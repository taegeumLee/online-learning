import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // 가장 최근의 payment를 찾아서 status를 paid로 업데이트 (pending 또는 overdue)
    const latestPayment = await prisma.payment.findFirst({
      where: {
        userId,
        status: {
          in: ["pending", "overdue"], // pending 또는 overdue 상태 모두 처리
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!latestPayment) {
      return NextResponse.json(
        { error: "No pending or overdue payment found" },
        { status: 404 }
      );
    }

    // payment 상태 업데이트
    await prisma.payment.update({
      where: {
        id: latestPayment.id,
      },
      data: {
        status: "paid",
      },
    });

    return NextResponse.json({ message: "Payment completed successfully" });
  } catch (error) {
    console.error("Failed to complete payment:", error);
    return NextResponse.json(
      { error: "Failed to complete payment" },
      { status: 500 }
    );
  }
}
