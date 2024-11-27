import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await Promise.resolve(params);
    
    const collection = await prisma.collection.findFirst({
      where: {
        slug,
        isPublic: true
      }
    });

    if (!collection) {
      return NextResponse.json(
        { error: "集合不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error("获取集合失败:", error);
    return NextResponse.json(
      { error: "获取集合失败" },
      { status: 500 }
    );
  }
} 