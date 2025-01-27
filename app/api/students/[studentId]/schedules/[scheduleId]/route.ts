import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { studentId: string; scheduleId: string } }
) {
  try {
    const { studentId, scheduleId } = params;
    const { status } = await request.json();

    const schedule = await prisma.schedule.update({
      where: {
        id: scheduleId,
        userId: studentId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Failed to update schedule:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}
