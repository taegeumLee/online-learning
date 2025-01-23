import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // URL에서 studentId 추출
    const studentId = request.url.split("/").pop();

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 5일 전 날짜 계산
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    // 5일 이상 된 메시지 삭제
    await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: studentId },
          { senderId: studentId, receiverId: session.user.id },
        ],
        createdAt: {
          lt: fiveDaysAgo,
        },
      },
    });

    // 남은 메시지 조회
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: studentId },
          { senderId: studentId, receiverId: session.user.id },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("메시지를 가져오는 중 오류 발생:", error);
    return NextResponse.json(
      { error: "메시지를 가져오는데 실패했습니다" },
      { status: 500 }
    );
  }
}
