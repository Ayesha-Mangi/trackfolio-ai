import React, { useEffect, useState } from 'react';
import { Sparkles, FileCheck, Layers, Bot } from 'lucide-react';

const RESUME_STEPS = [
  { message: 'Optimizing Resume...', detail: 'Analyzing ATS structural alignment and layout hierarchy' },
  { message: 'Improving ATS Keywords...', detail: 'Injecting high-impact industry and domain terms truthfully' },
  { message: 'Rewriting Experience...', detail: 'Enhancing action verbs and bullet point achievement metrics' },
  { message: 'Preparing Final Resume...', detail: 'Formatting professional sections for PDF & DOCX export' },
];

export const ResumeGenerationLoading: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % RESUME_STEPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const currentStep = RESUME_STEPS[currentStepIndex];

  return (
    <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white shadow-xl relative overflow-hidden my-6 animate-in fade-in duration-300">
      {/* Background glow effects */}
      <div className="absolute -top-16 -right-16 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto text-center space-y-6">
        {/* Animated Icon Pulsing Ring */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-indigo-500/30 animate-ping" />
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg border border-indigo-400/30">
            <FileCheck className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>

        {/* Dynamic Cycling Message */}
        <div className="space-y-2 min-h-[70px]">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {currentStep.message}
          </h3>
          <p className="text-xs text-indigo-200/90 leading-relaxed max-w-md mx-auto">
            {currentStep.detail}
          </p>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {RESUME_STEPS.map((step, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentStepIndex
                  ? 'w-8 bg-indigo-400 shadow-sm shadow-indigo-400/50'
                  : idx < currentStepIndex
                  ? 'w-2 bg-indigo-300/60'
                  : 'w-2 bg-indigo-900/60'
              }`}
            />
          ))}
        </div>

        <div className="pt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-[11px] font-medium border border-white/10">
          <Bot className="w-3.5 h-3.5 text-indigo-300" />
          <span>Generating truthful, ATS-optimized candidate profile</span>
        </div>
      </div>
    </div>
  );
};
