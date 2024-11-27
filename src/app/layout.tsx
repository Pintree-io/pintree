import type { Metadata } from "next";
import { prisma } from '@/lib/prisma';
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Analytics } from '@/components/analytics/Analytics';
import { Toaster as SonnerToaster } from "sonner";
import { defaultSettings } from "@/config/site-settings";
import { initializeSettings } from '@/lib/init-settings'


async function checkSiteSettingTableExists() {
  const result:any = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE  table_schema = 'public'
      AND    table_name   = 'SiteSetting'
    );
  `
  return result[0].exists
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const tableExists = await checkSiteSettingTableExists()
    const keys = ['websiteName', 'description', 'keywords', 'siteUrl'];
    let settings:any
    // if (result && result[0] !== 'null') {
      // 如果 result[0] 不是 'null'，则表存在
      // const tableExists = result[0].to_regclass !== null;

      if(tableExists){
        await initializeSettings()
        settings = await prisma.siteSetting.findMany({
          where: {
            key: {
              in: [
                ...keys,
              ]
            }
          }
        });
      }else{
        settings = defaultSettings.filter((setting) => keys.includes(setting.key));
      }
    // }
    // else{
    //   return {
    //     title: 'Pintree - Smart Bookmark Management & Organization Platform',
    //     description: 'Organize, manage and share your bookmarks efficiently with Pintree. Features AI-powered organization, custom collections, and seamless bookmark sharing for enhanced productivity.',
    //     keywords: 'bookmark manager, bookmark organizer, bookmark collections, bookmark sharing, productivity tools, website organization, link management, bookmark tags, AI bookmarking, digital organization',
    //     icons: {
    //       icon: '/favicon/favicon.ico',
    //     },
    //   };
    // }
    const settingsMap = settings.reduce((acc:any, setting:any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    const faviconBase = settingsMap.faviconUrl?.replace('favicon.ico', '') || '/favicon/';
    const siteUrl = settingsMap.siteUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const ogImageUrl = `${siteUrl}/og-image.png`;

    return {
      title: settingsMap.websiteName || 'Pintree - Smart Bookmark Management & Organization Platform',
      description: settingsMap.description || 'Organize, manage and share your bookmarks efficiently with Pintree. Features AI-powered organization, custom collections, and seamless bookmark sharing for enhanced productivity.',
      keywords: settingsMap.keywords || 'bookmark manager, bookmark organizer, bookmark collections, bookmark sharing, productivity tools, website organization, link management, bookmark tags, AI bookmarking, digital organization',
      metadataBase: new URL(siteUrl),
      alternates: {
        canonical: siteUrl,
      },
      openGraph: {
        type: 'website',
        title: settingsMap.websiteName || 'Pintree - Smart Bookmark Management & Organization Platform',
        description: settingsMap.description || 'Organize, manage and share your bookmarks efficiently with Pintree. Features AI-powered organization, custom collections, and seamless bookmark sharing for enhanced productivity.',
        siteName: settingsMap.websiteName || 'Pintree',
        url: siteUrl,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: settingsMap.websiteName || 'Pintree - Smart Bookmark Management & Organization Platform'
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: settingsMap.websiteName || 'Pintree - Smart Bookmark Management & Organization Platform',
        description: settingsMap.description || 'Organize, manage and share your bookmarks efficiently with Pintree. Features AI-powered organization, custom collections, and seamless bookmark sharing for enhanced productivity.',
        images: [ogImageUrl],
      },
      icons: {
        icon: [
          {
            url: `${faviconBase}favicon.ico`,
            sizes: '32x32',
            type: 'image/x-icon'
          },
          {
            url: `${faviconBase}favicon-16x16.png`,
            sizes: '16x16',
            type: 'image/png'
          },
          {
            url: `${faviconBase}favicon-32x32.png`,
            sizes: '32x32',
            type: 'image/png'
          },
          {
            url: `${faviconBase}favicon-192x192.png`,
            sizes: '192x192',
            type: 'image/png'
          },
          {
            url: `${faviconBase}favicon-512x512.png`,
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        apple: [
          {
            url: `${faviconBase}favicon-180x180.png`,
            sizes: '180x180',
            type: 'image/png'
          }
        ]
      },
    };
  } catch (error) {
    console.error('获取设置失败:', error);
    return {
      title: 'Pintree - Smart Bookmark Management & Organization Platform',
      description: 'Organize, manage and share your bookmarks efficiently with Pintree. Features AI-powered organization, custom collections, and seamless bookmark sharing for enhanced productivity.',
      keywords: 'bookmark manager, bookmark organizer, bookmark collections, bookmark sharing, productivity tools, website organization, link management, bookmark tags, AI bookmarking, digital organization',
      icons: {
        icon: '/favicon/favicon.ico',
      },
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let analyticsMap:any = {
    googleAnalyticsId: '',
    clarityId: ''
  }
  // const result:any = await prisma.$queryRaw`SELECT to_regclass('public.siteSetting')::text;`;
  // if (result && result[0] !== 'null') {
  //   // 如果 result[0] 不是 'null'，则表存在
  //   const tableExists = result[0].to_regclass !== null;
  const tableExists = await checkSiteSettingTableExists()
    if(tableExists){
        // 在渲染之前尝试初始化设置
        await initializeSettings()
        // 获取统计代码ID
        const analytics = await prisma.siteSetting.findMany({
          where: {
            key: {
              in: ['googleAnalyticsId', 'clarityId']
            }
          }
        });

      analyticsMap = analytics.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
    
    }
  // }


  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <Analytics 
          googleAnalyticsId={analyticsMap.googleAnalyticsId} 
          clarityId={analyticsMap.clarityId} 
        />
      </head>
      <body suppressHydrationWarning>
        <SessionProvider>{children}</SessionProvider>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
