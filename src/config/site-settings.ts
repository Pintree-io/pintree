export interface SettingItem {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  group: 'basic' | 'seo' | 'feature' | 'analytics';
  description?: string;
}

export const defaultSettings: SettingItem[] = [
  // 基础设置组
  {
    key: 'websiteName',
    value: 'Pintree',
    type: 'string',
    group: 'basic',
    description: '网站名称'
  },
  {
    key: 'logoUrl',
    value: '/logo.png',
    type: 'string',
    group: 'basic',
    description: '网站Logo (建议尺寸: 520x120px)'
  },
  {
    key: 'faviconUrl',
    value: '/favicon.ico',
    type: 'string',
    group: 'basic',
    description: '网站图标'
  },
  {
    key: 'copyrightText',
    value: '© 2024 Pintree. All rights reserved.',
    type: 'string',
    group: 'basic',
    description: '版权信息'
  },
  {
    key: 'icp',
    value: '',
    type: 'string',
    group: 'basic',
    description: 'ICP备案信息'
  },
  {
    key: 'icpUrl',
    value: '',
    type: 'string',
    group: 'basic',
    description: 'ICP备案链接'
  },
  {
    key: 'contactEmail',
    value: '',
    type: 'string',
    group: 'basic',
    description: '联系邮箱'
  },
  {
    key: 'poweredBy',
    value: 'true',
    type: 'boolean',
    group: 'basic',
    description: '显示 Powered by Pintree'
  },

  // 社交媒体链接
  {
    key: 'githubUrl',
    value: '',
    type: 'string',
    group: 'basic',
    description: 'GitHub链接'
  },
  {
    key: 'twitterUrl',
    value: '',
    type: 'string',
    group: 'basic',
    description: 'Twitter链接'
  },

  // SEO设置组
  {
    key: 'siteTitle',
    value: '',
    type: 'string',
    group: 'seo',
    description: '网站标题'
  },
  {
    key: 'description',
    value: '',
    type: 'string',
    group: 'seo',
    description: '网站描述'
  },
  {
    key: 'keywords',
    value: '',
    type: 'string',
    group: 'seo',
    description: '关键词(用逗号分隔)'
  },
  {
    key: 'siteUrl',
    value: '',
    type: 'string',
    group: 'seo',
    description: '网站URL'
  },
  {
    key: 'ogImage',
    value: '',
    type: 'string',
    group: 'seo',
    description: '社交分享图片'
  },
  {
    key: 'robots',
    value: 'index, follow',
    type: 'string',
    group: 'seo',
    description: '搜索引擎爬虫设置'
  },
  {
    key: 'author',
    value: '',
    type: 'string',
    group: 'seo',
    description: '作者信息'
  },

  // 统计分析组
  {
    key: 'googleAnalyticsId',
    value: '',
    type: 'string',
    group: 'analytics',
    description: 'Google Analytics ID'
  },
  {
    key: 'clarityId',
    value: '',
    type: 'string',
    group: 'analytics',
    description: 'Microsoft Clarity ID'
  },
  {
    key: 'umamiId',
    value: '',
    type: 'string',
    group: 'analytics',
    description: 'Umami Analytics ID'
  },
  {
    key: 'plausibleId',
    value: '',
    type: 'string',
    group: 'analytics',
    description: 'Plausible Analytics ID'
  },
  {
    key: 'gtagId',
    value: '',
    type: 'string',
    group: 'analytics',
    description: 'Google Tag ID'
  },

  // 功能设置组
  {
    key: 'enableSearch',
    value: 'true',
    type: 'boolean',
    group: 'feature',
    description: '启用搜索功能'
  },
  {
    key: 'enableBackToTop',
    value: 'true',
    type: 'boolean',
    group: 'feature',
    description: '启用返回顶部按钮'
  },
  {
    key: 'enableSidebarAds',
    value: 'false',
    type: 'boolean',
    group: 'feature',
    description: '启用侧边栏广告'
  },
  {
    key: 'sidebarAdsContent',
    value: '',
    type: 'string',
    group: 'feature',
    description: '侧边栏广告内容'
  },
  {
    key: 'enableCtaButton',
    value: 'false',
    type: 'boolean',
    group: 'feature',
    description: '启用CTA按钮'
  },
  {
    key: 'ctaButtonText',
    value: '',
    type: 'string',
    group: 'feature',
    description: 'CTA按钮文字'
  },
  {
    key: 'ctaButtonLink',
    value: '',
    type: 'string',
    group: 'feature',
    description: 'CTA按钮链接'
  },
  {
    key: 'ctaButtonStyle',
    value: 'primary',
    type: 'string',
    group: 'feature',
    description: 'CTA按钮样式'
  },
  {
    key: 'enableBanner',
    value: 'false',
    type: 'boolean',
    group: 'feature',
    description: '启用普通Banner'
  },
  {
    key: 'bannerContent',
    value: '',
    type: 'string',
    group: 'feature',
    description: 'Banner内容'
  },
  {
    key: 'bannerStyle',
    value: 'info',
    type: 'string',
    group: 'feature',
    description: 'Banner样式'
  },
  {
    key: 'enableCarousel',
    value: 'false',
    type: 'boolean',
    group: 'feature',
    description: '启用轮播'
  },
  {
    key: 'carouselItems',
    value: '[]',
    type: 'json',
    group: 'feature',
    description: '轮播项目'
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
    value: 'https://github.com/pintree/pintree',
    type: 'string',
    group: 'feature',
    description: 'Banner按钮链接'
  }
];

// 根据组获取设置项
export function getSettingsByGroup(group: string) {
  return defaultSettings.filter(setting => setting.group === group);
}

// 获取所有设置项的默认值
export function getDefaultSettingsObject() {
  return defaultSettings.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);
}
