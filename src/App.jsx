import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Briefcase, Settings, TrendingUp, Layers, Sparkles, Copy, RefreshCw, 
  ChevronDown, ChevronRight, FileText, Mail, ShieldAlert, Paperclip, 
  File as FileIcon, X, Network, Maximize2, BarChart2, Share2, Table, 
  CloudLightning, Server, Target, Calendar, Users, MessageSquare, Compass,
  Download, Upload, ClipboardCopy, Pencil, Eye, HelpCircle
} from 'lucide-react';

// Library imports
import { t } from './lib/i18n';
// API imports moved to useAIActions hook
import { calculateMeddicScores } from './lib/meddic';
import { glossary } from './lib/glossary';
// parseAIJson moved to useAIActions hook
import { useAIActions } from './hooks/useAIActions';
import { 
  DEFAULT_VALUE_METHODOLOGY, 
  DEFAULT_MARKETING_VOICE, 
  DEFAULT_GUARDRAILS,
  DEFAULT_INDUSTRIES,
  DEFAULT_PROCESS_DOMAINS,
  DEFAULT_VALUE_DRIVERS,
  DEFAULT_SOLUTION_CAPABILITIES,
  OTHER_SAP_OPTIONS,
  OTHER_NONSAP_OPTIONS
} from './lib/constants';
import { useDealState } from './hooks/useDealState';
import { useModals } from './hooks/useModals';
import { StakeholderList } from './components/StakeholderList';

// Component imports
import ToastContainer from './components/ToastContainer';
import LanguageSelector from './components/LanguageSelector';
import StrategicDropdown from './components/StrategicDropdown';
import MultiSelect from './components/MultiSelect';
import ContextMap from './components/ContextMap';
import ChatInterface from './components/ChatInterface';
import MeddicHeatmap from './components/MeddicHeatmap';
import Modal, { ConfirmModal, AdminModal, VisualMapModal, AgendaSettingsModal } from './components/Modal';

export default function App() {
  // Configuration State
  const [config, setConfig] = useState({ 
    industries: DEFAULT_INDUSTRIES, 
    processDomains: DEFAULT_PROCESS_DOMAINS, 
    valueDrivers: DEFAULT_VALUE_DRIVERS, 
    solutionCapabilities: DEFAULT_SOLUTION_CAPABILITIES, 
    valueMethodology: DEFAULT_VALUE_METHODOLOGY, 
    marketingVoice: DEFAULT_MARKETING_VOICE, 
    aiGuardrails: DEFAULT_GUARDRAILS 
  });

  // Toast State
  const [toasts, setToasts] = useState([]);
  const addToast = (msg, type) => { 
    const id = Date.now(); 
    setToasts(prev => [...prev, { id, message: msg, type }]); 
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000); 
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // UI State
  const [activeTab, setActiveTab] = useState('visual');
  const [selectedLanguage, setSelectedLanguage] = useState("English (EN)");
  const [expandedSection, setExpandedSection] = useState({ core: true, compass: false, compassDetails: false, landscape: false, details: true });
  const toggleSection = (key) => setExpandedSection(prev => ({ ...prev, [key]: !prev[key] }));

  // Deal State (inputs, stakeholders, timeline, attachments)
  const deal = useDealState(addToast);
  const {
    selectedIndustry, setSelectedIndustry,
    selectedProcess, setSelectedProcess,
    selectedValue, setSelectedValue,
    selectedCapability, setSelectedCapability,
    additionalContext, setAdditionalContext,
    attachments, setAttachments,
    isRise, setIsRise,
    adoptionRelated, setAdoptionRelated,
    erpSystem, setErpSystem,
    otherSap, setOtherSap,
    otherNonSap, setOtherNonSap,
    stakeholders, setStakeholders,
    stakeholderDraft, setStakeholderDraft,
    debriefText, setDebriefText,
    dealTimeline,
    fileInputRef,
    addStakeholder, removeStakeholder, cycleMilestone,
    handleFileSelect, removeAttachment,
  } = deal;
  const [isExtractingDebrief, setIsExtractingDebrief] = useState(false);

  // Output State
  const [coachingContent, setCoachingContent] = useState(() => {
    const saved = localStorage.getItem('btm_coaching_content');
    return saved || "";
  });
  const [briefContent, setBriefContent] = useState(() => {
    const saved = localStorage.getItem('btm_brief_content');
    return saved || "";
  });
  const [chatMessages, setChatMessages] = useState(() => {
    const saved = localStorage.getItem('btm_chat_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Save to localStorage whenever content changes
  React.useEffect(() => {
    localStorage.setItem('btm_coaching_content', coachingContent);
  }, [coachingContent]);

  React.useEffect(() => {
    localStorage.setItem('btm_brief_content', briefContent);
  }, [briefContent]);

  React.useEffect(() => {
    localStorage.setItem('btm_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Modal State
  // Modal State
  const {
    activeModal, setActiveModal, modalContent, setModalContent,
    isModalLoading, setIsModalLoading, modalMedia, setModalMedia,
    showAdmin, setShowAdmin, showAgendaSettings, setShowAgendaSettings,
    showFullMap, setShowFullMap, showHelp, setShowHelp,
    expandedHelp, setExpandedHelp,
    confirmConfig, setConfirmConfig, triggerConfirm,
  } = useModals();
  const [smartStartInput, setSmartStartInput] = useState('');
  const [smartStartLoading, setSmartStartLoading] = useState(false);

  // AI Actions hook (see below after state declarations)
  const [showValuePanel, setShowValuePanel] = useState(false);
  const [valueStrategies, setValueStrategies] = useState({ deepen: '', broaden: '', phase: '' });
  const [valueLoading, setValueLoading] = useState({ deepen: false, broaden: false, phase: false });
  // Refs
  const outputSectionRef = useRef(null);
  const valuePanelRef = useRef(null);
  const objectionPanelRef = useRef(null);
  const emailPanelRef = useRef(null);

  // Helper Functions
  const saveConfigWrapper = (newConfig) => {
    setConfig(newConfig);
    localStorage.setItem("btm_advisor_config", JSON.stringify(newConfig));
  };

  const getContextString = () => 
    `Industry: ${selectedIndustry.join(', ')}. Process: ${selectedProcess.join(', ')}. Value: ${selectedValue.join(', ')}. ${additionalContext}`;

  const scrollToOutput = () => { 
    if (window.innerWidth < 1024 && outputSectionRef.current) { 
      outputSectionRef.current.scrollIntoView({ behavior: 'smooth' }); 
    } 
  };

  const constructSystemInstruction = (roleInstruction) => {
    return `${config.valueMethodology}\n\n${config.marketingVoice}\n\nROLE: ${roleInstruction}\n\nIMPORTANT: Respond in ${selectedLanguage}.`;
  };

  const copyToClipboard = (text) => { 
    navigator.clipboard.writeText(text); 
    addToast(t(selectedLanguage, "actions", "copy"), "success"); 
  };

  const clearAll = () => deal.clearAll(triggerConfirm, setCoachingContent, setBriefContent, setChatMessages, t, selectedLanguage);

  const clearHistory = () => {
    triggerConfirm(t(selectedLanguage, "clearHistory"), "Clear all coaching content, briefs, and chat history?", () => {
      setCoachingContent("");
      setBriefContent("");
      setChatMessages([]);
      localStorage.removeItem('btm_coaching_content');
      localStorage.removeItem('btm_brief_content');
      localStorage.removeItem('btm_chat_messages');
      addToast(t(selectedLanguage, "clearHistory") + " complete", "info");
    });
  };

  const exportDeal = () => deal.exportDeal(coachingContent, briefContent, chatMessages);
  const importDeal = () => deal.importDeal(setCoachingContent, setBriefContent, setChatMessages);

  const copyFullDeal = () => {
    const meddicScores = calculateMeddicScores({ selectedIndustry, selectedProcess, selectedValue, selectedCapability, additionalContext, isRise, erpSystem, adoptionRelated, stakeholders, coachingContent, briefContent });
    const lines = [
      '=== SAP BTM AIDE-visor — Full Deal Summary ===',
      '',
      '— CONTEXT —',
      `Industry: ${selectedIndustry.join(', ') || 'Not set'}`,
      `Process: ${selectedProcess.join(', ') || 'Not set'}`,
      `Value Drivers: ${selectedValue.join(', ') || 'Not set'}`,
      `Capabilities: ${selectedCapability.join(', ') || 'Not set'}`,
      `RISE: ${isRise ? 'Yes' : 'No'}`,
      `ERP: ${[erpSystem.s4 && 'S/4HANA', erpSystem.ecc && 'SAP ECC', erpSystem.nonSap && 'Non-SAP'].filter(Boolean).join(', ') || 'Not set'}`,
      '',
      '— ADDITIONAL CONTEXT —',
      additionalContext || '(none)',
    ];
    if (stakeholders.length > 0) {
      lines.push('', '— STAKEHOLDERS —');
      stakeholders.forEach(s => lines.push(`• ${s.name}${s.title ? ` (${s.title})` : ''} — ${s.role} [${s.access}]${s.budgetConfirmed ? ' 💰' : ''}`));
    }
    if (coachingContent) {
      lines.push('', '— COACHING CONTENT —', coachingContent);
    }
    if (briefContent) {
      lines.push('', '— BRIEF CONTENT —', briefContent);
    }
    lines.push('', '— MEDDIC SCORES —');
    const labels = { metrics: 'Metrics', economicBuyer: 'Economic Buyer', decisionCriteria: 'Decision Criteria', decisionProcess: 'Decision Process', identifyPain: 'Pain Points', champion: 'Champion' };
    Object.entries(meddicScores).forEach(([key, data]) => {
      lines.push(`${labels[key] || key}: ${data.score}/100`);
    });
    navigator.clipboard.writeText(lines.join('\n'));
    addToast('Full deal copied to clipboard!', 'success');
  };

  const [showEmailPanel, setShowEmailPanel] = useState(false);
  const [emailCards, setEmailCards] = useState({ intro: null, followup: null, valuehook: null });
  const [emailLoading, setEmailLoading] = useState({ intro: false, followup: false, valuehook: false });
  const [copiedEmail, setCopiedEmail] = useState(null);

  const [showObjectionPanel, setShowObjectionPanel] = useState(false);
  const [isEditingCoaching, setIsEditingCoaching] = useState(false);
  const [objectionCards, setObjectionCards] = useState([]);
  const [objectionLoading, setObjectionLoading] = useState(false);
  const [expandedObjection, setExpandedObjection] = useState(null);

  // AI Actions Hook
  const {
    handleSmartStart, handleGiveIdeas, handleGenerateBrief, handleChat,
    handleExtractDebrief, handleDraftEmail, copyEmailToClipboard, openInEmailClient,
    refineEmailInChat, handleObjections, practiceObjection, handleCompetitorIntel,
    handleIncreaseValue, applyValueStrategy, handleStakeholderMap, handleSignavioBPMN,
    handleLeanIXModel, generateAgenda,
  } = useAIActions({
    config, selectedLanguage, attachments,
    setSelectedIndustry, setSelectedProcess, setSelectedValue, setSelectedCapability,
    setAdditionalContext, setIsRise, setErpSystem, setStakeholders,
    coachingContent, setCoachingContent, briefContent, setBriefContent,
    chatMessages, setChatMessages,
    setActiveTab, setExpandedSection, setIsGenerating, setIsChatTyping,
    setIsExtractingDebrief,
    setActiveModal, setIsModalLoading, setModalContent, setModalMedia,
    setShowAgendaSettings,
    setShowEmailPanel, showEmailPanel, setEmailCards, setEmailLoading, setCopiedEmail,
    setShowObjectionPanel, showObjectionPanel, objectionCards, setObjectionCards, setObjectionLoading,
    setShowValuePanel, showValuePanel, setValueStrategies, setValueLoading,
    addToast, scrollToOutput, getContextString, constructSystemInstruction,
    smartStartInput, setSmartStartInput, setSmartStartLoading,
    debriefText, setDebriefText,
    emailPanelRef, objectionPanelRef, valuePanelRef,
  });

  console.log('[BTM] App rendering...');
  return (
    <div className="min-h-screen bg-slate-200 text-slate-900 font-sans p-3 md:p-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmModal 
        isOpen={confirmConfig.isOpen} 
        onClose={() => setConfirmConfig({...confirmConfig, isOpen: false})} 
        title={confirmConfig.title} 
        message={confirmConfig.message} 
        onConfirm={confirmConfig.onConfirm} 
      />
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <HelpCircle size={20} className="text-blue-600" /> AIDE-visor Guide
              </h2>
              <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="px-6 py-4 space-y-1">
              {[
                { title: '🎯 What is AIDE-visor?', content: 'A strategic coaching tool for SAP Integrated Toolchain conversations. It helps you prepare for customer engagements by generating tailored coaching, value propositions, and formal deliverables — grounded in the customer\'s industry, processes, and context.' },
                { title: '🔄 The Flow', content: '**1. Configure** (left panel) — Set industry, company, process domain, ERP system, and any additional context.\n\n**2. Generate Coaching** — Hit the play button to get AI-powered strategic coaching.\n\n**3. Refine** — Edit the coaching output directly (pencil icon), explore value strategies, or practice objection handling.\n\n**4. Export** — Draft a formal brief, email, or copy the content.' },
                { title: '📑 Tabs', content: '**Coaching** — Your ideation workspace. Generate strategic coaching, explore value expansion (Deepen/Broaden/Phase), handle objections, and analyze competitors.\n\n**Chat** — Freeform AI conversation for ad-hoc questions about the deal context.\n\n**Brief** — Formal output. Generate polished briefs and emails for stakeholders.\n\n**Visual** — Architecture diagrams and process visualizations.\n\n**Deal Score** — MEDDIC-based deal qualification heatmap.' },
                { title: '📈 Value Strategies', content: '**Deepen** — Expand current solutions to more areas within the same scope.\n\n**Broaden** — Three dimensions, all within the Integrated Toolchain:\n• More processes (e.g., O2C → P2P)\n• More org units or countries\n• More ITC components not yet selected\n\n**Phase** — Combined roadmap: Quick Wins (0-6mo), Scale (6-18mo), Transform (18-36mo).' },
                { title: '🔧 Integrated Toolchain', content: 'The ITC orchestrates cloud ERP transformation across people, processes, apps, and data:\n\n• **SAP Signavio** — Process analysis & benchmarking\n• **SAP LeanIX** — Enterprise architecture mapping\n• **WalkMe** — Digital adoption & in-app guidance\n• **SAP Cloud ALM** — Project governance & orchestration\n• **SAP Build** — Low-code/no-code extensions\n• **Business Transformation Center** — Data migration\n• **Digital Discovery Assessment** — Landscape assessment\n• **Tricentis** — Automated testing & validation' },
                { title: '⚙️ Settings', content: '**Access Token** — Required to connect to the AI backend. Enter the token provided to you.\n\n**Language** — Switch the UI and AI output language.\n\n**Guardrails** — Customize the AI coaching principles (advanced). Default guardrails emphasize business outcomes over products.\n\n**Export/Import** — Save and restore your deal context as JSON files.' },
              ].map((section, i) => (
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
      )}
      <AdminModal 
        isOpen={showAdmin} 
        onClose={() => setShowAdmin(false)} 
        config={config} 
        onSave={saveConfigWrapper} 
        addToast={addToast} 
        selectedLanguage={selectedLanguage}
      />
      <Modal 
        isOpen={!!activeModal} 
        onClose={() => setActiveModal(null)} 
        title={activeModal ? t(selectedLanguage, "actions", activeModal) : ""} 
        content={modalContent} 
        isLoading={isModalLoading} 
        media={modalMedia} 
        icon={Settings} 
      />
      <VisualMapModal 
        isOpen={showFullMap} 
        onClose={() => setShowFullMap(false)} 
        industries={selectedIndustry} 
        processes={selectedProcess} 
        values={selectedValue} 
        capabilities={selectedCapability} 
        adoptionRelated={adoptionRelated} 
      />
      <AgendaSettingsModal 
        isOpen={showAgendaSettings} 
        onClose={() => setShowAgendaSettings(false)} 
        onGenerate={generateAgenda} 
      />

      <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[93vh] h-auto">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-4 flex flex-col lg:h-full h-auto gap-4">
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
              <button 
                onClick={() => setShowHelp(true)} 
                className="text-xs font-bold text-slate-500 hover:text-blue-700 flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors"
                title="Help"
              >
                <HelpCircle size={14} />
              </button>
              <button 
                onClick={() => setShowAdmin(true)} 
                className="text-xs font-bold text-slate-500 hover:text-blue-700 flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors"
                title={t(selectedLanguage, "admin")}
              >
                <Settings size={14} />
              </button>
              <button 
                onClick={exportDeal} 
                className="text-xs font-bold text-slate-500 hover:text-green-700 flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors"
                title="Export deal"
              >
                <Download size={14} />
              </button>
              <button 
                onClick={importDeal} 
                className="text-xs font-bold text-slate-500 hover:text-blue-700 flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors"
                title="Import deal"
              >
                <Upload size={14} />
              </button>
              <button 
                onClick={copyFullDeal} 
                className="text-xs font-bold text-slate-500 hover:text-teal-700 flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors"
                title="Copy full deal as text"
              >
                <ClipboardCopy size={14} />
              </button>
              <div className="w-px h-5 bg-slate-200 mx-0.5"></div>
              {(coachingContent || briefContent || chatMessages.length > 0) && (
                <button 
                  onClick={clearHistory} 
                  className="text-xs font-bold text-slate-500 hover:text-orange-700 flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors"
                  title={t(selectedLanguage, "clearHistory")}
                >
                  <X size={14} />
                </button>
              )}
              <button 
                onClick={clearAll} 
                className="text-xs font-bold text-slate-500 hover:text-red-700 flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors"
                title={t(selectedLanguage, "reset")}
              >
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
                  {smartStartLoading ? (
                    <><RefreshCw size={12} className="animate-spin" /> Researching...</>
                  ) : (
                    <><Sparkles size={12} /> Go</>
                  )}
                </button>
              </div>
            </div>

            {/* Core Context Section */}
            <div className="mb-3">
              <button 
                onClick={() => toggleSection('core')} 
                className="w-full flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings size={16} className="text-blue-600" />
                  <span className="font-extrabold text-sm text-slate-800">{t(selectedLanguage, "coreContext")}</span>
                </div>
                {expandedSection.core ? <ChevronDown size={16} className="text-slate-400"/> : <ChevronRight size={16} className="text-slate-400"/>}
              </button>
              {expandedSection.core && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in slide-in-from-top-2 fade-in duration-200">
                  <MultiSelect 
                    label={t(selectedLanguage, "industry")} 
                    icon={Briefcase} 
                    options={config.industries} 
                    selected={selectedIndustry} 
                    onChange={setSelectedIndustry} 
                    colorClass="text-purple-700" 
                    borderColor="border-slate-400" 
                  />
                  <MultiSelect 
                    label={t(selectedLanguage, "process")} 
                    icon={Layers} 
                    options={config.processDomains} 
                    selected={selectedProcess} 
                    onChange={setSelectedProcess} 
                    colorClass="text-blue-700" 
                    borderColor="border-slate-400" 
                  />
                  <MultiSelect 
                    label={t(selectedLanguage, "value")} 
                    icon={TrendingUp} 
                    options={config.valueDrivers} 
                    selected={selectedValue} 
                    onChange={setSelectedValue} 
                    colorClass="text-green-700" 
                    borderColor="border-slate-400" 
                  />
                  <MultiSelect 
                    label={t(selectedLanguage, "capability")} 
                    icon={Settings} 
                    options={config.solutionCapabilities} 
                    selected={selectedCapability} 
                    onChange={setSelectedCapability} 
                    colorClass="text-orange-700" 
                    borderColor="border-slate-400" 
                  />
                </div>
              )}
            </div>

            {/* Context Compass Section */}
            {(() => {
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

              // Build dynamic positioning statement
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
                  <button 
                    onClick={() => toggleSection('compass')} 
                    className="w-full flex justify-between items-center p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Compass size={16} className="text-blue-600" />
                      <span className="font-extrabold text-sm text-slate-800">Context Compass 🧭</span>
                    </div>
                    {expandedSection.compass ? <ChevronDown size={16} className="text-slate-400"/> : <ChevronRight size={16} className="text-slate-400"/>}
                  </button>
                  {buildSummary() && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-slate-700 italic">
                      {buildSummary()}
                    </div>
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
                                {glossary[item] && (
                                  <span className="text-slate-600 ml-1">— {glossary[item]}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Landscape Section */}
            <div className="mb-3">
              <button 
                onClick={() => toggleSection('landscape')} 
                className="w-full flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
              >
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
                      <input 
                        type="checkbox" 
                        checked={isRise} 
                        onChange={(e) => setIsRise(e.target.checked)} 
                        className="w-4 h-4 text-blue-600" 
                      />
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <CloudLightning size={12} className="text-orange-500" /> {t(selectedLanguage, "riseOpp")}
                      </span>
                    </label>
                    <div className="flex flex-col gap-1 pl-1">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <input 
                          type="checkbox" 
                          checked={erpSystem.s4} 
                          onChange={(e) => setErpSystem({...erpSystem, s4: e.target.checked})} 
                          className="w-3 h-3" 
                        /> {t(selectedLanguage, "s4hana")}
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <input 
                          type="checkbox" 
                          checked={erpSystem.ecc} 
                          onChange={(e) => setErpSystem({...erpSystem, ecc: e.target.checked})} 
                          className="w-3 h-3" 
                        /> {t(selectedLanguage, "sapEcc")}
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <input 
                          type="checkbox" 
                          checked={erpSystem.nonSap} 
                          onChange={(e) => setErpSystem({...erpSystem, nonSap: e.target.checked})} 
                          className="w-3 h-3" 
                        /> {t(selectedLanguage, "nonSapErp")}
                      </label>
                    </div>
                  </div>

                  {/* Adoption Related Section */}
                  <div className="mb-3">
                    <h4 className="text-[10px] font-bold text-slate-500 mb-1">{t(selectedLanguage, "adoptionOpp")}</h4>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1.5 p-1.5 rounded border bg-white cursor-pointer hover:border-slate-400">
                        <input 
                          type="checkbox" 
                          checked={adoptionRelated.signavio} 
                          onChange={(e) => setAdoptionRelated({...adoptionRelated, signavio: e.target.checked})} 
                          className="w-3.5 h-3.5 text-blue-600" 
                        />
                        <span className="text-[11px] font-bold text-slate-700">SAP Signavio</span>
                      </label>
                      <label className="flex items-center gap-1.5 p-1.5 rounded border bg-white cursor-pointer hover:border-slate-400">
                        <input 
                          type="checkbox" 
                          checked={adoptionRelated.leanix} 
                          onChange={(e) => setAdoptionRelated({...adoptionRelated, leanix: e.target.checked})} 
                          className="w-3.5 h-3.5 text-green-600" 
                        />
                        <span className="text-[11px] font-bold text-slate-700">SAP LeanIX</span>
                      </label>
                      <label className="flex items-center gap-1.5 p-1.5 rounded border bg-white cursor-pointer hover:border-slate-400">
                        <input 
                          type="checkbox" 
                          checked={adoptionRelated.walkme} 
                          onChange={(e) => setAdoptionRelated({...adoptionRelated, walkme: e.target.checked})} 
                          className="w-3.5 h-3.5 text-orange-600" 
                        />
                        <span className="text-[11px] font-bold text-slate-700">WalkMe</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">{t(selectedLanguage, "otherSap")}</label>
                      <select 
                        value={otherSap} 
                        onChange={(e) => setOtherSap(e.target.value)} 
                        className="w-full border border-slate-300 rounded p-1.5 text-xs font-medium bg-white focus:border-blue-500 outline-none"
                      >
                        <option value="">None</option>
                        {OTHER_SAP_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">{t(selectedLanguage, "otherNonSap")}</label>
                      <select 
                        value={otherNonSap} 
                        onChange={(e) => setOtherNonSap(e.target.value)} 
                        className="w-full border border-slate-300 rounded p-1.5 text-xs font-medium bg-white focus:border-blue-500 outline-none"
                      >
                        <option value="">None</option>
                        {OTHER_NONSAP_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Details Section */}
            <div className="flex-grow flex flex-col">
              <button 
                onClick={() => toggleSection('details')} 
                className="w-full flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors mb-2"
              >
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-green-600" />
                  <span className="font-extrabold text-sm text-slate-800">{t(selectedLanguage, "additionalDetails")}</span>
                </div>
                {expandedSection.details ? <ChevronDown size={16} className="text-slate-400"/> : <ChevronRight size={16} className="text-slate-400"/>}
              </button>
              {expandedSection.details && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {t(selectedLanguage, "contextAttachments")}
                    </span>
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-200 transition-colors"
                    >
                      <Paperclip size={12} /> {t(selectedLanguage, "attachFile")}
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".pdf,image/png,image/jpeg,image/jpg" 
                    onChange={handleFileSelect} 
                  />
                  {attachments.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {attachments.map((file, i) => (
                        <div 
                          key={i} 
                          className="flex items-center gap-1 bg-slate-100 border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 font-bold max-w-full"
                        >
                          <FileIcon size={10} className="text-slate-500" />
                          <span className="truncate max-w-[120px]">{file.name}</span>
                          <button 
                            onClick={() => removeAttachment(i)} 
                            className="text-slate-400 hover:text-red-500 ml-1"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <textarea 
                    value={additionalContext} 
                    onChange={(e) => {
                      setAdditionalContext(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }} 
                    placeholder={t(selectedLanguage, "pastePlaceholder")} 
                    className="w-full border border-slate-300 rounded-md p-2.5 text-sm font-medium text-slate-900 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 resize-none min-h-[6rem] max-h-48 overflow-y-auto" 
                    style={{ height: '6rem' }}
                  />

                  {/* Key Stakeholders */}
                  <StakeholderList
                    stakeholders={stakeholders}
                    removeStakeholder={removeStakeholder}
                    stakeholderDraft={stakeholderDraft}
                    setStakeholderDraft={setStakeholderDraft}
                    addStakeholder={addStakeholder}
                  />

                  {/* Post-Meeting Debrief */}
                  <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <MessageSquare size={12} /> Post-Meeting Debrief
                    </h4>
                    <textarea
                      value={debriefText}
                      onChange={(e) => setDebriefText(e.target.value)}
                      placeholder="What did you learn? Paste meeting notes, key takeaways, who said what..."
                      className="w-full border border-indigo-300 rounded px-2 py-1.5 text-xs font-medium text-slate-900 focus:ring-1 focus:ring-indigo-500 resize-none min-h-[4rem] mb-2"
                      rows={3}
                    />
                    <button
                      onClick={handleExtractDebrief}
                      disabled={!debriefText.trim() || isExtractingDebrief}
                      className={`w-full px-2.5 py-1.5 rounded text-xs font-bold transition-all ${
                        debriefText.trim() && !isExtractingDebrief
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isExtractingDebrief ? (
                        <span className="flex items-center justify-center gap-1">
                          <RefreshCw className="animate-spin" size={12} /> Extracting...
                        </span>
                      ) : (
                        'Extract Insights'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={handleGiveIdeas} 
              disabled={isGenerating} 
              className={`w-full mt-auto py-3 px-4 rounded-lg text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                isGenerating 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 hover:shadow-lg active:scale-[0.98]'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="animate-spin" size={18} /> {t(selectedLanguage, "consulting")}
                </>
              ) : (
                <>
                  <Sparkles size={18} /> {t(selectedLanguage, "giveIdeas")}
                </>
              )}
            </button>

            {/* Mini Context Map */}
            {(selectedIndustry.length > 0 || selectedProcess.length > 0 || selectedValue.length > 0 || selectedCapability.length > 0) && (
              <button 
                onClick={() => setActiveTab('visual')}
                className="w-full mt-3 p-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                    <Network size={10} /> Context Map
                  </span>
                  <span className="text-[9px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">View full map →</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedIndustry.map(i => (
                    <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{i}</span>
                  ))}
                  {selectedProcess.map(p => (
                    <span key={p} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700">{p}</span>
                  ))}
                  {selectedValue.map(v => (
                    <span key={v} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">{v}</span>
                  ))}
                  {selectedCapability.map(c => (
                    <span key={c} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">{c}</span>
                  ))}
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Outputs */}
        <div ref={outputSectionRef} className="lg:col-span-8 lg:h-full h-[600px] flex flex-col bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          {/* Deal timeline stripped — will return with persistence/phase-aware coaching */}
          <div className="flex border-b-2 border-slate-200 bg-slate-50 shrink-0 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('coaching')} 
              className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors border-r border-slate-200 whitespace-nowrap ${
                activeTab === 'coaching' 
                  ? 'bg-white text-blue-800 border-b-4 border-blue-700 shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-b border-slate-300'
              }`}
            >
              <Sparkles size={16} /> {t(selectedLanguage, "tabs", "coaching")}
            </button>
            <button 
              onClick={() => setActiveTab('chat')} 
              className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors border-r border-slate-200 whitespace-nowrap ${
                activeTab === 'chat' 
                  ? 'bg-white text-indigo-800 border-b-4 border-indigo-700 shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-b border-slate-300'
              }`}
            >
              <Target size={16} /> {t(selectedLanguage, "tabs", "chat")}
            </button>
            <button 
              onClick={() => setActiveTab('brief')} 
              className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors border-r border-slate-300 mr-2 pr-2 whitespace-nowrap ${
                activeTab === 'brief' 
                  ? 'bg-white text-green-800 border-b-4 border-green-700 shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-b border-slate-300'
              }`}
            >
              <FileText size={16} /> {t(selectedLanguage, "tabs", "brief")}
            </button>
            <button 
              onClick={() => setActiveTab('visual')} 
              className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'visual' 
                  ? 'bg-white text-orange-800 border-b-4 border-orange-700 shadow-sm' 
                  : 'bg-orange-50 text-slate-600 hover:bg-orange-100 border-b border-slate-300'
              }`}
            >
              <Network size={16} /> {t(selectedLanguage, "tabs", "visual")}
            </button>
            <button 
              onClick={() => setActiveTab('dealScore')} 
              className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'dealScore' 
                  ? 'bg-white text-purple-800 border-b-4 border-purple-700 shadow-sm' 
                  : 'bg-orange-50 text-slate-600 hover:bg-orange-100 border-b border-slate-300'
              }`}
            >
              <BarChart2 size={16} /> {t(selectedLanguage, "tabs", "dealScore")}
            </button>
          </div>

          <div className="flex-grow overflow-y-auto relative bg-white">
            {activeTab === 'coaching' && (
              <div className="h-full flex flex-col overflow-hidden">
                {!coachingContent && !isGenerating ? (
                  <div className="h-full flex flex-col items-center justify-center px-8">
                    <div className="max-w-2xl text-center">
                      <Sparkles size={56} className="mb-4 text-indigo-300 mx-auto" />
                      <h2 className="text-2xl font-extrabold text-slate-700 mb-3">{t(selectedLanguage, "emptyCoachingTitle")}</h2>
                      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                        {t(selectedLanguage, "emptyCoachingDesc")}
                      </p>
                      
                      <p className="text-xs text-slate-500 italic">
                        {t(selectedLanguage, "configureInputsPrompt")}
                      </p>
                    </div>
                  </div>
                ) : isGenerating ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <h3 className="text-base font-extrabold text-slate-900 mb-1">{t(selectedLanguage, "coachThinking")}</h3>
                    <p className="text-slate-500 text-xs font-bold">{t(selectedLanguage, "coachThinkingDesc")}</p>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="flex-grow overflow-y-auto p-6">
                      <div className="flex justify-end mb-2">
                        <button
                          onClick={() => setIsEditingCoaching(!isEditingCoaching)}
                          className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 px-2 py-1 rounded border border-slate-200 hover:border-slate-400 transition-colors"
                          title={isEditingCoaching ? "Preview" : "Edit"}
                        >
                          {isEditingCoaching ? <><Eye size={12} /> Preview</> : <><Pencil size={12} /> Edit</>}
                        </button>
                      </div>
                      {isEditingCoaching ? (
                        <textarea
                          value={coachingContent}
                          onChange={(e) => setCoachingContent(e.target.value)}
                          className="w-full h-[calc(100%-2rem)] min-h-[300px] p-4 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-white"
                          placeholder="Edit coaching content (Markdown supported)..."
                        />
                      ) : (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{coachingContent}</ReactMarkdown>
                        </div>
                      )}
                      
                      {/* Value Expansion Panel */}
                      <ValuePanel
                        valuePanelRef={valuePanelRef}
                        showValuePanel={showValuePanel}
                        setShowValuePanel={setShowValuePanel}
                        valueLoading={valueLoading}
                        valueStrategies={valueStrategies}
                        applyValueStrategy={applyValueStrategy}
                      />

                      {(() => {
                      const meddicScores = calculateMeddicScores({
                        selectedIndustry,
                        selectedProcess,
                        selectedValue,
                        selectedCapability,
                        additionalContext,
                        isRise,
                        erpSystem,
                        adoptionRelated,
                        stakeholders,
                        coachingContent,
                        briefContent
                      });
                      const weakDimensions = Object.entries(meddicScores)
                        .filter(([_key, data]) => data.score < 50) // eslint-disable-line no-unused-vars
                        .map(([key, data]) => ({ key, ...data }));
                      const strongDimensions = Object.entries(meddicScores)
                        .filter(([_key, data]) => data.score >= 50) // eslint-disable-line no-unused-vars
                        .map(([key]) => {
                          const labels = {
                            metrics: 'Metrics',
                            economicBuyer: 'Economic Buyer',
                            decisionCriteria: 'Decision Criteria',
                            decisionProcess: 'Decision Process',
                            identifyPain: 'Pain Points',
                            champion: 'Champion'
                          };
                          return labels[key] || key;
                        });

                      if (weakDimensions.length > 0) {
                        const dimensionLabels = {
                          metrics: 'Metrics',
                          economicBuyer: 'Economic Buyer',
                          decisionCriteria: 'Decision Criteria',
                          decisionProcess: 'Decision Process',
                          identifyPain: 'Pain Points',
                          champion: 'Champion'
                        };
                        const suggestions = {
                          metrics: 'Quantify the business value with specific ROI targets',
                          economicBuyer: 'Identify who controls the budget for this initiative',
                          decisionCriteria: 'Document the technical and business evaluation criteria',
                          decisionProcess: 'Map out the approval timeline and key decision gates',
                          identifyPain: 'Articulate the critical pain point driving this urgency',
                          champion: 'Find an internal advocate to champion this solution'
                        };

                        return (
                          <div className="mt-6 bg-indigo-50 border-l-4 border-indigo-500 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <span className="text-2xl">💡</span>
                              <div className="flex-1">
                                <h4 className="text-sm font-bold text-indigo-900 mb-2">
                                  Your coaching covers{' '}
                                  {strongDimensions.length > 0 ? (
                                    <span className="text-emerald-700">{strongDimensions.join(', ')}</span>
                                  ) : (
                                    'the basics'
                                  )}
                                  . Consider exploring:
                                </h4>
                                <ul className="space-y-1.5">
                                  {weakDimensions.map(({ key, score }) => (
                                    <li key={key} className="text-xs text-indigo-800">
                                      <span className="font-bold">{dimensionLabels[key]}</span>
                                      <span className="text-indigo-600 ml-1">({score}/100)</span>
                                      <span className="text-slate-700"> — {suggestions[key]}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                      {/* Objection Cards Panel */}
                      <ObjectionPanel
                        objectionPanelRef={objectionPanelRef}
                        showObjectionPanel={showObjectionPanel}
                        setShowObjectionPanel={setShowObjectionPanel}
                        objectionLoading={objectionLoading}
                        objectionCards={objectionCards}
                        expandedObjection={expandedObjection}
                        setExpandedObjection={setExpandedObjection}
                        practiceObjection={practiceObjection}
                        setBriefContent={setBriefContent}
                        setObjectionCards={setObjectionCards}
                        handleObjections={handleObjections}
                      />

                    </div>
                    <div className="shrink-0 p-3 bg-slate-50 border-t border-slate-200 flex justify-center">
                      <button 
                        onClick={handleGiveIdeas} 
                        disabled={isGenerating}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded shadow-sm flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
                      >
                        <RefreshCw size={14} /> Regenerate Ideas
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'chat' && (
              <ChatInterface 
                messages={chatMessages} 
                onSendMessage={handleChat} 
                isTyping={isChatTyping}
                suggestions={(() => {
                  const s = [];
                  const scores = calculateMeddicScores({ selectedIndustry, selectedProcess, selectedValue, selectedCapability, additionalContext, isRise, erpSystem, adoptionRelated, stakeholders, coachingContent, briefContent });
                  if (scores.economicBuyer?.score < 50) s.push({ icon: '👔', label: 'Help me identify and approach the Economic Buyer', prompt: 'Based on my deal context, help me identify who the Economic Buyer likely is, how to get access, and what messaging would resonate with them.' });
                  if (scores.champion?.score < 50) s.push({ icon: '🏆', label: 'How do I find and develop a Champion?', prompt: 'I need to find an internal champion for this deal. What characteristics should I look for, and how do I develop them into an advocate?' });
                  if (scores.metrics?.score < 50) s.push({ icon: '📊', label: 'What metrics should I quantify?', prompt: 'Help me identify the key business metrics and KPIs I should quantify to build a compelling business case for this deal.' });
                  if (scores.decisionProcess?.score < 50) s.push({ icon: '🗺️', label: 'Map out the likely decision process', prompt: 'Based on this deal context, what does the typical decision process look like? Who are the approvers, what are the stages, and what could stall it?' });
                  if (scores.identifyPain?.score < 50) s.push({ icon: '🎯', label: 'Sharpen the pain points', prompt: 'Help me articulate the customer pain points more sharply. What questions should I ask to uncover deeper pain?' });
                  if (s.length === 0) s.push({ icon: '🚀', label: 'What should my next move be?', prompt: 'Based on everything in my deal context, what should my next strategic move be to advance this deal?' });
                  return s.slice(0, 4);
                })()}
              />
            )}

            {activeTab === 'brief' && (
              <div className="h-full flex flex-col">
                {!briefContent && !isGenerating ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <FileText size={48} className="mb-4 text-green-200" />
                    <p className="text-lg font-extrabold text-slate-500 mb-2">{t(selectedLanguage, "briefNotGenerated")}</p>
                    <button 
                      onClick={handleGenerateBrief} 
                      disabled={isGenerating}
                      className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 shadow-lg flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                      <Sparkles size={16} /> {t(selectedLanguage, "generateBriefNow")}
                    </button>
                  </div>
                ) : isGenerating ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mb-4"></div>
                    <h3 className="text-base font-extrabold text-slate-900 mb-1">{t(selectedLanguage, "draftingDocument")}</h3>
                    <p className="text-slate-500 text-xs font-bold">{t(selectedLanguage, "draftingDesc")}</p>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="flex-grow overflow-y-auto p-6">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{briefContent}</ReactMarkdown>
                      </div>

                      {/* Email Composer Panel */}
                      {showEmailPanel && (
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
                      )}
                    </div>
                    <div className="shrink-0 p-3 bg-slate-50 border-t border-slate-200 flex justify-center">
                      <button 
                        onClick={handleGenerateBrief} 
                        disabled={isGenerating}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-4 rounded shadow-sm flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
                      >
                        <RefreshCw size={14} /> Regenerate Brief
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'visual' && (
              <div className="relative h-full flex flex-col">
                <div className="flex-grow relative overflow-hidden">
                  <ContextMap 
                    industries={selectedIndustry} 
                    processes={selectedProcess} 
                    values={selectedValue} 
                    capabilities={selectedCapability} 
                    adoptionRelated={adoptionRelated}
                    selectedLanguage={selectedLanguage}
                  />
                  <button 
                    onClick={() => setShowFullMap(true)} 
                    className="absolute top-4 right-4 bg-white border border-slate-300 p-2 rounded-lg shadow-sm hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <Maximize2 size={20} />
                  </button>
                </div>
                <div className="p-4 border-t border-slate-200 bg-slate-50/80 backdrop-blur-sm text-xs text-slate-600 shrink-0">
                  <div className="flex flex-wrap gap-4 md:gap-8">
                    <div className="flex-1 min-w-[200px]">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <Server size={12} className="text-orange-500"/> {t(selectedLanguage, "landscapeArchitecture")}
                      </h4>
                      <div className="space-y-0.5">
                        <p><span className="font-semibold">{t(selectedLanguage, "riseOppLabel")}</span> {isRise ? "Yes" : "No"}</p>
                        <p><span className="font-semibold">{t(selectedLanguage, "erpSystemLabel")}</span> {[erpSystem.s4 && "S/4HANA", erpSystem.ecc && "SAP ECC", erpSystem.nonSap && "Non-SAP ERP"].filter(Boolean).join(", ") || t(selectedLanguage, "notSpecified")}</p>
                        <p><span className="font-semibold">{t(selectedLanguage, "adoptionLabel")}</span> {Object.entries(adoptionRelated).filter(([_k, v]) => v).map(([k]) => k === 'signavio' ? 'Signavio' : k === 'leanix' ? 'LeanIX' : 'WalkMe').join(", ") || t(selectedLanguage, "none")}</p> {/* eslint-disable-line no-unused-vars */}
                      </div>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <FileText size={12} className="text-blue-500"/> {t(selectedLanguage, "additionalDetailsUpper")}
                      </h4>
                      <p className="italic text-slate-500 leading-relaxed line-clamp-3">
                        {additionalContext || t(selectedLanguage, "noAdditionalContext")}
                      </p>
                    </div>
                    {stakeholders.length > 0 && (
                      <div className="flex-1 min-w-[200px]">
                        <h4 className="font-bold text-slate-800 uppercase tracking-wide mb-1 flex items-center gap-1">
                          <Users size={12} className="text-purple-500"/> Key Stakeholders
                        </h4>
                        <div className="space-y-0.5">
                          {stakeholders.map(s => {
                            const accessIcon = s.access === 'direct' ? '●' : s.access === 'indirect' ? '◐' : '○';
                            return (
                              <p key={s.id}>
                                <span className="font-semibold">{s.name}</span>
                                {s.title && <span className="text-slate-500"> · {s.title}</span>}
                                <span className="text-slate-400"> — {s.role} {accessIcon}</span>
                                {s.budgetConfirmed && <span> 💰</span>}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dealScore' && (
              <MeddicHeatmap 
                state={{
                  selectedIndustry,
                  selectedProcess,
                  selectedValue,
                  selectedCapability,
                  additionalContext,
                  isRise,
                  erpSystem,
                  adoptionRelated,
                  stakeholders,
                  coachingContent,
                  briefContent
                }}
                selectedLanguage={selectedLanguage}
                attachments={attachments}
              />
            )}
          </div>

          {(coachingContent || briefContent) && (
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0 pb-safe">
              <div className="flex gap-2 items-center">
                {activeTab === 'coaching' && (
                  <>
                    {/* Primary actions */}
                    <button 
                      onClick={handleGenerateBrief} 
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded shadow-sm flex items-center gap-2 whitespace-nowrap"
                    >
                      <FileText size={14} /> {t(selectedLanguage, "actions", "draftBrief")}
                    </button>
                    <button 
                      onClick={handleDraftEmail} 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 rounded shadow-sm flex items-center gap-2 whitespace-nowrap"
                    >
                      <Mail size={14} /> {t(selectedLanguage, "actions", "email")}
                    </button>
                    <button 
                      onClick={handleObjections} 
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2 px-3 rounded shadow-sm flex items-center gap-2 whitespace-nowrap"
                    >
                      <ShieldAlert size={14} /> {t(selectedLanguage, "actions", "objections")}
                    </button>
                    <div className="w-px h-6 bg-slate-300 mx-1"></div>
                    {/* Secondary actions in overflow */}
                    <StrategicDropdown 
                      label="More"
                      actions={[
                        { label: t(selectedLanguage, "actions", "increaseValue"), icon: BarChart2, onClick: handleIncreaseValue },
                        { label: t(selectedLanguage, "actions", "competitor"), icon: Target, onClick: handleCompetitorIntel },
                        { label: t(selectedLanguage, "actions", "stakeholders"), icon: Users, onClick: handleStakeholderMap },
                        { label: t(selectedLanguage, "actions", "agenda"), icon: Calendar, onClick: () => setShowAgendaSettings(true) },
                        { label: 'Signavio BPMN', icon: Share2, onClick: handleSignavioBPMN },
                        { label: 'LeanIX Model', icon: Table, onClick: handleLeanIXModel },
                      ]}
                    />
                  </>
                )}
                {activeTab === 'brief' && (
                  <>
                    {/* Primary actions — brief-relevant only */}
                    <button 
                      onClick={handleGenerateBrief} 
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded shadow-sm flex items-center gap-2 whitespace-nowrap"
                    >
                      <FileText size={14} /> {t(selectedLanguage, "actions", "draftBrief")}
                    </button>
                    <button 
                      onClick={handleDraftEmail} 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 rounded shadow-sm flex items-center gap-2 whitespace-nowrap"
                    >
                      <Mail size={14} /> {t(selectedLanguage, "actions", "email")}
                    </button>
                    <button 
                      onClick={() => copyToClipboard(briefContent)} 
                      className="bg-white border border-slate-300 hover:border-slate-600 text-slate-700 text-xs font-bold py-2 px-3 rounded shadow-sm flex items-center gap-2 whitespace-nowrap"
                    >
                      <Copy size={14} /> {t(selectedLanguage, "actions", "copy")}
                    </button>
                    <div className="w-px h-6 bg-slate-300 mx-1"></div>
                    <StrategicDropdown 
                      label="More"
                      actions={[
                        { label: t(selectedLanguage, "actions", "agenda"), icon: Calendar, onClick: () => setShowAgendaSettings(true) },
                        { label: 'Signavio BPMN', icon: Share2, onClick: handleSignavioBPMN },
                        { label: 'LeanIX Model', icon: Table, onClick: handleLeanIXModel },
                      ]}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
