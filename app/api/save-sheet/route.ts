import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

function getAuthClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !rawKey) {
    throw new Error("Google 서비스 계정 환경변수가 설정되지 않았습니다.");
  }

  // Vercel 환경변수에서 \n을 실제 개행으로 변환
  const privateKey = rawKey.replace(/\\n/g, "\n");

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return auth;
}

export async function POST(req: NextRequest) {
  try {
    const { topic, basicInfo, experience, content } = await req.json();

    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) {
      return NextResponse.json({ error: "GOOGLE_SHEET_ID가 설정되지 않았습니다." }, { status: 500 });
    }

    const auth = getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [dateStr, topic, basicInfo || "", experience || "", content],
        ],
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
