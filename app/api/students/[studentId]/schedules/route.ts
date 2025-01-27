import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params;

    const schedules = await prisma.schedule.findMany({
      where: {
        userId: studentId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startAt: "asc",
      },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params;
    const { scheduleId, status } = await request.json();

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

export async function DELETE(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params;
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get("scheduleId");

    if (!scheduleId) {
      return NextResponse.json(
        { error: "Schedule ID is required" },
        { status: 400 }
      );
    }

    await prisma.schedule.delete({
      where: {
        id: scheduleId,
        userId: studentId,
      },
    });

    return NextResponse.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("Failed to delete schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
