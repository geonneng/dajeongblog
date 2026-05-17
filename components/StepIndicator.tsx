"use client";

import { Check } from "lucide-react";

const STEPS = [
  { num: 1, label: "장소·사진" },
  { num: 2, label: "인터뷰" },
  { num: 3, label: "글 생성" },
] as const;

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="진행 단계" className="mb-8">
      <ol className="flex items-start justify-between">
        {STEPS.map((step, index) => {
          const done = currentStep > step.num;
          const active = currentStep === step.num;
          return (
            <li key={step.num} className="flex flex-1 items-center min-w-0">
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold transition-all duration-200 ${
                    done
                      ? "bg-rose-400 text-white"
                      : active
                        ? "bg-rose-400 text-white ring-4 ring-rose-100"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" strokeWidth={3} /> : step.num}
                </div>
                <span
                  className={`mt-1.5 text-[11px] font-bold text-center ${
                    active ? "text-rose-500" : done ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 mt-4 rounded-full transition-colors ${
                    currentStep > step.num ? "bg-rose-300" : "bg-gray-200"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
