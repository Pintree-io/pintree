export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { readFileSync } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 获取所有设置
    const settings = await prisma.siteSetting.findMany();

    // 获取静态文件内容
    const staticFiles = {
      logo: getFileContent('public/images/logo.png'),
      favicon: getFileContent('public/favicon.ico'),
      // 可以添加其他静态文件
    };

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      settings,
      staticFiles,
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('导出设置失败:', error);
    return NextResponse.json({ error: '导出设置失败' }, { status: 500 });
  }
}

function getFileContent(filePath: string): string | null {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const buffer = readFileSync(fullPath);
    return buffer.toString('base64');
  } catch (error) {
    console.error(`读取文件失败: ${filePath}`, error);
    return null;
  }
}
