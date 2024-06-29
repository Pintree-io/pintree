import os
import json
import time
import asyncio
import aiohttp
import logging
import argparse
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from collections import defaultdict

# 设置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 默认值
DEFAULT_INPUT_FILE = "c:\\Users\\smartisan\Desktop\\bookmarks.html"
DEFAULT_OUTPUT_DIR = "c:\\Users\\smartisan\Desktop\\"

class PerformanceMonitor:
    def __init__(self):
        self.request_times = []
        self.success_count = 0
        self.total_requests = 0

    def add_request(self, time, success):
        self.request_times.append(time)
        self.total_requests += 1
        if success:
            self.success_count += 1

    def get_stats(self):
        avg_time = sum(self.request_times) / len(self.request_times) if self.request_times else 0
        success_rate = self.success_count / self.total_requests if self.total_requests > 0 else 0
        return {
            "average_request_time": avg_time,
            "success_rate": success_rate,
            "total_requests": self.total_requests
        }

class BookmarkProcessor:
    @staticmethod
    def parse_bookmarks(file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        soup = BeautifulSoup(content, 'html.parser')
        bookmarks = []
        for a in soup.find_all('a'):
            title = a.string
            url = a.get('href')
            if title and url:  # 只添加同时有 title 和 url 的书签
                bookmarks.append({'title': title, 'url': url})
        return soup, bookmarks

def analyze_bookmarks(bookmarks):
    languages = defaultdict(int)
    domain_features = defaultdict(int)

    for bookmark in bookmarks:
        title = bookmark.get('title', '')  # 使用 get 方法，如果 title 不存在则返回空字符串
        url = bookmark.get('url', '')      # 同样处理 url

        # 检查标题中的语言
        if title:  # 只在 title 不为空时检查
            if any('\u4e00' <= char <= '\u9fff' for char in title):
                languages['Chinese'] += 1
            elif any('\u3040' <= char <= '\u30ff' for char in title):
                languages['Japanese'] += 1
            elif any('\uac00' <= char <= '\ud7a3' for char in title):
                languages['Korean'] += 1
            else:
                languages['Other'] += 1

        # 分析域名特征
        if url:  # 只在 url 不为空时分析
            domain = urlparse(url).netloc
            if 'github' in domain:
                domain_features['GitHub'] += 1
            elif 'stackoverflow' in domain:
                domain_features['StackOverflow'] += 1
            # ... 其他域名特征 ...

    main_language = max(languages, key=languages.get) if languages else 'Unknown'
    return main_language, dict(domain_features)

class BookmarkCategorizer:
    def __init__(self, api_key, api_base):
        self.api_key = api_key
        self.api_base = api_base
        self.cache = {}
        self.performance_monitor = PerformanceMonitor()
        self.load_cache()

    def load_cache(self):
        try:
            with open('category_cache.json', 'r') as f:
                self.cache = json.load(f)
        except FileNotFoundError:
            self.cache = {}

    def save_cache(self):
        with open('category_cache.json', 'w') as f:
            json.dump(self.cache, f)

    async def categorize_bookmark(self, title, url):
        cache_key = f"{title}:{url}"
        if cache_key in self.cache:
            return self.cache[cache_key]

        prompt = f"给下面的书签选择一个合适的分类，只返回分类名称，不要其他任何内容。\n标题: {title}\n网址: {url}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "deepseek-chat",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 32,
            "stop": ["\n"]
        }

        start_time = time.time()
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{self.api_base}/chat/completions", headers=headers, json=data) as response:
                    if response.status == 200:
                        result = await response.json()
                        category = result['choices'][0]['message']['content'].strip()
                        self.cache[cache_key] = category
                        self.performance_monitor.add_request(time.time() - start_time, True)
                        return category
                    else:
                        logger.error(f"API request failed with status {response.status}")
                        self.performance_monitor.add_request(time.time() - start_time, False)
                        return "未分类"
        except Exception as e:
            logger.error(f"Error during API request: {str(e)}")
            self.performance_monitor.add_request(time.time() - start_time, False)
            return "未分类"

    async def process_bookmarks(self, file_path):
        soup, bookmarks = BookmarkProcessor.parse_bookmarks(file_path)

        if bookmarks:  # 确保 bookmarks 不为空
            main_language, domain_features = analyze_bookmarks(bookmarks)
        else:
            main_language, domain_features = 'Unknown', {}
        
        total_bookmarks = len(bookmarks)
        root_folder = {
            "type": "folder",
            "addDate": int(time.time()),
            "lastModified": int(time.time()),
            "title": "Root",
            "children": []
        }
        
        categorized_bookmarks = defaultdict(list)
        
        for i, bookmark in enumerate(bookmarks, 1):
            title = bookmark['title']
            url = bookmark['url']
            category = await self.categorize_bookmark(title, url)
            categorized_bookmarks[category].append(bookmark)
            
            logger.info(f"进度: {i}/{total_bookmarks} - 已分类: {title} -> {category}")

        for category, bookmarks in categorized_bookmarks.items():
            folder = {
                "type": "folder",
                "addDate": int(time.time()),
                "lastModified": int(time.time()),
                "title": category,
                "children": [{
                    "type": "bookmark",
                    "url": bookmark['url'],
                    "title": bookmark['title'],
                    "addDate": int(time.time()),
                    "lastModified": int(time.time())
                } for bookmark in bookmarks]
            }
            root_folder["children"].append(folder)

        self.save_cache()

        return root_folder

async def main():
    try:
        parser = argparse.ArgumentParser(description="分类书签")
        parser.add_argument("--input_file", help="输入书签HTML文件的路径", default=DEFAULT_INPUT_FILE)
        parser.add_argument("--output_dir", help="保存输出JSON文件的目录", default=DEFAULT_OUTPUT_DIR)
        args = parser.parse_args()

        DEEPSEEK_API_KEY = ""
        if not DEEPSEEK_API_KEY:
            raise ValueError("未设置DEEPSEEK_API_KEY环境变量")
        
        categorizer = BookmarkCategorizer(DEEPSEEK_API_KEY, "https://api.deepseek.com/v1")
        
        file_path = args.input_file
        output_dir = args.output_dir
        
        # 只获取 root_folder
        root_folder = await categorizer.process_bookmarks(file_path)
        
        # 构造新的 JSON 文件路径
        input_filename = os.path.splitext(os.path.basename(file_path))[0]
        json_file_path = os.path.join(output_dir, f"{input_filename}.json")

        # 保存 JSON 文件
        with open(json_file_path, 'w', encoding='utf-8') as file:
            json.dump(root_folder, file, ensure_ascii=False, indent=2)
        
        logger.info(f"分类后的书签JSON文件已保存至: {json_file_path}")

        # 如果需要，可以在这里计算并打印类别统计信息
        category_stats = {folder["title"]: len(folder["children"]) for folder in root_folder["children"]}
        logger.info("Category statistics:")
        for category, count in category_stats.items():
            logger.info(f"{category}: {count}")

        performance_stats = categorizer.performance_monitor.get_stats()
       
        logger.info("Performance statistics:")
        logger.info(f"Average request time: {performance_stats['average_request_time']:.2f} seconds")
        logger.info(f"Success rate: {performance_stats['success_rate']:.2%}")
        logger.info(f"Total requests: {performance_stats['total_requests']}")

    except Exception as e:
        logging.critical(f"An unexpected error occurred: {str(e)}", exc_info=True)

if __name__ == "__main__":
    asyncio.run(main())
