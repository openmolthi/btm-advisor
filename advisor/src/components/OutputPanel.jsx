import React from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles, FileText, Network, Target, BarChart2, RefreshCw, Copy,
  Mail, ShieldAlert, Calendar, Share2, Table, Users, Maximize2,
  Server, Pencil, Eye, X, MessageSquare
} from 'lucide-react';
import { t } from '../lib/i18n';
import { calculateMeddicScores } from '../lib/meddic';
import ChatInterface from './ChatInterface';
import ContextMap from './ContextMap';
import MeddicHeatmap from './MeddicHeatmap';
import StrategicDropdown from './StrategicDropdown';
import { ValuePanel } from './ValuePanel';
import { ObjectionPanel } from './ObjectionPanel';

export default function OutputPanel({
  // Refs
  outputSectionRef, emailPanelRef,
  // Tabs
  activeTab, setActiveTab,
  // Language
  selectedLanguage,
  // Generation state
  isGenerating, isChatTyping,
  // Content
  coachingContent, setCoachingContent,
  briefContent, setBriefContent,
  chatMessages,
  // Editing
  isEditingCoaching, setIsEditingCoaching,
  // Deal context (for MEDDIC)
  selectedIndustry, selectedProcess, selectedValue, selectedCapability,
  additionalContext, isRise, erpSystem, adoptionRelated, stakeholders,
  attachments,
  // Actions
  handleGiveIdeas, handleGenerateBrief, handleChat, handleDraftEmail,
  handleObjections, handleCompetitorIntel, handleIncreaseValue,
  handleStakeholderMap, handleSignavioBPMN, handleLeanIXModel,
  setShowAgendaSettings, setShowFullMap,
  copyToClipboard,
  // Value panel
  valuePanelRef, showValuePanel, setShowValuePanel,
  valueLoading, valueStrategies, applyValueStrategy,
  // Objection panel
  objectionPanelRef, showObjectionPanel, setShowObjectionPanel,
  objectionLoading, objectionCards, expandedObjection, setExpandedObjection,
  practiceObjection, setObjectionCards, 
  // Email panel
  showEmailPanel, setShowEmailPanel,
  emailCards, emailLoading, copiedEmail,
  copyEmailToClipboard, openInEmailClient, refineEmailInChat,
}) {
  const meddicState = { selectedIndustry, selectedProcess, selectedValue, selectedCapability, additionalContext, isRise, erpSystem, adoptionRelated, stakeholders, coachingContent, briefContent };

  return (
    <div ref={outputSectionRef} className="lg:col-span-8 lg:h-full h-[600px] flex flex-col bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
      {/* Tab Bar */}
      <div className="flex border-b-2 border-slate-200 bg-slate-50 shrink-0 overflow-x-auto">
        {[
          { key: 'coaching', icon: Sparkles, activeColor: 'text-blue-800 border-blue-700', bg: '' },
          { key: 'chat', icon: Target, activeColor: 'text-indigo-800 border-indigo-700', bg: '' },
          { key: 'brief', icon: FileText, activeColor: 'text-green-800 border-green-700', bg: '' },
          { key: 'visual', icon: Network, activeColor: 'text-orange-800 border-orange-700', bg: 'bg-orange-50' },
          { key: 'dealScore', icon: BarChart2, activeColor: 'text-purple-800 border-purple-700', bg: 'bg-orange-50' },
        ].map(({ key, icon: Icon, activeColor, bg }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
              key === 'brief' ? 'border-r border-slate-300 mr-2 pr-2' : key !== 'dealScore' ? 'border-r border-slate-200' : ''
            } ${activeTab === key
              ? `bg-white ${activeColor} border-b-4 shadow-sm`
              : `${bg || 'bg-slate-100'} text-slate-600 hover:bg-slate-200 border-b border-slate-300`
            }`}
          >
            <Icon size={16} /> {t(selectedLanguage, "tabs", key)}
          </button>
        ))}
      </div>

      <div className="flex-grow overflow-y-auto relative bg-white">
        {/* Coaching Tab */}
        {activeTab === 'coaching' && (
          <CoachingTab
            coachingContent={coachingContent}
            setCoachingContent={setCoachingContent}
            isGenerating={isGenerating}
            isEditingCoaching={isEditingCoaching}
            setIsEditingCoaching={setIsEditingCoaching}
            selectedLanguage={selectedLanguage}
            handleGiveIdeas={handleGiveIdeas}
            meddicState={meddicState}
            valuePanelRef={valuePanelRef}
            showValuePanel={showValuePanel}
            setShowValuePanel={setShowValuePanel}
            valueLoading={valueLoading}
            valueStrategies={valueStrategies}
            applyValueStrategy={applyValueStrategy}
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
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <ChatInterface
            messages={chatMessages}
            onSendMessage={handleChat}
            isTyping={isChatTyping}
            suggestions={buildChatSuggestions(meddicState)}
          />
        )}

        {/* Brief Tab */}
        {activeTab === 'brief' && (
          <BriefTab
            briefContent={briefContent}
            isGenerating={isGenerating}
            selectedLanguage={selectedLanguage}
            handleGenerateBrief={handleGenerateBrief}
            showEmailPanel={showEmailPanel}
            setShowEmailPanel={setShowEmailPanel}
            emailPanelRef={emailPanelRef}
            emailCards={emailCards}
            emailLoading={emailLoading}
            copiedEmail={copiedEmail}
            copyEmailToClipboard={copyEmailToClipboard}
            openInEmailClient={openInEmailClient}
            refineEmailInChat={refineEmailInChat}
          />
        )}

        {/* Visual Tab */}
        {activeTab === 'visual' && (
          <VisualTab
            selectedIndustry={selectedIndustry}
            selectedProcess={selectedProcess}
            selectedValue={selectedValue}
            selectedCapability={selectedCapability}
            adoptionRelated={adoptionRelated}
            selectedLanguage={selectedLanguage}
            isRise={isRise}
            erpSystem={erpSystem}
            additionalContext={additionalContext}
            stakeholders={stakeholders}
            setShowFullMap={setShowFullMap}
          />
        )}

        {/* Deal Score Tab */}
        {activeTab === 'dealScore' && (
          <MeddicHeatmap state={meddicState} selectedLanguage={selectedLanguage} attachments={attachments} />
        )}
      </div>

      {/* Bottom Action Bar */}
      {(coachingContent || briefContent) && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0 pb-safe">
          <div className="flex gap-2 items-center">
            {activeTab === 'coaching' && (
              <>
                <button onClick={handleGenerateBrief} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded shadow-sm flex items-center gap-2 whitespace-nowrap">
                  <FileText size={14} /> {t(selectedLanguage, "actions", "draftBrief")}
                </button>
                <button onClick={handleDraftEmail} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 rounded shadow-sm flex items-center gap-2 whitespace-nowrap">
                  <Mail size={14} /> {t(selectedLanguage, "actions", "email")}
                </button>
                <button onClick={handleObjections} className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2 px-3 rounded shadow-sm flex items-center gap-2 whitespace-nowrap">
                  <ShieldAlert size={14} /> {t(selectedLanguage, "actions", "objections")}
                </button>
                <div className="w-px h-6 bg-slate-300 mx-1"></div>
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
                <button onClick={handleGenerateBrief} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded shadow-sm flex items-center gap-2 whitespace-nowrap">
                  <FileText size={14} /> {t(selectedLanguage, "actions", "draftBrief")}
                </button>
                <button onClick={handleDraftEmail} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 rounded shadow-sm flex items-center gap-2 whitespace-nowrap">
                  <Mail size={14} /> {t(selectedLanguage, "actions", "email")}
                </button>
                <button onClick={() => copyToClipboard(briefContent)} className="bg-white border border-slate-300 hover:border-slate-600 text-slate-700 text-xs font-bold py-2 px-3 rounded shadow-sm flex items-center gap-2 whitespace-nowrap">
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
  );
}

// --- Sub-components ---

function CoachingTab({
  coachingContent, setCoachingContent, isGenerating, isEditingCoaching, setIsEditingCoaching,
  selectedLanguage, handleGiveIdeas, meddicState,
  valuePanelRef, showValuePanel, setShowValuePanel, valueLoading, valueStrategies, applyValueStrategy,
  objectionPanelRef, showObjectionPanel, setShowObjectionPanel, objectionLoading, objectionCards,
  expandedObjection, setExpandedObjection, practiceObjection, setBriefContent, setObjectionCards, handleObjections,
}) {
  if (!coachingContent && !isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8">
        <div className="max-w-2xl text-center">
          <Sparkles size={56} className="mb-4 text-indigo-300 mx-auto" />
          <h2 className="text-2xl font-extrabold text-slate-700 mb-3">{t(selectedLanguage, "emptyCoachingTitle")}</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">{t(selectedLanguage, "emptyCoachingDesc")}</p>
          <p className="text-xs text-slate-500 italic">{t(selectedLanguage, "configureInputsPrompt")}</p>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <h3 className="text-base font-extrabold text-slate-900 mb-1">{t(selectedLanguage, "coachThinking")}</h3>
        <p className="text-slate-500 text-xs font-bold">{t(selectedLanguage, "coachThinkingDesc")}</p>
      </div>
    );
  }

  const meddicScores = calculateMeddicScores(meddicState);
  const weakDimensions = Object.entries(meddicScores).filter(([, data]) => data.score < 50).map(([key, data]) => ({ key, ...data }));
  const strongDimensions = Object.entries(meddicScores).filter(([, data]) => data.score >= 50).map(([key]) => {
    const labels = { metrics: 'Metrics', economicBuyer: 'Economic Buyer', decisionCriteria: 'Decision Criteria', decisionProcess: 'Decision Process', identifyPain: 'Pain Points', champion: 'Champion' };
    return labels[key] || key;
  });
  const dimensionLabels = { metrics: 'Metrics', economicBuyer: 'Economic Buyer', decisionCriteria: 'Decision Criteria', decisionProcess: 'Decision Process', identifyPain: 'Pain Points', champion: 'Champion' };
  const suggestions = { metrics: 'Quantify the business value with specific ROI targets', economicBuyer: 'Identify who controls the budget for this initiative', decisionCriteria: 'Document the technical and business evaluation criteria', decisionProcess: 'Map out the approval timeline and key decision gates', identifyPain: 'Articulate the critical pain point driving this urgency', champion: 'Find an internal advocate to champion this solution' };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-6">
        <div className="flex justify-end mb-2">
          <button onClick={() => setIsEditingCoaching(!isEditingCoaching)} className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 px-2 py-1 rounded border border-slate-200 hover:border-slate-400 transition-colors" title={isEditingCoaching ? "Preview" : "Edit"}>
            {isEditingCoaching ? <><Eye size={12} /> Preview</> : <><Pencil size={12} /> Edit</>}
          </button>
        </div>
        {isEditingCoaching ? (
          <textarea value={coachingContent} onChange={(e) => setCoachingContent(e.target.value)} className="w-full h-[calc(100%-2rem)] min-h-[300px] p-4 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-white" placeholder="Edit coaching content (Markdown supported)..." />
        ) : (
          <div className="prose prose-sm max-w-none"><ReactMarkdown>{coachingContent}</ReactMarkdown></div>
        )}

        <ValuePanel valuePanelRef={valuePanelRef} showValuePanel={showValuePanel} setShowValuePanel={setShowValuePanel} valueLoading={valueLoading} valueStrategies={valueStrategies} applyValueStrategy={applyValueStrategy} />

        {weakDimensions.length > 0 && (
          <div className="mt-6 bg-indigo-50 border-l-4 border-indigo-500 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-indigo-900 mb-2">
                  Your coaching covers{' '}
                  {strongDimensions.length > 0 ? <span className="text-emerald-700">{strongDimensions.join(', ')}</span> : 'the basics'}. Consider exploring:
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
        )}

        <ObjectionPanel objectionPanelRef={objectionPanelRef} showObjectionPanel={showObjectionPanel} setShowObjectionPanel={setShowObjectionPanel} objectionLoading={objectionLoading} objectionCards={objectionCards} expandedObjection={expandedObjection} setExpandedObjection={setExpandedObjection} practiceObjection={practiceObjection} setBriefContent={setBriefContent} setObjectionCards={setObjectionCards} handleObjections={handleObjections} />
      </div>
      <div className="shrink-0 p-3 bg-slate-50 border-t border-slate-200 flex justify-center">
        <button onClick={handleGiveIdeas} disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded shadow-sm flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed">
          <RefreshCw size={14} /> Regenerate Ideas
        </button>
      </div>
    </div>
  );
}

function BriefTab({ briefContent, isGenerating, selectedLanguage, handleGenerateBrief, showEmailPanel, setShowEmailPanel, emailPanelRef, emailCards, emailLoading, copiedEmail, copyEmailToClipboard, openInEmailClient, refineEmailInChat }) {
  if (!briefContent && !isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <FileText size={48} className="mb-4 text-green-200" />
        <p className="text-lg font-extrabold text-slate-500 mb-2">{t(selectedLanguage, "briefNotGenerated")}</p>
        <button onClick={handleGenerateBrief} disabled={isGenerating} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 shadow-lg flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed">
          <Sparkles size={16} /> {t(selectedLanguage, "generateBriefNow")}
        </button>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <h3 className="text-base font-extrabold text-slate-900 mb-1">{t(selectedLanguage, "draftingDocument")}</h3>
        <p className="text-slate-500 text-xs font-bold">{t(selectedLanguage, "draftingDesc")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-6">
        <div className="prose prose-sm max-w-none"><ReactMarkdown>{briefContent}</ReactMarkdown></div>
        {showEmailPanel && (
          <div ref={emailPanelRef} className="mt-6 border-t-2 border-indigo-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-extrabold text-indigo-800 flex items-center gap-2"><Mail size={16} /> Email Starter Kit</h3>
              <button onClick={() => setShowEmailPanel(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
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
                          <button onClick={() => copyEmailToClipboard(card, key)} className={`w-full text-[10px] font-bold py-1.5 px-2 rounded ${btnPrimary} text-white transition-colors flex items-center justify-center gap-1`}>
                            <Copy size={10} /> {copiedEmail === key ? '✓ Copied!' : 'Copy to Clipboard'}
                          </button>
                          <button onClick={() => openInEmailClient(card)} className={`w-full text-[10px] font-bold py-1.5 px-2 rounded border ${btnSecondary} transition-colors flex items-center justify-center gap-1`}>
                            <Mail size={10} /> Open in Email Client
                          </button>
                          <button onClick={() => refineEmailInChat(card)} className="w-full text-[10px] font-bold py-1.5 px-2 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1">
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
        <button onClick={handleGenerateBrief} disabled={isGenerating} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-4 rounded shadow-sm flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed">
          <RefreshCw size={14} /> Regenerate Brief
        </button>
      </div>
    </div>
  );
}

function VisualTab({ selectedIndustry, selectedProcess, selectedValue, selectedCapability, adoptionRelated, selectedLanguage, isRise, erpSystem, additionalContext, stakeholders, setShowFullMap }) {
  return (
    <div className="relative h-full flex flex-col">
      <div className="flex-grow relative overflow-hidden">
        <ContextMap industries={selectedIndustry} processes={selectedProcess} values={selectedValue} capabilities={selectedCapability} adoptionRelated={adoptionRelated} selectedLanguage={selectedLanguage} />
        <button onClick={() => setShowFullMap(true)} className="absolute top-4 right-4 bg-white border border-slate-300 p-2 rounded-lg shadow-sm hover:bg-slate-100 text-slate-600 transition-colors">
          <Maximize2 size={20} />
        </button>
      </div>
      <div className="p-4 border-t border-slate-200 bg-slate-50/80 backdrop-blur-sm text-xs text-slate-600 shrink-0">
        <div className="flex flex-wrap gap-4 md:gap-8">
          <div className="flex-1 min-w-[200px]">
            <h4 className="font-bold text-slate-800 uppercase tracking-wide mb-1 flex items-center gap-1"><Server size={12} className="text-orange-500"/> {t(selectedLanguage, "landscapeArchitecture")}</h4>
            <div className="space-y-0.5">
              <p><span className="font-semibold">{t(selectedLanguage, "riseOppLabel")}</span> {isRise ? "Yes" : "No"}</p>
              <p><span className="font-semibold">{t(selectedLanguage, "erpSystemLabel")}</span> {[erpSystem.s4 && "S/4HANA", erpSystem.ecc && "SAP ECC", erpSystem.nonSap && "Non-SAP ERP"].filter(Boolean).join(", ") || t(selectedLanguage, "notSpecified")}</p>
              <p><span className="font-semibold">{t(selectedLanguage, "adoptionLabel")}</span> {Object.entries(adoptionRelated).filter(([, v]) => v).map(([k]) => k === 'signavio' ? 'Signavio' : k === 'leanix' ? 'LeanIX' : 'WalkMe').join(", ") || t(selectedLanguage, "none")}</p>
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <h4 className="font-bold text-slate-800 uppercase tracking-wide mb-1 flex items-center gap-1"><FileText size={12} className="text-blue-500"/> {t(selectedLanguage, "additionalDetailsUpper")}</h4>
            <p className="italic text-slate-500 leading-relaxed line-clamp-3">{additionalContext || t(selectedLanguage, "noAdditionalContext")}</p>
          </div>
          {stakeholders.length > 0 && (
            <div className="flex-1 min-w-[200px]">
              <h4 className="font-bold text-slate-800 uppercase tracking-wide mb-1 flex items-center gap-1"><Users size={12} className="text-purple-500"/> Key Stakeholders</h4>
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
  );
}

function buildChatSuggestions(meddicState) {
  const scores = calculateMeddicScores(meddicState);
  const s = [];
  if (scores.economicBuyer?.score < 50) s.push({ icon: '👔', label: 'Help me identify and approach the Economic Buyer', prompt: 'Based on my deal context, help me identify who the Economic Buyer likely is, how to get access, and what messaging would resonate with them.' });
  if (scores.champion?.score < 50) s.push({ icon: '🏆', label: 'How do I find and develop a Champion?', prompt: 'I need to find an internal champion for this deal. What characteristics should I look for, and how do I develop them into an advocate?' });
  if (scores.metrics?.score < 50) s.push({ icon: '📊', label: 'What metrics should I quantify?', prompt: 'Help me identify the key business metrics and KPIs I should quantify to build a compelling business case for this deal.' });
  if (scores.decisionProcess?.score < 50) s.push({ icon: '🗺️', label: 'Map out the likely decision process', prompt: 'Based on this deal context, what does the typical decision process look like? Who are the approvers, what are the stages, and what could stall it?' });
  if (scores.identifyPain?.score < 50) s.push({ icon: '🎯', label: 'Sharpen the pain points', prompt: 'Help me articulate the customer pain points more sharply. What questions should I ask to uncover deeper pain?' });
  if (s.length === 0) s.push({ icon: '🚀', label: 'What should my next move be?', prompt: 'Based on everything in my deal context, what should my next strategic move be to advance this deal?' });
  return s.slice(0, 4);
}
