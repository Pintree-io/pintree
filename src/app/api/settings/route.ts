import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";


export const runtime = 'nodejs';
// 增加超时时间到最大值
export const maxDuration = 60; // Vercel Hobby 允许的最大时间是 60 秒
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get('group');
    
    // 获取所有设置
    const settings = group 
      ? await prisma.siteSetting.findMany({ where: { group } })
      : await prisma.siteSetting.findMany();

    
    // 将设置转换为键值对格式
    const formattedSettings = settings.reduce((acc: Record<string, string>, setting) => {
      acc[setting.key] = setting.value || '';
      return acc;
    }, {});


    // 合并默认值和数据库值
    const result = {
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
      const updatedSettings = [];

      for (const [key, value] of Object.entries(data)) {
        const existingSetting = await prisma.siteSetting.findUnique({
          where: { key }
        });
      
        if (existingSetting) {
          const updated = await prisma.siteSetting.update({
            where: { key },
            data: {
              value: String(value)
            }
          });
          updatedSettings.push(updated);
        }
      }



      return NextResponse.json({ 
        message: 'Settings saved',
        results: updatedSettings
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
