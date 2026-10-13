"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface Step {
  label: string;
  short: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          {/* Step node */}
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-500",
                index < currentStep
                  ? "bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                  : index === currentStep
                  ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_0_16px_rgba(99,102,241,0.5)]"
                  : "bg-[rgba(30,30,48,0.8)] text-[rgba(255,255,255,0.3)] border border-[rgba(99,102,241,0.15)]"
              )}
            >
              {index < currentStep ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span
              className={cn(
                "text-xs font-medium transition-all duration-300 hidden lg:block",
                index === currentStep
                  ? "text-white"
                  : index < currentStep
                  ? "text-[rgba(255,255,255,0.5)]"
                  : "text-[rgba(255,255,255,0.25)]"
              )}
            >
              {step.label}
            </span>
          </div>

          {/* Connector */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-px w-6 lg:w-8 mx-1.5 transition-all duration-500",
                index < currentStep
                  ? "bg-gradient-to-r from-emerald-500 to-indigo-500"
                  : "bg-[rgba(99,102,241,0.15)]"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
