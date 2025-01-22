import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 실제 사용 중인 모든 코스 가져오기 (textbook과 연결된 코스만)
    const coursesInUse = await prisma.course.findMany({
      where: {
        Textbook: {
          some: {}, // textbook이 하나라도 있는 코스만
        },
      },
      distinct: ["name"], // 중복된 이름 제거
      orderBy: {
        name: "asc",
      },
    });

    // 실제 사용 중인 과목 목록 가져오기
    const subjectsInUse = await prisma.course.findMany({
      where: {
        Textbook: {
          some: {},
        },
      },
      select: {
        subject: true,
      },
      distinct: ["subject"],
      orderBy: {
        subject: "asc",
      },
    });

    // 실제 사용 중인 레벨 가져오기
    const levelsInUse = await prisma.textbook.findMany({
      select: {
        level: true,
      },
      distinct: ["level"],
      orderBy: {
        level: "asc",
      },
    });

    return NextResponse.json({
      courses: coursesInUse,
      subjects: subjectsInUse.map((s) => s.subject),
      levels: levelsInUse.map((l) => l.level),
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
