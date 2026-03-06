import React from 'react';
import {
  Briefcase, Settings, TrendingUp, Layers, Sparkles, ChevronDown, ChevronRight,
  FileText, Paperclip, File as FileIcon, X, Network, Server, CloudLightning,
  MessageSquare, RefreshCw, Download, Upload, ClipboardCopy, HelpCircle, Compass
} from 'lucide-react';
import { t } from '../lib/i18n';
import { glossary } from '../lib/glossary';
import { OTHER_SAP_OPTIONS, OTHER_NONSAP_OPTIONS } from '../lib/constants';
import MultiSelect from './MultiSelect';
import LanguageSelector from './LanguageSelector';
import { StakeholderList } from './StakeholderList';

export default function InputPanel({
  // Language
  selectedLanguage, setSelectedLanguage,
  // Config
  config,
  // Sections
  expandedSection, toggleSection,
  // Deal state
  selectedIndustry, setSelectedIndustry,
  selectedProcess, setSelectedProcess,
  selectedValue, setSelectedValue,
  selectedCapability, setSelectedCapability,
  additionalContext, setAdditionalContext,
  attachments, isRise, setIsRise,
  adoptionRelated, setAdoptionRelated,
  erpSystem, setErpSystem,
  otherSap, setOtherSap,
  otherNonSap, setOtherNonSap,
  stakeholders, stakeholderDraft, setStakeholderDraft,
  addStakeholder, removeStakeholder,
  debriefText, setDebriefText,
  fileInputRef,
  handleFileSelect, removeAttachment,
  // Actions
  handleSmartStart, smartStartInput, setSmartStartInput, smartStartLoading,
  handleGiveIdeas, isGenerating,
  handleExtractDebrief, isExtractingDebrief,
  // Toolbar actions
  setShowHelp, setShowAdmin, exportDeal, importDeal, copyFullDeal,
  clearHistory, clearAll, setActiveTab,
  coachingContent, briefContent, chatMessages,
}) {
  return (
    <div className="lg:col-span-4 flex flex-col lg:h-full h-auto gap-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-md border border-slate-200 shrink-0 overflow-visible">
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 bg-blue-700 rounded-lg shadow-sm">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none whitespace-nowrap">
              SAP BTM AIDE-visor
            </h1>
            <p className="text-slate-600 text-xs font-bold mt-1">{t(selectedLanguage, "subtitle")}</p>
          </div>
        </div>
        <div className="flex gap-1 items-center flex-wrap justify-end ml-2">
          <LanguageSelector selected={selectedLanguage} onChange={setSelectedLanguage} />
          <button onClick={() => setShowHelp(true)} className="text-xs font-bold text-slate-500 hover:text-blue-700 flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors" title="Help">
            <HelpCircle size={14} />
          </button>
          <button onClick={() => setShowAdmin(true)} className="text-xs font-bold text-slate-500 hover:text-blue-700 flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors" title={t(selectedLanguage, "admin")}>
            <Settings size={14} />
          </button>
          <button onClick={exportDeal} className="text-xs font-bold text-slate-500 hover:text-green-700 flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors" title="Export deal">
            <Download size={14} />
          </button>
          <button onClick={importDeal} className="text-xs font-bold text-slate-500 hover:text-blue-700 flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors" title="Import deal">
            <Upload size={14} />
          </button>
          <button onClick={copyFullDeal} className="text-xs font-bold text-slate-500 hover:text-teal-700 flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors" title="Copy full deal as text">
            <ClipboardCopy size={14} />
          </button>
          <div className="w-px h-5 bg-slate-200 mx-0.5"></div>
          {(coachingContent || briefContent || chatMessages.length > 0) && (
            <button onClick={clearHistory} className="text-xs font-bold text-slate-500 hover:text-orange-700 flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors" title={t(selectedLanguage, "clearHistory")}>
              <X size={14} />
            </button>
          )}
          <button onClick={clearAll} className="text-xs font-bold text-slate-500 hover:text-red-700 flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors" title={t(selectedLanguage, "reset")}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 flex-grow flex flex-col lg:overflow-y-auto h-auto">
        {/* Smart Start */}
        <div className="mb-3">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                value={smartStartInput}
                onChange={(e) => setSmartStartInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSmartStart()}
                placeholder='🚀 Smart Start — e.g. "Company XYZ in APAC wants to move to RISE"'
                disabled={smartStartLoading}
                className="w-full border-2 border-dashed border-indigo-300 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-indigo-500 bg-indigo-50/50 placeholder-indigo-400 disabled:opacity-50"
              />
            </div>
            <button
              onClick={handleSmartStart}
              disabled={!smartStartInput.trim() || smartStartLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 whitespace-nowrap disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {smartStartLoading ? (<><RefreshCw size={12} className="animate-spin" /> Researching...</>) : (<><Sparkles size={12} /> Go</>)}
            </button>
          </div>
        </div>

        {/* Core Context */}
        <div className="mb-3">
          <button onClick={() => toggleSection('core')} className="w-full flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-blue-600" />
              <span className="font-extrabold text-sm text-slate-800">{t(selectedLanguage, "coreContext")}</span>
            </div>
            {expandedSection.core ? <ChevronDown size={16} className="text-slate-400"/> : <ChevronRight size={16} className="text-slate-400"/>}
          </button>
          {expandedSection.core && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in slide-in-from-top-2 fade-in duration-200">
              <MultiSelect label={t(selectedLanguage, "industry")} icon={Briefcase} options={config.industries} selected={selectedIndustry} onChange={setSelectedIndustry} colorClass="text-purple-700" borderColor="border-slate-400" />
              <MultiSelect label={t(selectedLanguage, "process")} icon={Layers} options={config.processDomains} selected={selectedProcess} onChange={setSelectedProcess} colorClass="text-blue-700" borderColor="border-slate-400" />
              <MultiSelect label={t(selectedLanguage, "value")} icon={TrendingUp} options={config.valueDrivers} selected={selectedValue} onChange={setSelectedValue} colorClass="text-green-700" borderColor="border-slate-400" />
              <MultiSelect label={t(selectedLanguage, "capability")} icon={Settings} options={config.solutionCapabilities} selected={selectedCapability} onChange={setSelectedCapability} colorClass="text-orange-700" borderColor="border-slate-400" />
            </div>
          )}
        </div>

        {/* Context Compass */}
        <ContextCompass
          selectedIndustry={selectedIndustry}
          selectedProcess={selectedProcess}
          selectedValue={selectedValue}
          selectedCapability={selectedCapability}
          expandedSection={expandedSection}
          toggleSection={toggleSection}
          glossary={glossary}
        />

        {/* Landscape */}
        <div className="mb-3">
          <button onClick={() => toggleSection('landscape')} className="w-full flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-2">
              <Server size={16} className="text-orange-600" />
              <span className="font-extrabold text-sm text-slate-800">{t(selectedLanguage, "landscape")}</span>
            </div>
            {expandedSection.landscape ? <ChevronDown size={16} className="text-slate-400"/> : <ChevronRight size={16} className="text-slate-400"/>}
          </button>
          {expandedSection.landscape && (
            <div className="mt-3 p-1 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <label className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${isRise ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-300 hover:border-slate-400'}`}>
                  <input type="checkbox" checked={isRise} onChange={(e) => setIsRise(e.target.checked)} className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <CloudLightning size={12} className="text-orange-500" /> {t(selectedLanguage, "riseOpp")}
                  </span>
                </label>
                <div className="flex flex-col gap-1 pl-1">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <input type="checkbox" checked={erpSystem.s4} onChange={(e) => setErpSystem({...erpSystem, s4: e.target.checked})} className="w-3 h-3" /> {t(selectedLanguage, "s4hana")}
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <input type="checkbox" checked={erpSystem.ecc} onChange={(e) => setErpSystem({...erpSystem, ecc: e.target.checked})} className="w-3 h-3" /> {t(selectedLanguage, "sapEcc")}
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <input type="checkbox" checked={erpSystem.nonSap} onChange={(e) => setErpSystem({...erpSystem, nonSap: e.target.checked})} className="w-3 h-3" /> {t(selectedLanguage, "nonSapErp")}
                  </label>
                </div>
              </div>
              <div className="mb-3">
                <h4 className="text-[10px] font-bold text-slate-500 mb-1">{t(selectedLanguage, "adoptionOpp")}</h4>
                <div className="flex gap-2">
                  {[
                    { key: 'signavio', label: 'SAP Signavio', color: 'text-blue-600' },
                    { key: 'leanix', label: 'SAP LeanIX', color: 'text-green-600' },
                    { key: 'walkme', label: 'WalkMe', color: 'text-orange-600' },
                  ].map(({ key, label, color }) => (
                    <label key={key} className="flex items-center gap-1.5 p-1.5 rounded border bg-white cursor-pointer hover:border-slate-400">
                      <input type="checkbox" checked={adoptionRelated[key]} onChange={(e) => setAdoptionRelated({...adoptionRelated, [key]: e.target.checked})} className={`w-3.5 h-3.5 ${color}`} />
                      <span className="text-[11px] font-bold text-slate-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">{t(selectedLanguage, "otherSap")}</label>
                  <select value={otherSap} onChange={(e) => setOtherSap(e.target.value)} className="w-full border border-slate-300 rounded p-1.5 text-xs font-medium bg-white focus:border-blue-500 outline-none">
                    <option value="">None</option>
                    {OTHER_SAP_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">{t(selectedLanguage, "otherNonSap")}</label>
                  <select value={otherNonSap} onChange={(e) => setOtherNonSap(e.target.value)} className="w-full border border-slate-300 rounded p-1.5 text-xs font-medium bg-white focus:border-blue-500 outline-none">
                    <option value="">None</option>
                    {OTHER_NONSAP_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Details */}
        <div className="flex-grow flex flex-col">
          <button onClick={() => toggleSection('details')} className="w-full flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors mb-2">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-green-600" />
              <span className="font-extrabold text-sm text-slate-800">{t(selectedLanguage, "additionalDetails")}</span>
            </div>
            {expandedSection.details ? <ChevronDown size={16} className="text-slate-400"/> : <ChevronRight size={16} className="text-slate-400"/>}
          </button>
          {expandedSection.details && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{t(selectedLanguage, "contextAttachments")}</span>
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-200 transition-colors">
                  <Paperclip size={12} /> {t(selectedLanguage, "attachFile")}
                </button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,image/png,image/jpeg,image/jpg" onChange={handleFileSelect} />
              {attachments.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {attachments.map((file, i) => (
                    <div key={i} className="flex items-center gap-1 bg-slate-100 border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 font-bold max-w-full">
                      <FileIcon size={10} className="text-slate-500" />
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <button onClick={() => removeAttachment(i)} className="text-slate-400 hover:text-red-500 ml-1"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
              <textarea
                value={additionalContext}
                onChange={(e) => { setAdditionalContext(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                placeholder={t(selectedLanguage, "pastePlaceholder")}
                className="w-full border border-slate-300 rounded-md p-2.5 text-sm font-medium text-slate-900 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 resize-none min-h-[6rem] max-h-48 overflow-y-auto"
                style={{ height: '6rem' }}
              />
              <StakeholderList stakeholders={stakeholders} removeStakeholder={removeStakeholder} stakeholderDraft={stakeholderDraft} setStakeholderDraft={setStakeholderDraft} addStakeholder={addStakeholder} />
              <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <MessageSquare size={12} /> Post-Meeting Debrief
                </h4>
                <textarea value={debriefText} onChange={(e) => setDebriefText(e.target.value)} placeholder="What did you learn? Paste meeting notes, key takeaways, who said what..." className="w-full border border-indigo-300 rounded px-2 py-1.5 text-xs font-medium text-slate-900 focus:ring-1 focus:ring-indigo-500 resize-none min-h-[4rem] mb-2" rows={3} />
                <button onClick={handleExtractDebrief} disabled={!debriefText.trim() || isExtractingDebrief} className={`w-full px-2.5 py-1.5 rounded text-xs font-bold transition-all ${debriefText.trim() && !isExtractingDebrief ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                  {isExtractingDebrief ? (<span className="flex items-center justify-center gap-1"><RefreshCw className="animate-spin" size={12} /> Extracting...</span>) : 'Extract Insights'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGiveIdeas}
          disabled={isGenerating}
          className={`w-full mt-auto py-3 px-4 rounded-lg text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${isGenerating ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 hover:shadow-lg active:scale-[0.98]'}`}
        >
          {isGenerating ? (<><RefreshCw className="animate-spin" size={18} /> {t(selectedLanguage, "consulting")}</>) : (<><Sparkles size={18} /> {t(selectedLanguage, "giveIdeas")}</>)}
        </button>

        {/* Mini Context Map */}
        {(selectedIndustry.length > 0 || selectedProcess.length > 0 || selectedValue.length > 0 || selectedCapability.length > 0) && (
          <button onClick={() => setActiveTab('visual')} className="w-full mt-3 p-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors text-left group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1"><Network size={10} /> Context Map</span>
              <span className="text-[9px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">View full map →</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedIndustry.map(i => (<span key={i} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{i}</span>))}
              {selectedProcess.map(p => (<span key={p} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700">{p}</span>))}
              {selectedValue.map(v => (<span key={v} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">{v}</span>))}
              {selectedCapability.map(c => (<span key={c} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">{c}</span>))}
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

// Context Compass sub-component
function ContextCompass({ selectedIndustry, selectedProcess, selectedValue, selectedCapability, expandedSection, toggleSection, glossary }) {
  const hasSelections = selectedIndustry.length > 0 || selectedProcess.length > 0 || selectedValue.length > 0 || selectedCapability.length > 0;
  if (!hasSelections) return null;

  const allSelections = [
    ...selectedIndustry.map(s => ({ category: 'Industry', value: s })),
    ...selectedProcess.map(s => ({ category: 'Process', value: s })),
    ...selectedValue.map(s => ({ category: 'Value Driver', value: s })),
    ...selectedCapability.map(s => ({ category: 'Capability', value: s }))
  ];

  const grouped = allSelections.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item.value);
    return acc;
  }, {});

  const buildSummary = () => {
    const ind = selectedIndustry.length > 0;
    const proc = selectedProcess.length > 0;
    const val = selectedValue.length > 0;
    const cap = selectedCapability.length > 0;
    if (!ind && !proc && !val && !cap) return '';
    const industry = ind ? selectedIndustry.join(' & ') : 'enterprise';
    const templates = [];
    if (ind && proc && val) {
      templates.push(`Position SAP as the transformation backbone for ${industry}, anchoring the conversation around ${selectedProcess.slice(0,2).join(' and ')} to drive measurable ${selectedValue.slice(0,2).join(' and ').toLowerCase()}.`);
    } else if (ind && proc) {
      templates.push(`Lead with ${selectedProcess.slice(0,2).join(' and ')} as the entry point for ${industry} — this frames the conversation around business outcomes, not technology.`);
    } else if (ind && val) {
      templates.push(`For ${industry}, anchor the narrative on ${selectedValue.slice(0,2).join(' and ').toLowerCase()} — this is what the C-suite cares about.`);
    } else if (ind) {
      templates.push(`You're entering the ${industry} space — build credibility by showing you understand their specific operational challenges.`);
    } else if (proc) {
      templates.push(`Leading with ${selectedProcess.slice(0,2).join(' and ')} gives you a process-first narrative that resonates across industries.`);
    }
    if (cap) {
      templates.push(`${selectedCapability.slice(0,3).join(', ')} ${selectedCapability.length === 1 ? 'is' : 'are'} your proof points — use ${selectedCapability.length === 1 ? 'it' : 'them'} to make the value tangible.`);
    }
    return templates.join(' ');
  };

  return (
    <div className="mb-3">
      <button onClick={() => toggleSection('compass')} className="w-full flex justify-between items-center p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors">
        <div className="flex items-center gap-2">
          <Compass size={16} className="text-blue-600" />
          <span className="font-extrabold text-sm text-slate-800">Context Compass 🧭</span>
        </div>
        {expandedSection.compass ? <ChevronDown size={16} className="text-slate-400"/> : <ChevronRight size={16} className="text-slate-400"/>}
      </button>
      {buildSummary() && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-slate-700 italic">{buildSummary()}</div>
      )}
      {expandedSection.compass && (
        <div className="mt-3 p-3 bg-white border border-blue-100 rounded-lg animate-in slide-in-from-top-2 fade-in duration-200">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-3 last:mb-0">
              <h4 className="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-1.5">{category}</h4>
              <div className="space-y-1">
                {items.map(item => (
                  <div key={item} className="text-xs">
                    <span className="font-bold text-slate-800">{item}</span>
                    {glossary[item] && (<span className="text-slate-600 ml-1">— {glossary[item]}</span>)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
