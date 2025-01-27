import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { startOfToday, getDay } from "date-fns";

export async function DELETE(
  request: Request,
  { params }: { params: { studentId: string; scheduleId: string } }
) {
  try {
    const { studentId, scheduleId } = params;

    // 삭제할 고정 스케줄 정보 가져오기
    const fixedSchedule = await prisma.fixedSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!fixedSchedule) {
      return NextResponse.json(
        { error: "Fixed schedule not found" },
        { status: 404 }
      );
    }

    // 오늘 이후의 해당 요일, 시간의 스케줄 삭제
    const futureDates = await prisma.schedule.findMany({
      where: {
        userId: studentId,
        startAt: {
          gte: startOfToday(),
        },
      },
    });

    // 수동으로 요일과 시간을 필터링
    const schedulesToDelete = futureDates.filter((schedule) => {
      const scheduleDay = getDay(schedule.startAt);
      const startHour = schedule.startAt.getHours();
      const startMinute = schedule.startAt.getMinutes();
      const endHour = schedule.endAt.getHours();
      const endMinute = schedule.endAt.getMinutes();

      return (
        scheduleDay === fixedSchedule.dayOfWeek &&
        startHour === fixedSchedule.startHour &&
        startMinute === fixedSchedule.startMinute &&
        endHour === fixedSchedule.endHour &&
        endMinute === fixedSchedule.endMinute
      );
    });

    // 필터링된 스케줄들 삭제
    await Promise.all(
      schedulesToDelete.map((schedule) =>
        prisma.schedule.delete({
          where: {
            id: schedule.id,
          },
        })
      )
    );

    // 고정 스케줄 삭제
    await prisma.fixedSchedule.delete({
      where: {
        id: scheduleId,
      },
    });

    return NextResponse.json({
      message: "Fixed schedule and future schedules deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete fixed schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete fixed schedule" },
      { status: 500 }
    );
  }
}
