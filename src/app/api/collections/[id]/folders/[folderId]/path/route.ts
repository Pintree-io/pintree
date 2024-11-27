import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string; folderId: string } }
) {
  try {
    // 等待参数解析
    const { id, folderId } = await Promise.resolve(params);
    
    // 验证参数
    if (!id || !folderId) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    const path = [];
    let currentFolder = await prisma.folder.findUnique({
      where: { 
        id: folderId,
        collectionId: id // 确保文件夹属于正确的集合
      }
    });

    while (currentFolder) {
      path.unshift({
        id: currentFolder.id,
        name: currentFolder.name
      });
      
      if (!currentFolder.parentId) break;
      
      currentFolder = await prisma.folder.findUnique({
        where: { 
          id: currentFolder.parentId,
          collectionId: id
        }
      });
    }

    return NextResponse.json(path);
  } catch (error) {
    console.error("获取文件夹路径失败:", error);
    return NextResponse.json(
      { error: "获取文件夹路径失败" },
      { status: 500 }
    );
  }
}
