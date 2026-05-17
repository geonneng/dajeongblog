import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getSheetsAuth, getSheetId } from "@/lib/google-sheets";

export async function POST(req: NextRequest) {
  try {
    const { topic, placeName, content } = await req.json();
    const place = (placeName || topic)?.trim();

    const auth = getSheetsAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const sheetId = getSheetId();

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "A:C",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[dateStr, place || "", content || ""]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Google Sheets error:", error);
    return NextResponse.json(
      { error: "구글 시트 저장 중 오류가 발생했어요." },
      { status: 500 }
    );
  }
}
