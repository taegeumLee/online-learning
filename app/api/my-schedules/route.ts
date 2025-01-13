import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 현재 로그인한 사용자 세션 가져오기
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 현재 사용자의 수업 일정 조회
    const schedules = await prisma.schedule.findMany({
      where: {
        userId: session.user.id,
        // 지난 일정도 포함하되, 최근 1개월부터 향후 2개월까지의 일정만 조회
        startAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1)), // 1개월 전
          lte: new Date(new Date().setMonth(new Date().getMonth() + 2)), // 2개월 후
        },
      },
      orderBy: {
        startAt: "asc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
