import React from 'react';
import { ReviewerTable } from '@/components/ReviewerTable';
import initialDiagramsData from '@/data/results.json';
import { DiagramResult } from '@/types/diagram';
import { BookOpen, Sparkles, ShieldCheck } from 'lucide-react';

export default function Home() {
  const initialDiagrams = initialDiagramsData as DiagramResult[];

  return (
    <main className="min-h-screen bg-slate-100/70 text-slate-900">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Udhi Technologies
                </h1>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
                  GCSE Science Reviewer
                </span>
              </div>
              <p className="text-xs text-slate-500">
                AI Diagram Generator & Automated Verification Pipeline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              5 Automated Guardrails Active
            </span>
            <span className="inline-flex items-center gap-1 text-indigo-700 font-bold bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
              <Sparkles className="h-3.5 w-3.5" />
              Gemini 2.5 Flash
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Intro Banner */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs">
          <div className="max-w-3xl">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight sm:text-2xl">
              Science Diagram Maker (UK GCSE Curriculum)
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Automated generative AI pipeline creating animated vector SVG diagrams for UK GCSE students.
              Every SVG is rigorously verified across 5 programmatic guardrails (XML validity, viewBox
              containment, title and 3+ labels, continuous animation, and security complexity) with
              automated single-retry corrective feedback and rate-limit backoff.
            </p>
          </div>
        </div>

        {/* The Reviewer Table & Live Generator */}
        <ReviewerTable initialDiagrams={initialDiagrams} />
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Udhi Technologies Assessment • Science Diagram Maker</span>
          <span>Zero-API initial load • State preserved via LocalStorage</span>
        </div>
      </footer>
    </main>
  );
}
