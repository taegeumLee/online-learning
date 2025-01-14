import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const students = await prisma.user.findMany({
      where: {
        role: "user",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    return NextResponse.json(students);
  } catch (error: unknown) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch online students" },
      { status: 500 }
    );
  }
}
