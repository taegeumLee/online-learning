import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    paymentId: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { paymentId } = params;
    const { status } = await request.json();

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
