import { useState, useRef } from 'react';
import React from 'react';

const DEFAULT_MILESTONES = [
  { label: 'Discovery', status: 'pending' },
  { label: 'Qualification', status: 'pending' },
  { label: 'Demo', status: 'pending' },
  { label: 'Proposal', status: 'pending' },
  { label: 'Negotiation', status: 'pending' },
  { label: 'Close', status: 'pending' },
];

export function useDealState(addToast) {
  // Input State
  const [selectedIndustry, setSelectedIndustry] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState([]);
  const [selectedValue, setSelectedValue] = useState([]);
  const [selectedCapability, setSelectedCapability] = useState([]);
  const [additionalContext, setAdditionalContext] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isRise, setIsRise] = useState(false);
  const [adoptionRelated, setAdoptionRelated] = useState({ signavio: false, leanix: false, walkme: false });
  const [erpSystem, setErpSystem] = useState({ s4: false, ecc: false, nonSap: false });
  const [otherSap, setOtherSap] = useState("");
  const [otherNonSap, setOtherNonSap] = useState("");
  const [stakeholders, setStakeholders] = useState([]);
  const [stakeholderDraft, setStakeholderDraft] = useState({ name: '', title: '', role: 'Economic Buyer', access: 'unknown', budgetConfirmed: false });
  const [debriefText, setDebriefText] = useState("");

  // Deal Timeline State
  const [dealTimeline, setDealTimeline] = useState(() => {
    const saved = localStorage.getItem('btm_deal_timeline');
    return saved ? JSON.parse(saved) : DEFAULT_MILESTONES;
  });

  React.useEffect(() => {
    localStorage.setItem('btm_deal_timeline', JSON.stringify(dealTimeline));
  }, [dealTimeline]);

  // Refs
  const fileInputRef = useRef(null);

  // Handlers
  const addStakeholder = () => {
    if (!stakeholderDraft.name.trim()) return;
    setStakeholders(prev => [...prev, { ...stakeholderDraft, id: Date.now() }]);
    setStakeholderDraft({ name: '', title: '', role: 'Economic Buyer', access: 'unknown', budgetConfirmed: false });
  };

  const removeStakeholder = (id) => setStakeholders(prev => prev.filter(s => s.id !== id));

  const cycleMilestone = (index) => {
    setDealTimeline(prev => prev.map((m, i) => {
      if (i !== index) return m;
      const next = m.status === 'pending' ? 'active' : m.status === 'active' ? 'done' : 'pending';
      return { ...m, status: next };
    }));
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

  const clearAll = (confirmFn, setCoachingContent, setBriefContent, setChatMessages, t, selectedLanguage) => { 
    confirmFn(t(selectedLanguage, "confirmReset"), t(selectedLanguage, "confirmResetMsg"), () => {
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

  const exportDeal = (coachingContent, briefContent, chatMessages) => {
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

  const importDeal = (setCoachingContent, setBriefContent, setChatMessages) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.pdf,.txt,.doc,.docx,.md';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      if (file.name.endsWith('.json')) {
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
        const reader = new FileReader();
        reader.onload = (ev) => {
          const base64 = ev.target.result;
          setAttachments(prev => [...prev, { name: file.name, type: file.type, data: base64 }]);
          setAdditionalContext(prev => prev ? prev + `\n\n[Imported file: ${file.name}]` : `[Imported file: ${file.name}]`);
          addToast(`PDF attached: ${file.name} — use "Give me ideas" to analyze`, "success");
        };
        reader.readAsDataURL(file);
      } else {
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

  return {
    // State
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
    dealTimeline, setDealTimeline,
    fileInputRef,
    // Handlers
    addStakeholder,
    removeStakeholder,
    cycleMilestone,
    handleFileSelect,
    removeAttachment,
    clearAll,
    exportDeal,
    importDeal,
  };
}
