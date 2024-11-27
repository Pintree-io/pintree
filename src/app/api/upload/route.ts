import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import path from 'path';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // logo 或 favicon

    if (!file) {
      return NextResponse.json({ error: "未找到文件" }, { status: 400 });
    }

    // 文件路径映射
    const pathMap: Record<string, string> = {
      logo: 'public/images/logo.png',
      favicon: 'public/favicon.ico'
    };

    const filePath = pathMap[type];
    if (!filePath) {
      return NextResponse.json({ error: "无效的文件类型" }, { status: 400 });
    }

    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 保存文件
    const fullPath = path.join(process.cwd(), filePath);
    await writeFile(fullPath, buffer);

    return NextResponse.json({ 
      success: true,
      path: filePath.replace('public', '') 
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    return NextResponse.json({ error: "文件上传失败" }, { status: 500 });
  }
}

export const preferredRegion = 'auto' 