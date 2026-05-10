"use client";

import { useState } from "react";
import BlogForm, { FormData } from "@/components/BlogForm";
import BlogResult from "@/components/BlogResult";

type AppState = "form" | "result";

interface GenerateResult {
  content: string;
  savedToSheets: boolean;
}

export default function Home() {
  const [state, setState] = useState<AppState>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [currentTopic, setCurrentTopic] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setCurrentTopic(formData.topic);

    try {
      const generateRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!generateRes.ok) {
        const err = await generateRes.json();
        throw new Error(err.error || "글 생성에 실패했어요.");
      }

      const { content } = await generateRes.json();

      let savedToSheets = false;
      try {
        const sheetRes = await fetch("/api/save-sheet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: formData.topic,
            basicInfo: formData.basicInfo,
            experience: formData.experience,
            content,
          }),
        });
        savedToSheets = sheetRes.ok;
      } catch {
        // 시트 저장 실패해도 글 생성은 성공으로 처리
      }

      setResult({ content, savedToSheets });
      setState("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setState("form");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8 pb-16">
        {/* 헤더 */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-50 mb-4">
            <span className="text-3xl">✍️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">다정이 블로그 생성기</h1>
          <p className="text-sm text-gray-400">감성 넘치는 네이버 블로그 글을 AI가 대신 써드려요</p>
        </header>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500 text-center">
            {error}
          </div>
        )}

        {/* 메인 컨텐츠 */}
        {state === "form" ? (
          <BlogForm onGenerate={handleGenerate} isLoading={isLoading} />
        ) : result ? (
          <BlogResult
            content={result.content}
            topic={currentTopic}
            savedToSheets={result.savedToSheets}
            onReset={handleReset}
          />
        ) : null}
      </div>
    </main>
  );
}
