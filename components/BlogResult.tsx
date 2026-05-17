"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, RefreshCw, FileText } from "lucide-react";

interface BlogResultProps {
  content: string;
  topic: string;
  savedToSheets: boolean;
  onReset: () => void;
}

export default function BlogResult({ content, topic, savedToSheets, onReset }: BlogResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const charCount = content.length;

  const paragraphs = content.split(/\n+/).filter((p) => p.trim());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-rose-200 text-xs px-3 py-1">
            <FileText className="w-3 h-3 mr-1" />
            {charCount.toLocaleString()}자
          </Badge>
          {charCount >= 1500 && (
            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs px-3 py-1">
              ✓ 1500자 이상
            </Badge>
          )}
          {savedToSheets && (
            <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-xs px-3 py-1">
              ✓ 시트 저장 완료
            </Badge>
          )}
        </div>
      </div>

      <Card className="w-full border border-gray-100 shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-gray-50">
          <CardTitle className="text-base font-bold text-gray-700 flex items-center gap-2">
            <span className="text-rose-400">✍️</span>
            {topic}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="prose prose-sm max-w-none">
            {paragraphs.map((paragraph, index) => {
              if (paragraph.startsWith("[") && paragraph.endsWith("]")) {
                return (
                  <div
                    key={index}
                    className="my-4 p-3 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center text-gray-400 text-sm italic"
                  >
                    {paragraph}
                  </div>
                );
              }
              return (
                <p key={index} className="text-gray-700 leading-8 text-[15px] mb-4 last:mb-0">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          onClick={handleCopy}
          className={`flex-1 h-12 text-sm font-bold rounded-xl transition-all duration-200 shadow-sm touch-manipulation ${
            copied
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : "bg-rose-400 hover:bg-rose-500 text-white"
          }`}
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              복사 완료!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              복사하기
            </>
          )}
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          className="h-12 px-5 rounded-xl border-gray-200 text-gray-500 hover:bg-gray-50 font-bold touch-manipulation"
        >
          <RefreshCw className="mr-1.5 h-4 w-4" />
          다시 쓰기
        </Button>
      </div>
    </div>
  );
}
