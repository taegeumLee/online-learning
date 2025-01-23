import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const teachers = await prisma.user.findMany({
      where: {
        role: "admin",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error("Failed to fetch teachers:", error);
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}
