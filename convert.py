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
import hashlib
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
            icon = a.get('icon')
            if title and url:
                bookmark = {'title': title, 'url': url}
                if icon:
                    bookmark['icon'] = icon
                bookmarks.append(bookmark)
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
        self.prompt = self.get_prompt()
        self.prompt_hash = self.hash_prompt(self.prompt)
        self.load_cache()

    def get_prompt(self):
        return """请为以下书签选择一个最合适的分类，包括大分类和子分类（如果适用）。输出格式应为大分类和多个子分类的目录树结构。参考以下示例进行分类，并根据书签标题和URL的关键词进行分析：
        示例1:
        书签: <A HREF="https://github.com/Snailclimb/JavaGuide" ADD_DATE="1586575435" ICON="data:image/png;base64,...">Snailclimb/JavaGuide: 【Java学习+面试指南】 一份涵盖大部分Java程序员所需要掌握的核心知识。</A>
        输出:
        编程与技术
        - Java技术

        示例2:
        书签: <A HREF="https://reactjs.org" ADD_DATE="1586575435" ICON="data:image/png;base64,...">React - A JavaScript library for building user interfaces</A>
        输出:
        编程与技术
        - 前端技术

        示例3:
        书签: <A HREF="https://www.wireshark.org" ADD_DATE="1586575435" ICON="data:image/png;base64,...">Wireshark · Go Deep.</A>
        输出:
        网络与安全
        - 网络技术

        示例4:
        书签: <A HREF="https://kotlinlang.org" ADD_DATE="1586575435" ICON="data:image/png;base64,...">Kotlin for Android Developers</A>
        输出:
        编程与技术
        - Kotlin语言

        现在，请为下面的书签选择一个最合适的分类，遵循以下原则：

        - 输出格式为大分类和多个子分类的目录树结构
        - 如果有多个子分类，请按示例格式列出所有子分类
        - 不要包含"分类:"或任何其他前缀\后缀，只返回分类名称的文本内容

        大分类及其子分类包括但不限于：

        编程与技术
        - Java技术
        - 前端技术
        - 后端技术
        - Web开发
        - Go语言技术
        - Kotlin语言
        - 运维技术
        - 区块链技术
        - 系统设计
        - 算法
        - Python技术
        - 数据可视化
        - 嵌入式技术
        - 软件开发工具
        - 数据库技术
        - 硬件开发
        - ......

        设计与艺术
        - 图标设计
        - 字体设计
        - UI设计
        - 数字艺术
        - 网页设计
        - 视频编辑
        - 音乐制作
        - 影视后期特效
        - 视频调色
        - Photoshop资源
        - ......
        教育资源
        - 计算机书籍
        - 教育网站
        - 电子书
        - ......
        软件与工具
        - 桌面增强
        - 在线工具
        - 在线编辑器
        - 用户脚本
        - 社交平台工具
        - 开发者平台
        - 移动应用
        - 可视化工具
        - 刷机包
        - Windows工具
        - MacOS工具
        - ......
        - ......
        图片与视频
        - 摄影教程
        - 壁纸与桌面美化
        - 照片编辑
        - ......
        数据与分析
        - 数据可视化
        - 数据分析
        - ......
        媒体与娱乐
        - 音乐
        - 电影资源
        - 电视剧
        - 摄影教程
        - 地理与旅游
        - 音乐制作
        - 电影资源
        - 电视资源
        - ......
        网络与安全
        - 网络技术
        - 逆向工程
        - 漏洞挖掘
        - 网络安全
        - ......
        AI与技术
        - 机器学习
        - ......
        生活与兴趣
        - 模拟游戏
        - 电子产品
        - 园艺
        - 电子商务
        - 成人内容
        - ......
        请开始分类，记住只返回分类名称的文本内容，不要其他任何内容：
            """

    def hash_prompt(self, prompt):
        return hashlib.md5(prompt.encode()).hexdigest()

    def load_cache(self):
        try:
            with open('category_cache.json', 'r') as f:
                cached_data = json.load(f)
                if cached_data.get('prompt_hash') == self.prompt_hash:
                    self.cache = cached_data.get('categories', {})
                else:
                    self.cache = {}
        except FileNotFoundError:
            self.cache = {}

    def save_cache(self):
        with open('category_cache.json', 'w') as f:
            json.dump({
                'prompt_hash': self.prompt_hash,
                'categories': self.cache
            }, f)

    async def categorize_bookmark(self, title, url):
        cache_key = f"{title}:{url}"
        if cache_key in self.cache:
            return self.cache[cache_key]

        full_prompt = f"{self.prompt}\n标题: {title}\n网址: {url}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "deepseek-chat",
            "messages": [{"role": "user", "content": full_prompt}],
            "temperature": 0.5,
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
        # 检查 prompt 是否发生变化
        current_prompt = self.get_prompt()
        current_prompt_hash = self.hash_prompt(current_prompt)
        if current_prompt_hash != self.prompt_hash:
            logger.info("Prompt has changed. Clearing cache.")
            self.cache = {}
            self.prompt = current_prompt
            self.prompt_hash = current_prompt_hash

        # 其余的处理逻辑保持不变
        soup, bookmarks = BookmarkProcessor.parse_bookmarks(file_path)

        if bookmarks:
            main_language, domain_features = analyze_bookmarks(bookmarks)
        else:
            main_language, domain_features = 'Unknown', {}
        
        total_bookmarks = len(bookmarks)
        root_folder = {
            "type": "folder",
            "addDate": int(time.time()),
            "lastModified": int(time.time()),
            "title": "Navigation Hub",
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
                    "type": "link",
                    "url": bookmark['url'],
                    "title": bookmark['title'],
                    "addDate": int(time.time()),
                    "lastModified": int(time.time()),
                    **({"icon": bookmark['icon']} if 'icon' in bookmark else {})
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
        
        # 获取 root_folder
        root_folder = await categorizer.process_bookmarks(file_path)
        
        # 构造新的 JSON 文件路径
        input_filename = os.path.splitext(os.path.basename(file_path))[0]
        json_file_path = os.path.join(output_dir, f"{input_filename}.json")

        # 保存 JSON 文件，将 root_folder 包装在列表中
        with open(json_file_path, 'w', encoding='utf-8') as file:
            json.dump([root_folder], file, ensure_ascii=False, indent=2)
        
        logger.info(f"分类后的书签JSON文件已保存至: {json_file_path}")

        # 计算并打印类别统计信息
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
