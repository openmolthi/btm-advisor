import React from 'react';

export function DealTimeline({ dealTimeline, cycleMilestone }) {
  if (!dealTimeline || dealTimeline.length === 0) return null;

  const statusStyles = {
    pending: 'bg-slate-200 text-slate-500 border-slate-300',
    active: 'bg-blue-100 text-blue-700 border-blue-400',
    done: 'bg-green-100 text-green-700 border-green-400',
  };

  return (
    <div className="flex gap-1.5 items-center px-4 py-2 overflow-x-auto">
      {dealTimeline.map((milestone, i) => (
        <button
          key={i}
          onClick={() => cycleMilestone(i)}
          className={`text-[10px] font-bold px-2 py-1 rounded-full border whitespace-nowrap transition-colors ${statusStyles[milestone.status] || statusStyles.pending}`}
          title={`Click to cycle: ${milestone.status}`}
        >
          {milestone.status === 'done' ? '✓ ' : milestone.status === 'active' ? '● ' : ''}{milestone.label}
        </button>
      ))}
    </div>
  );
}
