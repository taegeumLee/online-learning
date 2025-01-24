import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // 인증 체크
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;
    const { textbookId } = await request.json();

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        recentTextbookId: textbookId,
        textbooks: {
          connect: {
            id: textbookId,
          },
        },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to assign textbook:", error);
    return NextResponse.json(
      { error: "Failed to assign textbook" },
      { status: 500 }
    );
  }
}
