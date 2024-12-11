import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await Promise.resolve(params);
  
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";
    const parentId = searchParams.get("parentId");

    const folders = await prisma.folder.findMany({
      where: {
        collectionId: id,
        ...(all ? {} : { parentId: parentId || null }),
      },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error("Failed to get folders:", error);
    return NextResponse.json(
      { error: "Failed to get folders" },
      { status: 500 }
    );
  }
}
