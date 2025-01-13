import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        textbooks: {
          orderBy: {
            sequence: "desc",
          },
          take: 1,
          select: {
            id: true,
          },
        },
      },
    });

    const latestTextbookId = user?.textbooks[0]?.id || null;
    return NextResponse.json({ textbookId: latestTextbookId });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch latest textbook" },
      { status: 500 }
    );
  }
}
