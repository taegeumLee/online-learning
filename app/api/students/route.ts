import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface WhereClause {
  role: string;
  OR?: Array<{ name: { contains: string } } | { email: { contains: string } }>;
  isActive?: boolean;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const whereClause: WhereClause = {
      role: "user", // 학생만 가져오기
    };

    // 검색어로 필터링
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    // 상태로 필터링
    if (status === "active") {
      whereClause.isActive = true;
    } else if (status === "inactive") {
      whereClause.isActive = false;
    }

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
