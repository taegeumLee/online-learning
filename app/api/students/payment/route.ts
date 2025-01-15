import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // 결제 완료 처리 - paymentDate는 변경하지 않음
    await prisma.payment.create({
      data: {
        userId,
        status: "paid",
        amount:
          (
            await prisma.user.findUnique({
              where: { id: userId },
              select: { price: true },
            })
          )?.price || 0,
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
