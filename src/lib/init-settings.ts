import { PrismaClient } from '@prisma/client'

const defaultSettings = [
    // 基础设置
    {
      key: 'websiteName',
      value: 'Pintree - Smart Bookmark Management & Organization Platform'
    },
    {
      key: 'logoUrl',
      value: '/logo.png'
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
      key: 'discordUrl',
      value: 'https://discord.gg/gJTrkHFg'
    },
    {
      key: 'twitterUrl',
      value: 'https://x.com/pintree_io'
    },
    {
      key: 'youtubeUrl',
      value: 'https://www.youtube.com/channel/UCMvuKFthQyn4eKgJwklOMrw'
    },
    {
      key: 'linkedinUrl',
      value: 'https://linkedin.com/company/pintree'
    },
    {
      key: 'weixinUrl',
      value: 'https://weixin.qq.com/pintree'
    },
    {
      key: 'weiboUrl',
      value: 'https://weibo.com/pintree'
    },
    {
      key: 'bilibiliUrl',
      value: 'https://dribbble.com/Pintree'
    },
    {
      key: 'zhihuUrl',
      value: 'https://zhihu.com/people/pintree'
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
      key: 'enableHeroBanner',
      value: 'true',
      type: 'boolean',
      group: 'feature',
      description: '启用 Hero Banner'
    },
    {
      key: 'heroBannerTitle',
      value: 'Organize and Share Your Bookmarks Effortlessly',
      type: 'string',
      group: 'feature',
      description: 'Hero Banner 标题'
    },
    {
      key: 'heroBannerDescription',
      value: 'Create, manage and share personalized bookmark collections with Pintree',
      type: 'string',
      group: 'feature',
      description: 'Hero Banner 描述'
    },
    {
      key: 'heroBannerButtonText',
      value: 'Pintree.io',
      type: 'string',
      group: 'feature',
      description: 'Hero Banner 按钮文本'
    },
    {
      key: 'heroBannerButtonLink',
      value: 'https://pintree.io',
      type: 'string',
      group: 'feature',
      description: 'Hero Banner 按钮链接'
    },
    {
      key: 'heroBannerSponsorText',
      value: 'Sponsored by',
      type: 'string',
      group: 'feature',
      description: 'Hero Banner 赞助商文本'
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