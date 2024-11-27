import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { name, icon, isPublic, password, sortOrder } = await request.json();

    // 验证必填字段
    if (!name) {
      return NextResponse.json(
        { error: "名称为必填项" },
        { status: 400 }
      );
    }

    const folder = await prisma.folder.update({
      where: { id: params.id },
      data: {
        name,
        icon,
        isPublic,
        password,
        sortOrder,
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "更新文件夹失败" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    await prisma.folder.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "删除文件夹失败" }, { status: 500 });
  }
}