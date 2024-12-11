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
      return { success: false, error: 'Could not find the corresponding setting item' };
    }

    const imageIds = setting.images.map(img => img.imageId);

    return { 
      success: true, 
      imageIds 
    };
  } catch (error) {
    console.error('Failed to get setting images:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get setting images' 
    };
  }
}
