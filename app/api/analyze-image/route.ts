import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
import { getGeminiClient, VISION_MODEL } from "@/lib/gemini";
import { VISION_ANALYSIS_PROMPT } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64?.trim()) {
      return NextResponse.json({ analysis: "" });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: VISION_MODEL,
      config: {
        temperature: 0.4,
        maxOutputTokens: 1024,
      },
      contents: [
        {
          role: "user",
          parts: [
            { text: VISION_ANALYSIS_PROMPT },
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
              },
            },
          ],
        },
      ],
    });

    const analysis = (response.text ?? "").trim();
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("analyze-image error:", error);
    return NextResponse.json(
      { error: "이미지 분석 중 오류가 발생했어요." },
      { status: 500 }
    );
  }
}
