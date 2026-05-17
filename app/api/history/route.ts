import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getSheetsAuth, getSheetId } from "@/lib/google-sheets";
import type { HistoryItem } from "@/lib/types";

function isHeaderRow(row: string[]): boolean {
  const first = (row[0] ?? "").toLowerCase();
  const second = (row[1] ?? "").toLowerCase();
  return (
    first.includes("날짜") ||
    second.includes("장소") ||
    second.includes("주제") ||
    first === "date"
  );
}

export async function GET() {
  try {
    const auth = getSheetsAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const sheetId = getSheetId();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "A:E",
    });

    const rows = res.data.values ?? [];
    const dataRows = rows.length > 0 && isHeaderRow(rows[0]) ? rows.slice(1) : rows;

    const items: HistoryItem[] = dataRows
      .map((row, index) => {
        const date = (row[0] ?? "").trim();
        const topic = (row[1] ?? "").trim();

        // 구형 포맷: A=날짜, B=주제, C=기본정보, D=경험, E=본문
        // 신형 포맷: A=날짜, B=장소, C=본문
        // E열에 내용이 있으면 구형(E열이 AI 본문), 없으면 신형(C열이 AI 본문)
        const colC = (row[2] ?? "").trim();
        const colE = (row[4] ?? "").trim();
        const content = colE || colC;

        if (!content) return null;
        return {
          id: `row-${index + 2}`,
          date: date || "날짜 없음",
          topic: topic || "제목 없음",
          content,
        };
      })
      .filter((item): item is HistoryItem => item !== null)
      .reverse();

    return NextResponse.json({ items });
  } catch (error) {
    console.error("history GET error:", error);
    return NextResponse.json(
      { error: "기록을 불러오는 중 오류가 발생했어요." },
      { status: 500 }
    );
  }
}
