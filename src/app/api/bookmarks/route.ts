import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "100");
    const skip = (page - 1) * pageSize;

    // 使用 Promise.all 并行执行查询
    const [total, bookmarks] = await Promise.all([
      // 获取总数
      prisma.bookmark.count(),
      // 获取分页数据
      prisma.bookmark.findMany({
        select: {
          id: true,
          title: true,
          url: true,
          description: true,
          icon: true,
          isFeatured: true,
          createdAt: true,
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
        skip,
        take: pageSize,
        orderBy: {
          updatedAt: "desc",
        },
      })
    ]);

    return NextResponse.json({
      bookmarks,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / pageSize)
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "获取书签失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { title, url, description, icon, collectionId, folderId, tags, isFeatured, sortOrder } = await request.json();

    // 验证必填字段
    if (!title || !url || !collectionId) {
      return NextResponse.json(
        { error: "标题、URL和所属集合为必填项" },
        { status: 400 }
      );
    }

    // 创建书签的基础数据
    const bookmarkData = {
      title,
      url,
      description,
      icon,
      collectionId,
      isFeatured: isFeatured ?? false,
      sortOrder: sortOrder ?? 0,
    };

    // 如果提供了有效的 folderId，则添加到数据中
    if (folderId && folderId !== "none") {
      // 验证文件夹是否存在且属于正确的集合
      const folder = await prisma.folder.findUnique({
        where: {
          id: folderId,
          collectionId: collectionId
        }
      });

      if (!folder) {
        return NextResponse.json(
          { error: "所选文件夹不存在或不属于该集合" },
          { status: 400 }
        );
      }

      Object.assign(bookmarkData, { folderId });
    }

    const bookmark = await prisma.bookmark.create({
      data: bookmarkData,
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
        tags: true,
      },
    });

    return NextResponse.json(bookmark);
  } catch (error) {
    console.error("创建书签失败:", error);
    return NextResponse.json(
      { error: "创建书签失败，请检查所有字段是否正确" },
      { status: 500 }
    );
  }
}
