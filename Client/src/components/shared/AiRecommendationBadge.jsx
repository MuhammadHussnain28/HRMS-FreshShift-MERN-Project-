import React from 'react';
import { Sparkles, AlertTriangle, Info, Bot } from 'lucide-react';

export default function AiRecommendationBadge({ aiRecommendation, showReasoning = false }) {
  const rec = aiRecommendation?.recommendation;
  const reasoning = aiRecommendation?.reasoning;

  // Case 1: Recommendation is "Approve"
  if (rec === 'Approve') {
    return (
      <div className="space-y-1.5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          AI Insight: Approve
        </span>
        {showReasoning && reasoning && (
          <p className="text-xs text-slate-600 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/80 font-medium flex items-start gap-2">
            <Bot className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{reasoning}</span>
          </p>
        )}
      </div>
    );
  }

  // Case 2: Recommendation is "Flag"
  if (rec === 'Flag') {
    return (
      <div className="space-y-1.5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          AI Insight: Flagged
        </span>
        {showReasoning && reasoning && (
          <p className="text-xs text-slate-700 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100 font-medium flex items-start gap-2">
            <Bot className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{reasoning}</span>
          </p>
        )}
      </div>
    );
  }

  // Case 3: Null / Graceful Default (Missing API key or timeout)
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
      <Info className="w-3.5 h-3.5 text-slate-400" />
      No AI insight available
    </span>
  );
}
