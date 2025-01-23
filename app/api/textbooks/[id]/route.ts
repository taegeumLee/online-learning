import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // URL에서 id 추출
    const id = request.url.split("/").pop();
    if (!id) {
      return NextResponse.json(
        { error: "Textbook ID is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const textbook = await prisma.textbook.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        author: true,
        url: true,
        level: true,
        sequence: true,
      },
    });

    if (!textbook) {
      return NextResponse.json(
        { error: "Textbook not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(textbook);
  } catch (error: unknown) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch textbook" },
      { status: 500 }
    );
  }
}
