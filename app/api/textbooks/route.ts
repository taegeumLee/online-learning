import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 현재 사용자의 교재 목록 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        textbooks: {
          select: { id: true },
        },
      },
    });

    const userTextbookIds = new Set(user?.textbooks.map((t) => t.id));

    // 모든 교재 정보 조회
    const textbooks = await prisma.course.findMany({
      include: {
        Textbook: {
          orderBy: [{ level: "asc" }, { sequence: "asc" }],
          select: {
            id: true,
            title: true,
            level: true,
            sequence: true,
            author: true,
            url: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // admin은 모든 교재를 사용할 수 있도록 처리
    const textbooksWithOwnership = textbooks.map((course) => ({
      ...course,
      Textbook: course.Textbook.map((book) => ({
        ...book,
        isOwned:
          session.user.role === "admin" ? true : userTextbookIds.has(book.id),
      })),
    }));

    return NextResponse.json(textbooksWithOwnership);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch textbooks" },
      { status: 500 }
    );
  }
}
