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
  },
  {
    key: 'sidebarAdsImageUrl',
    value: 'data:image/png;base64,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',
    type: 'string',
    group: 'feature',
    description: '侧边栏广告图片(Base64格式)'
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
