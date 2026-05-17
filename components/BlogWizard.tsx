"use client";

import { useState, useCallback } from "react";
import StepIndicator from "@/components/StepIndicator";
import Step1PlaceImage, { type Step1Data } from "@/components/steps/Step1PlaceImage";
import Step2Interview from "@/components/steps/Step2Interview";
import type { InterviewQuestion, WizardFormData } from "@/lib/types";

interface BlogWizardProps {
  onComplete: (data: WizardFormData) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

const initialStep1: Step1Data = {
  placeName: "",
  address: "",
  category: "",
  basicInfo: "",
  image: {
    previewUrl: null,
    imageBase64: null,
    imageMimeType: null,
  },
};

export default function BlogWizard({ onComplete, isGenerating, error }: BlogWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [step1, setStep1] = useState<Step1Data>(initialStep1);
  const [isPreparing, setIsPreparing] = useState(false);
  const [prepareError, setPrepareError] = useState<string | null>(null);

  const [imageAnalysis, setImageAnalysis] = useState("");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleStep1Change = useCallback((patch: Partial<Step1Data>) => {
    setStep1((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleStep1Next = async () => {
    setIsPreparing(true);
    setPrepareError(null);

    try {
      let analysis = "";
      if (step1.image.imageBase64) {
        const res = await fetch("/api/analyze-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: step1.image.imageBase64,
            mimeType: step1.image.imageMimeType || "image/jpeg",
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "이미지 분석에 실패했어요.");
        analysis = json.analysis ?? "";
      }
      setImageAnalysis(analysis);

      const interviewRes = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeName: step1.placeName,
          category: step1.category,
          address: step1.address,
          basicInfo: step1.basicInfo,
          imageAnalysis: analysis,
        }),
      });
      const interviewJson = await interviewRes.json();
      if (!interviewRes.ok) throw new Error(interviewJson.error || "질문 생성에 실패했어요.");

      const qs: InterviewQuestion[] = interviewJson.questions ?? [];
      setQuestions(qs);
      setAnswers(Object.fromEntries(qs.map((q) => [q.id, ""])));
      setStep(2);
    } catch (err) {
      setPrepareError(err instanceof Error ? err.message : "오류가 발생했어요.");
    } finally {
      setIsPreparing(false);
    }
  };

  const handleGenerate = async () => {
    await onComplete({
      placeName: step1.placeName,
      address: step1.address,
      category: step1.category,
      basicInfo: step1.basicInfo,
      imageAnalysis,
      imageBase64: step1.image.imageBase64,
      imageMimeType: step1.image.imageMimeType,
      interviewQuestions: questions,
      interviewAnswers: answers,
    });
  };

  const displayError = error || prepareError;
  const indicatorStep = isGenerating ? 3 : step;

  return (
    <div>
      <StepIndicator currentStep={indicatorStep} />

      {displayError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500 text-center">
          {displayError}
        </div>
      )}

      {step === 1 ? (
        <Step1PlaceImage
          data={step1}
          onChange={handleStep1Change}
          onNext={handleStep1Next}
          isLoading={isPreparing}
          disabled={isGenerating}
        />
      ) : (
        <Step2Interview
          questions={questions}
          answers={answers}
          imageAnalysis={imageAnalysis}
          onAnswerChange={(id, value) => setAnswers((prev) => ({ ...prev, [id]: value }))}
          onBack={() => setStep(1)}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      )}
    </div>
  );
}
