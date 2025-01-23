import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { subMonths } from "date-fns";

interface PaymentWhereClause {
  createdAt?: {
    gte: Date;
  };
  status?: string;
  user?: {
    name?: {
      contains: string;
    };
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("all") === "true";
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const whereClause: PaymentWhereClause = {};

    // 기간 필터
    if (!showAll) {
      const now = new Date();
      const monthAgo = subMonths(now, 1);
      whereClause.createdAt = {
        gte: monthAgo,
      };
    }

    // 상태 필터
    if (status && status !== "all") {
      whereClause.status = status;
    }

    // 이름 검색
    if (search) {
      whereClause.user = {
        name: {
          contains: search,
        },
      };
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            price: true,
            paymentDate: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
