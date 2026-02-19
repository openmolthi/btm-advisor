import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Briefcase, Settings, TrendingUp, Layers, Sparkles, Copy, RefreshCw, 
  ChevronDown, ChevronRight, FileText, Mail, ShieldAlert, Paperclip, 
  File as FileIcon, X, Network, Maximize2, BarChart2, Share2, Table, 
  CloudLightning, Server, Target, Calendar, Users, MessageSquare, Compass,
  Download, Upload, ClipboardCopy, Pencil, Eye
} from 'lucide-react';

// Library imports
import { t } from './lib/i18n';
import { generateGeminiResponse, generateImagenImage } from './lib/api';
import { calculateMeddicScores } from './lib/meddic';
import { glossary } from './lib/glossary';
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

  // Input State
  const [selectedIndustry, setSelectedIndustry] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState([]);
  const [selectedValue, setSelectedValue] = useState([]);
  const [selectedCapability, setSelectedCapability] = useState([]);

  // Context Compass summary shows automatically but details stay collapsed
  const [additionalContext, setAdditionalContext] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isRise, setIsRise] = useState(false);
  const [adoptionRelated, setAdoptionRelated] = useState({ signavio: false, leanix: false, walkme: false });
  const [erpSystem, setErpSystem] = useState({ s4: false, ecc: false, nonSap: false });
  const [otherSap, setOtherSap] = useState("");
  const [otherNonSap, setOtherNonSap] = useState("");
  const [stakeholders, setStakeholders] = useState([]);
  const [stakeholderDraft, setStakeholderDraft] = useState({ name: '', title: '', role: 'Economic Buyer', access: 'unknown', budgetConfirmed: false });
  const addStakeholder = () => {
    if (!stakeholderDraft.name.trim()) return;
    setStakeholders(prev => [...prev, { ...stakeholderDraft, id: Date.now() }]);
    setStakeholderDraft({ name: '', title: '', role: 'Economic Buyer', access: 'unknown', budgetConfirmed: false });
  };
  const removeStakeholder = (id) => setStakeholders(prev => prev.filter(s => s.id !== id));
  const [debriefText, setDebriefText] = useState("");
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

  // Deal Timeline State
  const DEFAULT_MILESTONES = [
    { label: 'Discovery', status: 'pending' },
    { label: 'Qualification', status: 'pending' },
    { label: 'Demo', status: 'pending' },
    { label: 'Proposal', status: 'pending' },
    { label: 'Negotiation', status: 'pending' },
    { label: 'Close', status: 'pending' },
  ];
  const [dealTimeline, setDealTimeline] = useState(() => {
    const saved = localStorage.getItem('btm_deal_timeline');
    return saved ? JSON.parse(saved) : DEFAULT_MILESTONES;
  });

  React.useEffect(() => {
    localStorage.setItem('btm_deal_timeline', JSON.stringify(dealTimeline));
  }, [dealTimeline]);

  const cycleMilestone = (index) => {
    setDealTimeline(prev => prev.map((m, i) => {
      if (i !== index) return m;
      const next = m.status === 'pending' ? 'active' : m.status === 'active' ? 'done' : 'pending';
      return { ...m, status: next };
    }));
  };

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
  const [activeModal, setActiveModal] = useState(null);
  const [modalContent, setModalContent] = useState("");
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalMedia, setModalMedia] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [smartStartInput, setSmartStartInput] = useState('');
  const [smartStartLoading, setSmartStartLoading] = useState(false);

  const handleSmartStart = async () => {
    if (!smartStartInput.trim()) return;
    setSmartStartLoading(true);
    const prompt = `Research this company/context and suggest the best SAP deal positioning: "${smartStartInput}"

Based on public knowledge about this company, return ONLY valid JSON (no markdown, no code fences):
{
  "industries": ["pick 1-2 from: Automotive, Banking, Chemicals, Consumer Products, Healthcare, High Tech, Industrial Manufacturing, Insurance, Life Sciences, Logistics, Media, Mining, Oil & Gas, Pharmaceuticals, Professional Services, Public Sector, Retail, Telecommunications, Transportation, Utilities"],
  "processes": ["pick 2-3 from: Acquire to Retire, Campaign to Lead, Claims to Resolution, Forecast to Fulfill, Hire to Retire, Idea to Market, Incident to Resolution, Lead to Cash, Meter to Cash, Order to Cash, Plan to Produce, Procure to Pay, Quote to Cash, Record to Report, Service to Cash"],
  "valueDrivers": ["pick 2-3 from: Reduce Days Sales Outstanding, Improve Net Working Capital, Reduce Total Logistics Cost, Reduce Finance Cost, Reduce Sales Cost, Reduce Manufacturing Cost, Reduce Asset Maintenance Cost, Reduce Unplanned Downtime, Reduce Waste Generation Cost, Reduce Service & Support Cost, Improve Procurement FTE Productivity, Reduce Uncollectible Accounts Receivable, Improve On-Time Delivery, Improve Customer Satisfaction, Increase Forecast Accuracy, Improve Compliance, Increase First-Time-Right, Reduce Cycle Time, Increase Automation Rate"],
  "capabilities": ["pick 2-3 from: SAP Signavio - all, SAP LeanIX - all, WalkMe - all, Process Modeling, Process Mining, Journey Modeling, Application Portfolio Mgmt, Tech Risk Mgmt, Digital Adoption, Guided Workflows"],
  "additionalContext": "2-3 sentences about this company's key challenges, digital transformation status, and relevant SAP opportunities",
  "isRise": true/false,
  "erpSystem": {"s4": true/false, "ecc": true/false, "nonSap": true/false}
}`;
    const text = await generateGeminiResponse(prompt, constructSystemInstruction("SAP Industry Research Analyst"), []);
    try {
      const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleaned);
      if (result.industries) setSelectedIndustry(result.industries);
      if (result.processes) setSelectedProcess(result.processes);
      if (result.valueDrivers) setSelectedValue(result.valueDrivers);
      if (result.capabilities) setSelectedCapability(result.capabilities);
      if (result.additionalContext) setAdditionalContext(result.additionalContext);
      if (result.isRise !== undefined) setIsRise(result.isRise);
      if (result.erpSystem) setErpSystem({ s4: result.erpSystem.s4 || false, ecc: result.erpSystem.ecc || false, nonSap: result.erpSystem.nonSap || false });
      setSmartStartInput('');
      addToast(`Smart Start: ${smartStartInput} — context loaded!`, "success");
    } catch {
      addToast("Couldn't parse research results. Try again.", "error");
    }
    setSmartStartLoading(false);
  };
  const [showAgendaSettings, setShowAgendaSettings] = useState(false);
  const [showFullMap, setShowFullMap] = useState(false);
  const [showValuePanel, setShowValuePanel] = useState(false);
  const [valueStrategies, setValueStrategies] = useState({ deepen: '', broaden: '', phase: '' });
  const [valueLoading, setValueLoading] = useState({ deepen: false, broaden: false, phase: false });
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  // Refs
  const fileInputRef = useRef(null);
  const outputSectionRef = useRef(null);
  const valuePanelRef = useRef(null);
  const objectionPanelRef = useRef(null);
  const emailPanelRef = useRef(null);

  // Helper Functions
  const triggerConfirm = (title, message, onConfirm) => 
    setConfirmConfig({ isOpen: true, title, message, onConfirm });

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

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => { 
        setAttachments(prev => [...prev, { name: file.name, type: file.type, data: event.target.result }]); 
        addToast(`Attached ${file.name}`, 'success');
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
  };

  const removeAttachment = (index) => { 
    setAttachments(prev => prev.filter((_, i) => i !== index)); 
  };

  const copyToClipboard = (text) => { 
    navigator.clipboard.writeText(text); 
    addToast(t(selectedLanguage, "actions", "copy"), "success"); 
  };

  const clearAll = () => { 
    triggerConfirm(t(selectedLanguage, "confirmReset"), t(selectedLanguage, "confirmResetMsg"), () => {
      setSelectedIndustry([]); 
      setSelectedProcess([]); 
      setSelectedValue([]); 
      setSelectedCapability([]); 
      setAdditionalContext(""); 
      setCoachingContent(""); 
      setBriefContent(""); 
      setChatMessages([]); 
      setAttachments([]); 
      setIsRise(false); 
      setErpSystem({ s4: false, ecc: false, nonSap: false }); 
      setOtherSap(""); 
      setOtherNonSap(""); 
      setAdoptionRelated({ signavio: false, leanix: false, walkme: false }); 
      setDealTimeline(DEFAULT_MILESTONES);
      localStorage.removeItem('btm_deal_timeline');
      localStorage.removeItem('btm_coaching_content');
      localStorage.removeItem('btm_brief_content');
      localStorage.removeItem('btm_chat_messages');
      addToast("All fields reset", "info");
    });
  };

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

  const exportDeal = () => {
    const deal = {
      version: 1,
      exportedAt: new Date().toISOString(),
      context: { selectedIndustry, selectedProcess, selectedValue, selectedCapability, additionalContext, isRise, erpSystem, otherSap, otherNonSap, adoptionRelated, stakeholders },
      content: { coachingContent, briefContent, chatMessages },
      dealTimeline,
    };
    const blob = new Blob([JSON.stringify(deal, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deal-${selectedIndustry[0] || 'untitled'}-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Deal exported!", "success");
  };

  const importDeal = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.pdf,.txt,.doc,.docx,.md';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      if (file.name.endsWith('.json')) {
        // Structured deal import
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const deal = JSON.parse(ev.target.result);
            if (deal.context) {
              setSelectedIndustry(deal.context.selectedIndustry || []);
              setSelectedProcess(deal.context.selectedProcess || []);
              setSelectedValue(deal.context.selectedValue || []);
              setSelectedCapability(deal.context.selectedCapability || []);
              setAdditionalContext(deal.context.additionalContext || '');
              setIsRise(deal.context.isRise || false);
              setErpSystem(deal.context.erpSystem || { s4: false, ecc: false, nonSap: false });
              setOtherSap(deal.context.otherSap || '');
              setOtherNonSap(deal.context.otherNonSap || '');
              setAdoptionRelated(deal.context.adoptionRelated || { signavio: false, leanix: false, walkme: false });
              setStakeholders(deal.context.stakeholders || []);
            }
            if (deal.content) {
              setCoachingContent(deal.content.coachingContent || '');
              setBriefContent(deal.content.briefContent || '');
              setChatMessages(deal.content.chatMessages || []);
            }
            if (deal.dealTimeline) {
              setDealTimeline(deal.dealTimeline);
            }
            addToast(`Deal imported: ${deal.context?.selectedIndustry?.[0] || 'untitled'}`, "success");
          } catch {
            addToast("Failed to parse JSON file", "error");
          }
        };
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        // PDF — read as base64 and add as attachment + context
        const reader = new FileReader();
        reader.onload = (ev) => {
          const base64 = ev.target.result;
          setAttachments(prev => [...prev, { name: file.name, type: file.type, data: base64 }]);
          setAdditionalContext(prev => prev ? prev + `\n\n[Imported file: ${file.name}]` : `[Imported file: ${file.name}]`);
          addToast(`PDF attached: ${file.name} — use "Give me ideas" to analyze`, "success");
        };
        reader.readAsDataURL(file);
      } else {
        // Text/markdown/other — read as text and add to additional context
        const reader = new FileReader();
        reader.onload = (ev) => {
          const text = ev.target.result;
          const truncated = text.length > 5000 ? text.substring(0, 5000) + '\n\n[...truncated]' : text;
          setAdditionalContext(prev => prev ? prev + '\n\n--- Imported: ' + file.name + ' ---\n' + truncated : '--- Imported: ' + file.name + ' ---\n' + truncated);
          addToast(`Content imported from ${file.name}`, "success");
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

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

  // Main Action Handlers
  const handleGiveIdeas = async () => {
    setIsGenerating(true); 
    setActiveTab('coaching'); 
    setCoachingContent(""); 
    setExpandedSection(prev => ({ ...prev, core: false, landscape: false, details: false }));
    scrollToOutput();
    const prompt = `CONTEXT: ${getContextString()}\nTASK: Generate 3 high-impact coaching ideas for this deal. Use this exact markdown format for each:\n\n## 1. [Bold Headline]\n\n**Why it matters:** 1-2 sentences.\n\n**Talk track:** 2-3 sentences of what to actually say.\n\n---\n\n(repeat for ideas 2 and 3)\n\nUse --- between ideas. Use **bold** for key terms. Keep total under 400 words. No preamble before idea 1.\n${config.aiGuardrails}`;
    const text = await generateGeminiResponse(prompt, constructSystemInstruction("Expert Solution Advisor Coach"), attachments);
    setCoachingContent(text); 
    setIsGenerating(false);
  };

  const handleGenerateBrief = async () => {
    setIsGenerating(true);
    setActiveTab('brief');
    setBriefContent("");
    const prompt = `CONTEXT: ${getContextString()}\nCOACHING NOTES: ${coachingContent}\nTASK: Create a formal executive brief based on the above. Structure it professionally.\n${config.aiGuardrails}`;
    const text = await generateGeminiResponse(prompt, constructSystemInstruction("Executive Communications Expert"), attachments);
    setBriefContent(text);
    setIsGenerating(false);
  };

  // Fixed chat handler - removed duplicate user message
  const handleChat = async (message) => {
    setChatMessages(prev => [...prev, { role: 'user', text: message }]);
    setIsChatTyping(true);
    const prompt = `CONTEXT: ${getContextString()}\nCHAT HISTORY: ${JSON.stringify(chatMessages.slice(-5))}\nUSER MESSAGE: ${message}\n${config.aiGuardrails}`;
    const text = await generateGeminiResponse(prompt, constructSystemInstruction("Helpful Coach"), attachments);
    setChatMessages(prev => [...prev, { role: 'model', text: text }]);
    setIsChatTyping(false);
  };

  // Debrief extraction handler
  const handleExtractDebrief = async () => {
    if (!debriefText.trim()) return;
    setIsExtractingDebrief(true);
    try {
      const prompt = `Extract structured deal intelligence from these meeting notes/debrief:

"${debriefText}"

Return ONLY valid JSON:
{
  "stakeholders": [{"name": "...", "title": "...", "role": "Economic Buyer|Champion|Decision Maker|Influencer|Blocker", "access": "direct|indirect|none"}],
  "metrics": "quantifiable outcomes or KPIs mentioned (or empty string)",
  "pain": "business pain points mentioned (or empty string)", 
  "timeline": "timeline, deadlines, phases mentioned (or empty string)",
  "criteria": "decision criteria, requirements mentioned (or empty string)",
  "summary": "2-3 sentence summary of key takeaways"
}
Only include stakeholders explicitly mentioned by name. If no names found, return empty array.`;

      const response = await generateGeminiResponse(prompt, "Extract deal intelligence. Return only valid JSON.", []);
      let cleanJson = response.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        // Merge stakeholders (avoid duplicates by name)
        if (data.stakeholders?.length) {
          setStakeholders(prev => {
            const existingNames = new Set(prev.map(s => s.name.toLowerCase()));
            const newOnes = data.stakeholders
              .filter(s => s.name && !existingNames.has(s.name.toLowerCase()))
              .map(s => ({ ...s, id: Date.now() + Math.random(), budgetConfirmed: false }));
            return [...prev, ...newOnes];
          });
        }
        // Append insights to additional context
        const parts = [data.summary, data.metrics, data.pain, data.timeline, data.criteria].filter(Boolean);
        if (parts.length) {
          setAdditionalContext(prev => prev ? prev + '\n\n--- Debrief Insights ---\n' + parts.join('\n') : parts.join('\n'));
        }
        setDebriefText(''); // Clear after extraction
        addToast('Insights extracted successfully', 'success');
      }
    } catch (err) {
      console.error('Debrief extraction error:', err);
      addToast('Failed to extract insights', 'error');
    } finally {
      setIsExtractingDebrief(false);
    }
  };

  // Modal Action Handlers
    const [showEmailPanel, setShowEmailPanel] = useState(false);
  const [emailCards, setEmailCards] = useState({ intro: null, followup: null, valuehook: null });
  const [emailLoading, setEmailLoading] = useState({ intro: false, followup: false, valuehook: false });
  const [copiedEmail, setCopiedEmail] = useState(null);

  const handleDraftEmail = () => {
    const willShow = !showEmailPanel;
    setShowEmailPanel(willShow);
    if (willShow) {
      setTimeout(() => emailPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      const ctx = getContextString();
      const sysInstr = constructSystemInstruction("Expert B2B Sales Copywriter");
      const variants = [
        { key: 'intro', prompt: `Context:\n${ctx}\n\nWrite a short cold outreach email (3-4 sentences max). Be curiosity-driven, not salesy. Return ONLY valid JSON, no markdown, no code fences:\n{"subject":"...","body":"...","tone":"Conversational"}` },
        { key: 'followup', prompt: `Context:\n${ctx}\n\nWrite a short meeting follow-up email (4-5 sentences). Reference the deal context, propose clear next steps. Return ONLY valid JSON, no markdown, no code fences:\n{"subject":"...","body":"...","tone":"Formal"}` },
        { key: 'valuehook', prompt: `Context:\n${ctx}\n\nWrite a short value-hook email (3-4 sentences) sharing a specific insight or proof point to re-engage a prospect. Return ONLY valid JSON, no markdown, no code fences:\n{"subject":"...","body":"...","tone":"Executive"}` },
      ];
      variants.forEach(async ({ key, prompt }) => {
        setEmailLoading(prev => ({ ...prev, [key]: true }));
        const text = await generateGeminiResponse(prompt, sysInstr, attachments);
        try {
          const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
          setEmailCards(prev => ({ ...prev, [key]: JSON.parse(cleaned) }));
        } catch {
          setEmailCards(prev => ({ ...prev, [key]: { subject: 'Email draft', body: text, tone: 'N/A' } }));
        }
        setEmailLoading(prev => ({ ...prev, [key]: false }));
      });
    }
  };

  const copyEmailToClipboard = (card, key) => {
    const text = `Subject: ${card.subject}\n\n${card.body}`;
    navigator.clipboard.writeText(text);
    setCopiedEmail(key);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const openInEmailClient = (card) => {
    const mailto = `mailto:?subject=${encodeURIComponent(card.subject)}&body=${encodeURIComponent(card.body)}`;
    window.open(mailto, '_blank');
  };

  const refineEmailInChat = (card) => {
    setActiveTab('chat');
    setShowEmailPanel(false);
    setTimeout(() => handleChat(`Help me refine this email draft. Here's what I have:\n\nSubject: ${card.subject}\n\n${card.body}\n\nMake it more personalized and compelling. Keep it short.`), 100);
  };

  const [showObjectionPanel, setShowObjectionPanel] = useState(false);
  const [isEditingCoaching, setIsEditingCoaching] = useState(false);
  const [objectionCards, setObjectionCards] = useState([]);
  const [objectionLoading, setObjectionLoading] = useState(false);
  const [expandedObjection, setExpandedObjection] = useState(null);

  const handleObjections = async () => {
    const willShow = !showObjectionPanel;
    setShowObjectionPanel(willShow);
    if (willShow) {
      setTimeout(() => objectionPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
    if (willShow && objectionCards.length === 0) {
      setObjectionLoading(true);
      const prompt = `Context:\n${getContextString()}\n\nList exactly 4 likely customer objections for this deal. For each objection return ONLY valid JSON array format, no markdown, no code fences:
[
  {
    "objection": "short objection headline",
    "severity": "high|medium|low",
    "why": "why the customer says this (1 sentence)",
    "realMeaning": "what they really mean (1 sentence)", 
    "rebuttal": "your recommended response (2-3 sentences)",
    "proofPoint": "specific reference, case study, or data point (1 sentence)"
  }
]
Return ONLY the JSON array, nothing else.`;
      const text = await generateGeminiResponse(prompt, constructSystemInstruction("Sales Objection Handler Expert"), attachments);
      try {
        const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        setObjectionCards(parsed);
      } catch {
        setObjectionCards([{ objection: "Could not parse objections", severity: "low", why: text, realMeaning: "", rebuttal: "", proofPoint: "" }]);
      }
      setObjectionLoading(false);
    }
  };

  const practiceObjection = (card) => {
    setActiveTab('chat');
    setShowObjectionPanel(false);
    setTimeout(() => handleChat(`I want to practice handling this objection: "${card.objection}". Play the role of a skeptical customer and challenge me with this objection. After I respond, score my rebuttal and suggest improvements.`), 100);
  };

  const handleCompetitorIntel = async () => { 
    setActiveModal('competitor'); 
    setIsModalLoading(true); 
    setModalContent(""); 
    setModalMedia(null); 
    const text = await generateGeminiResponse(`Context:\n${getContextString()}\n\nIdentify competitors (Direct & Status Quo).\n${config.aiGuardrails}`, constructSystemInstruction("Competitive Intelligence Expert"), attachments); 
    setModalContent(text); 
    setIsModalLoading(false); 
  };

  const handleIncreaseValue = () => {
    const willShow = !showValuePanel;
    setShowValuePanel(willShow);
    if (willShow) {
      setTimeout(() => valuePanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      // Auto-generate all 3 strategies
      const ctx = getContextString();
      const sysInstr = constructSystemInstruction("Sales Strategist");
      
      const strategies = [
        { key: 'deepen', prompt: `CONTEXT: ${ctx}\nTASK: Propose strategies to DEEPEN the deal value by expanding the SAME solutions already selected to more processes, departments, or geographies. Be specific about which areas to expand into and the incremental value. Keep it concise (3-5 bullet points max).\n${config.aiGuardrails}` },
        { key: 'broaden', prompt: `CONTEXT: ${ctx}\nTASK: Propose strategies to BROADEN the deal by leveraging additional capabilities within SAP's Integrated Toolchain ONLY. Limit suggestions to: SAP Signavio, SAP LeanIX, WalkMe, SAP Cloud ALM, SAP Build, SAP Business Transformation Center, Digital Discovery Assessment, and SAP Test Automation (Tricentis). Do NOT suggest solutions outside the Integrated Toolchain (e.g., no Concur, SuccessFactors, Ariba, etc.). Identify 2-3 complementary toolchain components not yet selected that strengthen the end-to-end transformation story. Keep it concise (3-5 bullet points max).\n${config.aiGuardrails}` },
        { key: 'phase', prompt: `CONTEXT: ${ctx}\nTASK: Propose a PHASED transformation roadmap that combines deepening current solutions AND broadening to new ones over 3 phases (Quick Wins 0-6mo, Scale 6-18mo, Transform 18-36mo). Keep each phase to 2-3 bullet points.\n${config.aiGuardrails}` },
      ];
      
      strategies.forEach(async ({ key, prompt }) => {
        setValueLoading(prev => ({ ...prev, [key]: true }));
        const text = await generateGeminiResponse(prompt, sysInstr, attachments);
        setValueStrategies(prev => ({ ...prev, [key]: text }));
        setValueLoading(prev => ({ ...prev, [key]: false }));
      });
    }
  };

  const applyValueStrategy = (strategyText, target) => {
    if (target === 'coaching') {
      setCoachingContent(prev => prev + '\n\n---\n**Value Expansion Strategy:**\n' + strategyText);
    } else {
      setBriefContent(prev => prev + '\n\n---\n**Value Expansion Strategy:**\n' + strategyText);
    }
    setShowValuePanel(false);
  };

  const handleStakeholderMap = async () => {
    setActiveModal('stakeholders');
    setIsModalLoading(true);
    setModalContent("");
    setModalMedia(null);
    const prompt = `CONTEXT: ${getContextString()}\nTASK: Create a stakeholder map. Identify key personas (CIO, CFO, etc.), their likely concerns, and how to address them.\n${config.aiGuardrails}`;
    const text = await generateGeminiResponse(prompt, constructSystemInstruction("Change Management Expert"), attachments);
    setModalContent(text);
    setIsModalLoading(false);
  };

  const handleSignavioBPMN = async () => {
    setActiveModal('signavio');
    setIsModalLoading(true);
    setModalContent("");
    setModalMedia(null);
    const prompt = `CONTEXT: ${getContextString()}\nTASK: Generate a realistic, industry-specific BPMN 2.0 process flow for the selected Process Domain. Use synthetic but plausible data that reflects the customer's industry (e.g., a retailer would have POS integration, inventory replenishment; a bank would have KYC checks, credit scoring). Include: Start Event → Tasks → Gateways → End Event, with lane/pool suggestions for relevant departments. Make it feel like a real customer's process, not a generic template.\n${config.aiGuardrails}`;
    const text = await generateGeminiResponse(prompt, constructSystemInstruction("Process Architect"), attachments);
    setModalContent(text);
    setIsModalLoading(false);
  };

  const handleLeanIXModel = async () => {
    setActiveModal('leanix'); 
    setIsModalLoading(true); 
    setModalContent(""); 
    setModalMedia(null);
    
    const dataPrompt = `
      Act as a LeanIX Data Architect. Based on the user context: ${getContextString()}, generate a comprehensive, industry-specific IT landscape in valid JSON format suitable for LeanIX Inventory import.

      Required JSON Structure (LDIF-compatible):
      {
        "businessCapabilities": [ { "name": "...", "description": "..." } ],
        "techCategories": [ { "name": "...", "description": "..." } ],
        "providers": [ "Provider Name 1", "Provider Name 2" ],
        "applications": [ { "name": "...", "description": "...", "applicationCategory": "...", "linkedCapability": "..." } ],
        "itComponents": [ { "name": "...", "description": "...", "linkedApplication": "...", "provider": "...", "techCategory": "..." } ],
        "interfaces": [ { "name": "...", "description": "...", "providerApp": "...", "consumerApp": "...", "dataObjects": ["..."] } ],
        "dataObjects": [ { "name": "...", "description": "..." } ]
      }

      Guidelines:
      1. **Industry-Specific Realism**: Generate capabilities, applications, and components that are plausible for the customer's industry. Examples: Retail → POS Systems, Merchandise Planning, Supply Chain Visibility; Banking → Mortgage Origination, Credit Risk Engine, Core Banking; Manufacturing → MES, Quality Management, Shop Floor Integration.
      2. **Relationships**: Link Apps to Capabilities, IT Components to Apps/Providers/Tech Categories, Interfaces to Provider/Consumer Apps and Data Objects.
      3. **Providers**: Use a realistic mix of vendors the customer's industry would actually have (SAP, Microsoft, Salesforce, industry-specific vendors, cloud providers).
      4. **Format**: Return ONLY raw JSON.
      ${config.aiGuardrails}
    `;
    
    try {
      const jsonStr = await generateGeminiResponse(dataPrompt, "Data Architect", attachments);
      let data = { businessCapabilities: [], techCategories: [], providers: [], applications: [], itComponents: [], interfaces: [], dataObjects: [] };
      
      try { 
        const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        data = JSON.parse(cleanJson); 
      } catch(e) {
        console.error("JSON Parse Error", e);
        data = { businessCapabilities: [{name: "Core Business"}], applications: [{name: "ERP System", linkedCapability: "Core Business"}], itComponents: [], providers: [], interfaces: [], dataObjects: [], techCategories: [] };
      }

      const toId = (type, name) => (type + "_" + name.toLowerCase().replace(/[^a-z0-9]/g, "_")).substring(0, 60);
      const patches = [];
      
      data.businessCapabilities?.forEach(bc => {
        patches.push({ type: "BusinessCapability", externalId: toId("bc", bc.name), data: { name: bc.name, description: bc.description || "" }, relations: {} });
      });

      data.providers?.forEach(p => {
        patches.push({ type: "Provider", externalId: toId("prov", p), data: { name: p }, relations: {} });
      });

      data.techCategories?.forEach(tc => {
        patches.push({ type: "TechCategory", externalId: toId("tc", tc.name), data: { name: tc.name, description: tc.description || "" }, relations: {} });
      });

      data.dataObjects?.forEach(doj => {
        patches.push({ type: "DataObject", externalId: toId("do", doj.name), data: { name: doj.name, description: doj.description || "" }, relations: {} });
      });

      data.applications?.forEach(app => {
        const rels = {};
        if (app.linkedCapability) rels.businessCapabilities = [{ externalId: toId("bc", app.linkedCapability) }];
        patches.push({ type: "Application", externalId: toId("app", app.name), data: { name: app.name, description: app.description || "", applicationCategory: app.applicationCategory || "Business Application" }, relations: rels });
      });

      data.itComponents?.forEach(it => {
        const rels = {};
        if (it.linkedApplication) rels.application = { externalId: toId("app", it.linkedApplication) };
        if (it.provider) rels.provider = { externalId: toId("prov", it.provider) };
        if (it.techCategory) rels.techCategory = { externalId: toId("tc", it.techCategory) };
        patches.push({ type: "ITComponent", externalId: toId("it", it.name), data: { name: it.name, description: it.description || "" }, relations: rels });
      });

      data.interfaces?.forEach(iface => {
        const rels = {};
        if (iface.providerApp) rels.provider = { externalId: toId("app", iface.providerApp) };
        if (iface.consumerApp) rels.consumer = { externalId: toId("app", iface.consumerApp) };
        if (iface.dataObjects) rels.dataObjects = iface.dataObjects.map(d => ({ externalId: toId("do", d) }));
        patches.push({ type: "Interface", externalId: toId("iface", iface.name), data: { name: iface.name, description: iface.description || "" }, relations: rels });
      });

      const ldifContent = JSON.stringify({ patches }, null, 2);
      
      const imagePrompt = `
      Create a high-quality, layered IT architecture diagram (Visual Meta Model) on a white background.
      Layer 1 (Top): Business Capabilities. Draw ${data.businessCapabilities.length} blue rectangular nodes labeled: ${data.businessCapabilities.map(b=>b.name).join(', ')}.
      Layer 2: Applications. Draw ${data.applications.length} green rectangular nodes labeled: ${data.applications.map(a=>a.name).join(', ')}. Connect these to the capabilities above.
      Layer 3: IT Components. Draw ${data.itComponents.length} orange nodes labeled: ${data.itComponents.map(i=>i.name).join(', ')}. Connect to apps above.
      Layer 4 (Bottom): Providers. Draw small grey boxes for: ${data.providers.join(', ')}.
      Style: Clean corporate vector art, distinct layers, legible text, directional lines showing support flow (bottom-up).
      `;
      
      const imageUrl = await generateImagenImage(imagePrompt);
      
      setModalContent("Generated comprehensive LeanIX inventory with " + patches.length + " factsheets."); 
      setModalMedia({ imageUrl, isDiagram: true, importData: ldifContent });
    } catch(_e) { // eslint-disable-line no-unused-vars
      setModalContent("Error generating model."); 
    } finally { 
      setIsModalLoading(false); 
    }
  };

  const generateAgenda = async (duration) => { 
    setShowAgendaSettings(false); 
    setActiveModal('agenda'); 
    setIsModalLoading(true); 
    setModalContent(""); 
    setModalMedia(null); 
    const text = await generateGeminiResponse(`Context:\n${getContextString()}\n\nDesign ${duration} Workshop Agenda.`, constructSystemInstruction("Expert Facilitator"), attachments); 
    setModalContent(text); 
    setIsModalLoading(false); 
  };

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
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Users size={12} /> Key Stakeholders
                    </h4>
                    {/* Existing stakeholders as chips */}
                    {stakeholders.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {stakeholders.map(s => {
                          const roleColors = {
                            'Economic Buyer': 'bg-purple-100 border-purple-300 text-purple-800',
                            'Champion': 'bg-green-100 border-green-300 text-green-800',
                            'Influencer': 'bg-blue-100 border-blue-300 text-blue-800',
                            'Blocker': 'bg-red-100 border-red-300 text-red-800',
                            'Decision Maker': 'bg-amber-100 border-amber-300 text-amber-800',
                          };
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
                    {/* Add stakeholder row */}
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
                      {showValuePanel && (
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
                              { key: 'broaden', icon: '↔️', title: 'Broaden', subtitle: 'Expand within Integrated Toolchain',
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
                      )}

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
                      {showObjectionPanel && (
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
                      )}

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
