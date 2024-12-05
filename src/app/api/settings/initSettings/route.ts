import { NextRequest, NextResponse } from 'next/server';
import { updateSettingsWithDefaults } from '@/actions/init-settings';

// 增加超时时间到最大值
export const maxDuration = 60; // Vercel Hobby 允许的最大时间是 60 秒
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 调用初始化设置的服务器操作
    await updateSettingsWithDefaults();
    
    return NextResponse.json({ 
      message: '设置初始化成功',
      status: 'success' 
    }, { status: 200 });
  } catch (error) {
    console.error('初始化设置失败:', error);
    
    return NextResponse.json({ 
      message: '设置初始化失败',
      status: 'error',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
