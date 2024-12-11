export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

function getSearchWhereClause(query: string, scope: string, collectionId: string | null, isAuthenticated: boolean) {
  const baseConditions = {
    OR: [
      { title: { contains: query, mode: 'insensitive' as const } },
      { description: { contains: query, mode: 'insensitive' as const } },
      { url: { contains: query, mode: 'insensitive' as const } }
    ]
  };

  if (scope === 'current' && collectionId) {
    return {
      AND: [
        baseConditions,
        { collectionId: collectionId }
      ]
    };
  }

  if (scope === 'all') {
    if (isAuthenticated) {
      return baseConditions;
    } else {
      return {
        AND: [
          baseConditions,
          { collection: { isPublic: true } }
        ]
      };
    }
  }

  return {
    AND: [
      baseConditions,
      { id: 'none' }
    ]
  };
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get("q");
    const scope = searchParams.get("scope") || "all";
    const collectionId = searchParams.get("collectionId");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "100");
    const skip = (page - 1) * pageSize;

    if (!query) {
      return NextResponse.json({ bookmarks: [], total: 0 });
    }

    const whereClause = getSearchWhereClause(query, scope, collectionId, !!session);

    const [total, bookmarks] = await Promise.all([
      prisma.bookmark.count({
        where: whereClause
      }),
      prisma.bookmark.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        include: {
          collection: {
            select: {
              name: true,
              slug: true,
              isPublic: true
            }
          },
          folder: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })
    ]);

    return NextResponse.json({ 
      bookmarks, 
      total,
      currentPage: page,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error("Search bookmarks failed:", error);
    return NextResponse.json(
      { error: "Search bookmarks failed" },
      { status: 500 }
    );
  }
}
