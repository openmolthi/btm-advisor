/**
 * MEDDIC Deal Qualification Scoring Engine
 * Scores enterprise sales opportunities on 6 dimensions
 */

/**
 * Calculate MEDDIC scores based on app state
 * @param {Object} state - App state containing selections and content
 * @returns {Object} Scores for each MEDDIC dimension
 */
export const calculateMeddicScores = (state) => {
  const {
    selectedIndustry: _selectedIndustry = [],
    selectedProcess = [],
    selectedValue = [],
    selectedCapability = [],
    additionalContext = "",
    isRise = false,
    erpSystem = {},
    adoptionRelated: _adoptionRelated = {},
    stakeholders = [],
    coachingContent = "",
    briefContent = ""
  } = state;

  const context = additionalContext.toLowerCase();
  const allContent = `${coachingContent} ${briefContent}`.toLowerCase();

  // METRICS: Quantifiable business outcomes (0-100)
  const metricsScore = (() => {
    let score = 0;
    const signals = [];

    // Value Drivers selected (+30)
    if (selectedValue.length > 0) {
      const points = Math.min(30, selectedValue.length * 10);
      score += points;
      signals.push(`${selectedValue.length} value driver(s) selected (+${points})`);
    }

    // Specific numbers/percentages in additionalContext (+30)
    const numericMatches = context.match(/\d+%|\$\d+|€\d+|£\d+|\d+\s?(million|billion|k\b|m\b|fte|days|hours)/gi);
    if (numericMatches && numericMatches.length > 0) {
      const points = Math.min(30, numericMatches.length * 10);
      score += points;
      signals.push(`${numericMatches.length} quantifiable metric(s) found in context (+${points})`);
    }

    // Metrics mentioned in coaching/brief content (+40)
    const metricKeywords = ['roi', 'savings', 'reduction', 'increase', 'productivity', 'efficiency', 'kpi', 'revenue', 'cost', 'margin', 'growth'];
    const foundMetrics = metricKeywords.filter(kw => allContent.includes(kw));
    if (foundMetrics.length > 0) {
      const points = Math.min(40, foundMetrics.length * 8);
      score += points;
      signals.push(`Metrics discussed in generated content: ${foundMetrics.join(', ')} (+${points})`);
    }

    return { score: Math.min(100, score), signals };
  })();

  // ECONOMIC BUYER: Person with budget authority (0-100)
  const economicBuyerScore = (() => {
    let score = 0;
    const signals = [];
    const ebs = stakeholders.filter(s => s.role === 'Economic Buyer');

    if (ebs.length > 0) {
      const eb = ebs[0]; // Primary EB

      // Named (+30)
      score += 30;
      signals.push(`Economic Buyer identified: ${eb.name}${eb.title ? ' (' + eb.title + ')' : ''} (+30)`);

      // Title specified (+15)
      if (eb.title && eb.title.trim()) {
        score += 15;
        signals.push(`Role/title known: ${eb.title} (+15)`);
      }

      // Access level (+25 direct, +10 indirect)
      if (eb.access === 'direct') {
        score += 25;
        signals.push(`Direct access to EB (+25)`);
      } else if (eb.access === 'indirect') {
        score += 10;
        signals.push(`Indirect access to EB (+10)`);
      } else {
        signals.push(`No access to EB yet (0)`);
      }

      // Budget confirmed (+30)
      if (eb.budgetConfirmed) {
        score += 30;
        signals.push(`Budget confirmed (+30)`);
      }

      // Multiple EBs identified (bonus context)
      if (ebs.length > 1) {
        signals.push(`${ebs.length} economic buyers mapped`);
      }
    } else {
      // Fallback: keyword detection in additionalContext (+15 max)
      const buyerKeywords = ['ceo', 'cfo', 'cio', 'coo', 'cto', 'vp', 'vice president', 'director', 'budget', 'sponsor', 'executive', 'c-level', 'decision maker'];
      const foundBuyers = buyerKeywords.filter(kw => context.includes(kw));
      if (foundBuyers.length > 0) {
        const points = Math.min(15, foundBuyers.length * 5);
        score += points;
        signals.push(`Executive keywords in context: ${foundBuyers.join(', ')} (+${points})`);
      }
    }

    // Stakeholder analysis in generated content (+10 bonus)
    const stakeholderKeywords = ['stakeholder', 'decision maker', 'budget holder', 'approval', 'authority', 'buyer', 'sponsor', 'executive team'];
    const foundSH = stakeholderKeywords.filter(kw => allContent.includes(kw));
    if (foundSH.length > 0) {
      const points = Math.min(10, foundSH.length * 3);
      score += points;
      signals.push(`Stakeholder analysis in content (+${points})`);
    }

    return { score: Math.min(100, score), signals };
  })();

  // DECISION CRITERIA: Technical, business, and political criteria (0-100)
  const decisionCriteriaScore = (() => {
    let score = 0;
    const signals = [];

    // ERP system specified (+20)
    const erpSelected = Object.values(erpSystem).some(v => v);
    if (erpSelected) {
      score += 20;
      const systems = [];
      if (erpSystem.s4) systems.push('S/4HANA');
      if (erpSystem.ecc) systems.push('SAP ECC');
      if (erpSystem.nonSap) systems.push('Non-SAP ERP');
      signals.push(`ERP landscape defined: ${systems.join(', ')} (+20)`);
    }

    // Capabilities selected (+20)
    if (selectedCapability.length > 0) {
      score += 20;
      signals.push(`${selectedCapability.length} solution capability/capabilities defined (+20)`);
    }

    // RISE flagged (+20)
    if (isRise) {
      score += 20;
      signals.push('RISE opportunity identified (+20)');
    }

    // Criteria discussed in content (+40)
    const criteriaKeywords = ['criteria', 'requirements', 'must-have', 'evaluation', 'technical', 'compliance', 'security', 'integration', 'scalability', 'performance'];
    const foundCriteria = criteriaKeywords.filter(kw => allContent.includes(kw));
    if (foundCriteria.length > 0) {
      const points = Math.min(40, foundCriteria.length * 8);
      score += points;
      signals.push(`Decision criteria discussed in content (+${points})`);
    }

    return { score: Math.min(100, score), signals };
  })();

  // DECISION PROCESS: Steps, timeline, approval chain (0-100)
  const decisionProcessScore = (() => {
    let score = 0;
    const signals = [];

    // Timeline/deadline/phases mentioned in additionalContext (+40)
    const timelineKeywords = ['timeline', 'deadline', 'q1', 'q2', 'q3', 'q4', 'quarter', 'month', 'week', 'phase', 'milestone', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', '2024', '2025', '2026'];
    const foundTimeline = timelineKeywords.filter(kw => context.includes(kw));
    if (foundTimeline.length > 0) {
      const points = Math.min(40, foundTimeline.length * 10);
      score += points;
      signals.push(`Timeline indicators in context (+${points})`);
    }

    // Process steps in content (+30)
    const processKeywords = ['process', 'step', 'stage', 'workflow', 'approval', 'review', 'procurement', 'rfp', 'proposal', 'evaluation'];
    const foundProcess = processKeywords.filter(kw => allContent.includes(kw));
    if (foundProcess.length > 0) {
      const points = Math.min(30, foundProcess.length * 6);
      score += points;
      signals.push(`Process steps discussed in content (+${points})`);
    }

    // Approval chain mentioned (+30)
    const approvalKeywords = ['approval', 'sign-off', 'committee', 'board', 'governance', 'steering'];
    const foundApproval = approvalKeywords.filter(kw => allContent.includes(kw));
    if (foundApproval.length > 0) {
      const points = Math.min(30, foundApproval.length * 10);
      score += points;
      signals.push(`Approval chain discussed (+${points})`);
    }

    return { score: Math.min(100, score), signals };
  })();

  // IDENTIFY PAIN: Critical business pain driving the initiative (0-100)
  const identifyPainScore = (() => {
    let score = 0;
    const signals = [];

    // Process domains selected (+25)
    if (selectedProcess.length > 0) {
      const points = Math.min(25, selectedProcess.length * 12);
      score += points;
      signals.push(`${selectedProcess.length} process domain(s) identified (+${points})`);
    }

    // Pain-related keywords in additionalContext (+35)
    const painKeywords = ['pain', 'problem', 'challenge', 'issue', 'bottleneck', 'inefficiency', 'risk', 'concern', 'struggle', 'difficulty', 'urgent', 'critical'];
    const foundPain = painKeywords.filter(kw => context.includes(kw));
    if (foundPain.length > 0) {
      const points = Math.min(35, foundPain.length * 10);
      score += points;
      signals.push(`Pain indicators in context: ${foundPain.join(', ')} (+${points})`);
    }

    // Pain articulated in coaching/brief (+40)
    const painDiscussionKeywords = ['pain point', 'business impact', 'cost of inaction', 'consequence', 'implication', 'urgency', 'priority'];
    const foundPainDiscussion = painDiscussionKeywords.filter(kw => allContent.includes(kw));
    if (foundPainDiscussion.length > 0) {
      const points = Math.min(40, foundPainDiscussion.length * 13);
      score += points;
      signals.push(`Pain articulation in content (+${points})`);
    }

    return { score: Math.min(100, score), signals };
  })();

  // CHAMPION: Internal advocate who sells on your behalf (0-100)
  const championScore = (() => {
    let score = 0;
    const signals = [];
    const champions = stakeholders.filter(s => s.role === 'Champion');

    if (champions.length > 0) {
      const ch = champions[0];
      // Named champion (+40)
      score += 40;
      signals.push(`Champion identified: ${ch.name}${ch.title ? ' (' + ch.title + ')' : ''} (+40)`);

      // Direct access = strong champion (+25), indirect (+10)
      if (ch.access === 'direct') {
        score += 25;
        signals.push(`Champion has direct access to power (+25)`);
      } else if (ch.access === 'indirect') {
        score += 10;
        signals.push(`Champion has indirect access (+10)`);
      }

      // Multiple champions
      if (champions.length > 1) {
        score += 10;
        signals.push(`${champions.length} champions mapped (+10)`);
      }
    }

    // Named person in additionalContext (fallback, +20)
    if (champions.length === 0) {
      const namePattern = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g;
      const names = additionalContext.match(namePattern);
      if (names && names.length > 0) {
        score += 20;
        signals.push(`Named contact(s) in context (+20)`);
      }
    }

    // Other supportive stakeholders (Influencers) boost champion score
    const influencers = stakeholders.filter(s => s.role === 'Influencer');
    if (influencers.length > 0) {
      const points = Math.min(15, influencers.length * 5);
      score += points;
      signals.push(`${influencers.length} influencer(s) supporting (+${points})`);
    }

    // Blockers identified = awareness bonus (+5)
    const blockers = stakeholders.filter(s => s.role === 'Blocker');
    if (blockers.length > 0) {
      score += 5;
      signals.push(`${blockers.length} blocker(s) identified — risk awareness (+5)`);
    }

    // Champion characteristics discussed in content (+15)
    const championKeywords = ['champion', 'advocate', 'supporter', 'ally', 'sponsor', 'coach'];
    const foundChampion = championKeywords.filter(kw => allContent.includes(kw));
    if (foundChampion.length > 0) {
      const points = Math.min(15, foundChampion.length * 5);
      score += points;
      signals.push(`Champion traits in content (+${points})`);
    }

    return { score: Math.min(100, score), signals };
  })();

  return {
    metrics: metricsScore,
    economicBuyer: economicBuyerScore,
    decisionCriteria: decisionCriteriaScore,
    decisionProcess: decisionProcessScore,
    identifyPain: identifyPainScore,
    champion: championScore
  };
};

/**
 * Get color classification for score
 * @param {number} score - Score from 0-100
 * @returns {string} Color name
 */
export const getMeddicColor = (score) => {
  if (score <= 33) return 'exploring';
  if (score <= 66) return 'building';
  return 'confirmed';
};

/**
 * Get gaps and suggestions for dimensions scoring < 50
 * @param {Object} scores - MEDDIC scores object
 * @returns {Array} Array of {dimension, nextAction} objects
 */
export const getMeddicGaps = (scores) => {
  const gaps = [];

  const suggestions = {
    metrics: {
      dimension: 'Metrics',
      nextAction: 'Schedule a value quantification session to identify specific ROI, cost savings targets, and KPIs that will measure success.'
    },
    economicBuyer: {
      dimension: 'Economic Buyer',
      nextAction: 'Request an introduction to the executive with final budget authority (CFO, CEO, or VP-level sponsor).'
    },
    decisionCriteria: {
      dimension: 'Decision Criteria',
      nextAction: 'Document all technical, business, compliance, and security requirements in a formal criteria checklist.'
    },
    decisionProcess: {
      dimension: 'Decision Process',
      nextAction: 'Map out the full decision timeline, approval stages, and identify all stakeholders involved at each gate.'
    },
    identifyPain: {
      dimension: 'Identify Pain',
      nextAction: 'Conduct a discovery session to articulate the critical business pain, cost of inaction, and urgency drivers.'
    },
    champion: {
      dimension: 'Champion',
      nextAction: 'Identify and cultivate an internal advocate who has influence and will champion this solution within their organization.'
    }
  };

  Object.entries(scores).forEach(([key, value]) => {
    if (value.score < 50) {
      gaps.push({
        dimension: suggestions[key].dimension,
        score: value.score,
        nextAction: suggestions[key].nextAction
      });
    }
  });

  return gaps;
};
