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

    // Prevent import if any other collection already exists
    const existingCollectionsCount = await prisma.collection.count();

    if (existingCollectionsCount > 0 && !collectionId) {
      throw new Error("Cannot create new collection: collections already exist");
    }

    let targetCollection;
    let insideFolderMap: { [key: string]: string }[] = folderMap || [];

    // Handle collection (create new or use existing)
    if (collectionId) {
      targetCollection = await prisma.collection.findUnique({
        where: { id: collectionId },
      });

      if (!targetCollection) {
        throw new Error("Specified collection does not exist");
      }
    } else {
      // Create new collection
      targetCollection = await prisma.collection.create({
        data: {
          name: name,
          description: description,
        },
      });

      // Use collectionId as slug to update database
      await prisma.collection.update({
        where: { id: targetCollection.id },
        data: {
          slug: targetCollection.id,
        },
      });
    }

    // Create folders individually and ensure parent folders are created
    const folderItems = bookmarks.filter(
      (item: FlattenedBookmarkItem) => item.type === "folder"
    );
    const limit = pLimit(10); // Limit concurrency to 10
    // Group folders by depth
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

    // Process by depth order, create folders at the same depth concurrently
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

    // Create bookmarks in parallel
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

    // Wait for all bookmarks to be created
    await Promise.all(bookmarkPromises);

    return NextResponse.json(
      {
        message: "Import successful",
        collectionId: targetCollection.id,
        insideFolderMap: insideFolderMap,
        itemsImported: bookmarks.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error importing bookmarks:", error);
    return NextResponse.json(
      {
        message: "Import failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}