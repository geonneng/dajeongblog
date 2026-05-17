"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import ImageUpload from "@/components/ImageUpload";
import {
  Loader2,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  MapPin,
} from "lucide-react";
import type {
  BlogCategory,
  BlogFormData,
  FoodFields,
  DailyFields,
  ProductFields,
  NaverLocalItem,
  ImageItem,
} from "@/lib/types";

const CATEGORIES: { key: BlogCategory; emoji: string; label: string }[] = [
  { key: "food", emoji: "🍽️", label: "맛집·카페" },
  { key: "daily", emoji: "☕", label: "일상·생각" },
  { key: "product", emoji: "📦", label: "상품 리뷰" },
];

const INITIAL_FOOD: FoodFields = {
  placeName: "",
  address: "",
  basicInfo: "",
  menu: "",
  tasteDetail: "",
  atmosphere: "",
};
const INITIAL_DAILY: DailyFields = {
  topic: "",
  emotion: "",
  weather: "",
  message: "",
};
const INITIAL_PRODUCT: ProductFields = {
  productName: "",
  price: "",
  reason: "",
  prosCons: "",
  recommendation: "",
};

interface BlogFormProps {
  onGenerate: (data: BlogFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// ─── 네이버 검색 패널 ────────────────────────────────────────
function NaverSearchPanel({
  onApply,
  disabled,
}: {
  onApply: (info: { placeName: string; address: string; basicInfo: string }) => void;
  disabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<NaverLocalItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    setResults([]);
    try {
      const res = await fetch(`/api/naver-search?query=${encodeURIComponent(query.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "검색 실패");
      setResults(json.items ?? []);
      if (json.suggested) onApply(json.suggested);
      if ((json.items ?? []).length === 0) setError("검색 결과가 없어요.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "검색 오류");
    } finally {
      setSearching(false);
    }
  };

  const selectItem = (item: NaverLocalItem) => {
    const address = item.roadAddress || item.address;
    const basicInfo = [
      address ? `* ${address}` : "",
      item.telephone ? `☏ ${item.telephone}` : "",
      item.category ? `✓ ${item.category.replace(/>/g, " > ")}` : "",
      item.description ? `📝 ${item.description}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    onApply({ placeName: item.title, address, basicInfo });
    setResults([]);
  };

  return (
    <div className="space-y-3 py-3">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
          placeholder="장소명 검색 (예: 성수 어니언)"
          className="h-11 border-gray-200 flex-1"
          disabled={disabled || searching}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleSearch}
          disabled={searching || !query.trim() || disabled}
          className="h-11 px-4 shrink-0 border-gray-200"
        >
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      {results.length > 0 && (
        <ul className="border border-gray-100 rounded-xl divide-y divide-gray-50 max-h-44 overflow-y-auto">
          {results.map((item, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => selectItem(item)}
                className="w-full text-left px-4 py-3 hover:bg-rose-50 transition-colors"
              >
                <p className="font-bold text-sm text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {item.roadAddress || item.address}
                </p>
                {item.category && (
                  <p className="text-xs text-rose-400 mt-0.5">{item.category}</p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── 맛집·카페 필드 ──────────────────────────────────────────
function FoodForm({
  fields,
  onChange,
  disabled,
}: {
  fields: FoodFields;
  onChange: (p: Partial<FoodFields>) => void;
  disabled: boolean;
}) {
  const f = (key: keyof FoodFields) => ({
    value: fields[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ [key]: e.target.value }),
    disabled,
  });

  return (
    <div className="space-y-4">
      <Field label="장소명" required>
        <Textarea {...f("placeName")} rows={1} placeholder="예: 성수 어니언" className="min-h-[44px] border-gray-200" />
      </Field>
      <Field label="주소">
        <Textarea {...f("address")} rows={1} placeholder="네이버 검색 시 자동 입력" className="min-h-[44px] border-gray-200" />
      </Field>
      <Field label="기본 정보" hint="영업시간, 전화, 주차, 웨이팅 등">
        <Textarea {...f("basicInfo")} placeholder={`예:\n영업시간: 11:00~22:00\n주차: 건물 지하\n웨이팅: 주말 30분`} className="min-h-[90px] border-gray-200" />
      </Field>
      <Field label="주문한 메뉴 및 가격" required>
        <Textarea {...f("menu")} rows={1} placeholder="예: 어니언 바게트 3,500원, 아이스 아메리카노 5,000원" className="min-h-[44px] border-gray-200" />
      </Field>
      <Field label="맛·식감·비주얼 디테일 메모" required hint="입에 넣었을 때의 느낌, 향, 색감 등">
        <Textarea {...f("tasteDetail")} placeholder={`예: 바게트 겉은 바삭바삭, 속은 촉촉하고 달달한 양파향\n아메리카노는 산미가 살짝 있고 뒷맛이 깔끔함`} className="min-h-[100px] border-gray-200" />
      </Field>
      <Field label="매장 분위기·인테리어·팁" hint="조명, 음악, 좌석, 웨이팅 팁 등">
        <Textarea {...f("atmosphere")} placeholder={`예: 빈티지 우드 인테리어, 자연광 잘 들어옴\n주말 오전 11시 전에 가면 웨이팅 없음`} className="min-h-[90px] border-gray-200" />
      </Field>
    </div>
  );
}

// ─── 일상·생각 필드 ─────────────────────────────────────────
function DailyForm({
  fields,
  onChange,
  disabled,
}: {
  fields: DailyFields;
  onChange: (p: Partial<DailyFields>) => void;
  disabled: boolean;
}) {
  const f = (key: keyof DailyFields) => ({
    value: fields[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ [key]: e.target.value }),
    disabled,
  });

  return (
    <div className="space-y-4">
      <Field label="오늘의 핵심 사건 또는 장소" required>
        <Textarea {...f("topic")} rows={1} placeholder="예: 오랜 친구와 한강에서 치맥한 날" className="min-h-[44px] border-gray-200" />
      </Field>
      <Field label="그때 느낀 솔직한 감정과 든 생각" required hint="감정을 자세히 쓸수록 글이 풍성해져요">
        <Textarea {...f("emotion")} placeholder={`예: 오랜만에 만난 친구라 처음엔 어색했는데\n치킨 먹으면서 옛날 이야기 하다 보니 그 감정이 살아났어요`} className="min-h-[110px] border-gray-200" />
      </Field>
      <Field label="그날의 날씨·시간대·분위기">
        <Textarea {...f("weather")} rows={1} placeholder="예: 흐리고 선선한 저녁 8시, 노을 지는 하늘" className="min-h-[44px] border-gray-200" />
      </Field>
      <Field label="독자들과 나누고 싶은 공감 한마디">
        <Textarea {...f("message")} rows={1} placeholder="예: 바쁘게 살다 보면 연락이 뜸해지지만 그래도 괜찮아요" className="min-h-[44px] border-gray-200" />
      </Field>
    </div>
  );
}

// ─── 상품 리뷰 필드 ─────────────────────────────────────────
function ProductForm({
  fields,
  onChange,
  disabled,
}: {
  fields: ProductFields;
  onChange: (p: Partial<ProductFields>) => void;
  disabled: boolean;
}) {
  const f = (key: keyof ProductFields) => ({
    value: fields[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ [key]: e.target.value }),
    disabled,
  });

  return (
    <div className="space-y-4">
      <Field label="상품명" required>
        <Textarea {...f("productName")} rows={1} placeholder="예: 다이슨 에어랩 멀티 스타일러" className="min-h-[44px] border-gray-200" />
      </Field>
      <Field label="구매 가격">
        <Textarea {...f("price")} rows={1} placeholder="예: 699,000원 (직구 560,000원)" className="min-h-[44px] border-gray-200" />
      </Field>
      <Field label="이 상품을 사게 된 계기·목적" required>
        <Textarea {...f("reason")} rows={1} placeholder="예: 드라이어 고장나서 겸사겸사 업그레이드" className="min-h-[44px] border-gray-200" />
      </Field>
      <Field label="실사용 후 장점과 단점" required hint="솔직한 단점도 꼭 적어 주세요">
        <Textarea {...f("prosCons")} placeholder={`장점: 세팅력 좋음, 열 손상 적음, 다양한 어태치먼트\n단점: 무거워서 팔 아픔, 케이스 따로 사야 함, 가성비 논란`} className="min-h-[110px] border-gray-200" />
      </Field>
      <Field label="어떤 분께 추천하는지">
        <Textarea {...f("recommendation")} rows={1} placeholder="예: 매일 스타일링하는 분, 긴 머리 여성분" className="min-h-[44px] border-gray-200" />
      </Field>
    </div>
  );
}

// ─── 공통 Field 래퍼 ─────────────────────────────────────────
function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-bold text-gray-700">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </Label>
      {hint && <p className="text-xs text-gray-400 -mt-0.5">{hint}</p>}
      {children}
    </div>
  );
}

// ─── 메인 BlogForm ────────────────────────────────────────────
export default function BlogForm({ onGenerate, isLoading, error }: BlogFormProps) {
  const [category, setCategory] = useState<BlogCategory>("food");
  const [naverOpen, setNaverOpen] = useState(false);
  const [food, setFood] = useState<FoodFields>(INITIAL_FOOD);
  const [daily, setDaily] = useState<DailyFields>(INITIAL_DAILY);
  const [product, setProduct] = useState<ProductFields>(INITIAL_PRODUCT);
  const [images, setImages] = useState<ImageItem[]>([]);
  const formRef = useRef<HTMLDivElement>(null);

  const handleCategoryChange = (cat: BlogCategory) => {
    setCategory(cat);
    setNaverOpen(false);
  };

  const handleNaverApply = (info: { placeName: string; address: string; basicInfo: string }) => {
    if (category === "food") {
      setFood((prev) => ({
        ...prev,
        placeName: info.placeName,
        address: info.address,
        basicInfo: info.basicInfo,
      }));
    }
  };

  const isSubmitDisabled = () => {
    if (isLoading) return true;
    if (category === "food") return !food.placeName.trim();
    if (category === "daily") return !daily.topic.trim();
    if (category === "product") return !product.productName.trim();
    return false;
  };

  const handleSubmit = async () => {
    await onGenerate({
      blogCategory: category,
      food,
      daily,
      product,
      images,
    });
  };

  return (
    <div ref={formRef} className="space-y-4">
      {/* ── 카테고리 탭 ── */}
      <div className="flex gap-2">
        {CATEGORIES.map(({ key, emoji, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleCategoryChange(key)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 font-bold text-sm transition-all duration-150 touch-manipulation ${
              category === key
                ? "border-rose-400 bg-rose-50 text-rose-500 shadow-sm"
                : "border-gray-200 bg-white text-gray-400 hover:border-rose-200 hover:text-rose-400"
            }`}
          >
            <span className="text-xl leading-none">{emoji}</span>
            <span className="text-[11px] font-extrabold">{label}</span>
          </button>
        ))}
      </div>

      {/* ── 에러 ── */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-center">
          {error}
        </p>
      )}

      {/* ── 네이버 검색 (맛집 탭에서만 유효) ── */}
      {category === "food" && (
        <Card className="border border-gray-100 shadow-sm">
          <button
            type="button"
            onClick={() => setNaverOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
            disabled={isLoading}
          >
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4 text-rose-400" />
              네이버에서 장소 정보 검색 (선택)
            </span>
            {naverOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
          {naverOpen && (
            <CardContent className="pt-0 px-4 pb-4">
              <NaverSearchPanel onApply={handleNaverApply} disabled={isLoading} />
            </CardContent>
          )}
        </Card>
      )}

      {/* ── 카테고리별 필드 ── */}
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="pt-5 pb-5">
          {category === "food" && (
            <FoodForm
              fields={food}
              onChange={(p) => setFood((prev) => ({ ...prev, ...p }))}
              disabled={isLoading}
            />
          )}
          {category === "daily" && (
            <DailyForm
              fields={daily}
              onChange={(p) => setDaily((prev) => ({ ...prev, ...p }))}
              disabled={isLoading}
            />
          )}
          {category === "product" && (
            <ProductForm
              fields={product}
              onChange={(p) => setProduct((prev) => ({ ...prev, ...p }))}
              disabled={isLoading}
            />
          )}
        </CardContent>
      </Card>

      {/* ── 이미지 업로드 ── */}
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="pt-5 pb-5">
          <ImageUpload value={images} onChange={setImages} disabled={isLoading} />
        </CardContent>
      </Card>

      {/* ── 생성 버튼 ── */}
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitDisabled()}
        className="w-full h-14 text-base font-bold bg-rose-400 hover:bg-rose-500 text-white rounded-xl shadow-md touch-manipulation"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            다정이가 글 쓰는 중...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            블로그 글 만들기 ✨
          </>
        )}
      </Button>
    </div>
  );
}
