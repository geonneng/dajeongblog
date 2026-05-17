"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, ChevronLeft, MessageCircle } from "lucide-react";
import type { InterviewQuestion } from "@/lib/types";

interface Step2InterviewProps {
  questions: InterviewQuestion[];
  answers: Record<string, string>;
  imageAnalysis: string;
  onAnswerChange: (id: string, value: string) => void;
  onBack: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function Step2Interview({
  questions,
  answers,
  imageAnalysis,
  onAnswerChange,
  onBack,
  onGenerate,
  isGenerating,
}: Step2InterviewProps) {
  const allAnswered = questions.every((q) => answers[q.id]?.trim());

  return (
    <Card className="w-full border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-gray-800">Step 2 · 다정이 인터뷰</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          AI가 준비한 질문에 답해 주시면 더 풍성한 글이 완성돼요 🫶
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {imageAnalysis && (
          <div className="rounded-xl bg-rose-50/60 border border-rose-100 px-4 py-3 text-sm text-gray-600 leading-relaxed">
            <p className="text-xs font-bold text-rose-400 mb-1">📷 사진 분석 요약</p>
            {imageAnalysis}
          </div>
        )}

        {questions.map((q, index) => (
          <div key={q.id} className="space-y-2">
            <Label htmlFor={q.id} className="text-sm font-bold text-gray-700 flex items-start gap-2">
              <MessageCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                <span className="text-rose-400 mr-1">Q{index + 1}.</span>
                {q.text}
              </span>
            </Label>
            <Textarea
              id={q.id}
              placeholder="자유롭게 답변해 주세요 ㅎㅎ"
              value={answers[q.id] ?? ""}
              onChange={(e) => onAnswerChange(q.id, e.target.value)}
              className="min-h-[90px] border-gray-200 resize-none leading-relaxed"
              disabled={isGenerating}
            />
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isGenerating}
            className="h-12 px-4 rounded-xl border-gray-200"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            이전
          </Button>
          <Button
            type="button"
            onClick={onGenerate}
            disabled={!allAnswered || isGenerating}
            className="flex-1 h-12 text-base font-bold bg-rose-400 hover:bg-rose-500 text-white rounded-xl shadow-md"
          >
            {isGenerating ? (
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
      </CardContent>
    </Card>
  );
}
