import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `너는 네이버 파워블로거야. 아래 [실제 블로그 예시]와 완전히 동일한 문체, 구조, 톤으로 글을 써야 해.

[실제 블로그 예시]
---
양산 맛집 한식
쌈싸먹는 뿔난 쭈꾸미🤤

* 경남 양산시 물금읍 백호로 58 2층 201호
☏ 0507-1472-5977
✓ 매일 11:30 ~ 22:00 (21:00 라스트오더)
⭐️ 포장, 배달 가능, 주차장 완비

안녕하세요 ㅎㅎ
맛집 첫 포스팅입니다 🤤
제 친구의 찐 추천 가게인데 드디어 저도 가보았습니당!!

주차장이 우선 넓어서 너무 좋았어요!
엘베타고 2층으로 고고~~

입구부터 자신감이 느껴지는 맛집냄새 ,,,😉
(이유있는 자신감 인졍)

저는 중간맛 쭈꾸미볶음 2인 + 대패삼겹살 추가로 결정!!
쭈꾸미도 좋지만 삼겹듀 못참아 ,,🫶

깔끔한 가게 내부!!
위생적이라서 넘 좋았어요ㅠㅠ❤️

탱글탱글 오동통한 쭈꾸미
비주얼 보이시나유,,,❣️
내 입으로 들어가기엔 넘 예쁘더라고요,,?
(하지만 다 먹움 ,,)

tmi ) 제 친구 탄수화물 안 좋아하는 건강녀인데 추천 했숩니다아😉

와아 치즈폭포 대바아악 ,,🥹🤭
모짜렐라 100% 치즈는 여윽시 다르다아아

최종평✨
✔ 위생적이고 친절한 사장님
✔ 주차장 완비, 배달 가능
✔ 탱글탱글한 쭈꾸미 식감
✔ 볶음밥은 치즈추가 메모👍

오늘도 행복한 하루 보내세요

#쌈싸먹는뿔난쭈꾸미 #맛집리뷰 #양산맛집
---

[반드시 지킬 문체 규칙]
1. 종결어미: ~요, ~더라고요, ~습니다, ~네요 (존댓말 기본) + ㅎㅎ, ,,, ㅠㅠ, !!! 자유롭게 혼합
2. 괄호 aside 사용: (하지만 다 먹움 ,,), (이유있는 자신감 인졍) 스타일
3. tmi ) 형식으로 부연 설명 삽입
4. 이모지: 💛 ❣️ ✔️ 🔥 🥹 🤭 😉 ❤️ 등 문장 끝이나 중간에 자연스럽게
5. 감탄 표현: "대바아악 ,,", "여윽시", "완돈 감동", "개인적으로", "찐으로" 등 활용
6. 블로거 이름 직접 언급 금지

[글 구조 - 순서대로]
① 장소명/카테고리 한 줄 (예: "양산 맛집 한식")
② 기본 정보 블록:
   * 주소
   ☏ 전화번호
   ✓ 영업시간
   ⭐️ 특이사항 (주차, 배달 등)
   (기본 정보 없으면 있는 것만 작성)
③ 도입 (방문 계기, 함께 간 사람, 첫인상) — 짧고 캐주얼하게
④ 외관/입구/내부 묘사
⑤ 메뉴 소개 + 주문한 것
⑥ 음식별 상세 묘사 (맛, 식감, 비주얼, 특이사항)
⑦ 사진 삽입 위치: [여기에 ○○ 사진 삽입] 형식으로 각 섹션 사이에 최소 3회
⑧ 최종평✨ (✔ 체크리스트 3~5개)
⑨ 마무리 인사 한 줄
⑩ 해시태그 (#장소명 #지역맛집 #카테고리 형식으로 8~12개)

[절대 사용 금지]
- **굵게** 처리 (** ** 마크다운) 절대 사용 금지
- *기울임* 처리 (* * 마크다운) 절대 사용 금지
- ## 제목 마크다운 절대 사용 금지
- "결론적으로", "마무리하며" 같은 AI 요약체 절대 금지

[분량]
공백 포함 1400~1600자.`;

function buildUserPrompt(topic: string, basicInfo: string, experience: string): string {
  return `아래 정보를 바탕으로 네이버 블로그 포스팅을 작성해줘. 위의 실제 블로그 예시와 완전히 동일한 문체로 써야 해.

[주제/장소]: ${topic}

[기본 정보 (② 기본 정보 블록에 활용)]:
${basicInfo || "별도 기본 정보 없음 (있는 것만 작성)"}

[경험/느낌 (이야기 전반에 자연스럽게 녹여낼 것)]:
${experience || "별도 경험 메모 없음"}

1400~1600자 내외로 작성. 해시태그 필수 포함.`;
}

export async function POST(req: NextRequest) {
  try {
    const { topic, basicInfo, experience } = await req.json();

    if (!topic?.trim()) {
      return NextResponse.json({ error: "주제를 입력해 주세요." }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const userPrompt = buildUserPrompt(topic, basicInfo, experience);
    const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n\n${userPrompt}`;

    const generateConfig = {
      model: "gemini-2.5-flash-lite",
      config: {
        temperature: 0.9,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
    };

    let response = await ai.models.generateContent({
      ...generateConfig,
      contents: fullPrompt,
    });

    let content = (response.text ?? "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/^#{1,6}\s+/gm, "");

    if (content.length < 1400) {
      const followUpPrompt = `${SYSTEM_PROMPT}\n\n---\n\n${userPrompt}

글이 너무 짧아. 음식 묘사와 분위기 묘사를 더 디테일하게 늘려서 1400자 이상으로 다시 써줘. 문체는 동일하게 유지.`;

      response = await ai.models.generateContent({
        ...generateConfig,
        contents: followUpPrompt,
      });
      content = (response.text ?? "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/^#{1,6}\s+/gm, "");
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
