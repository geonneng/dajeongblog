"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X, Images } from "lucide-react";
import { compressImageFile } from "@/lib/image-compress";
import { Label } from "@/components/ui/label";
import type { ImageItem } from "@/lib/types";

const MAX_IMAGES = 10;

interface ImageUploadProps {
  value: ImageItem[];
  onChange: (items: ImageItem[]) => void;
  disabled?: boolean;
}

export default function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - value.length;
    if (remaining <= 0) {
      setError(`최대 ${MAX_IMAGES}장까지 첨부할 수 있어요.`);
      return;
    }

    const validFiles = files
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, remaining);

    const invalidCount = files.length - validFiles.length;
    if (invalidCount > 0) {
      setError(`이미지 파일 ${invalidCount}개는 제외됐어요.`);
    } else {
      setError(null);
    }

    if (!validFiles.length) return;

    setCompressing(true);
    setProgress({ done: 0, total: validFiles.length });

    const newItems: ImageItem[] = [];
    for (const file of validFiles) {
      try {
        const compressed = await compressImageFile(file);
        newItems.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          previewUrl: compressed.previewUrl,
          imageBase64: compressed.base64,
          imageMimeType: compressed.mimeType,
        });
        setProgress((p) => ({ ...p, done: p.done + 1 }));
      } catch {
        // 개별 실패는 스킵
      }
    }

    onChange([...value, ...newItems]);
    setCompressing(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeItem = (id: string) => {
    onChange(value.filter((item) => item.id !== id));
  };

  const canAdd = value.length < MAX_IMAGES && !disabled && !compressing;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-bold text-gray-700">방문 사진 (선택)</Label>
        <span className="text-[11px] font-bold text-gray-400">
          {value.length} / {MAX_IMAGES}장
        </span>
      </div>
      <p className="text-xs text-gray-400">
        최대 {MAX_IMAGES}장 · 자동 압축 · AI가 사진 전체를 분석해 글에 녹여요
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
        disabled={!canAdd}
      />

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* 썸네일 그리드 */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((item, index) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.previewUrl}
                alt={`사진 ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
              <span className="absolute bottom-1 left-1.5 text-[10px] font-bold text-white/90">
                {index + 1}
              </span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/55 text-white hover:bg-black/80 touch-manipulation"
                  aria-label={`사진 ${index + 1} 제거`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}

          {/* 추가 버튼 (그리드 안에 배치) */}
          {canAdd && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-rose-300 hover:text-rose-400 hover:bg-rose-50/40 transition-colors touch-manipulation"
            >
              <ImagePlus className="h-5 w-5" />
              <span className="text-[10px] font-bold">추가</span>
            </button>
          )}
        </div>
      )}

      {/* 압축 진행 중 */}
      {compressing && (
        <div className="flex items-center gap-3 py-3 px-4 bg-rose-50 rounded-xl border border-rose-100">
          <Loader2 className="h-5 w-5 animate-spin text-rose-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-rose-500">사진 압축 중...</p>
            <p className="text-xs text-rose-400 mt-0.5">
              {progress.done} / {progress.total}장 완료
            </p>
          </div>
        </div>
      )}

      {/* 첫 업로드 버튼 (사진 없을 때) */}
      {value.length === 0 && !compressing && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          className="w-full flex flex-col items-center justify-center gap-2 py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-rose-200 hover:text-rose-400 hover:bg-rose-50/30 transition-colors touch-manipulation min-h-[120px] disabled:opacity-50"
        >
          <Images className="h-8 w-8" />
          <span className="text-sm font-bold">사진 첨부하기</span>
          <span className="text-[11px] text-gray-300">최대 {MAX_IMAGES}장 · 한 번에 여러 장 선택 가능</span>
        </button>
      )}
    </div>
  );
}
