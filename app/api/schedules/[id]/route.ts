import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 수업 일정 수정
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { startAt, endAt, status } = await req.json();
    const { id } = params;

    const schedule = await prisma.schedule.update({
      where: {
        id,
        teacherId: session.user.id,
      },
      data: {
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        status: status || "pending",
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
  } catch (error) {
    console.error("Update schedule error:", error);
    return NextResponse.json(
      { error: "Failed to update schedule", message: (error as Error).message },
      { status: 500 }
    );
  }
}

// 수업 일정 삭제
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    await prisma.schedule.delete({
      where: {
        id,
        teacherId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
