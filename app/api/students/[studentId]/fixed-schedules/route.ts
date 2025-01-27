import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { addWeeks, startOfWeek, endOfWeek } from "date-fns";

export async function GET(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params;

    const schedules = await prisma.fixedSchedule.findMany({
      where: {
        userId: studentId,
      },
      orderBy: {
        dayOfWeek: "asc",
      },
      select: {
        id: true,
        dayOfWeek: true,
        startHour: true,
        startMinute: true,
        endHour: true,
        endMinute: true,
      },
    });

    // 날짜 형식을 시간 문자열로 변환
    const formattedSchedules = schedules.map((schedule) => ({
      ...schedule,
      startAt: `${schedule.startHour
        .toString()
        .padStart(2, "0")}:${schedule.startMinute.toString().padStart(2, "0")}`,
      endAt: `${schedule.endHour
        .toString()
        .padStart(2, "0")}:${schedule.endMinute.toString().padStart(2, "0")}`,
    }));

    return NextResponse.json(formattedSchedules);
  } catch (error) {
    console.error("Failed to fetch fixed schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch fixed schedules" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params;
    const { dayOfWeek, startHour, startMinute, endHour, endMinute, teacherId } =
      await request.json();

    // 동일한 요일, 시간대의 고정 스케줄이 있는지 확인
    const existingSchedule = await prisma.fixedSchedule.findFirst({
      where: {
        userId: studentId,
        dayOfWeek,
        startHour,
        startMinute,
        endHour,
        endMinute,
      },
    });

    if (existingSchedule) {
      return NextResponse.json(
        { error: "Duplicate schedule exists" },
        { status: 400 }
      );
    }

    // 고정 스케줄 생성
    const fixedSchedule = await prisma.fixedSchedule.create({
      data: {
        userId: studentId,
        dayOfWeek,
        startHour,
        startMinute,
        endHour,
        endMinute,
      },
    });

    // 다음 3주치 스케줄 생성
    const now = new Date();
    const nextWeek = addWeeks(startOfWeek(now), 1);

    for (let i = 0; i < 3; i++) {
      const weekStart = addWeeks(nextWeek, i);
      const scheduleDate = new Date(weekStart);

      // 해당 요일로 설정
      scheduleDate.setDate(
        scheduleDate.getDate() + ((dayOfWeek - scheduleDate.getDay() + 7) % 7)
      );

      const startAt = new Date(scheduleDate);
      startAt.setHours(startHour, startMinute, 0);

      const endAt = new Date(scheduleDate);
      endAt.setHours(endHour, endMinute, 0);

      await prisma.schedule.create({
        data: {
          userId: studentId,
          startAt,
          endAt,
          teacherId,
        },
      });
    }

    return NextResponse.json(fixedSchedule);
  } catch (error) {
    console.error("Failed to create fixed schedule:", error);
    return NextResponse.json(
      { error: "Failed to create fixed schedule" },
      { status: 500 }
    );
  }
}
