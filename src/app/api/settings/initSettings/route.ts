import { NextRequest, NextResponse } from 'next/server';
import { updateSettingsWithDefaults } from '@/actions/init-settings';
import { revalidatePath } from 'next/cache'

// 增加超时时间到最大值
export const maxDuration = 60; // Vercel Hobby 允许的最大时间是 60 秒
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 调用初始化设置的服务器操作
    await updateSettingsWithDefaults();
    revalidatePath('/', 'layout');
    
    return NextResponse.json({ 
      message: 'Settings initialized successfully',
      status: 'success' 
    }, { status: 200 });
  } catch (error) {
    console.error('Settings initialization failed:', error);
    
    return NextResponse.json({ 
      message: 'Settings initialization failed',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
