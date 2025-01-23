import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const subject = searchParams.get("subject");
    const level = searchParams.get("level");
    const search = searchParams.get("search");

    let whereClause: any = {};

    if (courseId && courseId !== "all") {
      whereClause.courseId = courseId;
    }

    if (level && level !== "all") {
      whereClause.level = parseInt(level);
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
      ];
    }

    if (subject && subject !== "all") {
      whereClause.course = {
        subject: subject,
      };
    }

    const textbooks = await prisma.textbook.findMany({
      where: whereClause,
      include: {
        course: {
          select: {
            name: true,
            subject: true,
          },
        },
      },
      orderBy: [{ level: "asc" }, { sequence: "asc" }, { title: "asc" }],
    });

    return NextResponse.json(textbooks);
  } catch (error) {
    console.error("Failed to fetch textbooks:", error);
    return NextResponse.json(
      { error: "Failed to fetch textbooks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const textbook = await prisma.textbook.create({
      data: {
        title: data.title,
        author: data.author,
        level: data.level,
        url: data.url,
        sequence: data.sequence,
        courseId: data.courseId,
      },
    });

    return NextResponse.json(textbook);
  } catch (error) {
    console.error("Failed to create textbook:", error);
    return NextResponse.json(
      { error: "Failed to create textbook" },
      { status: 500 }
    );
  }
}
