import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  const students = await prisma.user.findMany({
    where: {
      AND: [
        { teacherId: session.user.id },
        { role: "user" },
        { name: { contains: query } },
      ],
    },
    select: {
      id: true,
      name: true,
      isActive: true,
      textbooks: {
        select: {
          title: true,
        },
        take: 1,
      },
    },
  });

  return NextResponse.json(students);
}
