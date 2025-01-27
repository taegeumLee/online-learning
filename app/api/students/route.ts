import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getKoreanTime } from "@/lib/date-utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeTodaySchedule =
      searchParams.get("includeTodaySchedule") === "true";
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    let whereClause: any = {
      role: "user",
    };

    // 검색어로 필터링 (학생 관리 페이지용)
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    // 상태로 필터링 (학생 관리 페이지용)
    if (status === "active") {
      whereClause.isActive = true;
    } else if (status === "inactive") {
      whereClause.isActive = false;
    }

    // 스케줄 목록 페이지용 쿼리
    if (includeTodaySchedule) {
      const students = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          recentTextbookId: true,
          textbooks: {
            take: 1,
            orderBy: { id: "desc" },
            select: {
              id: true,
              title: true,
              course: {
                select: {
                  subject: true,
                },
              },
            },
          },
          Schedule: {
            where: {
              status: "pending",
            },
            orderBy: {
              startAt: "asc",
            },
            select: {
              id: true,
              startAt: true,
              endAt: true,
              status: true,
            },
          },
        },
      });

      // 스케줄 목록용 응답 데이터 가공
      const formattedStudents = students.map((student: any) => {
        const textbook = student.textbooks[0];
        const schedules = student.Schedule || [];
        const nextSchedule = schedules[0];

        return {
          id: student.id,
          name: student.name,
          isActive: student.isActive,
          currentTextbookId: student.recentTextbookId,
          textbookTitle: textbook?.title || "교재 없음",
          courseSubject: textbook?.course?.subject || "과목 없음",
          todaySchedule: nextSchedule
            ? {
                startAt: nextSchedule.startAt,
                endAt: nextSchedule.endAt,
              }
            : null,
          scheduleStatus: nextSchedule?.status || null,
          nextSchedule: nextSchedule
            ? getKoreanTime(nextSchedule.startAt).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "예정된 수업 없음",
          startAt: nextSchedule?.startAt || new Date(),
          endAt: nextSchedule?.endAt || new Date(),
        };
      });

      return NextResponse.json(formattedStudents);
    }

    // 학생 관리 페이지용 쿼리
    const students = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        price: true,
        paymentDate: true,
        isActive: true,
        teacherId: true,
        Payment: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            status: true,
            amount: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
