import React from 'react';
import { Users, X } from 'lucide-react';

export function StakeholderList({ stakeholders, removeStakeholder, stakeholderDraft, setStakeholderDraft, addStakeholder }) {
  const roleColors = {
    'Economic Buyer': 'bg-purple-100 border-purple-300 text-purple-800',
    'Champion': 'bg-green-100 border-green-300 text-green-800',
    'Influencer': 'bg-blue-100 border-blue-300 text-blue-800',
    'Blocker': 'bg-red-100 border-red-300 text-red-800',
    'Decision Maker': 'bg-amber-100 border-amber-300 text-amber-800',
  };

  return (
    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2 flex items-center gap-1">
        <Users size={12} /> Key Stakeholders
      </h4>
      {stakeholders.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {stakeholders.map(s => {
            const accessIcon = s.access === 'direct' ? '●' : s.access === 'indirect' ? '◐' : '○';
            return (
              <div key={s.id} className={`flex items-center gap-1 border rounded-full px-2.5 py-1 text-xs font-bold ${roleColors[s.role] || 'bg-slate-100 border-slate-300 text-slate-700'}`}>
                <span title={`Access: ${s.access}`}>{accessIcon}</span>
                <span>{s.name}</span>
                {s.title && <span className="font-medium opacity-70">· {s.title}</span>}
                <span className="opacity-50">({s.role})</span>
                {s.budgetConfirmed && <span title="Budget confirmed">💰</span>}
                <button onClick={() => removeStakeholder(s.id)} className="ml-0.5 opacity-40 hover:opacity-100 transition-opacity">
                  <X size={10} />
                </button>
              </div>
            );
          })}
        </div>
      )}
      <div className="flex gap-1.5 items-end flex-wrap">
        <input
          type="text"
          value={stakeholderDraft.name}
          onChange={(e) => setStakeholderDraft(prev => ({ ...prev, name: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && addStakeholder()}
          placeholder="Name"
          className="border border-blue-300 rounded px-2 py-1.5 text-xs font-medium text-slate-900 focus:ring-1 focus:ring-blue-500 w-28"
        />
        <input
          type="text"
          value={stakeholderDraft.title}
          onChange={(e) => setStakeholderDraft(prev => ({ ...prev, title: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && addStakeholder()}
          placeholder="Title"
          className="border border-blue-300 rounded px-2 py-1.5 text-xs font-medium text-slate-900 focus:ring-1 focus:ring-blue-500 w-24"
        />
        <select
          value={stakeholderDraft.role}
          onChange={(e) => setStakeholderDraft(prev => ({ ...prev, role: e.target.value }))}
          className="border border-blue-300 rounded px-1.5 py-1.5 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-blue-500 bg-white"
        >
          <option>Economic Buyer</option>
          <option>Champion</option>
          <option>Decision Maker</option>
          <option>Influencer</option>
          <option>Blocker</option>
        </select>
        <div className="flex items-center gap-0.5">
          {[{val: 'direct', label: '●', tip: 'Direct access'}, {val: 'indirect', label: '◐', tip: 'Indirect access'}, {val: 'none', label: '○', tip: 'No access'}].map(a => (
            <button
              key={a.val}
              title={a.tip}
              onClick={() => setStakeholderDraft(prev => ({ ...prev, access: a.val }))}
              className={`w-6 h-6 rounded text-xs font-bold transition-all ${
                stakeholderDraft.access === a.val
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-500 hover:border-blue-400'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1 cursor-pointer" title="Budget confirmed">
          <input
            type="checkbox"
            checked={stakeholderDraft.budgetConfirmed}
            onChange={(e) => setStakeholderDraft(prev => ({ ...prev, budgetConfirmed: e.target.checked }))}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
          />
          <span className="text-xs font-bold text-slate-500">💰</span>
        </label>
        <button
          onClick={addStakeholder}
          disabled={!stakeholderDraft.name.trim()}
          className={`px-2.5 py-1.5 rounded text-xs font-bold transition-all ${
            stakeholderDraft.name.trim()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          + Add
        </button>
      </div>
    </div>
  );
}
