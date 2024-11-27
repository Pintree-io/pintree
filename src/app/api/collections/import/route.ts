import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { Prisma } from "@prisma/client";

interface ImportFolder {
  name: string;
  icon?: string;
  addDate: string | number;
  parentId?: string | null;
}

interface ImportBookmark {
  title: string;
  url: string;
  icon?: string;
  addDate: string | number;
  folderId?: string | null;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log("未授权访问");
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }
    // 检查是否已经存在任何集合
    const existingCollections = await prisma.collection.findMany({
      take: 1,
    });

    if (existingCollections.length > 0) {
      console.log("已存在集合，不允许导入");
      return NextResponse.json(
        {
          error:
            "A collection already exists. Cannot import another collection.",
        },
        { status: 403 }
      );
    }

    console.log("开始处理导入请求");
    const body = await request.text();
    console.log("请求体大小:", body.length);

    let data;
    try {
      data = JSON.parse(body);
      console.log("JSON解析成功，数据结构:", {
        hasName: !!data.name,
        hasFolders: Array.isArray(data.folders),
        hasBookmarks: Array.isArray(data.bookmarks),
        foldersLength: data.folders?.length,
        bookmarksLength: data.bookmarks?.length
      });
    } catch (e) {
      console.error("JSON解析失败:", e);
      return NextResponse.json({ 
          error: "Invalid JSON format",
        details: e instanceof Error ? e.message : 'Unknown parsing error'
      }, { status: 400 });
    }

    const { name, folders = [], bookmarks = [] } = data;

    if (!name) {
      console.log("缺少集合名称");
      return NextResponse.json({ 
          error: "Collection name is required",
        receivedData: { name, foldersCount: folders.length, bookmarksCount: bookmarks.length }
      }, { status: 400 });
    }

    console.log("导入数据概览:", {
      name,
      foldersCount: folders.length,
      bookmarksCount: bookmarks.length
    });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // 检查名称和slug是否已存在
    const existingCollection = await prisma.collection.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ]
      }
    });

    if (existingCollection) {
      return NextResponse.json(
        { error: "Collection name or slug already exists" },
        { status: 400 }
      );
    }

    // 创建新集合
    const collection = await prisma.collection.create({
      data: {
        name,
        slug,
        description: "",
        icon: "",
        isPublic: true,
        viewStyle: "list",
        sortStyle: "alpha",
      },
    });

    // 创建文件夹映射
    const folderMap = new Map();

    // 分批处理文件夹，每批25个
    const FOLDER_BATCH_SIZE = 25;
    for (let i = 0; i < folders.length; i += FOLDER_BATCH_SIZE) {
      const batch = folders.slice(i, i + FOLDER_BATCH_SIZE);
      console.log(`处理文件夹批次 ${Math.floor(i/FOLDER_BATCH_SIZE) + 1}/${Math.ceil(folders.length/FOLDER_BATCH_SIZE)}`);

      await Promise.all(batch.map(async (folder: ImportFolder) => {
          try {
            const createdFolder = await prisma.folder.create({
              data: {
                name: folder.name,
                icon: folder.icon || "",
                isPublic: true,
                sortOrder: 0,
                collectionId: collection.id,
              parentId: folder.parentId ? folderMap.get(folder.parentId) : null,
                createdAt: new Date(folder.addDate),
              },
            });
            folderMap.set(folder.name, createdFolder.id);
          } catch (error) {
          console.error('创建文件夹失败:', error, folder);
          }
      }));
    }

    // 分批处理书签，每批50个
    const BOOKMARK_BATCH_SIZE = 50;
    for (let i = 0; i < bookmarks.length; i += BOOKMARK_BATCH_SIZE) {
      const batch = bookmarks.slice(i, i + BOOKMARK_BATCH_SIZE);
      console.log(`处理书签批次 ${Math.floor(i/BOOKMARK_BATCH_SIZE) + 1}/${Math.ceil(bookmarks.length/BOOKMARK_BATCH_SIZE)}`);

      await Promise.all(batch.map(async (bookmark: ImportBookmark) => {
          try {
            await prisma.bookmark.create({
              data: {
                title: bookmark.title,
                url: bookmark.url,
                description: "",
                icon: bookmark.icon || "",
                isFeatured: false,
                sortOrder: 0,
                viewCount: 0,
                collectionId: collection.id,
              folderId: bookmark.folderId ? folderMap.get(bookmark.folderId) : null,
                createdAt: new Date(bookmark.addDate),
              },
            });
          } catch (error) {
          console.error('创建书签失败:', error, bookmark);
          }
      }));
    }

    console.log("导入完成:", {
      collectionId: collection.id,
      name: collection.name,
      foldersProcessed: folderMap.size,
      bookmarksProcessed: bookmarks.length
    });

    return NextResponse.json({
      message: "Import successful",
      collection
    });
  } catch (error) {
    console.error("导入失败，详细错误:", error);
    return NextResponse.json(
      { 
        error: `Import failed`,
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
