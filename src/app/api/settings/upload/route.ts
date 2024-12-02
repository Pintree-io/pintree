import { writeFile, mkdir } from 'fs/promises';
import { NextRequest } from 'next/server';
import path from 'path';
import { prisma } from '@/lib/prisma';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    
    if (!file) {
      return Response.json({ error: '没有文件' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    if (type === 'logo') {
      // 使用 sharp 压缩图片
      const compressedBuffer = await sharp(buffer)
        .resize(520, 120, { fit: 'inside' }) // 限制最大尺寸
        .jpeg({ quality: 80 }) // 使用 JPEG 格式并压缩质量
        .toBuffer();
      
      // 将压缩后的图片转换为 base64
      const base64String = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
      
      // 更新数据库中的 logoUrl
      await prisma.siteSetting.upsert({
        where: { key: 'logoUrl' },
        update: { value: base64String },
        create: { 
          key: 'logoUrl',
          value: base64String
        }
      });

      return Response.json({ 
        success: true,
        logoUrl: base64String
      });
    } else if (type === 'favicon') {
      // 确保 favicon 目录存在
      const faviconDir = path.join(process.cwd(), 'public', 'favicon');
      await mkdir(faviconDir, { recursive: true });

      // 使用 sharp 处理图片
      const image = sharp(buffer);
      
      // 生成不同尺寸的 PNG 图标
      const sizes = [16, 32, 192, 512];
      for (const size of sizes) {
        await image
          .resize(size, size)
          .png()
          .toFile(path.join(faviconDir, `favicon-${size}x${size}.png`));
      }
      
      // 生成 ICO 格式
      await image
        .resize(32, 32)
        .toFile(path.join(faviconDir, 'favicon.ico'));
      
      // 更新数据库
      await prisma.siteSetting.upsert({
        where: { key: 'faviconUrl' },
        update: { value: '/favicon/favicon.ico' },
        create: { 
          key: 'faviconUrl',
          value: '/favicon/favicon.ico'
        }
      });

      return Response.json({ 
        success: true,
        faviconUrl: '/favicon/favicon.ico'
      });
    } else if (type === 'og-image') {
      await writeFile(path.join(process.cwd(), 'public', 'og-image.png'), buffer);
    } else if (type === 'sidebar-ads') {
      // 转换为 base64
      const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;
      
      // 更新数据库
      await prisma.siteSetting.upsert({
        where: { key: 'sidebarAdsImageUrl' },
        update: { value: base64String },
        create: { 
          key: 'sidebarAdsImageUrl',
          value: base64String
        }
      });

      return Response.json({ 
        success: true,
        url: base64String
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('上传失败:', error);
    return Response.json({ error: '上传失败' }, { status: 500 });
  }
} 