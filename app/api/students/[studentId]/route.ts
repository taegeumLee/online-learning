import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params;
    const data = await request.json();

    const student = await prisma.user.update({
      where: {
        id: studentId,
      },
      data: {
        name: data.name,
        email: data.email,
        price: data.price,
        paymentDate: data.paymentDate,
        isActive: data.isActive,
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("Failed to update student:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}
