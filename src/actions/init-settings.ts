"use server";

import { prisma } from "@/lib/prisma";
import { defaultSettings, defaultImages } from "@/lib/defaultSettings";
import pLimit from "p-limit"; // 推荐使用 p-limit 控制并发
import { headers } from "next/headers";

export async function updateSettingsWithDefaults() {
  // 尝试从多个来源获取 baseUrl
  const referer = headers().get('referer');
  const host = headers().get('host');
  
  let baseUrl = '';

  if (referer) {
    // 优先使用 Referer 的完整 URL
    baseUrl = new URL(referer).origin;
  } else if (host) {
    // 如果没有 Referer，使用 host
    baseUrl = `https://${host}`;
  }

  console.log(`当前基础 URL: ${baseUrl}`);

  try {
    // 使用并发处理
    const limit = pLimit(5); // 限制 5 个并发请求

    // 并发处理设置
    await Promise.all(
      defaultSettings.map((setting) =>
        limit(() => 
          // {
          prisma.siteSetting.upsert({
            where: { key: setting.key },
            update: {},
            create: {
              key: setting.key,
              value: setting.value,
              type: setting.type,
              group: setting.group,
              description: setting.description,
            },
          })
          // console.log(`处理设置 ${setting.key} 成功`);
        // }
      )
      )
    );

    // 并发处理图片
    await Promise.all(
      defaultImages.map(async (imageData) => {

        for (const settingKey of imageData.settingKeys || []) {
          const setting = await prisma.siteSetting.findUnique({
            where: { key: settingKey.key },
          });

          if (setting) {
            const existingSettingImage = await prisma.settingImage.findFirst({
              where: { settingId: setting.id },
            });

            if (!existingSettingImage) {
              const imagesToProcess = imageData.images || [imageData.image];

              await Promise.all(
                imagesToProcess.map(async (imagePath) => {
                  try {
                    const buffer = await fetch(`${baseUrl}${imagePath}`).then(
                      (res) => res.arrayBuffer()
                    );

                    const image = await prisma.image.create({
                      data: {
                        name: imageData.name,
                        data: Buffer.from(buffer),
                        mimeType: getMimeType(imagePath),
                        type: imageData.type,
                        size: buffer.byteLength,
                        isPublic: true,
                      },
                    });

                    await prisma.settingImage.create({
                      data: {
                        settingId: setting.id,
                        imageId: image.id,
                        description: `Default ${imageData.name} for ${settingKey.key}`,
                      },
                    });
                    console.log(`处理图片 ${imagePath} 成功`);
                  } catch (error) {
                    console.error(`处理图片 ${imagePath} 失败:`, error);
                    throw error;
                  }
                })
              );
            }
          }
        }
      })
    );

    console.log("设置和图片更新完成");
  } catch (error) {
    console.error("更新设置失败:", error);
    throw error;
  }
}

// 获取文件的 MIME 类型
function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "ico":
      return "image/x-icon";
    default:
      return "application/octet-stream";
  }
}
