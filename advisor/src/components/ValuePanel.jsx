import React from 'react';
import ReactMarkdown from 'react-markdown';
import { BarChart2, X } from 'lucide-react';

export function ValuePanel({ valuePanelRef, showValuePanel, setShowValuePanel, valueLoading, valueStrategies, applyValueStrategy }) {
  if (!showValuePanel) return null;

  return (
    <div ref={valuePanelRef} className="mt-6 border-t-2 border-purple-200 pt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-extrabold text-purple-800 flex items-center gap-2">
          <BarChart2 size={16} /> Value Expansion Strategies
        </h3>
        <button onClick={() => setShowValuePanel(false)} className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { key: 'deepen', icon: '🔽', title: 'Deepen', subtitle: 'Expand current solutions to more areas',
            border: 'border-blue-200', bg: 'bg-blue-50/50', titleColor: 'text-blue-800',
            spinBorder: 'border-blue-200 border-t-blue-600',
            btnPrimary: 'bg-blue-600 hover:bg-blue-700', btnSecondary: 'border-blue-300 text-blue-700 hover:bg-blue-100' },
          { key: 'broaden', icon: '↔️', title: 'Broaden', subtitle: 'More processes, org units, or ITC components',
            border: 'border-green-200', bg: 'bg-green-50/50', titleColor: 'text-green-800',
            spinBorder: 'border-green-200 border-t-green-600',
            btnPrimary: 'bg-green-600 hover:bg-green-700', btnSecondary: 'border-green-300 text-green-700 hover:bg-green-100' },
          { key: 'phase', icon: '📅', title: 'Phase', subtitle: 'Combined roadmap over time',
            border: 'border-orange-200', bg: 'bg-orange-50/50', titleColor: 'text-orange-800',
            spinBorder: 'border-orange-200 border-t-orange-600',
            btnPrimary: 'bg-orange-600 hover:bg-orange-700', btnSecondary: 'border-orange-300 text-orange-700 hover:bg-orange-100' },
        ].map(({ key, icon, title, subtitle, border, bg, titleColor, spinBorder, btnPrimary, btnSecondary }) => (
          <div key={key} className={`border-2 ${border} rounded-lg ${bg} p-3 flex flex-col`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{icon}</span>
              <h4 className={`text-sm font-extrabold ${titleColor}`}>{title}</h4>
            </div>
            <p className="text-[10px] text-slate-500 mb-3">{subtitle}</p>
            <div className="flex-grow overflow-y-auto max-h-48 mb-3">
              {valueLoading[key] ? (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className={`w-4 h-4 border-2 ${spinBorder} rounded-full animate-spin`}></div>
                  Analyzing...
                </div>
              ) : valueStrategies[key] ? (
                <div className="prose prose-xs max-w-none text-xs">
                  <ReactMarkdown>{valueStrategies[key]}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Generating...</p>
              )}
            </div>
            {valueStrategies[key] && !valueLoading[key] && (
              <div className="flex gap-1 mt-auto">
                <button 
                  onClick={() => applyValueStrategy(valueStrategies[key], 'coaching')}
                  className={`flex-1 text-[10px] font-bold py-1.5 px-2 rounded ${btnPrimary} text-white transition-colors`}
                >
                  Apply to Coaching
                </button>
                <button 
                  onClick={() => applyValueStrategy(valueStrategies[key], 'brief')}
                  className={`flex-1 text-[10px] font-bold py-1.5 px-2 rounded border ${btnSecondary} transition-colors`}
                >
                  Apply to Brief
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
