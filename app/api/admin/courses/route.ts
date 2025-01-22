import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 모든 코스 가져오기
    const allCourses = await prisma.course.findMany({
      orderBy: {
        name: "asc",
      },
    });

    // name이 중복된 코스 제거 (첫 번째 항목만 유지)
    const uniqueCourses = allCourses.reduce<typeof allCourses>(
      (acc, current) => {
        const exists = acc.find((course) => course.name === current.name);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      },
      []
    );

    // 과목 목록 (중복 제거)
    const subjects = [
      ...new Set(uniqueCourses.map((course) => course.subject)),
    ];

    // 모든 교재의 레벨 가져오기 (중복 제거)
    const textbooks = await prisma.textbook.findMany({
      select: {
        level: true,
      },
      distinct: ["level"],
      orderBy: {
        level: "asc",
      },
    });

    const levels = textbooks.map((t) => t.level);

    return NextResponse.json({
      courses: uniqueCourses,
      subjects,
      levels,
    });
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, subject } = await request.json();

    const course = await prisma.course.create({
      data: {
        name,
        subject,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Failed to create course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
