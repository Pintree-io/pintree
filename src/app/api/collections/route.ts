import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get('publicOnly') === 'true';
    
    // Retrieve collections list, optionally filtering for public collections
    const collections = await prisma.collection.findMany({
      where: publicOnly ? {
        isPublic: true
      } : undefined,
      orderBy: {
        sortOrder: "asc"
      }
    });

    // Return data structure:
    // An array of collection objects with the following properties:
    // {
    //   id: string,           // Unique identifier of the collection
    //   name: string,         // Name of the collection
    //   description?: string, // Optional description of the collection
    //   icon?: string,        // Optional icon for the collection
    //   isPublic: boolean,    // Indicates if the collection is publicly visible
    //   viewStyle: string,    // Display style of the collection
    //   sortStyle: string,    // Sorting method for items in the collection
    //   sortOrder: number,    // Numerical order for sorting collections
    //   slug: string,         // URL-friendly name of the collection
    //   totalBookmarks: number // Total number of bookmarks in the collection
    // }
    const collectionsWithBookmarkCount = await Promise.all(
      collections.map(async (collection) => {
        const folders = await prisma.folder.findMany({
          where: {
            collectionId: collection.id
          },
          select: {
            id: true
          }
        });

        const folderIds = folders.map(folder => folder.id);

        const totalBookmarks = await prisma.bookmark.count({
          where: {
            collectionId: collection.id,
            OR: [
              { folderId: null },
              { folderId: { in: folderIds } }
            ]
          }
        });

        return {
          ...collection,
          totalBookmarks
        };
      })
    );

    return NextResponse.json(collectionsWithBookmarkCount);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to get bookmark collections" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
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
      return NextResponse.json(
        {
          error:
            "A collection already exists. Cannot create another collection.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, icon, isPublic, viewStyle, sortStyle, sortOrder } = body;
    const slug = name ? name.toLowerCase().replace(/\s+/g, '-') : "";

    // 检查名称是否已存在
    if (name) {
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
          { error: "The name or slug is already in use" },
          { status: 400 }
        );
      }
    }

    // 创建新集合
    const collection = await prisma.collection.create({
      data: {
        name: name || "",
        description: description || "",
        icon: icon || "",
        isPublic: isPublic ?? true,
        viewStyle: viewStyle || "list",
        sortStyle: sortStyle || "alpha",
        sortOrder: sortOrder ?? 0,
        slug,
      },
    });

    return NextResponse.json(collection);
  } catch (error: unknown) {
    console.error("Detailed error creating collection:", error);
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: "Name or slug already in use" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: `Failed to create collection: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
