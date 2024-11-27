import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Folder, Bookmark } from "@prisma/client";

// 定义返回数据的类型
interface FolderWithItems extends Folder {
  items: Array<(Folder | Bookmark) & { type: 'folder' | 'bookmark' }>;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const id = params.id;
    const folderId = searchParams.get("folderId");
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // 打印详细的查询条件
    console.log("Query conditions:", {
      collectionId: id,
      folderId: folderId || null
    });

    // 先检查该集合下是否有书签（不带 folderId 条件）
    const totalBookmarks = await prisma.bookmark.count({
      where: {
        collectionId: id,
      }
    });

    console.log("Total bookmarks in collection:", totalBookmarks);

    // 获取书签，修改查询条件
    const currentBookmarks = await prisma.bookmark.findMany({
      where: {
        collectionId: id,
        // 如果 folderId 为 null 或 undefined，则获取根目录的书签
        // 如果 folderId 有值，则获取对应文件夹的书签
        ...(folderId ? { folderId } : { folderId: null })
      },
      orderBy: {
        [sortField]: sortOrder as 'asc' | 'desc',
      },
      include: {
        collection: {
          select: {
            name: true,
          },
        },
        folder: {
          select: {
            name: true,
          },
        },
      },
    });

    // 打印查询结果
    console.log("Query results:", {
      totalFound: currentBookmarks.length,
      bookmarks: currentBookmarks
    });

    // 获取子文件夹
    const subfolders = await prisma.folder.findMany({
      where: {
        collectionId: id,
        parentId: folderId || null
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log("Subfolders found:", subfolders.length);

    return NextResponse.json({
      currentBookmarks,
      subfolders,
    });

  } catch (error) {
    console.error("获取内容失败:", error);
    return NextResponse.json(
      { error: "获取内容失败", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
