import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    // URL에서 studentId 추출
    const studentId = request.url.split("/").pop();
    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

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
        teacherId: data.teacherId,
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
