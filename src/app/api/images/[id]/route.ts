import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma";



export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const image = await prisma.image.findUnique({
      where: { id: params.id }
    })

    if (!image) {
      return new NextResponse(null, { status: 404 })
    }

    return new NextResponse(image.data, {
      headers: {
        'Content-Type': image.mimeType,
        'Content-Length': image.size.toString()
      }
    })
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}