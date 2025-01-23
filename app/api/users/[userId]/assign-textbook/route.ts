import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { textbookId } = await req.json();
    const { userId } = params;

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
    console.error("Error assigning textbook:", error);
    return NextResponse.json(
      { error: "Failed to assign textbook" },
      { status: 500 }
    );
  }
}
