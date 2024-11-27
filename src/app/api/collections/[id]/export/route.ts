import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    console.log("Exporting collection:", id);

    // 获取集合信息
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        folders: {
          include: {
            parent: true
          }
        },
        bookmarks: {
          include: {
            folder: true
          }
        }
      }
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    console.log("Found collection:", {
      name: collection.name,
      foldersCount: collection.folders.length,
      bookmarksCount: collection.bookmarks.length
    });

    // 处理文件夹数据
    const processedFolders = collection.folders.map(folder => ({
      name: folder.name,
      icon: folder.icon || "",
      addDate: folder.createdAt.toISOString(),
      parentId: folder.parent?.name || null
    }));

    // 处理书签数据
    const processedBookmarks = collection.bookmarks.map(bookmark => ({
      title: bookmark.title,
      url: bookmark.url,
      icon: bookmark.icon || "",
      addDate: bookmark.createdAt.toISOString(),
      folderId: bookmark.folder?.name || null
    }));

    // 构建最终的导出数据
    const exportData = {
      name: collection.name,
      folders: processedFolders,
      bookmarks: processedBookmarks
    };

    console.log("Export data prepared:", {
      name: exportData.name,
      foldersCount: exportData.folders.length,
      bookmarksCount: exportData.bookmarks.length
    });

    return NextResponse.json(exportData);
  } catch (error) {
    console.error("Export failed:", error);
    return NextResponse.json(
      { error: "Export failed" },
      { status: 500 }
    );
  }
}