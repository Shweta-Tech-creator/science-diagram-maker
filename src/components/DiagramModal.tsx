'use client';

import React from 'react';
import { DiagramResult } from '@/types/diagram';
import { X, CheckCircle2, XCircle, Code, Eye } from 'lucide-react';

interface DiagramModalProps {
  diagram: DiagramResult | null;
  onClose: () => void;
}

export function DiagramModal({ diagram, onClose }: DiagramModalProps) {
  const [viewSource, setViewSource] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  if (!diagram) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(diagram.svg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                {diagram.subject}
              </span>
              <h3 className="text-lg font-bold text-slate-900">{diagram.conceptName}</h3>
            </div>
            <p className="mt-1 text-xs text-slate-500 italic">"{diagram.promptText}"</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewSource(!viewSource)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-100 transition"
            >
              {viewSource ? <Eye className="h-3.5 w-3.5" /> : <Code className="h-3.5 w-3.5" />}
              {viewSource ? 'Show Preview' : 'View SVG Code'}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {viewSource ? (
            <div className="relative rounded-xl bg-slate-900 p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[460px]">
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 rounded bg-slate-800 px-2.5 py-1 text-[11px] font-sans font-medium text-slate-200 hover:bg-slate-700 transition border border-slate-700"
              >
                {copied ? 'Copied! ✓' : 'Copy SVG'}
              </button>
              <pre className="whitespace-pre-wrap">{diagram.svg}</pre>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 p-4 min-h-[380px] max-h-[500px]">
              <div
                className="w-full h-full max-h-[460px] flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[440px]"
                dangerouslySetInnerHTML={{ __html: diagram.svg }}
              />
            </div>
          )}

          {/* Validation Checklist Details */}
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Automated Code Checks ({diagram.checks.filter((c) => c.passed).length}/5 Passed)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {diagram.checks.map((check) => (
                <div
                  key={check.id}
                  className="flex items-start gap-2.5 rounded-lg border border-slate-200/80 bg-white p-2.5 text-xs shadow-xs"
                >
                  {check.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold text-slate-900">{check.name}</div>
                    <div className="text-slate-500 text-[11px]">{check.details || check.description}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Metrics Footer */}
            <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-600">
              <div>
                <span className="font-medium text-slate-700">Model:</span> {diagram.model}
              </div>
              <div>
                <span className="font-medium text-slate-700">Tokens:</span> {diagram.inputTokens} in / {diagram.outputTokens} out
              </div>
              <div>
                <span className="font-medium text-slate-700">Estimated Cost:</span> ${diagram.estimatedCostUsd.toFixed(6)}
              </div>
              <div>
                <span className="font-medium text-slate-700">Retries:</span> {diagram.retries}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
