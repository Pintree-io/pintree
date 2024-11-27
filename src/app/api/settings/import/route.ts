import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const data = await request.json();

    // 验证导入数据的格式
    if (!data.version || !data.settings) {
      return NextResponse.json({ error: '无效的配置文件格式' }, { status: 400 });
    }

    // 开始事务处理
    await prisma.$transaction(async (tx) => {
      // 1. 清除现有设置
      await tx.siteSetting.deleteMany();

      // 2. 导入新设置
      await tx.siteSetting.createMany({
        data: data.settings.map((setting: any) => ({
          key: setting.key,
          value: setting.value,
          type: setting.type,
          group: setting.group,
          description: setting.description,
        }))
      });
    });

    // 3. 恢复静态文件
    if (data.staticFiles) {
      if (data.staticFiles.logo) {
        await saveFile('public/images/logo.png', data.staticFiles.logo);
      }
      if (data.staticFiles.favicon) {
        await saveFile('public/favicon.ico', data.staticFiles.favicon);
      }
      // 可以添加其他静态文件的恢复
    }

    return NextResponse.json({ message: '设置导入成功' });
  } catch (error) {
    console.error('导入设置失败:', error);
    return NextResponse.json({ error: '导入设置失败' }, { status: 500 });
  }
}

async function saveFile(filePath: string, base64Content: string) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const dirPath = path.dirname(fullPath);
    
    // 确保目录存在
    mkdirSync(dirPath, { recursive: true });
    
    // 保存文件
    const buffer = Buffer.from(base64Content, 'base64');
    writeFileSync(fullPath, buffer);
  } catch (error) {
    console.error(`保存文件失败: ${filePath}`, error);
    throw error;
  }
} 