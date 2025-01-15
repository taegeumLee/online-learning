import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function GET() {
  try {
    const now = new Date();
    const currentStartDate = startOfMonth(now);
    const currentEndDate = endOfMonth(now);

    // 지난달 날짜 계산
    const lastMonth = subMonths(now, 1);
    const lastMonthStartDate = startOfMonth(lastMonth);
    const lastMonthEndDate = endOfMonth(lastMonth);

    // 이번달 매출
    const currentMonthPayments = await prisma.payment.findMany({
      where: {
        status: "paid",
        createdAt: {
          gte: currentStartDate,
          lte: currentEndDate,
        },
      },
      include: {
        user: {
          select: {
            price: true,
          },
        },
      },
    });

    // 지난달 매출
    const lastMonthPayments = await prisma.payment.findMany({
      where: {
        status: "paid",
        createdAt: {
          gte: lastMonthStartDate,
          lte: lastMonthEndDate,
        },
      },
    });

    // 코스별 매출 계산
    const courseRevenue = {
      초보자: 0,
      개척자: 0,
      숙련자: 0,
    };

    currentMonthPayments.forEach((payment) => {
      // price를 기반으로 코스 구분
      let course: keyof typeof courseRevenue;
      if (payment.user.price === 150000) {
        course = "초보자";
      } else if (payment.user.price === 200000) {
        course = "개척자";
      } else {
        course = "숙련자";
      }
      courseRevenue[course] += payment.amount;
    });

    // 총 매출 계산
    const totalRevenue = Object.values(courseRevenue).reduce(
      (a, b) => a + b,
      0
    );

    const lastMonthRevenue = lastMonthPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const revenueChange = totalRevenue - lastMonthRevenue;
    const revenueChangePercentage = lastMonthRevenue
      ? ((revenueChange / lastMonthRevenue) * 100).toFixed(1)
      : null;

    return NextResponse.json({
      totalRevenue,
      courseRevenue,
      paymentCount: currentMonthPayments.length,
      lastMonthRevenue,
      revenueChange,
      revenueChangePercentage,
    });
  } catch (error) {
    console.error("Failed to fetch revenue:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue" },
      { status: 500 }
    );
  }
}
