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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 检查文件夹是否存在
    const folder = await prisma.folder.findUnique({
      where: { id: params.id },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // 删除文件夹
    await prisma.folder.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Delete success" });
  } catch (error) {
    console.error("Delete folder failed:", error);
    return NextResponse.json({ error: "Delete folder failed" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // 检查文件夹是否存在
    const folder = await prisma.folder.findUnique({
      where: { id: params.id },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
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
    console.error("Update folder failed:", error);
    return NextResponse.json({ error: "Update folder failed" }, { status: 500 });
  }
}

