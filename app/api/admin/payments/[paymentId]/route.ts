import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { status } = await request.json();
    const { paymentId } = params;

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
