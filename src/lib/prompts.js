/**
 * Prompt template functions for all AI generation handlers.
 * Each function accepts dynamic parameters and returns a prompt string.
 */

export function smartStartPrompt(input) {
  return `Research this company/context and suggest the best SAP deal positioning: "${input}"

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
}

export function giveIdeasPrompt(context, guardrails) {
  return `CONTEXT: ${context}\nTASK: Generate 3 high-impact coaching ideas for this deal. Use this exact markdown format for each:\n\n## 1. [Bold Headline]\n\n**Why it matters:** 1-2 sentences.\n\n**Talk track:** 2-3 sentences of what to actually say.\n\n---\n\n(repeat for ideas 2 and 3)\n\nUse --- between ideas. Use **bold** for key terms. Keep total under 400 words. No preamble before idea 1.\n${guardrails}`;
}

export function generateBriefPrompt(context, coachingContent, guardrails) {
  return `CONTEXT: ${context}\nCOACHING NOTES: ${coachingContent}\nTASK: Create a formal executive brief based on the above. Structure it professionally.\n${guardrails}`;
}

export function chatPrompt(context, chatHistory, message, guardrails) {
  return `CONTEXT: ${context}\nCHAT HISTORY: ${JSON.stringify(chatHistory)}\nUSER MESSAGE: ${message}\n${guardrails}`;
}

export function extractDebriefPrompt(debriefText) {
  return `Extract structured deal intelligence from these meeting notes/debrief:

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
}

export function emailPrompts(ctx) {
  return [
    { key: 'intro', prompt: `Context:\n${ctx}\n\nWrite a short cold outreach email (3-4 sentences max). Be curiosity-driven, not salesy. Return ONLY valid JSON, no markdown, no code fences:\n{"subject":"...","body":"...","tone":"Conversational"}` },
    { key: 'followup', prompt: `Context:\n${ctx}\n\nWrite a short meeting follow-up email (4-5 sentences). Reference the deal context, propose clear next steps. Return ONLY valid JSON, no markdown, no code fences:\n{"subject":"...","body":"...","tone":"Formal"}` },
    { key: 'valuehook', prompt: `Context:\n${ctx}\n\nWrite a short value-hook email (3-4 sentences) sharing a specific insight or proof point to re-engage a prospect. Return ONLY valid JSON, no markdown, no code fences:\n{"subject":"...","body":"...","tone":"Executive"}` },
  ];
}

export function objectionsPrompt(context, guardrails) {
  return `Context:\n${context}\n\nList exactly 4 likely customer objections for this deal. For each objection return ONLY valid JSON array format, no markdown, no code fences:
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
}

export function competitorPrompt(context, guardrails) {
  return `Context:\n${context}\n\nIdentify competitors (Direct & Status Quo).\n${guardrails}`;
}

export function valueStrategyPrompts(ctx, guardrails) {
  return [
    { key: 'deepen', prompt: `CONTEXT: ${ctx}\nTASK: Propose strategies to DEEPEN the deal value by expanding the SAME solutions already selected to more processes, departments, or geographies. Be specific about which areas to expand into and the incremental value. Keep it concise (3-5 bullet points max).\n${guardrails}` },
    { key: 'broaden', prompt: `CONTEXT: ${ctx}\nTASK: Propose strategies to BROADEN the deal. Broadening means expanding the footprint across THREE dimensions, all within SAP's Integrated Toolchain (Signavio, LeanIX, WalkMe, Cloud ALM, SAP Build, Business Transformation Center, Digital Discovery Assessment, Tricentis). Do NOT suggest solutions outside the Integrated Toolchain (no Concur, SuccessFactors, Ariba, etc.).\n\nDimensions to explore:\n1. **More Processes** — apply existing toolchain to additional business processes (e.g., from Order-to-Cash to Procure-to-Pay)\n2. **More Org Units / Countries** — roll out to additional subsidiaries, business units, or geographies\n3. **More Toolchain Components** — add complementary ITC products not yet selected\n\nIdentify 2-3 concrete broadening opportunities. Keep it concise (3-5 bullet points max).\n${guardrails}` },
    { key: 'phase', prompt: `CONTEXT: ${ctx}\nTASK: Propose a PHASED transformation roadmap that combines deepening current solutions AND broadening to new ones over 3 phases (Quick Wins 0-6mo, Scale 6-18mo, Transform 18-36mo). Keep each phase to 2-3 bullet points.\n${guardrails}` },
  ];
}

export function stakeholderMapPrompt(context, guardrails) {
  return `CONTEXT: ${context}\nTASK: Create a stakeholder map. Identify key personas (CIO, CFO, etc.), their likely concerns, and how to address them.\n${guardrails}`;
}

export function signavioBpmnPrompt(context, guardrails) {
  return `CONTEXT: ${context}\nTASK: Generate a realistic, industry-specific BPMN 2.0 process flow for the selected Process Domain. Use synthetic but plausible data that reflects the customer's industry (e.g., a retailer would have POS integration, inventory replenishment; a bank would have KYC checks, credit scoring). Include: Start Event → Tasks → Gateways → End Event, with lane/pool suggestions for relevant departments. Make it feel like a real customer's process, not a generic template.\n${guardrails}`;
}

export function leanixDataPrompt(context, guardrails) {
  return `
      Act as a LeanIX Data Architect. Based on the user context: ${context}, generate a comprehensive, industry-specific IT landscape in valid JSON format suitable for LeanIX Inventory import.

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
      ${guardrails}
    `;
}

export function leanixImagePrompt(data) {
  return `
      Create a high-quality, layered IT architecture diagram (Visual Meta Model) on a white background.
      Layer 1 (Top): Business Capabilities. Draw ${data.businessCapabilities.length} blue rectangular nodes labeled: ${data.businessCapabilities.map(b=>b.name).join(', ')}.
      Layer 2: Applications. Draw ${data.applications.length} green rectangular nodes labeled: ${data.applications.map(a=>a.name).join(', ')}. Connect these to the capabilities above.
      Layer 3: IT Components. Draw ${data.itComponents.length} orange nodes labeled: ${data.itComponents.map(i=>i.name).join(', ')}. Connect to apps above.
      Layer 4 (Bottom): Providers. Draw small grey boxes for: ${data.providers.join(', ')}.
      Style: Clean corporate vector art, distinct layers, legible text, directional lines showing support flow (bottom-up).
      `;
}

export function agendaPrompt(context, duration) {
  return `Context:\n${context}\n\nDesign ${duration} Workshop Agenda.`;
}
