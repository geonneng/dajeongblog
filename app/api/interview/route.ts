import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, TEXT_MODEL } from "@/lib/gemini";
import { INTERVIEW_SYSTEM_PROMPT } from "@/lib/prompts";
import type { InterviewQuestion } from "@/lib/types";

function parseInterviewQuestions(raw: string): InterviewQuestion[] {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as { questions?: string[] };
      const list = parsed.questions?.filter((q) => q?.trim()).slice(0, 2) ?? [];
      if (list.length >= 2) {
        return list.map((text, i) => ({ id: `q${i + 1}`, text: text.trim() }));
      }
    } catch {
      // fallback below
    }
  }

  const lines = raw
    .split("\n")
    .map((l) => l.replace(/^\d+[\.\)]\s*/, "").replace(/^[-*]\s*/, "").trim())
    .filter((l) => l.length > 5 && (l.includes("?") || l.includes("요") || l.includes("나요")));

  const fallback = lines.slice(0, 2);
  if (fallback.length < 2) {
    return [
      { id: "q1", text: "어떤 메뉴나 공간이 가장 기억에 남으셨나요?" },
      { id: "q2", text: "누구와 함께 방문하셨고, 분위기는 어떠셨나요?" },
    ];
  }
  return fallback.map((text, i) => ({ id: `q${i + 1}`, text }));
}

export async function POST(req: NextRequest) {
  try {
    const { placeName, category, address, basicInfo, imageAnalysis } = await req.json();

    if (!placeName?.trim()) {
      return NextResponse.json({ error: "장소명이 필요해요." }, { status: 400 });
    }

    const ai = getGeminiClient();
    const userPrompt = `[장소] ${placeName}
[카테고리] ${category || "미입력"}
[주소] ${address || "미입력"}
[기본 정보]
${basicInfo || "없음"}

[사진 분석]
${imageAnalysis || "사진 없음"}

위 내용을 바탕으로 맞춤 질문 2개를 JSON으로만 출력해줘.`;

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      config: {
        temperature: 0.85,
        maxOutputTokens: 512,
      },
      contents: `${INTERVIEW_SYSTEM_PROMPT}\n\n${userPrompt}`,
    });

    const questions = parseInterviewQuestions(response.text ?? "");
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("interview error:", error);
    return NextResponse.json(
      { error: "인터뷰 질문 생성 중 오류가 발생했어요." },
      { status: 500 }
    );
  }
}
