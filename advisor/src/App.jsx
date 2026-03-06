import React, { useState, useRef } from 'react';
import { Settings } from 'lucide-react';

// Hooks
import { useDealState } from './hooks/useDealState';
import { useAIActions } from './hooks/useAIActions';
import { useModals } from './hooks/useModals';

// Lib
import { t } from './lib/i18n';
import { calculateMeddicScores } from './lib/meddic';
import {
  DEFAULT_VALUE_METHODOLOGY,
  DEFAULT_MARKETING_VOICE,
  DEFAULT_GUARDRAILS,
  DEFAULT_INDUSTRIES,
  DEFAULT_PROCESS_DOMAINS,
  DEFAULT_VALUE_DRIVERS,
  DEFAULT_SOLUTION_CAPABILITIES,
} from './lib/constants';

// Components
import ToastContainer from './components/ToastContainer';
import Modal, { ConfirmModal, AdminModal, VisualMapModal, AgendaSettingsModal } from './components/Modal';
import HelpPanel from './components/HelpPanel';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';

export default function App() {
  // --- Config ---
  const [config, setConfig] = useState({
    industries: DEFAULT_INDUSTRIES,
    processDomains: DEFAULT_PROCESS_DOMAINS,
    valueDrivers: DEFAULT_VALUE_DRIVERS,
    solutionCapabilities: DEFAULT_SOLUTION_CAPABILITIES,
    valueMethodology: DEFAULT_VALUE_METHODOLOGY,
    marketingVoice: DEFAULT_MARKETING_VOICE,
    aiGuardrails: DEFAULT_GUARDRAILS,
  });

  // --- Toast ---
  const [toasts, setToasts] = useState([]);
  const addToast = (msg, type) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message: msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // --- UI State ---
  const [activeTab, setActiveTab] = useState('visual');
  const [selectedLanguage, setSelectedLanguage] = useState("English (EN)");
  const [expandedSection, setExpandedSection] = useState({ core: true, compass: false, compassDetails: false, landscape: false, details: true });
  const toggleSection = (key) => setExpandedSection(prev => ({ ...prev, [key]: !prev[key] }));

  // --- Deal State ---
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

  // --- Output State ---
  const [coachingContent, setCoachingContent] = useState(() => localStorage.getItem('btm_coaching_content') || "");
  const [briefContent, setBriefContent] = useState(() => localStorage.getItem('btm_brief_content') || "");
  const [chatMessages, setChatMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('btm_chat_messages')) || []; } catch { return []; }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChatTyping, setIsChatTyping] = useState(false);

  React.useEffect(() => { localStorage.setItem('btm_coaching_content', coachingContent); }, [coachingContent]);
  React.useEffect(() => { localStorage.setItem('btm_brief_content', briefContent); }, [briefContent]);
  React.useEffect(() => { localStorage.setItem('btm_chat_messages', JSON.stringify(chatMessages)); }, [chatMessages]);

  // --- Modal State ---
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
  const [showValuePanel, setShowValuePanel] = useState(false);
  const [valueStrategies, setValueStrategies] = useState({ deepen: '', broaden: '', phase: '' });
  const [valueLoading, setValueLoading] = useState({ deepen: false, broaden: false, phase: false });
  const [showEmailPanel, setShowEmailPanel] = useState(false);
  const [emailCards, setEmailCards] = useState({ intro: null, followup: null, valuehook: null });
  const [emailLoading, setEmailLoading] = useState({ intro: false, followup: false, valuehook: false });
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [showObjectionPanel, setShowObjectionPanel] = useState(false);
  const [isEditingCoaching, setIsEditingCoaching] = useState(false);
  const [objectionCards, setObjectionCards] = useState([]);
  const [objectionLoading, setObjectionLoading] = useState(false);
  const [expandedObjection, setExpandedObjection] = useState(null);

  // --- Refs ---
  const outputSectionRef = useRef(null);
  const valuePanelRef = useRef(null);
  const objectionPanelRef = useRef(null);
  const emailPanelRef = useRef(null);

  // --- Helpers ---
  const saveConfigWrapper = (newConfig) => { setConfig(newConfig); localStorage.setItem("btm_advisor_config", JSON.stringify(newConfig)); };
  const getContextString = () => `Industry: ${selectedIndustry.join(', ')}. Process: ${selectedProcess.join(', ')}. Value: ${selectedValue.join(', ')}. ${additionalContext}`;
  const scrollToOutput = () => { if (window.innerWidth < 1024 && outputSectionRef.current) outputSectionRef.current.scrollIntoView({ behavior: 'smooth' }); };
  const constructSystemInstruction = (roleInstruction) => `${config.valueMethodology}\n\n${config.marketingVoice}\n\nROLE: ${roleInstruction}\n\nIMPORTANT: Respond in ${selectedLanguage}.`;
  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); addToast(t(selectedLanguage, "actions", "copy"), "success"); };

  const clearAll = () => deal.clearAll(triggerConfirm, setCoachingContent, setBriefContent, setChatMessages, t, selectedLanguage);
  const clearHistory = () => {
    triggerConfirm(t(selectedLanguage, "clearHistory"), "Clear all coaching content, briefs, and chat history?", () => {
      setCoachingContent(""); setBriefContent(""); setChatMessages([]);
      localStorage.removeItem('btm_coaching_content'); localStorage.removeItem('btm_brief_content'); localStorage.removeItem('btm_chat_messages');
      addToast(t(selectedLanguage, "clearHistory") + " complete", "info");
    });
  };
  const exportDeal = () => deal.exportDeal(coachingContent, briefContent, chatMessages);
  const importDeal = () => deal.importDeal(setCoachingContent, setBriefContent, setChatMessages);

  const copyFullDeal = () => {
    const meddicScores = calculateMeddicScores({ selectedIndustry, selectedProcess, selectedValue, selectedCapability, additionalContext, isRise, erpSystem, adoptionRelated, stakeholders, coachingContent, briefContent });
    const lines = [
      '=== SAP BTM AIDE-visor — Full Deal Summary ===', '',
      '— CONTEXT —', `Industry: ${selectedIndustry.join(', ') || 'Not set'}`, `Process: ${selectedProcess.join(', ') || 'Not set'}`,
      `Value Drivers: ${selectedValue.join(', ') || 'Not set'}`, `Capabilities: ${selectedCapability.join(', ') || 'Not set'}`,
      `RISE: ${isRise ? 'Yes' : 'No'}`, `ERP: ${[erpSystem.s4 && 'S/4HANA', erpSystem.ecc && 'SAP ECC', erpSystem.nonSap && 'Non-SAP'].filter(Boolean).join(', ') || 'Not set'}`,
      '', '— ADDITIONAL CONTEXT —', additionalContext || '(none)',
    ];
    if (stakeholders.length > 0) { lines.push('', '— STAKEHOLDERS —'); stakeholders.forEach(s => lines.push(`• ${s.name}${s.title ? ` (${s.title})` : ''} — ${s.role} [${s.access}]${s.budgetConfirmed ? ' 💰' : ''}`)); }
    if (coachingContent) lines.push('', '— COACHING CONTENT —', coachingContent);
    if (briefContent) lines.push('', '— BRIEF CONTENT —', briefContent);
    lines.push('', '— MEDDIC SCORES —');
    const labels = { metrics: 'Metrics', economicBuyer: 'Economic Buyer', decisionCriteria: 'Decision Criteria', decisionProcess: 'Decision Process', identifyPain: 'Pain Points', champion: 'Champion' };
    Object.entries(meddicScores).forEach(([key, data]) => lines.push(`${labels[key] || key}: ${data.score}/100`));
    navigator.clipboard.writeText(lines.join('\n'));
    addToast('Full deal copied to clipboard!', 'success');
  };

  // --- AI Actions ---
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

  // --- Render ---
  return (
    <div className="min-h-screen bg-slate-200 text-slate-900 font-sans p-3 md:p-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmModal isOpen={confirmConfig.isOpen} onClose={() => setConfirmConfig({...confirmConfig, isOpen: false})} title={confirmConfig.title} message={confirmConfig.message} onConfirm={confirmConfig.onConfirm} />
      <HelpPanel showHelp={showHelp} setShowHelp={setShowHelp} expandedHelp={expandedHelp} setExpandedHelp={setExpandedHelp} />
      <AdminModal isOpen={showAdmin} onClose={() => setShowAdmin(false)} config={config} onSave={saveConfigWrapper} addToast={addToast} selectedLanguage={selectedLanguage} />
      <Modal isOpen={!!activeModal} onClose={() => setActiveModal(null)} title={activeModal ? t(selectedLanguage, "actions", activeModal) : ""} content={modalContent} isLoading={isModalLoading} media={modalMedia} icon={Settings} />
      <VisualMapModal isOpen={showFullMap} onClose={() => setShowFullMap(false)} industries={selectedIndustry} processes={selectedProcess} values={selectedValue} capabilities={selectedCapability} adoptionRelated={adoptionRelated} />
      <AgendaSettingsModal isOpen={showAgendaSettings} onClose={() => setShowAgendaSettings(false)} onGenerate={generateAgenda} />

      <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[93vh] h-auto">
        <InputPanel
          selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage}
          config={config}
          expandedSection={expandedSection} toggleSection={toggleSection}
          selectedIndustry={selectedIndustry} setSelectedIndustry={setSelectedIndustry}
          selectedProcess={selectedProcess} setSelectedProcess={setSelectedProcess}
          selectedValue={selectedValue} setSelectedValue={setSelectedValue}
          selectedCapability={selectedCapability} setSelectedCapability={setSelectedCapability}
          additionalContext={additionalContext} setAdditionalContext={setAdditionalContext}
          attachments={attachments} isRise={isRise} setIsRise={setIsRise}
          adoptionRelated={adoptionRelated} setAdoptionRelated={setAdoptionRelated}
          erpSystem={erpSystem} setErpSystem={setErpSystem}
          otherSap={otherSap} setOtherSap={setOtherSap}
          otherNonSap={otherNonSap} setOtherNonSap={setOtherNonSap}
          stakeholders={stakeholders} stakeholderDraft={stakeholderDraft} setStakeholderDraft={setStakeholderDraft}
          addStakeholder={addStakeholder} removeStakeholder={removeStakeholder}
          debriefText={debriefText} setDebriefText={setDebriefText}
          fileInputRef={fileInputRef} handleFileSelect={handleFileSelect} removeAttachment={removeAttachment}
          handleSmartStart={handleSmartStart} smartStartInput={smartStartInput} setSmartStartInput={setSmartStartInput} smartStartLoading={smartStartLoading}
          handleGiveIdeas={handleGiveIdeas} isGenerating={isGenerating}
          handleExtractDebrief={handleExtractDebrief} isExtractingDebrief={isExtractingDebrief}
          setShowHelp={setShowHelp} setShowAdmin={setShowAdmin}
          exportDeal={exportDeal} importDeal={importDeal} copyFullDeal={copyFullDeal}
          clearHistory={clearHistory} clearAll={clearAll} setActiveTab={setActiveTab}
          coachingContent={coachingContent} briefContent={briefContent} chatMessages={chatMessages}
        />
        <OutputPanel
          outputSectionRef={outputSectionRef} emailPanelRef={emailPanelRef}
          activeTab={activeTab} setActiveTab={setActiveTab}
          selectedLanguage={selectedLanguage}
          isGenerating={isGenerating} isChatTyping={isChatTyping}
          coachingContent={coachingContent} setCoachingContent={setCoachingContent}
          briefContent={briefContent} setBriefContent={setBriefContent}
          chatMessages={chatMessages}
          isEditingCoaching={isEditingCoaching} setIsEditingCoaching={setIsEditingCoaching}
          selectedIndustry={selectedIndustry} selectedProcess={selectedProcess}
          selectedValue={selectedValue} selectedCapability={selectedCapability}
          additionalContext={additionalContext} isRise={isRise} erpSystem={erpSystem}
          adoptionRelated={adoptionRelated} stakeholders={stakeholders} attachments={attachments}
          handleGiveIdeas={handleGiveIdeas} handleGenerateBrief={handleGenerateBrief}
          handleChat={handleChat} handleDraftEmail={handleDraftEmail}
          handleObjections={handleObjections} handleCompetitorIntel={handleCompetitorIntel}
          handleIncreaseValue={handleIncreaseValue} handleStakeholderMap={handleStakeholderMap}
          handleSignavioBPMN={handleSignavioBPMN} handleLeanIXModel={handleLeanIXModel}
          setShowAgendaSettings={setShowAgendaSettings} setShowFullMap={setShowFullMap}
          copyToClipboard={copyToClipboard}
          valuePanelRef={valuePanelRef} showValuePanel={showValuePanel} setShowValuePanel={setShowValuePanel}
          valueLoading={valueLoading} valueStrategies={valueStrategies} applyValueStrategy={applyValueStrategy}
          objectionPanelRef={objectionPanelRef} showObjectionPanel={showObjectionPanel} setShowObjectionPanel={setShowObjectionPanel}
          objectionLoading={objectionLoading} objectionCards={objectionCards}
          expandedObjection={expandedObjection} setExpandedObjection={setExpandedObjection}
          practiceObjection={practiceObjection} setObjectionCards={setObjectionCards}
          showEmailPanel={showEmailPanel} setShowEmailPanel={setShowEmailPanel}
          emailCards={emailCards} emailLoading={emailLoading} copiedEmail={copiedEmail}
          copyEmailToClipboard={copyEmailToClipboard} openInEmailClient={openInEmailClient} refineEmailInChat={refineEmailInChat}
        />
      </div>
    </div>
  );
}
