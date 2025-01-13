import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const students = await prisma.user.findMany({
      where: {
        role: "user",
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        recentTextbookId: true,
        schedules: {
          where: {
            startAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
            endAt: {
              lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
          orderBy: {
            startAt: "asc",
          },
          take: 1,
          select: {
            startAt: true,
            endAt: true,
          },
        },
      },
    });

    const formattedStudents = await Promise.all(
      students.map(async (student) => {
        let textbookTitle = "교재 없음";
        let courseSubject = "";

        if (student.recentTextbookId) {
          const textbook = await prisma.textbook.findUnique({
            where: {
              id: student.recentTextbookId,
            },
            include: {
              course: true,
            },
          });

          if (textbook) {
            textbookTitle = textbook.title;
            courseSubject = textbook.course?.subject || "";
          }
        }

        return {
          id: student.id,
          name: student.name,
          isOnline: student.isActive,
          currentTextbookId: student.recentTextbookId,
          textbookTitle,
          courseSubject,
          nextSchedule: student.schedules[0]
            ? new Date(student.schedules[0].startAt).toLocaleTimeString(
                "ko-KR",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )
            : "예정된 수업 없음",
          startAt: student.schedules[0]?.startAt,
          endAt: student.schedules[0]?.endAt,
        };
      })
    );

    return NextResponse.json(formattedStudents);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
