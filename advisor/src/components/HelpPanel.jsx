import React from 'react';
import ReactMarkdown from 'react-markdown';
import { HelpCircle, ChevronDown, X } from 'lucide-react';

const HELP_SECTIONS = [
  { title: '🎯 What is AIDE-visor?', content: 'A strategic coaching tool for SAP Integrated Toolchain conversations. It helps you prepare for customer engagements by generating tailored coaching, value propositions, and formal deliverables — grounded in the customer\'s industry, processes, and context.' },
  { title: '🔄 The Flow', content: '**1. Configure** (left panel) — Set industry, company, process domain, ERP system, and any additional context.\n\n**2. Generate Coaching** — Hit the play button to get AI-powered strategic coaching.\n\n**3. Refine** — Edit the coaching output directly (pencil icon), explore value strategies, or practice objection handling.\n\n**4. Export** — Draft a formal brief, email, or copy the content.' },
  { title: '📑 Tabs', content: '**Coaching** — Your ideation workspace. Generate strategic coaching, explore value expansion (Deepen/Broaden/Phase), handle objections, and analyze competitors.\n\n**Chat** — Freeform AI conversation for ad-hoc questions about the deal context.\n\n**Brief** — Formal output. Generate polished briefs and emails for stakeholders.\n\n**Visual** — Architecture diagrams and process visualizations.\n\n**Deal Score** — MEDDIC-based deal qualification heatmap.' },
  { title: '📈 Value Strategies', content: '**Deepen** — Expand current solutions to more areas within the same scope.\n\n**Broaden** — Three dimensions, all within the Integrated Toolchain:\n• More processes (e.g., O2C → P2P)\n• More org units or countries\n• More ITC components not yet selected\n\n**Phase** — Combined roadmap: Quick Wins (0-6mo), Scale (6-18mo), Transform (18-36mo).' },
  { title: '🔧 Integrated Toolchain', content: 'The ITC orchestrates cloud ERP transformation across people, processes, apps, and data:\n\n• **SAP Signavio** — Process analysis & benchmarking\n• **SAP LeanIX** — Enterprise architecture mapping\n• **WalkMe** — Digital adoption & in-app guidance\n• **SAP Cloud ALM** — Project governance & orchestration\n• **SAP Build** — Low-code/no-code extensions\n• **Business Transformation Center** — Data migration\n• **Digital Discovery Assessment** — Landscape assessment\n• **Tricentis** — Automated testing & validation' },
  { title: '⚙️ Settings', content: '**Access Token** — Required to connect to the AI backend. Enter the token provided to you.\n\n**Language** — Switch the UI and AI output language.\n\n**Guardrails** — Customize the AI coaching principles (advanced). Default guardrails emphasize business outcomes over products.\n\n**Export/Import** — Save and restore your deal context as JSON files.' },
];

export default function HelpPanel({ showHelp, setShowHelp, expandedHelp, setExpandedHelp }) {
  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <HelpCircle size={20} className="text-blue-600" /> AIDE-visor Guide
          </h2>
          <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="px-6 py-4 space-y-1">
          {HELP_SECTIONS.map((section, i) => (
            <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedHelp(expandedHelp === i ? null : i)}
                className="w-full px-4 py-3 text-left text-sm font-bold text-slate-800 hover:bg-slate-50 flex justify-between items-center transition-colors"
              >
                {section.title}
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${expandedHelp === i ? 'rotate-180' : ''}`} />
              </button>
              {expandedHelp === i && (
                <div className="px-4 pb-4 text-sm text-slate-600 prose prose-sm max-w-none">
                  <ReactMarkdown>{section.content}</ReactMarkdown>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
