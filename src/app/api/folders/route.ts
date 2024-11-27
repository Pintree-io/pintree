import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { name, icon, isPublic, password, collectionId, parentId } = await request.json();

    // 验证必填字段
    if (!name || !collectionId) {
      return NextResponse.json(
        { error: "名称和所属集合为必填项" },
        { status: 400 }
      );
    }

    // 如果指定了parentId,验证父文件夹是否存在且属于同一个集合
    if (parentId) {
      const parentFolder = await prisma.folder.findUnique({
        where: { 
          id: parentId,
          collectionId: collectionId
        }
      });

      if (!parentFolder) {
        return NextResponse.json(
          { error: "父文件夹不存在或不属于该集合" },
          { status: 400 }
        );
      }
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        icon,
        isPublic,
        password,
        collectionId,
        parentId: parentId || null
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "创建文件夹失败" }, { status: 500 });
  }
}
