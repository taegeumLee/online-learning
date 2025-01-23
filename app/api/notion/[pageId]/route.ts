import { NextResponse } from "next/server";
import { NotionAPI } from "notion-client";

const notion = new NotionAPI();

export async function GET(
  req: Request,
  { params }: { params: { pageId: string } }
) {
  try {
    params = await params;
    const pageId = params.pageId;

    // 서버에서 Notion API 호출
    const recordMap = await notion.getPage(pageId);
    return NextResponse.json(recordMap);
  } catch (error) {
    console.error("Notion API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notion page" },
      { status: 500 }
    );
  }
}
