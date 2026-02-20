import React from 'react';
import { Mail, X, Copy, MessageSquare } from 'lucide-react';

export function EmailPanel({
  emailPanelRef, showEmailPanel, setShowEmailPanel,
  emailCards, emailLoading, copiedEmail,
  copyEmailToClipboard, openInEmailClient, refineEmailInChat,
}) {
  if (!showEmailPanel) return null;

  return (
    <div ref={emailPanelRef} className="mt-6 border-t-2 border-indigo-200 pt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-extrabold text-indigo-800 flex items-center gap-2">
          <Mail size={16} /> Email Starter Kit
        </h3>
        <button onClick={() => setShowEmailPanel(false)} className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { key: 'intro', icon: '🤝', title: 'Cold Outreach', titleColor: 'text-blue-800', border: 'border-blue-200', bg: 'bg-blue-50/50', btnPrimary: 'bg-blue-600 hover:bg-blue-700', btnSecondary: 'border-blue-300 text-blue-700 hover:bg-blue-100' },
          { key: 'followup', icon: '📋', title: 'Meeting Follow-up', titleColor: 'text-green-800', border: 'border-green-200', bg: 'bg-green-50/50', btnPrimary: 'bg-green-600 hover:bg-green-700', btnSecondary: 'border-green-300 text-green-700 hover:bg-green-100' },
          { key: 'valuehook', icon: '💡', title: 'Value Hook', titleColor: 'text-purple-800', border: 'border-purple-200', bg: 'bg-purple-50/50', btnPrimary: 'bg-purple-600 hover:bg-purple-700', btnSecondary: 'border-purple-300 text-purple-700 hover:bg-purple-100' },
        ].map(({ key, icon, title, titleColor, border, bg, btnPrimary, btnSecondary }) => {
          const card = emailCards[key];
          const loading = emailLoading[key];
          return (
            <div key={key} className={`border-2 ${border} rounded-lg ${bg} p-3 flex flex-col`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{icon}</span>
                <h4 className={`text-sm font-extrabold ${titleColor}`}>{title}</h4>
              </div>
              {loading ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-6 justify-center">
                  <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  Drafting...
                </div>
              ) : card ? (
                <div className="flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Subject</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600">{card.tone}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 mb-2 bg-white rounded p-1.5 border border-slate-200">{card.subject}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Body</p>
                  <p className="text-xs text-slate-700 mb-3 bg-white rounded p-2 border border-slate-200 flex-grow whitespace-pre-wrap">{card.body}</p>
                  <div className="flex flex-col gap-1.5 mt-auto">
                    <button
                      onClick={() => copyEmailToClipboard(card, key)}
                      className={`w-full text-[10px] font-bold py-1.5 px-2 rounded ${btnPrimary} text-white transition-colors flex items-center justify-center gap-1`}
                    >
                      <Copy size={10} /> {copiedEmail === key ? '✓ Copied!' : 'Copy to Clipboard'}
                    </button>
                    <button
                      onClick={() => openInEmailClient(card)}
                      className={`w-full text-[10px] font-bold py-1.5 px-2 rounded border ${btnSecondary} transition-colors flex items-center justify-center gap-1`}
                    >
                      <Mail size={10} /> Open in Email Client
                    </button>
                    <button
                      onClick={() => refineEmailInChat(card)}
                      className="w-full text-[10px] font-bold py-1.5 px-2 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <MessageSquare size={10} /> Refine in Chat
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-6 text-center">Generating...</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
