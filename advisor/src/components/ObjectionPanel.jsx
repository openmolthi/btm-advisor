import React from 'react';
import { ShieldAlert, X, ChevronDown, ChevronRight, MessageSquare, RefreshCw } from 'lucide-react';

export function ObjectionPanel({
  objectionPanelRef, showObjectionPanel, setShowObjectionPanel,
  objectionLoading, objectionCards, expandedObjection, setExpandedObjection,
  practiceObjection, setBriefContent, setObjectionCards, handleObjections,
}) {
  if (!showObjectionPanel) return null;

  return (
    <div ref={objectionPanelRef} className="mt-6 border-t-2 border-orange-200 pt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-extrabold text-orange-800 flex items-center gap-2">
          <ShieldAlert size={16} /> Objection Battlecards
        </h3>
        <button onClick={() => { setShowObjectionPanel(false); setExpandedObjection(null); }} className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>
      {objectionLoading ? (
        <div className="flex items-center gap-3 py-8 justify-center">
          <div className="w-5 h-5 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
          <span className="text-sm text-slate-500 font-medium">Anticipating objections...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {objectionCards.map((card, idx) => {
            const isExpanded = expandedObjection === idx;
            const severityStyles = {
              high: { badge: 'bg-red-100 text-red-700 border-red-200', border: 'border-red-200', dot: '🔴' },
              medium: { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', border: 'border-yellow-200', dot: '🟡' },
              low: { badge: 'bg-green-100 text-green-700 border-green-200', border: 'border-green-200', dot: '🟢' },
            };
            const sev = severityStyles[card.severity] || severityStyles.medium;
            return (
              <div key={idx} className={`border-2 ${sev.border} rounded-lg overflow-hidden transition-all`}>
                <button
                  onClick={() => setExpandedObjection(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{sev.dot}</span>
                    <span className="text-sm font-bold text-slate-800">{card.objection}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sev.badge}`}>
                      {card.severity?.toUpperCase()}
                    </span>
                    {isExpanded ? <ChevronDown size={14} className="text-slate-400"/> : <ChevronRight size={14} className="text-slate-400"/>}
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3 border-t border-slate-100 bg-slate-50/50">
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Why they say it</p>
                        <p className="text-xs text-slate-700">{card.why}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">What they really mean</p>
                        <p className="text-xs text-slate-700">{card.realMeaning}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-green-700 uppercase mb-1">💬 Your Response</p>
                      <p className="text-xs text-slate-800 bg-green-50 border border-green-200 rounded p-2">{card.rebuttal}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-blue-700 uppercase mb-1">📊 Proof Point</p>
                      <p className="text-xs text-slate-700 bg-blue-50 border border-blue-200 rounded p-2">{card.proofPoint}</p>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => practiceObjection(card)}
                        className="flex-1 text-[10px] font-bold py-1.5 px-2 rounded bg-orange-600 hover:bg-orange-700 text-white transition-colors flex items-center justify-center gap-1"
                      >
                        <MessageSquare size={10} /> Practice in Chat
                      </button>
                      <button
                        onClick={() => { setBriefContent(prev => prev + '\n\n---\n**Objection: ' + card.objection + '**\n- *Why:* ' + card.why + '\n- *Response:* ' + card.rebuttal + '\n- *Proof:* ' + card.proofPoint); setShowObjectionPanel(false); }}
                        className="flex-1 text-[10px] font-bold py-1.5 px-2 rounded border border-orange-300 text-orange-700 hover:bg-orange-100 transition-colors"
                      >
                        Add to Brief
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <button
            onClick={() => { setObjectionCards([]); handleObjections(); }}
            className="w-full text-xs text-slate-500 hover:text-slate-700 font-medium py-2 flex items-center justify-center gap-1"
          >
            <RefreshCw size={12} /> Regenerate objections
          </button>
        </div>
      )}
    </div>
  );
}
