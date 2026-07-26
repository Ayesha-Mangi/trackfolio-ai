import React, { useEffect, useState } from 'react';
import { Sparkles, BrainCircuit, Bot, FileText, CheckCircle2 } from 'lucide-react';

const LOADING_STEPS = [
  { message: 'Analyzing Resume...', detail: 'Extracting candidate competencies and work history' },
  { message: 'Comparing Skills...', detail: 'Benchmarking qualifications against job requirements' },
  { message: 'Generating Suggestions...', detail: 'Creating ATS-tailored resume bullet point improvements' },
  { message: 'Preparing Cover Letter...', detail: 'Drafting professional, position-specific cover letter' },
  { message: 'Generating Interview Questions...', detail: 'Formulating technical and behavioral question set' },
];

export const LoadingExperience: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentStep = LOADING_STEPS[currentStepIndex];

  return (
    <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden animate-in fade-in duration-300">
      {/* Background glow effects */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto text-center space-y-6">
        {/* Animated Icon Pulsing Ring */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-purple-500/30 animate-ping" />
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg border border-purple-400/30">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>

        {/* Dynamic Cycling Message */}
        <div className="space-y-2 min-h-[70px]">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight animate-fade-in">
            {currentStep.message}
          </h3>
          <p className="text-xs text-purple-200/90 leading-relaxed max-w-md mx-auto">
            {currentStep.detail}
          </p>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {LOADING_STEPS.map((step, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentStepIndex
                  ? 'w-8 bg-purple-400 shadow-sm shadow-purple-400/50'
                  : idx < currentStepIndex
                  ? 'w-2 bg-purple-300/60'
                  : 'w-2 bg-purple-900/60'
              }`}
            />
          ))}
        </div>

        {/* Reassuring Note */}
        <div className="pt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-[11px] font-medium border border-white/10">
          <Bot className="w-3.5 h-3.5 text-purple-300" />
          <span>Powered by Google Gemini AI SDK</span>
        </div>
      </div>
    </div>
  );
};
