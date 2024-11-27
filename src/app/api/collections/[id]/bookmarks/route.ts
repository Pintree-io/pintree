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
  const { id } = await Promise.resolve(params);
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");
    const sortField = searchParams.get("sortField") || "updatedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const pageSize = parseInt(searchParams.get("pageSize") || "100");

    // 并行执行书签总数查询和当前书签查询
    const [totalBookmarks, currentBookmarks] = await Promise.all([
      prisma.bookmark.count({
        where: {
          collectionId: id,
        }
      }),
      prisma.bookmark.findMany({
        where: {
          collectionId: id,
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
      })
    ]);

    // 获取子文件夹及其内容
    const subfolders = await Promise.all(
      (await prisma.folder.findMany({
        where: {
          collectionId: id,
          parentId: folderId || null
        },
        orderBy: {
          name: 'asc'
        }
      })).map(async (folder) => {
        // 并行获取文件夹内的书签、子文件夹和总书签数
        const [bookmarks, childFolders, bookmarkCount] = await Promise.all([
          prisma.bookmark.findMany({
            where: {
              folderId: folder.id
            },
            take: pageSize,
            orderBy: {
              [sortField]: sortOrder as 'asc' | 'desc',
            }
          }),
          prisma.folder.findMany({
            where: {
              parentId: folder.id
            },
            orderBy: {
              name: 'asc'
            }
          }),
          prisma.bookmark.count({
            where: {
              folderId: folder.id
            }
          })
        ]);

        return {
          ...folder,
          items: [
            ...childFolders.map(f => ({ ...f, type: 'folder' as const })),
            ...bookmarks.map(b => ({ ...b, type: 'bookmark' as const }))
          ],
          bookmarkCount
        };
      })
    );

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