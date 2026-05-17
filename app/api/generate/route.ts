import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, stripMarkdownArtifacts, TEXT_MODEL, VISION_MODEL } from "@/lib/gemini";
import {
  buildSystemPrompt,
  buildFoodUserPrompt,
  buildDailyUserPrompt,
  buildProductUserPrompt,
  // 레거시 wizard 흐름 호환
  DAJEONG_SYSTEM_PROMPT,
  DAJEONG_IMAGE_VISION_RULE,
  buildGenerateUserPrompt,
} from "@/lib/prompts";
import type { BlogCategory } from "@/lib/types";

export const maxDuration = 60;

function cleanBase64(data: string): string {
  return data.replace(/^data:image\/\w+;base64,/, "").trim();
}

function buildInterviewBlock(
  questions: Array<{ id: string; text: string }>,
  answers: Record<string, string>
): string {
  if (!questions?.length) return "";
  return questions
    .map((q) => `Q. ${q.text}\nA. ${answers[q.id]?.trim() || "(답변 없음)"}`)
    .join("\n\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── 신형: 카테고리 폼 방식 ─────────────────────────────
    if (body.blogCategory) {
      const { blogCategory, food, daily, product, images = [] } = body;

      const category = blogCategory as BlogCategory;
      const validImages: Array<{ base64: string; mimeType: string }> = (
        images as Array<{ base64?: string; mimeType?: string }>
      ).filter((img) => img?.base64?.trim());
      const hasImage = validImages.length > 0;

      const imageNote = hasImage
        ? `(${validImages.length}장의 사진이 함께 전달됨 — 각 사진을 직접 보고 묘사할 것)`
        : "";

      let userPrompt = "";
      let topicName = "";

      if (category === "food") {
        userPrompt = buildFoodUserPrompt(food ?? {}, imageNote);
        topicName = food?.placeName ?? "";
      } else if (category === "daily") {
        userPrompt = buildDailyUserPrompt(daily ?? {}, imageNote);
        topicName = daily?.topic ?? "";
      } else {
        userPrompt = buildProductUserPrompt(product ?? {}, imageNote);
        topicName = product?.productName ?? "";
      }

      if (!topicName.trim()) {
        return NextResponse.json({ error: "핵심 정보(장소명/사건/상품명)를 입력해 주세요." }, { status: 400 });
      }

      const systemPrompt = buildSystemPrompt(category, hasImage);
      const fullText = `${systemPrompt}\n\n---\n\n${userPrompt}`;
      const ai = getGeminiClient();
      const model = hasImage ? VISION_MODEL : TEXT_MODEL;

      const generateConfig = {
        model,
        config: { temperature: 0.9, topP: 0.95, maxOutputTokens: 8192 },
      };

      // 여러 장 이미지를 parts 배열로 구성
      const buildContents = (text: string) => {
        if (!hasImage) return text;
        return [
          {
            role: "user" as const,
            parts: [
              { text },
              ...validImages.map((img) => ({
                inlineData: {
                  mimeType: img.mimeType || "image/jpeg",
                  data: cleanBase64(img.base64),
                },
              })),
            ],
          },
        ];
      };

      let response = await ai.models.generateContent({
        ...generateConfig,
        contents: buildContents(fullText),
      });
      let content = stripMarkdownArtifacts(response.text ?? "");

      if (content.length < 1500) {
        const followUp = `${systemPrompt}\n\n---\n\n${userPrompt}\n\n현재 글이 ${content.length}자로 너무 짧아. 묘사를 더 구체적으로 늘려 공백 포함 1500자 이상으로 다시 써줘. 다정이 문체, [여기에 감성적인 사진 삽입], 제목 3개·해시태그 10개 유지.${hasImage ? ` ${validImages.length}장 사진 디테일을 골고루 활용할 것.` : ""}`;
        response = await ai.models.generateContent({
          ...generateConfig,
          contents: buildContents(followUp),
        });
        content = stripMarkdownArtifacts(response.text ?? "");
      }

      return NextResponse.json({ content, topicName });
    }

    // ── 레거시: Wizard 흐름 (구버전 호환) ────────────────────
    const {
      placeName,
      topic,
      address,
      category: legacyCategory,
      basicInfo,
      imageAnalysis,
      imageBase64,
      imageMimeType,
      interviewQuestions,
      interviewAnswers,
      experience,
    } = body;

    const name = (placeName || topic)?.trim();
    if (!name) {
      return NextResponse.json({ error: "장소명을 입력해 주세요." }, { status: 400 });
    }

    const hasImage = Boolean(imageBase64?.trim());
    const interviewBlock =
      buildInterviewBlock(interviewQuestions ?? [], interviewAnswers ?? {}) ||
      (experience ? `Q. 경험 메모\nA. ${experience}` : "");

    const userPrompt = buildGenerateUserPrompt({
      placeName: name,
      address: address ?? "",
      category: legacyCategory ?? "",
      basicInfo: basicInfo ?? "",
      imageAnalysis: hasImage
        ? `${imageAnalysis || ""}\n(첨부 사진 전달됨 — 직접 묘사 요망)`
        : imageAnalysis ?? "",
      interviewBlock,
    });

    const systemPrompt = hasImage
      ? `${DAJEONG_SYSTEM_PROMPT}\n\n${DAJEONG_IMAGE_VISION_RULE}`
      : DAJEONG_SYSTEM_PROMPT;

    const fullText = `${systemPrompt}\n\n---\n\n${userPrompt}`;
    const ai = getGeminiClient();
    const model = hasImage ? VISION_MODEL : TEXT_MODEL;

    const generateConfig = {
      model,
      config: { temperature: 0.9, topP: 0.95, maxOutputTokens: 8192 },
    };

    const buildContents = (text: string) => {
      if (!hasImage) return text;
      return [
        {
          role: "user" as const,
          parts: [
            { text },
            {
              inlineData: {
                mimeType: imageMimeType || "image/jpeg",
                data: cleanBase64(imageBase64),
              },
            },
          ],
        },
      ];
    };

    let response = await ai.models.generateContent({
      ...generateConfig,
      contents: buildContents(fullText),
    });
    let content = stripMarkdownArtifacts(response.text ?? "");

    if (content.length < 1500) {
      const followUp = `${systemPrompt}\n\n---\n\n${userPrompt}\n\n현재 글이 ${content.length}자로 짧아. 묘사를 늘려 1500자 이상으로 다시 써줘.`;
      response = await ai.models.generateContent({
        ...generateConfig,
        contents: buildContents(followUp),
      });
      content = stripMarkdownArtifacts(response.text ?? "");
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "글 생성 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
