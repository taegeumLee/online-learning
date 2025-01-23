import { NextResponse } from "next/server";
import { NotionAPI } from "notion-client";

const notion = new NotionAPI();

export async function GET(request: Request) {
  try {
    // URL에서 pageId 추출
    const pageId = request.url.split("/").pop();

    if (!pageId) {
      return NextResponse.json(
        { error: "Notion page ID is required" },
        { status: 400 }
      );
    }

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
