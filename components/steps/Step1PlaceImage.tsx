"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUpload from "@/components/ImageUpload";
import { Loader2, MapPin, Search } from "lucide-react";
import type { ImageItem, NaverLocalItem } from "@/lib/types";

export interface Step1Data {
  placeName: string;
  address: string;
  category: string;
  basicInfo: string;
  image: ImageItem[];
}

interface Step1PlaceImageProps {
  data: Step1Data;
  onChange: (data: Partial<Step1Data>) => void;
  onNext: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function Step1PlaceImage({
  data,
  onChange,
  onNext,
  isLoading,
  disabled,
}: Step1PlaceImageProps) {
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [results, setResults] = useState<NaverLocalItem[]>([]);

  const handleSearch = async () => {
    if (!data.placeName.trim()) return;
    setSearching(true);
    setSearchError(null);
    setResults([]);

    try {
      const res = await fetch(`/api/naver-search?query=${encodeURIComponent(data.placeName.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "검색에 실패했어요.");

      setResults(json.items ?? []);

      if (json.suggested) {
        onChange({
          placeName: json.suggested.placeName,
          address: json.suggested.address,
          category: json.suggested.category,
          basicInfo: json.suggested.basicInfo,
        });
      } else if ((json.items ?? []).length === 0) {
        setSearchError("검색 결과가 없어요. 장소명을 다시 확인해 주세요.");
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "검색 오류");
    } finally {
      setSearching(false);
    }
  };

  const selectResult = (item: NaverLocalItem) => {
    const address = item.roadAddress || item.address;
    const basicInfo = [
      address ? `* ${address}` : "",
      item.telephone ? `☏ ${item.telephone}` : "",
      item.category ? `✓ ${item.category.replace(/>/g, " > ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    onChange({
      placeName: item.title,
      address,
      category: item.category,
      basicInfo,
    });
    setResults([]);
  };

  return (
    <Card className="w-full border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-gray-800">Step 1 · 장소 & 사진</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          네이버에서 장소를 검색하고, 방문 사진을 올려 주세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="placeName" className="text-sm font-bold text-gray-700">
            장소명 <span className="text-rose-400">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="placeName"
              placeholder="예: 성수 어니언"
              value={data.placeName}
              onChange={(e) => onChange({ placeName: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
              className="h-12 flex-1 border-gray-200 focus:border-rose-300"
              disabled={disabled || isLoading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSearch}
              disabled={searching || !data.placeName.trim() || disabled || isLoading}
              className="h-12 px-4 shrink-0 border-gray-200 touch-manipulation"
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-1" />
                  검색
                </>
              )}
            </Button>
          </div>
        </div>

        {searchError && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{searchError}</p>
        )}

        {results.length > 0 && (
          <ul className="border border-gray-100 rounded-xl divide-y divide-gray-50 max-h-48 overflow-y-auto">
            {results.map((item, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => selectResult(item)}
                  className="w-full text-left px-4 py-3 hover:bg-rose-50 transition-colors touch-manipulation"
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

        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-bold text-gray-700">
            주소
          </Label>
          <Input
            id="address"
            placeholder="네이버 검색 시 자동 입력"
            value={data.address}
            onChange={(e) => onChange({ address: e.target.value })}
            className="h-11 border-gray-200"
            disabled={disabled || isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-bold text-gray-700">
            카테고리
          </Label>
          <Input
            id="category"
            placeholder="예: 음식점 > 카페"
            value={data.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="h-11 border-gray-200"
            disabled={disabled || isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="basicInfo" className="text-sm font-bold text-gray-700">
            기본 정보
          </Label>
          <Textarea
            id="basicInfo"
            placeholder="주소, 전화, 영업시간 등"
            value={data.basicInfo}
            onChange={(e) => onChange({ basicInfo: e.target.value })}
            className="min-h-[100px] border-gray-200 resize-none"
            disabled={disabled || isLoading}
          />
        </div>

        <ImageUpload
          value={data.image}
          onChange={(image) => onChange({ image })}
          disabled={disabled || isLoading}
        />

        <Button
          type="button"
          onClick={onNext}
          disabled={!data.placeName.trim() || isLoading || disabled}
          className="w-full h-14 text-base font-bold bg-rose-400 hover:bg-rose-500 text-white rounded-xl shadow-md touch-manipulation"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              AI가 사진·장소 분석 중...
            </>
          ) : (
            "다음으로 →"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
