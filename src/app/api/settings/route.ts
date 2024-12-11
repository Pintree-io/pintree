export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { defaultSettings } from "@/lib/defaultSettings";

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get('group');
    
    // 获取所有设置
    const settings = await prisma.siteSetting.findMany();
    // console.log('数据库中的设置:', settings);
    
    // 将设置转换为键值对格式
    const formattedSettings = settings.reduce((acc: Record<string, string>, setting) => {
      acc[setting.key] = setting.value || '';
      return acc;
    }, {});

    // 从 defaultSettings 获取默认值
    const defaultValues = defaultSettings.reduce((acc, setting) => {
      if (!group || setting.group === group) {
        acc[setting.key] = setting.value;
      }
      return acc;
    }, {} as Record<string, string>);

    // console.log('默认值:', defaultValues);
    // console.log('数据库值:', formattedSettings);

    // 合并默认值和数据库值
    const result = {
      ...defaultValues,
      ...formattedSettings,
      enableSearch: true
    };


    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get settings:', error);
    return NextResponse.json({ 
      error: 'Failed to get settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Please login" }, { status: 401 });
    }

    const data = await request.json();
    // console.log('接收到的数据:', data);

    try {
      // 只保存 key 和 value
      const updates = Object.entries(data).map(([key, value]) => {
        return prisma.siteSetting.upsert({
          where: { key },
          create: {
            key,
            value: String(value)
          },
          update: {
            value: String(value)
          }
        });
      });

      const results = await prisma.$transaction(updates);
      // console.log('更新结果:', results);

      return NextResponse.json({ 
        message: 'Settings saved',
        results 
      });
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json({ 
        error: 'Database operation failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Failed to save settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
