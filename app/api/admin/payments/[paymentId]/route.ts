import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    // URL에서 paymentId 추출
    const paymentId = request.url.split("/").pop();
    const { status } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status,
        updatedAt: status === "paid" ? new Date() : undefined,
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Failed to update payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}
