import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentTextbookId } = await req.json();
    const { userId } = params;

    // 현재 교재의 정보 조회
    const currentTextbook = await prisma.textbook.findUnique({
      where: { id: currentTextbookId },
      include: { course: true },
    });

    if (!currentTextbook) {
      return NextResponse.json(
        { error: "Current textbook not found" },
        { status: 404 }
      );
    }

    // 다음 sequence의 교재 찾기
    const nextTextbook = await prisma.textbook.findFirst({
      where: {
        courseId: currentTextbook.courseId,
        level: currentTextbook.level,
        sequence: currentTextbook.sequence
          ? {
              gt: currentTextbook.sequence,
            }
          : undefined,
      },
      orderBy: {
        sequence: "asc",
      },
    });

    if (!nextTextbook) {
      return NextResponse.json(
        { error: "No next textbook available" },
        { status: 404 }
      );
    }

    // 사용자의 교재 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        recentTextbookId: nextTextbook.id,
        textbooks: {
          connect: { id: nextTextbook.id },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error assigning next textbook:", error);
    return NextResponse.json(
      { error: "Failed to assign next textbook" },
      { status: 500 }
    );
  }
}
