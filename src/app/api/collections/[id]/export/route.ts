export interface ExportedData {
  metadata: {
    version: string;
    exportedAt: string;
    exportedFrom: string;
    // exporterId: string;
  };
  collection: {
    name: string;
    description?: string;
    icon?: string;
    isPublic: boolean;
    viewStyle: string;
    sortStyle: string;
  };
  // data: (ExportedFolder | ExportedBookmark)[]
  folders: { [level: number]: ExportedFolder[][] }

  bookmarks: ExportedBookmark[];
}

export interface ExportedFolder {
  tempId: string;
  type: string;
  name: string;
  icon?: string;
  sortOrder: number;
  parentTempId?: string;
  level: number;
  path: string[];
}

export interface ExportedBookmark {
  tempId: string;
  type: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  isFeatured: boolean;
  sortOrder: number;
  folderTempId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}


import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { randomUUID } from 'crypto';
import { Folder } from "@prisma/client";

export const maxDuration = 60;
export const dynamic = "force-dynamic";


function buildFolderHierarchy(folders: Folder[]): {
  folders: ExportedFolder[];
  idMapping: Map<string, string>;
} {
  const folderMap = new Map<string, ExportedFolder>();
  const idMapping = new Map<string, string>();
  const rootFolders: ExportedFolder[] = [];

  // First iteration: create basic mapping
  folders.forEach(folder => {
    const tempId = randomUUID();
    idMapping.set(folder.id, tempId); // Store original id to temporary id mapping

    const exportedFolder: ExportedFolder = {
      tempId,
      type: 'folder',
      name: folder.name,
      icon: folder.icon || undefined,
      sortOrder: folder.sortOrder,
      parentTempId: undefined, // Set later
      level: 0,
      path: [],
    };
    folderMap.set(folder.id, exportedFolder);
  });

  // Second iteration: establish hierarchy
  folders.forEach(folder => {
    const currentFolder = folderMap.get(folder.id)!;
    
    if (folder.parentId) {
      const parentFolder = folderMap.get(folder.parentId);
      if (parentFolder) {
        currentFolder.parentTempId = parentFolder.tempId;
        currentFolder.level = parentFolder.level + 1;
        currentFolder.path = [...parentFolder.path, folder.name];
      }
    } else {
      rootFolders.push(currentFolder);
    }
  });

  return {
    folders: [...folderMap.values()],
    idMapping
  };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log('session', session);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const collection = await prisma.collection.findFirst({
      where: {
        id: params.id,
      },
      include: {
        folders: {
          include: {
            bookmarks: {
              where: {
                folderId: { not: null } // Only get bookmarks belonging to folders
              },
              include: {
                tags: true,
              },
            }
          },
        },
        bookmarks: {
          where: {
            folderId: null // Only get bookmarks directly belonging to the collection
          },
          include: {
            tags: true,
          },
        }
      }
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found or access denied" },
        { status: 404 }
      );
    }

    // Process folder hierarchy
    const { folders: processedFolders, idMapping } = buildFolderHierarchy(collection.folders);
    // Group folders by level, limit each group to 100
    const foldersByLevel: { [level: number]: ExportedFolder[][] } = {};
    processedFolders.forEach(folder => {
      if (!foldersByLevel[folder.level]) {
        foldersByLevel[folder.level] = [];
      }
      
      // If the last subarray of the current level is not full, add to the last subarray
      const currentLevelFolders = foldersByLevel[folder.level];
      if (currentLevelFolders.length === 0 || 
          currentLevelFolders[currentLevelFolders.length - 1].length >= 100) {
        currentLevelFolders.push([folder]);
      } else {
        currentLevelFolders[currentLevelFolders.length - 1].push(folder);
      }
    });
    
    // Process bookmarks
    const processedBookmarks: ExportedBookmark[] = [
      // Process bookmarks within folders
      ...collection.folders.flatMap(folder =>
        folder.bookmarks.map(bookmark => ({
          tempId: randomUUID(),
          type: 'bookmark',
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description || undefined,
          icon: bookmark.icon || undefined,
          isFeatured: bookmark.isFeatured,
          sortOrder: bookmark.sortOrder,
          folderTempId: idMapping.get(folder.id), // Use mapping to get new tempId
          tags: bookmark.tags.map(tag => tag.name),
          createdAt: bookmark.createdAt.toISOString(),
          updatedAt: bookmark.updatedAt.toISOString(),
        }))
      ),
      // Process bookmarks directly belonging to Collection
      ...collection.bookmarks.map(bookmark => ({
        tempId: randomUUID(),
        type: 'bookmark',
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description || undefined,
        icon: bookmark.icon || undefined,
        isFeatured: bookmark.isFeatured,
        sortOrder: bookmark.sortOrder,
        folderTempId: undefined,
        tags: bookmark.tags.map(tag => tag.name),
        createdAt: bookmark.createdAt.toISOString(),
        updatedAt: bookmark.updatedAt.toISOString(),
      }))
    ];

    // Build export data
    const exportData: ExportedData = {
      metadata: {
        version: "1.0.0",
        exportedFrom:'PintreePro',
        exportedAt: new Date().toISOString(),
      },
      collection: {
        name: collection.name,
        description: collection.description || undefined,
        icon: collection.icon || undefined,
        isPublic: collection.isPublic,
        viewStyle: collection.viewStyle,
        sortStyle: collection.sortStyle,
      },
      // folders: processedFolders,
      folders: foldersByLevel,
      bookmarks: processedBookmarks,

    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export collection" },
      { status: 500 }
    );
  }
}