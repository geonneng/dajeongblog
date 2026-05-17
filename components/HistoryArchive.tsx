"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FolderOpen,
  Loader2,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Copy,
  Check,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import type { HistoryItem } from "@/lib/types";

interface HistoryArchiveProps {
  onSelect: (item: HistoryItem) => void;
}

function HistorySkeleton() {
  return (
    <ul className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="animate-pulse rounded-xl border border-gray-100 p-4">
          <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-full bg-gray-100 rounded" />
        </li>
      ))}
    </ul>
  );
}

function ContentView({
  item,
  onBack,
  onOpenMain,
}: {
  item: HistoryItem;
  onBack: () => void;
  onOpenMain: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = item.content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const charCount = item.content.length;
  const paragraphs = item.content.split(/\n+/).filter((p) => p.trim());

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 상단 바 */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-100 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          aria-label="목록으로"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-rose-400 font-bold">{item.date}</p>
          <p className="text-sm font-bold text-gray-800 truncate">{item.topic}</p>
        </div>
        <Badge
          variant="secondary"
          className="bg-rose-50 text-rose-500 border-rose-100 text-[10px] px-2 shrink-0"
        >
          <FileText className="h-3 w-3 mr-1" />
          {charCount.toLocaleString()}자
        </Badge>
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 min-h-0">
        <div className="space-y-3">
          {paragraphs.map((para, i) => {
            if (para.startsWith("[") && para.endsWith("]")) {
              return (
                <div
                  key={i}
                  className="py-2 px-3 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center text-gray-400 text-xs italic"
                >
                  {para}
                </div>
              );
            }
            return (
              <p key={i} className="text-gray-700 text-[14px] leading-7">
                {para}
              </p>
            );
          })}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="shrink-0 flex gap-2 px-4 py-3 border-t border-gray-100 bg-white">
        <Button
          type="button"
          onClick={handleCopy}
          className={`flex-1 h-11 text-sm font-bold rounded-xl transition-all duration-200 ${
            copied
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : "bg-rose-400 hover:bg-rose-500 text-white"
          }`}
        >
          {copied ? (
            <>
              <Check className="mr-1.5 h-4 w-4" />
              복사 완료!
            </>
          ) : (
            <>
              <Copy className="mr-1.5 h-4 w-4" />
              복사하기
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onOpenMain}
          className="h-11 px-4 rounded-xl border-gray-200 text-gray-500 text-sm font-bold"
        >
          크게 보기
        </Button>
      </div>
    </div>
  );
}

export default function HistoryArchive({ onSelect }: HistoryArchiveProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/history");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "불러오기 실패");
      setItems(json.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했어요.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setSelected(null);
      fetchHistory();
    }
  }, [open, fetchHistory]);

  const handleOpenMain = () => {
    if (selected) {
      onSelect(selected);
      setOpen(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 shadow-sm touch-manipulation">
        <FolderOpen className="h-4 w-4 shrink-0" />
        <span className="text-xs sm:text-sm">보관소</span>
      </SheetTrigger>

      <SheetContent side="right" className="p-0 flex flex-col">
        {selected ? (
          <ContentView
            item={selected}
            onBack={() => setSelected(null)}
            onOpenMain={handleOpenMain}
          />
        ) : (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 pr-8">
                <span>📂</span> 내 기록 보관소
              </SheetTitle>
              <SheetDescription>글을 탭하면 바로 읽고 복사할 수 있어요</SheetDescription>
              <SheetClose />
            </SheetHeader>

            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50 shrink-0">
              <span className="text-xs text-gray-400">
                {loading ? "불러오는 중..." : `총 ${items.length}건`}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={fetchHistory}
                disabled={loading}
                className="h-8 text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
                새로고침
              </Button>
            </div>

            {error && (
              <p className="mx-4 mt-3 text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 shrink-0">
                {error}
              </p>
            )}

            <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 relative">
              {loading && items.length === 0 ? (
                <HistorySkeleton />
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  {loading ? (
                    <Loader2 className="h-10 w-10 animate-spin text-rose-400" />
                  ) : (
                    <>
                      <FolderOpen className="h-12 w-12 text-gray-200 mb-3" />
                      <p className="text-sm font-bold text-gray-500">저장된 글이 없어요</p>
                      <p className="text-xs text-gray-400 mt-1">글을 생성하면 여기에 쌓여요</p>
                    </>
                  )}
                </div>
              ) : (
                <ul className="divide-y divide-gray-50 pb-8">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(item)}
                        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-rose-50/60 active:bg-rose-50 transition-colors touch-manipulation"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-rose-400 mb-0.5">{item.date}</p>
                          <p className="text-sm font-bold text-gray-800 truncate">{item.topic}</p>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                            {item.content.replace(/\n/g, " ").slice(0, 60)}...
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300 shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {loading && items.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <Loader2 className="h-8 w-8 animate-spin text-rose-400" />
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
