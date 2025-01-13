import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { startAt, endAt, userId, status } = body;

  // 학생 정보 조회
  const student = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const schedule = await prisma.schedule.create({
    data: {
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      teacherId: session.user.id,
      userId: userId,
      status: status,
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

  return NextResponse.json(schedule);
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schedules = await prisma.schedule.findMany({
    where: {
      OR: [
        // 선생님의 직접적인 스케줄
        { teacherId: session.user.id },
        // 선생님의 학생들의 스케줄
        {
          user: {
            teacherId: session.user.id,
          },
        },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          teacherId: true,
        },
      },
    },
    orderBy: {
      startAt: "asc",
    },
  });

  return NextResponse.json(schedules);
}
