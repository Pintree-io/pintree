import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";

async function checkUrl(url: string) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function getIconUrl(domain: string, $?: CheerioAPI): Promise<string> {
  // 1. 如果提供了 CheerioAPI，先尝试从 HTML 中获取图标
  if ($) {
    // 查找网页中的图标链接
    const iconSelectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
      'link[rel="apple-touch-icon-precomposed"]',
      'meta[property="og:image"]'
    ];

    for (const selector of iconSelectors) {
      const iconElement = $(selector);
      const iconUrl = iconElement.attr('href') || iconElement.attr('content');
      if (iconUrl) {
        // 处理相对路径
        try {
          const absoluteUrl = new URL(iconUrl, `https://${domain}`).href;
          if (await checkUrl(absoluteUrl)) {
            return absoluteUrl;
          }
        } catch (error) {
          console.error('Error processing icon URL:', error);
        }
      }
    }
  }

  // 2. 尝试网站根目录的 favicon.ico
  const rootFaviconUrl = `https://${domain}/favicon.ico`;
  if (await checkUrl(rootFaviconUrl)) {
    return rootFaviconUrl;
  }

  // 3. 尝试 Google Favicon 服务
  const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  if (await checkUrl(googleFaviconUrl)) {
    return googleFaviconUrl;
  }

  // 4. 尝试 Clearbit
  const clearbitUrl = `https://logo.clearbit.com/${domain}`;
  if (await checkUrl(clearbitUrl)) {
    return clearbitUrl;
  }

  // 5. 如果都失败了，返回 Google 的默认图标（这样至少能显示一个图标）
  return googleFaviconUrl;
}

async function getAllIcons(domain: string, $?: CheerioAPI): Promise<string[]> {
  const icons: string[] = [];

  // 1. 从 HTML 获取图标
  if ($) {
    const iconSelectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
      'link[rel="apple-touch-icon-precomposed"]',
      'meta[property="og:image"]'
    ];

    for (const selector of iconSelectors) {
      const iconElement = $(selector);
      const iconUrl = iconElement.attr('href') || iconElement.attr('content');
      if (iconUrl) {
        try {
          const absoluteUrl = new URL(iconUrl, `https://${domain}`).href;
          if (await checkUrl(absoluteUrl)) {
            icons.push(absoluteUrl);
          }
        } catch (error) {
          console.error('Error processing icon URL:', error);
        }
      }
    }
  }

  // 2. 添加其他来源的图标
  const alternativeIcons = [
    `https://${domain}/favicon.ico`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    `https://logo.clearbit.com/${domain}`
  ];

  for (const iconUrl of alternativeIcons) {
    if (await checkUrl(iconUrl)) {
      icons.push(iconUrl);
    }
  }

  return [...new Set(icons)]; // 去重
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "请输入URL" }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "无效的URL格式" }, { status: 400 });
    }

    const domain = new URL(url).hostname;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('text/html')) {
        return NextResponse.json({
          title: url,
          description: "",
          icons: await getAllIcons(domain),
          icon: await getIconUrl(domain)
        });
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // 获取标题
      let title = $("title").text() || 
                 $('meta[property="og:title"]').attr("content") || 
                 $('meta[name="twitter:title"]').attr("content") || 
                 domain;

      // 获取描述
      let description = $('meta[name="description"]').attr("content") || 
                       $('meta[property="og:description"]').attr("content") || 
                       $('meta[name="twitter:description"]').attr("content") || 
                       "";

      // 修改返回数据，包含所有图标
      return NextResponse.json({
        title: title.trim(),
        description: description.trim(),
        icons: await getAllIcons(domain, $),
        icon: await getIconUrl(domain, $) // 保持默认图标向后兼容
      });

    } catch (error) {
      console.error("Fetch error:", error);
      // 如果获取失败，至少返回域名作为标题
      return NextResponse.json({
        title: domain,
        description: "",
        icons: await getAllIcons(domain),
        icon: await getIconUrl(domain)
      });
    }

  } catch (error) {
    console.error("Error in URL info API:", error);
    return NextResponse.json(
      { error: "获取URL信息失败，请检查URL是否正确" },
      { status: 500 }
    );
  }
} 