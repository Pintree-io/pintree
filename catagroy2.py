import asyncio
import logging
import json
import os
import time
import signal
import sys
import sys
import io
from logging.handlers import RotatingFileHandler
from tqdm import tqdm
from bs4 import BeautifulSoup
from openai import AsyncOpenAI

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# 设置日志
log_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
log_file = 'bookmark_categorizer.log'
log_handler = RotatingFileHandler(log_file, maxBytes=1024 * 1024, backupCount=5, encoding='utf-8')
log_handler.setFormatter(log_formatter)

logger = logging.getLogger()
logger.setLevel(logging.INFO)  # 这里修改为 logging.INFO
logger.addHandler(log_handler)

# 添加一个 StreamHandler 用于控制台输出
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(log_formatter)
logger.addHandler(console_handler)

class RateLimiter:
    def __init__(self, rate_limit):
        self.rate_limit = rate_limit
        self.tokens = rate_limit
        self.updated_at = time.monotonic()

    async def acquire(self):
        while self.tokens < 1:
            self.add_new_tokens()
            await asyncio.sleep(0.1)
        self.tokens -= 1

    def add_new_tokens(self):
        now = time.monotonic()
        time_since_update = now - self.updated_at
        new_tokens = time_since_update * self.rate_limit
        if new_tokens > 1:
            self.tokens = min(self.tokens + new_tokens, self.rate_limit)
            self.updated_at = now

class PerformanceMonitor:
    def __init__(self):
        self.request_times = []
        self.success_count = 0
        self.failure_count = 0

    def record_request(self, duration, success):
        self.request_times.append(duration)
        if success:
            self.success_count += 1
        else:
            self.failure_count += 1

    def get_stats(self):
        avg_time = sum(self.request_times) / len(self.request_times) if self.request_times else 0
        return {
            "average_request_time": avg_time,
            "success_rate": self.success_count / (self.success_count + self.failure_count) if (self.success_count + self.failure_count) > 0 else 0,
            "total_requests": self.success_count + self.failure_count
        }

class AIClassifier:
    def __init__(self, api_key, base_url):
        self.client = AsyncOpenAI(api_key=api_key, base_url=base_url)
        self.MODEL = "deepseek-chat"
        self.TEMPERATURE = 1
        self.MAX_TOKENS = 50
        self.TIMEOUT = 60  # 60 seconds timeout

    async def classify(self, titles, urls):
        system_content = """
               You are an expert bookmark categorizer. Your task is to ensure that every bookmark is categorized, without missing a single one. Follow the workflow below to categorize bookmarks:

        Workflow:
        Analyze: Carefully read each bookmark's title and description.
        Match: Match the bookmark with the predefined categories.
        Categorize: Choose the most appropriate category. If a bookmark could belong to multiple categories, select the most relevant one.
        Judge: Use your expert judgment for unclear cases.
        Confirm: Check that all bookmarks have been categorized, leaving none unclassified.
        Example Categories:
        Programming Learning: Programming language tutorials, algorithms, data structures
        Development Tools: IDEs, version control, debugging tools
        Design Resources: UI/UX design, icons, fonts
        Learning Platforms: Online courses, educational websites, learning resources
        Utility Tools: Various online tools, software applications
        Resource Downloads: E-books, software, media resources
        Technical Communities: Forums, blogs, Q&A websites
        Artificial Intelligence: AI tools, machine learning resources
        Databases: Database tutorials, management tools
        Cybersecurity: Security tools, tutorials
        Notes:
        Always choose the category that best describes the main content of the bookmark. For example, a bookmark about "secure coding practices" should be categorized under "Cybersecurity" rather than "Programming Learning."
        If you encounter a bookmark that is difficult to categorize, still assign it to the closest fitting category; no bookmark should be left uncategorized.
        After completing the categorization, double-check to ensure all bookmarks have been categorized with none left out.
        Your goal is to achieve 100% bookmark categorization coverage while maintaining accuracy and relevance.
        """
        user_content = "\n".join([f"Title: '{title}', URL: '{url}'" for title, url in zip(titles, urls)])
        
        try:
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=self.MODEL,
                    messages=[
                        {"role": "system", "content": system_content},
                        {"role": "user", "content": f"Categorize the following bookmarks:\n{user_content}"}
                    ],
                    temperature=self.TEMPERATURE,
                    max_tokens=self.MAX_TOKENS
                ),
                timeout=self.TIMEOUT
            )
            return [category.strip() for category in response.choices[0].message.content.split('\n')]
        except asyncio.TimeoutError:
            logging.error(f"AI classification timeout for batch")
            return ["Uncategorized"] * len(titles)
        except Exception as e:
            logging.error(f"AI classification error: {str(e)}")
            return ["Uncategorized"] * len(titles)

class BookmarkProcessor:
    @staticmethod
    def parse_bookmarks(file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        soup = BeautifulSoup(content, 'html.parser')
        return soup, soup.find_all('a')

    @staticmethod
    def add_category_to_bookmark(bookmark, category, soup):
        if category:
            parent = bookmark.parent
            new_dt = soup.new_tag("dt")
            new_h3 = soup.new_tag("h3")
            new_h3.string = category
            new_dt.append(new_h3)
            parent.insert_before(new_dt)

    @staticmethod
    def generate_output(soup):
        return soup.prettify()

class BookmarkCategorizer:
    def __init__(self, api_key, base_url):
        self.ai_classifier = AIClassifier(api_key, base_url)
        self.url_cache = self.load_cache()
        self.BATCH_SIZE = 50
        self.rate_limiter = RateLimiter(50)  # 每秒10个请求
        self.performance_monitor = PerformanceMonitor()

    def load_cache(self):
        try:
            with open('url_cache.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}

    def save_cache(self):
        with open('url_cache.json', 'w') as f:
            json.dump(self.url_cache, f)

    async def process_bookmarks(self, file_path):
        soup, bookmarks = BookmarkProcessor.parse_bookmarks(file_path)
        
        total_bookmarks = len(bookmarks)
        categorized_data = []
        
        with tqdm(total=total_bookmarks, desc="Processing bookmarks", unit="bookmark") as pbar:
            for i in range(0, total_bookmarks, self.BATCH_SIZE):
                batch = bookmarks[i:i+self.BATCH_SIZE]
                categories = await self.process_batch(batch)
                
                for bookmark, category in zip(batch, categories):
                    BookmarkProcessor.add_category_to_bookmark(bookmark, category, soup)
                    categorized_data.append({
                        'title': bookmark.string,
                        'url': bookmark.get('href'),
                        'icon': bookmark.get('icon'),
                        'category': category
                    })
                
                pbar.update(len(batch))

                if (i + 1) % 100 == 0:  # 每处理100个书签后保存缓存
                    try:
                        await self.save_cache_async()  # 假设有一个异步的保存方法
                        logger.info(f"Cache saved after processing {i + 1} bookmarks")
                    except Exception as e:
                        logger.error(f"Failed to save cache: {str(e)}")

        # 可能的进度报告
                if (i + 1) % 1000 == 0:
                    logger.info(f"Processed {i + 1} bookmarks")
                    self.save_cache()

        category_stats = {}
        for data in categorized_data:
            category = data['category']
            category_stats[category] = category_stats.get(category, 0) + 1

        self.save_cache()  # 最后再保存一次缓存

        return BookmarkProcessor.generate_output(soup), categorized_data, category_stats

    async def process_batch(self, batch):
        titles = []
        urls = []
        cached_categories = []

        for bookmark in batch:
            title = bookmark.string
            url = bookmark.get('href')
            if url in self.url_cache:
                cached_categories.append(self.url_cache[url])
            else:
                titles.append(title)
                urls.append(url)
                cached_categories.append(None)

        if titles:
            await self.rate_limiter.acquire()
            start_time = time.time()
            try:
                new_categories = await self.ai_classifier.classify(titles, urls)
                self.performance_monitor.record_request(time.time() - start_time, True)
                
                # 确保 new_categories 的长度与 titles 相同
                if len(new_categories) < len(titles):
                    logging.warning(f"AI classifier returned fewer categories than expected. Expected {len(titles)}, got {len(new_categories)}.")
                    new_categories.extend(["Uncategorized"] * (len(titles) - len(new_categories)))
                
                for url, category in zip(urls, new_categories):
                    self.url_cache[url] = category
            except Exception as e:
                self.performance_monitor.record_request(time.time() - start_time, False)
                logging.error(f"Failed to categorize batch: {str(e)}")
                new_categories = ["Uncategorized"] * len(titles)

            # 合并缓存的类别和新的类别
            categories = []
            new_index = 0
            for cached_category in cached_categories:
                if cached_category is None:
                    categories.append(new_categories[new_index])
                    new_index += 1
                else:
                    categories.append(cached_category)
        else:
            categories = cached_categories

        return categories
        
        
      

def handle_shutdown(signum, frame):
    logger.info("Received shutdown signal. Cleaning up...")
    # 执行清理操作，如保存缓存等
    sys.exit(0)

signal.signal(signal.SIGINT, handle_shutdown)
signal.signal(signal.SIGTERM, handle_shutdown)

async def main():
    try:
        DEEPSEEK_API_KEY = ""  # 替换为你的实际API密钥
        if not DEEPSEEK_API_KEY:
            raise ValueError("DEEPSEEK_API_KEY is not set")
        
        categorizer = BookmarkCategorizer(DEEPSEEK_API_KEY, "https://api.deepseek.com/v1")
        
        file_path = 'c:\\Users\\smartisan\\Desktop\\bookmarks.html'  # 替换为你的书签文件路径
        categorized_bookmarks, categorized_data, category_stats = await categorizer.process_bookmarks(file_path)
        
        # Save HTML file
        with open('categorized_bookmarks.html', 'w', encoding='utf-8') as file:
            file.write(categorized_bookmarks)
        
        # Save JSON file
        with open('categorized_bookmarks.json', 'w', encoding='utf-8') as file:
            json.dump(categorized_data, file, ensure_ascii=False, indent=2)
        
        logger.info("Bookmark categorization completed successfully. HTML and JSON files have been created.")
        logger.info("Category statistics:")
        for category, count in category_stats.items():
            try:
                logger.info(f"{category}: {count}")
            except UnicodeEncodeError:
                logger.info(f"{category.encode('ascii', 'ignore').decode('ascii')}: {count}")

        performance_stats = categorizer.performance_monitor.get_stats()
        logger.info("Performance statistics:")
        logger.info(f"Average request time: {performance_stats['average_request_time']:.2f} seconds")
        logger.info(f"Success rate: {performance_stats['success_rate']:.2%}")
        logger.info(f"Total requests: {performance_stats['total_requests']}")
    except ValueError as e:
        logging.critical(f"Configuration error: {str(e)}")
    except FileNotFoundError as e:
        logging.critical(f"File not found: {str(e)}")
    except json.JSONDecodeError as e:
        logging.critical(f"JSON encoding error: {str(e)}")
    except IOError as e:
        logging.critical(f"I/O error: {str(e)}")
    except Exception as e:
        logging.critical(f"An unexpected error occurred: {str(e)}", exc_info=True)

if __name__ == "__main__":
    asyncio.run(main())
