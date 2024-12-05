
import { prisma } from "@/lib/prisma";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Analytics } from "@/components/analytics/Analytics";
import { Toaster as SonnerToaster } from "sonner";
import { defaultSettings } from "@/lib/defaultSettings";
import { cache } from 'react'
import type { Metadata, ResolvingMetadata } from 'next'

async function checkSiteSettingTableExists() {
  const result: any = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE  table_schema = 'public'
      AND    table_name   = 'SiteSetting'
    );
  `;
  return result[0].exists;
}

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const generateMetadata = cache(async (
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> => {
  try {
    const tableExists = await checkSiteSettingTableExists();
    const keys = ["websiteName", "description", "keywords", "siteUrl", "faviconUrl", "ogImage"];
    let settings: any;
    if (tableExists) {
      settings = await prisma.siteSetting.findMany({
        where: {
          key: {
            in: [...keys],
          },
        },
      });
    } 

    // console.log(settings)

    settings = settings.length > 0 ? settings : defaultSettings.filter((setting) =>
      keys.includes(setting.key)
    );

    const settingsMap = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    // const faviconBase =
    //   settingsMap.faviconUrl?.replace("favicon.ico", "") || "/favicon/";
    const siteUrl =
      settingsMap.siteUrl ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";


    const imageBaseUrl = '/api/images/'


    const faviconSetting = settings.find((setting: any) => setting.key === 'faviconUrl');
    const faviconId = faviconSetting ? 
      (await prisma.settingImage.findFirst({
        where: { settingId: faviconSetting.id },
        select: { imageId: true }
      }))?.imageId || '' : '';
    const faviconUrl = faviconId ? `${imageBaseUrl}${faviconId}` : '/favicon/favicon.ico'

    return {
      title:
        settingsMap.websiteName,
      description:
        settingsMap.description,
      keywords:
        settingsMap.keywords,
      metadataBase: new URL(siteUrl),
      alternates: {
        canonical: siteUrl,
      },
      icons: {
        icon: [
          {
            url: faviconUrl,
            sizes: "32x32",
            type: "image/x-icon",
          },
          // {
          //   url: `${faviconBase}favicon-16x16.png`,
          //   sizes: "16x16",
          //   type: "image/png",
          // },
          // {
          //   url: `${faviconBase}favicon-32x32.png`,
          //   sizes: "32x32",
          //   type: "image/png",
          // },
          // {
          //   url: `${faviconBase}favicon-192x192.png`,
          //   sizes: "192x192",
          //   type: "image/png",
          // },
          // {
          //   url: `${faviconBase}favicon-512x512.png`,
          //   sizes: "512x512",
          //   type: "image/png",
          // },
        // apple: [
        //   {
        //     url: `${faviconBase}favicon-180x180.png`,
        //     sizes: "180x180",
        //     type: "image/png",
        //   },
        // ],
        ],
      },
    };
  } catch (error) {
    console.error("获取设置失败:", error);
    return {
      title: "Pintree - Smart Bookmark Management & Organization Platform",
      description:
        "Organize, manage and share your bookmarks efficiently with Pintree. Features AI-powered organization, custom collections, and seamless bookmark sharing for enhanced productivity.",
      keywords:
        "bookmark manager, bookmark organizer, bookmark collections, bookmark sharing, productivity tools, website organization, link management, bookmark tags, AI bookmarking, digital organization",
      icons: {
        icon: "/favicon/favicon.ico",
      },
    };
  }
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let analyticsMap: any = {
    googleAnalyticsId: "",
    clarityId: "",
  };
  const tableExists = await checkSiteSettingTableExists();
  if (tableExists) {
    // 获取统计代码ID
    const analytics = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: ["googleAnalyticsId", "clarityId"],
        },
      },
    });

    if(analytics.length > 0) {
      analyticsMap = analytics.reduce((acc, setting) => {
        acc[setting.key] = setting.value || "";
        return acc;
      }, {} as Record<string, string>);
    }
  }

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
