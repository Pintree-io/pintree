import { NextRequest, NextResponse } from "next/server";
import pLimit from "p-limit";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

interface FlattenedBookmarkItem {
  id: string;
  type: "folder" | "link";
  title: string;
  parentId?: string;
  sortOrder: number;
  addDate?: number;
  url?: string;
  icon?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, bookmarks, collectionId, folderMap } =
      await request.json();

    let targetCollection;
    let insideFolderMap: { [key: string]: string }[] = folderMap || [];

    // 处理集合（新建或使用已存在的）
    if (collectionId) {
      targetCollection = await prisma.collection.findUnique({
        where: { id: collectionId },
      });

      if (!targetCollection) {
        throw new Error("指定的集合不存在");
      }
    } else {
      // 检查是否已存在同名集合
      const existingCollection = await prisma.collection.findFirst({
        where: { name: name },
      });

      if (existingCollection) {
        throw new Error("集合名称已存在");
      }

      // 创建新集合
      targetCollection = await prisma.collection.create({
        data: {
          name: name,
          description: description,
        },
      });

      // 使用 collectionId 作为 slug 更新数据库
      await prisma.collection.update({
        where: { id: targetCollection.id },
        data: {
          slug: targetCollection.id,
        },
      });
    }

    // 逐个创建文件夹，并确保父文件夹已创建
    const folderItems = bookmarks.filter(
      (item: FlattenedBookmarkItem) => item.type === "folder"
    );
    const limit = pLimit(10); // 限制并发数为10
    // 按深度对文件夹分组
    const foldersByDepth = folderItems.reduce(
      (
        acc: Record<number, FlattenedBookmarkItem[]>,
        folder: FlattenedBookmarkItem & { depth: number }
      ) => {
        const depth = folder.depth;
        if (!acc[depth]) {
          acc[depth] = [];
        }
        acc[depth].push(folder);
        return acc;
      },
      {} as Record<number, FlattenedBookmarkItem[]>
    );

    // 按深度顺序处理，同深度的文件夹并发创建
    const depths = Object.keys(foldersByDepth)
      .map(Number)
      .sort((a, b) => a - b);
    for (const depth of depths) {
      const foldersAtDepth = foldersByDepth[depth];
      const promises = foldersAtDepth.map((folder: FlattenedBookmarkItem) =>
        limit(async () => {
          const existingMapping = insideFolderMap.find(
            (item) => item.processId === folder.id
          );
          if (!existingMapping) {
            const parentId = folder.parentId
              ? insideFolderMap.find(
                  (item) => item.processId === folder.parentId
                )?.dataBaseId
              : undefined;

            const createdFolder = await prisma.folder.create({
              data: {
                name: folder.title,
                collectionId: targetCollection.id,
                parentId: parentId,
                sortOrder: folder.sortOrder,
              },
            });

            insideFolderMap.push({
              dataBaseId: createdFolder.id,
              processId: folder.id,
            });
          }
        })
      );

      await Promise.all(promises);
    }

    // 并行创建书签
    const bookmarkItems = bookmarks.filter(
      (item: FlattenedBookmarkItem) => item.type === "link"
    );
    const bookmarkPromises = bookmarkItems.map(
      (bookmark: FlattenedBookmarkItem) =>
        limit(async () => {
          const folderId = bookmark.parentId
            ? insideFolderMap.find(
                (item) => item.processId === bookmark.parentId
              )?.dataBaseId
            : undefined;

          await prisma.bookmark.create({
            data: {
              title: bookmark.title,
              url: bookmark.url || "",
              icon: bookmark.icon,
              collectionId: targetCollection.id,
              folderId: folderId,
              sortOrder: bookmark.sortOrder,
            },
          });
        })
    );

    // 等待所有书签创建完成
    await Promise.all(bookmarkPromises);

    return NextResponse.json(
      {
        message: "导入成功",
        collectionId: targetCollection.id,
        insideFolderMap: insideFolderMap,
        itemsImported: bookmarks.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("导入书签时发生错误:", error);
    return NextResponse.json(
      {
        message: "导入失败",
        error: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}