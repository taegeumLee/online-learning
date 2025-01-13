import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { textbookId } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { recentTextbookId: textbookId },
      select: {
        id: true,
        recentTextbookId: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating recent textbook:", error);
    return NextResponse.json(
      { error: "Failed to update recent textbook" },
      { status: 500 }
    );
  }
}
