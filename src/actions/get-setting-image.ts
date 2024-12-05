'use server'

import { prisma } from "@/lib/prisma";

export async function getSettingImages(settingKey: string) {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: settingKey },
      include: {
        images: {
          select: {
            imageId: true
          },
        }
      }
    });

    // console.log('setting', setting);

    if (!setting) {
      return { success: false, error: '未找到对应的设置项' };
    }

    const imageIds = setting.images.map(img => img.imageId);

    return { 
      success: true, 
      imageIds 
    };
  } catch (error) {
    console.error('获取设置图片失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '获取设置图片失败' 
    };
  }
}
