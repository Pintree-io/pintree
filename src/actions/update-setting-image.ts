'use server'

import { prisma } from "@/lib/prisma";
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// 图片设置验证模式
const SettingImageSchema = z.object({
  settingKey: z.string().min(1, '设置键不能为空'),
  file: z.instanceof(File),
  imageId: z.string().optional()
});

// 上传图片的函数
async function uploadImage(file: File, existingImageId?: string) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
  
      // 只更新 Image 表，不动 SettingImage
      const image = await prisma.image.upsert({
        where: { id: existingImageId || '' },
        update: {
          name: file.name,
          data: buffer,
          mimeType: file.type,
          size: file.size,
          description: `Setting image: ${file.name}`
        },
        create: {
          name: file.name,
          data: buffer,
          mimeType: file.type,
          type: 'setting',
          size: file.size,
          description: `Setting image: ${file.name}`
        },
        select: {
          id: true,
          name: true,
          mimeType: true,
          size: true
        }
      });
  
      return image;
    } catch (error) {
      console.error('图片上传失败:', error);
      throw new Error(`图片 ${file.name} 上传失败`);
    }
  }

export async function updateSettingImage(formData: FormData) {
  const settingKey = formData.get('settingKey') as string;
  const imageId = formData.get('imageId') as string | null;
  const file = formData.get('file') as File;

  if (!settingKey || !file) {
    throw new Error('缺少必要参数');
  }

  const setting = await prisma.siteSetting.findUnique({
    where: { key: settingKey },
    include: {
      images: {
        select: { imageId: true }
      }
    }
  });

  if (!setting) {
    throw new Error(`未找到对应的设置项: ${settingKey}`);
  }

  const existingImageId = imageId || setting.images[0]?.imageId;

  if (!existingImageId) {
    throw new Error(`未找到对应的图片: ${settingKey}`);
  }

  // const validatedData = SettingImageSchema.parse({ 
  //   settingKey, 
  //   file, 
  //   imageId: existingImageId 
  // });

  const uploadedImage = await uploadImage(file, existingImageId);

  // 清除所有缓存
  revalidatePath('/', 'layout');

  return { 
    settingKey,
    success: true, 
    image: uploadedImage 
  };
}