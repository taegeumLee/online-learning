import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // URL에서 userId 추출
    const userId = req.url.split("/").pop();
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const { textbookId } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        recentTextbookId: textbookId,
        textbooks: {
          connect: { id: textbookId },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to assign textbook:", error);
    return NextResponse.json(
      { error: "Failed to assign textbook" },
      { status: 500 }
    );
  }
}
