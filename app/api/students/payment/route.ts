import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // 가장 최근의 payment를 찾아서 status를 paid로 업데이트
    const latestPayment = await prisma.payment.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (latestPayment) {
      await prisma.payment.update({
        where: {
          id: latestPayment.id,
        },
        data: {
          status: "paid",
        },
      });
    }

    // 사용자의 결제일 업데이트
    await prisma.user.update({
      where: { id: userId },
      data: {
        paymentDate: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update payment status:", error);
    return NextResponse.json(
      { error: "Failed to update payment status" },
      { status: 500 }
    );
  }
}
