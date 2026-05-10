"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

export interface FormData {
  topic: string;
  basicInfo: string;
  experience: string;
}

interface BlogFormProps {
  onGenerate: (data: FormData) => Promise<void>;
  isLoading: boolean;
}

export default function BlogForm({ onGenerate, isLoading }: BlogFormProps) {
  const [formData, setFormData] = useState<FormData>({
    topic: "",
    basicInfo: "",
    experience: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) return;
    await onGenerate(formData);
  };

  return (
    <Card className="w-full border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-gray-800">글 정보 입력</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          아래 정보를 입력하면 다정이가 감성 넘치는 블로그 글을 써드려요 🥰
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-sm font-bold text-gray-700">
              주제 / 장소 이름 <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="topic"
              placeholder="예: 성수동 감성 카페 '오브제'"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="h-12 text-base border-gray-200 focus:border-rose-300 focus:ring-rose-200 placeholder:text-gray-300"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="basicInfo" className="text-sm font-bold text-gray-700">
              기본 정보
            </Label>
            <p className="text-xs text-gray-400">영업시간, 주차 여부, 주소, 가격대 등 팩트 정보</p>
            <Textarea
              id="basicInfo"
              placeholder={`예시:\n영업시간: 평일 11:00~22:00, 주말 10:00~23:00\n주차: 발렛 가능 (건물 지하)\n위치: 서울 성동구 성수동 2가\n가격: 아메리카노 6,500원`}
              value={formData.basicInfo}
              onChange={(e) => setFormData({ ...formData, basicInfo: e.target.value })}
              className="min-h-[130px] text-base border-gray-200 focus:border-rose-300 focus:ring-rose-200 placeholder:text-gray-300 resize-none leading-relaxed"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience" className="text-sm font-bold text-gray-700">
              다정이의 경험 / 느낌 메모
            </Label>
            <p className="text-xs text-gray-400">주문한 메뉴, 좋았던 점, 아쉬운 점, 누구와 갔는지 등 자유롭게</p>
            <Textarea
              id="experience"
              placeholder={`예시:\n- 친구랑 주말 오후에 방문\n- 크로플 + 얼그레이라떼 주문\n- 빈티지 우드 인테리어, 자연광 잘 들어와서 사진 잘 나옴\n- 음악 감성 있어서 대화하기 좋은 분위기\n- 웨이팅 30분 있었음, 예약 불가라 일찍 가는 게 좋을듯`}
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="min-h-[150px] text-base border-gray-200 focus:border-rose-300 focus:ring-rose-200 placeholder:text-gray-300 resize-none leading-relaxed"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !formData.topic.trim()}
            className="w-full h-14 text-base font-bold bg-rose-400 hover:bg-rose-500 text-white rounded-xl transition-all duration-200 disabled:opacity-50 shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                다정이가 글 쓰는 중...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                다정이 감성으로 1500자 글쓰기 ✨
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
