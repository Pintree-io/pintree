import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 默认设置
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

async function main() {
  console.log('开始初始化默认设置...');

// 批量创建默认设置
const createSettings = defaultSettings.map(setting => 
  prisma.siteSetting.upsert({
    where: { key: setting.key },
    update: {}, // 如果存在则不更新
    create: {
      key: setting.key,
      value: setting.value
    }
  })
);

await Promise.all(createSettings);

  console.log('默认设置初始化完成');
}

// main()
//   .catch((e) => {
//     console.error('初始化失败:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   }); 