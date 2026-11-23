'use client';

import React, { useState, useEffect } from 'react';
import { DiagramResult, ReviewState } from '@/types/diagram';
import { GCSE_CONCEPTS } from '@/lib/constants';
import { DiagramModal } from './DiagramModal';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Maximize2,
  Download,
  Info,
} from 'lucide-react';

interface ReviewerTableProps {
  initialDiagrams: DiagramResult[];
}

const STORAGE_KEY = 'udhi_gcse_diagram_reviews_v1';

export function ReviewerTable({ initialDiagrams }: ReviewerTableProps) {
  const [diagrams, setDiagrams] = useState<DiagramResult[]>(initialDiagrams);
  const [reviews, setReviews] = useState<Record<number, ReviewState>>({});
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramResult | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Live generation state
  const [selectedConceptToGenerate, setSelectedConceptToGenerate] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Filter state (Useful for interview live modifications!)
  const [filter, setFilter] = useState<'all' | 'approved' | 'rejected' | 'pending'>('all');

  // Load saved reviews and diagrams from localStorage on client mount
  useEffect(() => {
    setIsClient(true);
    try {
      const savedDiagrams = localStorage.getItem('udhi_saved_diagrams_v2');
      if (savedDiagrams) {
        setDiagrams(JSON.parse(savedDiagrams));
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setReviews(JSON.parse(saved));
      } else {
        // Initialize default pending state
        const initialMap: Record<number, ReviewState> = {};
        initialDiagrams.forEach((d) => {
          initialMap[d.conceptId] = { status: 'pending', notes: '' };
        });
        setReviews(initialMap);
      }
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
    }
  }, [initialDiagrams]);

  // Save review state updates to localStorage
  const updateReview = (conceptId: number, status: 'approved' | 'rejected' | 'pending', notes?: string) => {
    setReviews((prev) => {
      const current = prev[conceptId] || { status: 'pending', notes: '' };
      const updated: Record<number, ReviewState> = {
        ...prev,
        [conceptId]: {
          status,
          notes: notes !== undefined ? notes : current.notes,
          updatedAt: new Date().toISOString(),
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
      return updated;
    });
  };

  const updateNotes = (conceptId: number, notes: string) => {
    setReviews((prev) => {
      const current = prev[conceptId] || { status: 'pending', notes: '' };
      const updated = {
        ...prev,
        [conceptId]: {
          ...current,
          notes,
          updatedAt: new Date().toISOString(),
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
      return updated;
    });
  };

  // Live Generation Handler (Part B requirement)
  const handleLiveGenerate = async (conceptId: number) => {
    setIsGenerating(true);
    setApiError(null);
    setSuccessNotice(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conceptId }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || `Generation failed with status ${res.status}`);
      }

      const updatedDiagram: DiagramResult = json.data;

      // Update in local diagrams state and persist to localStorage
      setDiagrams((prev) => {
        const next = prev.map((d) => (d.conceptId === updatedDiagram.conceptId ? updatedDiagram : d));
        try {
          localStorage.setItem('udhi_saved_diagrams_v2', JSON.stringify(next));
        } catch (e) {
          console.warn('Could not cache diagrams in localStorage:', e);
        }
        return next;
      });

      setSuccessNotice(json.notice || `Successfully generated fresh diagram for "${updatedDiagram.conceptName}"!`);
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch (err: any) {
      console.error('Live generation error:', err);
      setApiError(err.message || 'Network error while contacting Gemini API.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Export reviews as JSON (bonus reviewer helper)
  const handleExportReviews = () => {
    const exportData = diagrams.map((d) => ({
      conceptId: d.conceptId,
      conceptName: d.conceptName,
      subject: d.subject,
      review: reviews[d.conceptId] || { status: 'pending', notes: '' },
      metrics: {
        costUsd: d.estimatedCostUsd,
        retries: d.retries,
        inputTokens: d.inputTokens,
        outputTokens: d.outputTokens,
      },
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gcse-diagram-reviews-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtering diagrams
  const filteredDiagrams = diagrams.filter((d) => {
    const review = reviews[d.conceptId]?.status || 'pending';
    if (filter === 'all') return true;
    return review === filter;
  });

  const totalCost = diagrams.reduce((sum, d) => sum + d.estimatedCostUsd, 0);
  const approvedCount = Object.values(reviews).filter((r) => r.status === 'approved').length;
  const rejectedCount = Object.values(reviews).filter((r) => r.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Diagrams</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{diagrams.length}</span>
            <span className="text-xs text-slate-400">GCSE Concepts</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Review Status</div>
          <div className="mt-1 flex items-center gap-3">
            <span className="inline-flex items-center text-sm font-bold text-emerald-700">
              <span className="mr-1 h-2 w-2 rounded-full bg-emerald-500" />
              {approvedCount} Approved
            </span>
            <span className="inline-flex items-center text-sm font-bold text-rose-700">
              <span className="mr-1 h-2 w-2 rounded-full bg-rose-500" />
              {rejectedCount} Rejected
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Total Cost</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-indigo-700">${totalCost.toFixed(6)}</span>
            <span className="text-xs text-slate-400">USD</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Review Persistence</div>
          <div className="mt-1 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Browser LocalStorage
            </span>
            <button
              onClick={handleExportReviews}
              title="Download review results as JSON"
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Live Generator Panel (Part A & B Requirement) */}
      <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 to-blue-50/70 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Live AI Generator (Part A Live Test)</h3>
              <p className="text-xs text-slate-600">
                Trigger Gemini to generate and validate a diagram live with automatic retry loop and error handling.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedConceptToGenerate}
              onChange={(e) => setSelectedConceptToGenerate(Number(e.target.value))}
              disabled={isGenerating}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-hidden disabled:opacity-50"
            >
              {GCSE_CONCEPTS.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.id}: {c.name} ({c.subject})
                </option>
              ))}
            </select>

            <button
              onClick={() => handleLiveGenerate(selectedConceptToGenerate)}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating & Validating...' : 'Generate Diagram'}
            </button>
          </div>
        </div>

        {/* Live Status Messages */}
        {apiError && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <span className="font-bold">Generation Error: </span>
              {apiError}
              <div className="mt-1 text-[11px] text-rose-600">
                Ensure <code className="font-mono bg-rose-100 px-1 py-0.5 rounded">GEMINI_API_KEY</code> is set in your environment variables.
              </div>
            </div>
          </div>
        )}

        {successNotice && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter:</span>
          {(['all', 'approved', 'rejected', 'pending'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition ${
                filter === mode
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mode} ({mode === 'all' ? diagrams.length : Object.values(reviews).filter((r) => r.status === mode).length})
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1">
          <Info className="h-3.5 w-3.5 text-slate-400" />
          Click any diagram to view full-screen animation and raw SVG.
        </div>
      </div>

      {/* Main Reviewer Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4"># Concept & Subject</th>
                <th className="py-3.5 px-4">Animated Diagram</th>
                <th className="py-3.5 px-4">Automated Checks (5)</th>
                <th className="py-3.5 px-4">Cost & Retries</th>
                <th className="py-3.5 px-4 w-72">Reviewer Decision & Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredDiagrams.map((d) => {
                const review = reviews[d.conceptId] || { status: 'pending', notes: '' };
                const passedChecksCount = d.checks.filter((c) => c.passed).length;

                return (
                  <tr key={d.conceptId} className="hover:bg-slate-50/50 transition">
                    {/* Column 1: Concept & Subject */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
                          {d.conceptId}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{d.conceptName}</span>
                      </div>
                      <div className="mt-1">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            d.subject === 'Maths'
                              ? 'bg-purple-100 text-purple-800'
                              : d.subject === 'Physics'
                              ? 'bg-blue-100 text-blue-800'
                              : d.subject === 'Biology'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {d.subject}
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] text-slate-500 line-clamp-3 italic">
                        "{d.promptText}"
                      </p>
                    </td>

                    {/* Column 2: Animated Diagram Preview */}
                    <td className="py-4 px-4 align-top">
                      <div
                        onClick={() => setSelectedDiagram(d)}
                        className="group relative h-36 w-56 cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2 shadow-xs transition hover:border-indigo-400 hover:shadow-md"
                      >
                        <div
                          key={`${d.conceptId}-${d.generatedAt}`}
                          className="h-full w-full flex items-center justify-center [&>svg]:h-full [&>svg]:w-full [&>svg]:object-contain"
                          dangerouslySetInnerHTML={{ __html: d.svg }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                          <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-medium text-slate-900 shadow-xs">
                            <Maximize2 className="h-3 w-3" /> Expand
                          </span>
                        </div>
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400 text-center">
                        Hover to preview • Click to inspect
                      </div>
                    </td>

                    {/* Column 3: Automated Checks (5 checks) */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex items-center gap-1.5 mb-2">
                        {d.allChecksPassed ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" /> All 5 Checks Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                            <AlertCircle className="h-3 w-3" /> {passedChecksCount}/5 Checks Passed
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        {d.checks.map((c) => (
                          <div
                            key={c.id}
                            title={c.details || c.description}
                            className="flex items-center gap-1.5 text-[11px]"
                          >
                            {c.passed ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                            )}
                            <span className={c.passed ? 'text-slate-700' : 'text-rose-700 font-medium'}>
                              {c.name}
                            </span>
                          </div>
                        ))}
                      </div>

                      {d.initialValidationFailed && (
                        <div className="mt-2 rounded bg-amber-50 border border-amber-200 px-1.5 py-1 text-[10px] text-amber-800">
                          Initial failed; passed after retry.
                        </div>
                      )}
                    </td>

                    {/* Column 4: Cost & Retries */}
                    <td className="py-4 px-4 align-top">
                      <div className="space-y-1.5">
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Estimated Cost</div>
                          <div className="font-mono font-bold text-slate-900 text-sm">
                            ${d.estimatedCostUsd.toFixed(6)}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">Retries</div>
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${
                              d.retries === 0
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {d.retries} {d.retries === 1 ? 'retry' : 'retries'}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-500">
                          Tokens: <span className="font-mono">{d.inputTokens}</span> in / <span className="font-mono">{d.outputTokens}</span> out
                        </div>
                      </div>
                    </td>

                    {/* Column 5: Review Decision & Notes */}
                    <td className="py-4 px-4 align-top">
                      <div className="space-y-2.5">
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateReview(d.conceptId, 'approved')}
                            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-3 text-xs font-bold transition ${
                              review.status === 'approved'
                                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500 ring-offset-1'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            Approve
                          </button>

                          <button
                            onClick={() => updateReview(d.conceptId, 'rejected')}
                            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-3 text-xs font-bold transition ${
                              review.status === 'rejected'
                                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-500 ring-offset-1'
                                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>

                        {/* Note Box */}
                        <div>
                          <textarea
                            value={review.notes || ''}
                            onChange={(e) => updateNotes(d.conceptId, e.target.value)}
                            placeholder="Add review notes (saved automatically)..."
                            rows={2}
                            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:border-indigo-500 focus:outline-hidden"
                          />
                        </div>

                        {/* Persistence indicator */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>
                            {review.status !== 'pending' ? (
                              <span className="capitalize font-medium text-slate-600">
                                Status: {review.status}
                              </span>
                            ) : (
                              'Not yet reviewed'
                            )}
                          </span>
                          {isClient && review.updatedAt && (
                            <span className="text-emerald-600 font-medium">Saved ✓</span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Diagram Inspection Modal */}
      <DiagramModal diagram={selectedDiagram} onClose={() => setSelectedDiagram(null)} />
    </div>
  );
}
