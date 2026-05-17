"use client";

import { useState } from "react";
import BlogForm from "@/components/BlogForm";
import BlogResult from "@/components/BlogResult";
import HistoryArchive from "@/components/HistoryArchive";
import type { BlogFormData, HistoryItem } from "@/lib/types";

type AppState = "form" | "result";

interface GenerateResult {
  content: string;
  savedToSheets: boolean;
  fromHistory?: boolean;
}

export default function Home() {
  const [state, setState] = useState<AppState>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [topicName, setTopicName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (data: BlogFormData) => {
    setIsLoading(true);
    setError(null);

    const derivedTopic =
      data.blogCategory === "food"
        ? data.food.placeName
        : data.blogCategory === "daily"
          ? data.daily.topic
          : data.product.productName;
    setTopicName(derivedTopic);

    try {
      const generateRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogCategory: data.blogCategory,
          food: data.food,
          daily: data.daily,
          product: data.product,
          images: data.images.map((img) => ({
            base64: img.imageBase64,
            mimeType: img.imageMimeType,
          })),
        }),
      });

      if (!generateRes.ok) {
        const err = await generateRes.json();
        throw new Error(err.error || "글 생성에 실패했어요.");
      }

      const json = await generateRes.json();
      const content: string = json.content;
      if (json.topicName) setTopicName(json.topicName);

      let savedToSheets = false;
      try {
        const sheetRes = await fetch("/api/save-sheet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ placeName: json.topicName || derivedTopic, content }),
        });
        savedToSheets = sheetRes.ok;
      } catch {
        // 시트 저장 실패해도 글 생성은 성공으로 처리
      }

      setResult({ content, savedToSheets, fromHistory: false });
      setState("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setTopicName(item.topic);
    setResult({ content: item.content, savedToSheets: true, fromHistory: true });
    setState("result");
    setError(null);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setState("form");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-20">
        {/* ── 헤더 ── */}
        <header className="flex items-start justify-between gap-3 mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">✍️</span>
              <h1 className="text-xl font-extrabold text-gray-800 leading-tight">
                다정이 블로그 생성기
              </h1>
            </div>
            <p className="text-xs text-gray-400 leading-snug pl-1">
              카테고리 선택 → 내용 입력 → AI 감성 블로그 완성
            </p>
          </div>
          <div className="shrink-0 pt-0.5">
            <HistoryArchive onSelect={handleHistorySelect} />
          </div>
        </header>

        {/* ── 컨텐츠 ── */}
        {state === "form" ? (
          <BlogForm
            onGenerate={handleGenerate}
            isLoading={isLoading}
            error={error}
          />
        ) : result ? (
          <div className="space-y-3">
            {result.fromHistory && (
              <p className="text-center text-xs font-bold text-blue-500 bg-blue-50 rounded-xl py-2 px-3">
                📂 보관소에서 불러온 글이에요
              </p>
            )}
            <BlogResult
              content={result.content}
              topic={topicName}
              savedToSheets={result.savedToSheets}
              onReset={handleReset}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
