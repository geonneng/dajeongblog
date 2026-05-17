import { NextRequest, NextResponse } from "next/server";
import { buildBasicInfoFromNaverItem, stripHtmlTags } from "@/lib/naver";
import type { NaverLocalItem } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("query")?.trim();
    if (!query) {
      return NextResponse.json({ error: "장소명을 입력해 주세요." }, { status: 400 });
    }

    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "네이버 API 키(NAVER_CLIENT_ID, NAVER_CLIENT_SECRET)가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const url = new URL("https://openapi.naver.com/v1/search/local.json");
    url.searchParams.set("query", query);
    url.searchParams.set("display", "5");
    url.searchParams.set("sort", "comment");

    const res = await fetch(url.toString(), {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
    });

    if (!res.ok) {
      console.error("Naver API error:", res.status, await res.text());
      return NextResponse.json(
        { error: "네이버 검색에 실패했어요. 잠시 후 다시 시도해 주세요." },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { items?: Array<Record<string, string>> };
    const items: NaverLocalItem[] = (data.items ?? []).map((item) => ({
      title: stripHtmlTags(item.title ?? ""),
      link: item.link ?? "",
      category: item.category ?? "",
      description: stripHtmlTags(item.description ?? ""),
      telephone: item.telephone ?? "",
      address: item.address ?? "",
      roadAddress: item.roadAddress ?? "",
    }));

    const first = items[0];
    const suggestedBasicInfo = first ? buildBasicInfoFromNaverItem(first) : "";

    return NextResponse.json({
      items,
      suggested: first
        ? {
            placeName: first.title,
            address: first.roadAddress || first.address,
            category: first.category,
            basicInfo: suggestedBasicInfo,
          }
        : null,
    });
  } catch (error) {
    console.error("naver-search error:", error);
    return NextResponse.json({ error: "검색 중 오류가 발생했어요." }, { status: 500 });
  }
}
