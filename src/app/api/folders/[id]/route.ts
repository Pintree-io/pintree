import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 检查文件夹是否存在
    const folder = await prisma.folder.findUnique({
      where: { id: params.id },
    });

    if (!folder) {
      return NextResponse.json({ error: "文件夹不存在" }, { status: 404 });
    }

    // 删除文件夹
    await prisma.folder.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除文件夹失败:", error);
    return NextResponse.json({ error: "删除文件夹失败" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const data = await request.json();

    // 检查文件夹是否存在
    const folder = await prisma.folder.findUnique({
      where: { id: params.id },
    });

    if (!folder) {
      return NextResponse.json({ error: "文件夹不存在" }, { status: 404 });
    }

    // 更新文件夹
    const updatedFolder = await prisma.folder.update({
      where: { id: params.id },
      data: {
        name: data.name,
        icon: data.icon,
        isPublic: data.isPublic,
        password: data.password,
        sortOrder: data.sortOrder,
        parentId: data.parentId,
      },
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error("更新文件夹失败:", error);
    return NextResponse.json({ error: "更新文件夹失败" }, { status: 500 });
  }
}

