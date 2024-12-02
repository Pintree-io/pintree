import { PrismaClient } from '@prisma/client'

const defaultSettings = [
    // 基础设置
    {
      key: 'websiteName',
      value: 'Pintree - Smart Bookmark Management & Organization Platform'
    },
    {
      key: 'logoUrl',
      value: 'data:image/png;base64,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',
      type: 'string',
      group: 'basic',
      description: 'Logo图片(Base64格式)'
    },
    {
      key: 'faviconUrl',
      value: '/favicon.ico'
    },
    {
      key: 'copyrightText',
      value: '© 2024 Pintree. All rights reserved.'
    },
    {
      key: 'contactEmail',
      value: 'support@pintree.io'
    },
    {
      key: 'icp',
      value: ''
    },
    {
      key: 'icpUrl',
      value: ''
    },
    
    // 社交媒体链接
    {
      key: 'githubUrl',
      value: 'https://github.com/Pintree-io/pintree'
    },
    {
      key: 'twitterUrl',
      value: 'https://x.com/pintree_io'
    },
  
    // SEO设置
    {
      key: 'siteTitle',
      value: 'Pintree - Smart Bookmark Management & Organization Platform'
    },
    {
      key: 'description',
      value: 'Organize, manage and share your bookmarks efficiently with Pintree. Features AI-powered organization, custom collections, and seamless bookmark sharing for enhanced productivity.'
    },
    {
      key: 'keywords',
      value: 'bookmark manager, bookmark organizer, bookmark collections, bookmark sharing, productivity tools, website organization, link management, bookmark tags, AI bookmarking, digital organization'
    },
    {
      key: 'siteUrl',
      value: 'https://pintree.io'
    },
    {
      key: 'ogImage',
      value: 'https://pintree.io/og-image.png'
    },
    {
      key: 'robots',
      value: 'index, follow'
    },
    {
      key: 'author',
      value: 'Pintree Team'
    },
  
    // 统计分析
    {
      key: 'googleAnalyticsId',
      value: ''
    },
    {
      key: 'clarityId',
      value: ''
    },
    {
      key: 'umamiId',
      value: ''
    },
    {
      key: 'plausibleId',
      value: ''
    },
    {
      key: 'gtagId',
      value: ''
    },
  
    // 功能设置
    {
      key: 'enableSearch',
      value: 'true'
    },
    {
      key: 'enableSidebarAds',
      value: 'false'
    },
    {
      key: 'sidebarAdsContent',
      value: ''
    },
    {
      key: 'enableCtaButton',
      value: 'true'
    },
    {
      key: 'ctaButtonText',
      value: 'Claim your Pintree'
    },
    {
      key: 'ctaButtonLink',
      value: 'https://pintree.io'
    },
    {
      key: 'ctaButtonStyle',
      value: 'primary'
    },
    {
      key: 'enableBanner',
      value: 'false'
    },
    {
      key: 'bannerContent',
      value: ''
    },
    {
      key: 'bannerStyle',
      value: 'info'
    },
    {
      key: 'enableCarousel',
      value: 'false',
      type: 'boolean',
      group: 'feature',
      description: '启用轮播'
    },
    {
      key: 'carouselImageStates',
      value: '[true,true,true,true,true,true]',
      type: 'json',
      group: 'feature',
      description: '轮播图片显示状态'
    },
    {
      key: 'enableTopBanner',
      value: 'false',
      type: 'boolean',
      group: 'feature',
      description: '启用顶部通知Banner'
    },
    {
      key: 'topBannerTitle',
      value: 'Pintree 1.0 Launched',
      type: 'string',
      group: 'feature',
      description: 'Banner标题'
    },
    {
      key: 'topBannerDescription',
      value: 'A bookmark manager that helps you collect, organize, and share your favorite websites.',
      type: 'string',
      group: 'feature',
      description: 'Banner描述'
    },
    {
      key: 'topBannerButtonText',
      value: 'Learn More',
      type: 'string',
      group: 'feature',
      description: 'Banner按钮文本'
    },
    {
      key: 'topBannerButtonLink',
      value: 'https://github.com/Pintree-io/pintree',
      type: 'string',
      group: 'feature',
      description: 'Banner按钮链接'
    },
    {
      key: 'carouselImageLinks',
      value: JSON.stringify([
        'https://pintree.io',
        'https://pintree.io',
        'https://pintree.io',
        'https://pintree.io',
        'https://pintree.io',
        'https://pintree.io'
      ]),
      type: 'json',
      group: 'feature',
      description: '轮播图片链接'
    },
    {
      key: 'sidebarAdsTitle',
      value: 'Organize Your Bookmarks',
      type: 'string',
      group: 'feature',
      description: '侧边栏广告标题'
    },
    {
      key: 'sidebarAdsDescription',
      value: 'Pintree helps you collect, organize and share your favorite websites in a beautiful way',
      type: 'string',
      group: 'feature',
      description: '侧边栏广告描述'
    },
    {
      key: 'sidebarAdsImageUrl',
      value: '/assets/spaces-preview.png',
      type: 'string',
      group: 'feature',
      description: '侧边栏广告图片'
    },
    {
      key: 'sidebarAdsButtonText',
      value: 'Get Started',
      type: 'string',
      group: 'feature',
      description: '侧边栏广告按钮文本'
    },
    {
      key: 'sidebarAdsButtonUrl',
      value: 'https://github.com/Pintree-io/pintree',
      type: 'string',
      group: 'feature',
      description: '侧边栏广告按钮链接'
    }
  ];

export async function initializeSettings() {
  const prisma = new PrismaClient()
  
  try {
    // 检查是否已经初始化
    const existingSettings = await prisma.siteSetting.count()
    
    if (existingSettings === 0) {
      // 批量创建默认设置
      const createSettings = defaultSettings.map(setting => 
        prisma.siteSetting.create({
          data: {
            key: setting.key,
            value: setting.value,
            // 如果原始数据中有额外字段，也可以包含进来
            ...(setting.type && { type: setting.type }),
            ...(setting.group && { group: setting.group }),
            ...(setting.description && { description: setting.description })
          }
        })
      )

      await Promise.all(createSettings)
      console.log('默认设置初始化完成')
    } else {
      console.log('设置已存在，跳过初始化')
    }
  } catch (error) {
    console.error('初始化设置失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}