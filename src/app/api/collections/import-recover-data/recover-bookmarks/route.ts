import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ExportedBookmark } from "../../[id]/export/route";
import pLimit from "p-limit";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
) {
  try {
    // Parse imported data
    const { bookmarks, collectionId, folderMap } = await request.json();
    
    // Prevent import if any other collection already exists
    const existingCollectionsCount = await prisma.collection.count();

    if (existingCollectionsCount > 0 && !collectionId) {
      throw new Error("Cannot create new collection: collections already exist");
    }
    

    // Set concurrency limit, for example, process 5 bookmarks simultaneously
    const limit = pLimit(10);

    // Use p-limit to concurrently import bookmarks
    const importedBookmarks = await Promise.all(
      bookmarks.map((bookmark: ExportedBookmark) => 
        limit(async () => {
          const folderId = bookmark.folderTempId
            ? folderMap.find((item: any) => item.tempId === bookmark.folderTempId)?.id
            : undefined;

          return prisma.bookmark.create({
            data: {
              title: bookmark.title,
              url: bookmark.url,
              description: bookmark.description,
              icon: bookmark.icon,
              isFeatured: bookmark.isFeatured,
              sortOrder: bookmark.sortOrder,
              collectionId: collectionId,
              folderId: folderId,
              tags: {
                connectOrCreate: bookmark.tags.map((tagName) => ({
                  where: {
                    name: tagName,
                  },
                  create: {
                    name: tagName,
                  },
                })),
              },
            },
          });
        })
      )
    );

    return NextResponse.json({
      message: "Bookmarks import successful",
      importedBookmarkCount: importedBookmarks.length,
    });
  } catch (error) {
    console.error("Import bookmarks error:", error);
    return NextResponse.json(
      { error: "Failed to import bookmarks", details: String(error) },
      { status: 500 }
    );
  }
}