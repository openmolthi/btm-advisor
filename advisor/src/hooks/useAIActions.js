import { generateGeminiResponse, generateImagenImage } from '../lib/api';
import { parseAIJson } from '../lib/parseAIJson';
import {
  smartStartPrompt, giveIdeasPrompt, generateBriefPrompt, chatPrompt,
  extractDebriefPrompt, emailPrompts, objectionsPrompt, competitorPrompt,
  valueStrategyPrompts, stakeholderMapPrompt, signavioBpmnPrompt,
  leanixDataPrompt, leanixImagePrompt, agendaPrompt
} from '../lib/prompts';

export function useAIActions({
  // State
  config, selectedLanguage, attachments,
  // Deal setters
  setSelectedIndustry, setSelectedProcess, setSelectedValue, setSelectedCapability,
  setAdditionalContext, setIsRise, setErpSystem, setStakeholders,
  // Output state & setters
  coachingContent, setCoachingContent, briefContent, setBriefContent,
  chatMessages, setChatMessages,
  // UI state & setters
  setActiveTab, setExpandedSection, setIsGenerating, setIsChatTyping,
  setIsExtractingDebrief,
  // Modal state
  setActiveModal, setIsModalLoading, setModalContent, setModalMedia,
  setShowAgendaSettings,
  // Email state
  setShowEmailPanel, showEmailPanel, setEmailCards, setEmailLoading, setCopiedEmail,
  // Objection state
  setShowObjectionPanel, showObjectionPanel, objectionCards, setObjectionCards, setObjectionLoading,
  // Value state
  setShowValuePanel, showValuePanel, setValueStrategies, setValueLoading,
  // Other
  addToast, scrollToOutput, getContextString, constructSystemInstruction,
  smartStartInput, setSmartStartInput, setSmartStartLoading,
  debriefText, setDebriefText,
  // Refs
  emailPanelRef, objectionPanelRef, valuePanelRef,
}) {

  const handleSmartStart = async () => {
    if (!smartStartInput.trim()) return;
    setSmartStartLoading(true);
    const prompt = smartStartPrompt(smartStartInput);
    const text = await generateGeminiResponse(prompt, constructSystemInstruction("SAP Industry Research Analyst"), []);
    const parsed = parseAIJson(text);
    if (parsed.ok) {
      const result = parsed.data;
      if (result.industries) setSelectedIndustry(result.industries);
      if (result.processes) setSelectedProcess(result.processes);
      if (result.valueDrivers) setSelectedValue(result.valueDrivers);
      if (result.capabilities) setSelectedCapability(result.capabilities);
      if (result.additionalContext) setAdditionalContext(result.additionalContext);
      if (result.isRise !== undefined) setIsRise(result.isRise);
      if (result.erpSystem) setErpSystem({ s4: result.erpSystem.s4 || false, ecc: result.erpSystem.ecc || false, nonSap: result.erpSystem.nonSap || false });
      setSmartStartInput('');
      addToast(`Smart Start: ${smartStartInput} — context loaded!`, "success");
    } else {
      addToast("Couldn't parse research results. Try again.", "error");
    }
    setSmartStartLoading(false);
  };

  const handleGiveIdeas = async () => {
    setIsGenerating(true); 
    setActiveTab('coaching'); 
    setCoachingContent(""); 
    setExpandedSection(prev => ({ ...prev, core: false, landscape: false, details: false }));
    scrollToOutput();
    const prompt = giveIdeasPrompt(getContextString(), config.aiGuardrails);
    const text = await generateGeminiResponse(prompt, constructSystemInstruction("Expert Solution Advisor Coach"), attachments);
    setCoachingContent(text); 
    setIsGenerating(false);
  };

  const handleGenerateBrief = async () => {
    setIsGenerating(true);
    setActiveTab('brief');
    setBriefContent("");
    const prompt = generateBriefPrompt(getContextString(), coachingContent, config.aiGuardrails);
    const text = await generateGeminiResponse(prompt, constructSystemInstruction("Executive Communications Expert"), attachments);
    setBriefContent(text);
    setIsGenerating(false);
  };

  const handleChat = async (message) => {
    setChatMessages(prev => [...prev, { role: 'user', text: message }]);
    setIsChatTyping(true);
    const prompt = chatPrompt(getContextString(), chatMessages.slice(-5), message, config.aiGuardrails);
    const text = await generateGeminiResponse(prompt, constructSystemInstruction("Helpful Coach"), attachments);
    setChatMessages(prev => [...prev, { role: 'model', text: text }]);
    setIsChatTyping(false);
  };

  const handleExtractDebrief = async () => {
    if (!debriefText.trim()) return;
    setIsExtractingDebrief(true);
    try {
      const prompt = extractDebriefPrompt(debriefText);
      const response = await generateGeminiResponse(prompt, "Extract deal intelligence. Return only valid JSON.", []);
      let cleanJson = response.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        if (data.stakeholders?.length) {
          setStakeholders(prev => {
            const existingNames = new Set(prev.map(s => s.name.toLowerCase()));
            const newOnes = data.stakeholders
              .filter(s => s.name && !existingNames.has(s.name.toLowerCase()))
              .map(s => ({ ...s, id: Date.now() + Math.random(), budgetConfirmed: false }));
            return [...prev, ...newOnes];
          });
        }
        const parts = [data.summary, data.metrics, data.pain, data.timeline, data.criteria].filter(Boolean);
        if (parts.length) {
          setAdditionalContext(prev => prev ? prev + '\n\n--- Debrief Insights ---\n' + parts.join('\n') : parts.join('\n'));
        }
        setDebriefText('');
        addToast('Insights extracted successfully', 'success');
      }
    } catch (err) {
      console.error('Debrief extraction error:', err);
      addToast('Failed to extract insights', 'error');
    } finally {
      setIsExtractingDebrief(false);
    }
  };

  const handleDraftEmail = () => {
    const willShow = !showEmailPanel;
    setShowEmailPanel(willShow);
    if (willShow) {
      setTimeout(() => emailPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      const ctx = getContextString();
      const sysInstr = constructSystemInstruction("Expert B2B Sales Copywriter");
      const variants = emailPrompts(ctx);
      variants.forEach(async ({ key, prompt }) => {
        setEmailLoading(prev => ({ ...prev, [key]: true }));
        const text = await generateGeminiResponse(prompt, sysInstr, attachments);
        const parsed = parseAIJson(text);
        if (parsed.ok) {
          setEmailCards(prev => ({ ...prev, [key]: parsed.data }));
        } else {
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

  const handleObjections = async () => {
    const willShow = !showObjectionPanel;
    setShowObjectionPanel(willShow);
    if (willShow) {
      setTimeout(() => objectionPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
    if (willShow && objectionCards.length === 0) {
      setObjectionLoading(true);
      const prompt = objectionsPrompt(getContextString(), config.aiGuardrails);
      const text = await generateGeminiResponse(prompt, constructSystemInstruction("Sales Objection Handler Expert"), attachments);
      const parsed = parseAIJson(text);
      if (parsed.ok) {
        setObjectionCards(parsed.data);
      } else {
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
    const text = await generateGeminiResponse(competitorPrompt(getContextString(), config.aiGuardrails), constructSystemInstruction("Competitive Intelligence Expert"), attachments); 
    setModalContent(text); 
    setIsModalLoading(false); 
  };

  const handleIncreaseValue = () => {
    const willShow = !showValuePanel;
    setShowValuePanel(willShow);
    if (willShow) {
      setTimeout(() => valuePanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      const ctx = getContextString();
      const sysInstr = constructSystemInstruction("Sales Strategist");
      const strategies = valueStrategyPrompts(ctx, config.aiGuardrails);
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
    const prompt = stakeholderMapPrompt(getContextString(), config.aiGuardrails);
    const text = await generateGeminiResponse(prompt, constructSystemInstruction("Change Management Expert"), attachments);
    setModalContent(text);
    setIsModalLoading(false);
  };

  const handleSignavioBPMN = async () => {
    setActiveModal('signavio');
    setIsModalLoading(true);
    setModalContent("");
    setModalMedia(null);
    const prompt = signavioBpmnPrompt(getContextString(), config.aiGuardrails);
    const text = await generateGeminiResponse(prompt, constructSystemInstruction("Process Architect"), attachments);
    setModalContent(text);
    setIsModalLoading(false);
  };

  const handleLeanIXModel = async () => {
    setActiveModal('leanix'); 
    setIsModalLoading(true); 
    setModalContent(""); 
    setModalMedia(null);
    
    const dataPrompt = leanixDataPrompt(getContextString(), config.aiGuardrails);
    
    try {
      const jsonStr = await generateGeminiResponse(dataPrompt, "Data Architect", attachments);
      let data = { businessCapabilities: [], techCategories: [], providers: [], applications: [], itComponents: [], interfaces: [], dataObjects: [] };
      
      const parsedJson = parseAIJson(jsonStr);
      if (parsedJson.ok) {
        data = parsedJson.data;
      } else {
        console.error("JSON Parse Error");
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
      
      const imagePrompt = leanixImagePrompt(data);
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
    const text = await generateGeminiResponse(agendaPrompt(getContextString(), duration), constructSystemInstruction("Expert Facilitator"), attachments); 
    setModalContent(text); 
    setIsModalLoading(false); 
  };

  return {
    handleSmartStart,
    handleGiveIdeas,
    handleGenerateBrief,
    handleChat,
    handleExtractDebrief,
    handleDraftEmail,
    copyEmailToClipboard,
    openInEmailClient,
    refineEmailInChat,
    handleObjections,
    practiceObjection,
    handleCompetitorIntel,
    handleIncreaseValue,
    applyValueStrategy,
    handleStakeholderMap,
    handleSignavioBPMN,
    handleLeanIXModel,
    generateAgenda,
  };
}
