import React, { useState } from 'react';
import { 
  Activity, Target, BarChart2, Users, Shield, Award, 
  ChevronDown, ChevronRight, Sparkles, AlertCircle, CheckCircle2, AlertTriangle, ArrowRight
} from 'lucide-react';
import { t } from '../lib/i18n';
import { calculateMeddicScores, getMeddicColor, getMeddicGaps } from '../lib/meddic';
import { generateGeminiResponse } from '../lib/api';

const MeddicHeatmap = ({ state, selectedLanguage, attachments = [] }) => {
  const [expandedDimension, setExpandedDimension] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiScores, setAiScores] = useState(null);
  const [aiError, setAiError] = useState(null);

  // Calculate rule-based scores
  const ruleBasedScores = calculateMeddicScores(state);
  const gaps = getMeddicGaps(ruleBasedScores);

  // Dimension metadata
  const dimensions = [
    { 
      key: 'metrics', 
      icon: BarChart2, 
      name: t(selectedLanguage, 'meddic', 'metrics'),
      description: t(selectedLanguage, 'meddic', 'metricsDesc')
    },
    { 
      key: 'economicBuyer', 
      icon: Users, 
      name: t(selectedLanguage, 'meddic', 'economicBuyer'),
      description: t(selectedLanguage, 'meddic', 'economicBuyerDesc')
    },
    { 
      key: 'decisionCriteria', 
      icon: Shield, 
      name: t(selectedLanguage, 'meddic', 'decisionCriteria'),
      description: t(selectedLanguage, 'meddic', 'decisionCriteriaDesc')
    },
    { 
      key: 'decisionProcess', 
      icon: Target, 
      name: t(selectedLanguage, 'meddic', 'decisionProcess'),
      description: t(selectedLanguage, 'meddic', 'decisionProcessDesc')
    },
    { 
      key: 'identifyPain', 
      icon: AlertCircle, 
      name: t(selectedLanguage, 'meddic', 'identifyPain'),
      description: t(selectedLanguage, 'meddic', 'identifyPainDesc')
    },
    { 
      key: 'champion', 
      icon: Award, 
      name: t(selectedLanguage, 'meddic', 'champion'),
      description: t(selectedLanguage, 'meddic', 'championDesc')
    }
  ];

  const getColorClasses = (score) => {
    const color = getMeddicColor(score);
    if (color === 'exploring') return {
      bg: 'bg-slate-100',
      border: 'border-slate-300',
      text: 'text-slate-600',
      bar: 'bg-slate-400',
      icon: 'text-slate-500'
    };
    if (color === 'building') return {
      bg: 'bg-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-700',
      bar: 'bg-blue-500',
      icon: 'text-blue-600'
    };
    return {
      bg: 'bg-emerald-100',
      border: 'border-emerald-300',
      text: 'text-emerald-700',
      bar: 'bg-emerald-500',
      icon: 'text-emerald-600'
    };
  };

  const getScoreLabel = (score) => {
    if (score <= 33) return 'Exploring';
    if (score <= 66) return 'Building';
    return 'Confirmed';
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiError(null);

    const contextSummary = `
Industry: ${state.selectedIndustry?.join(', ') || 'Not specified'}
Process Domains: ${state.selectedProcess?.join(', ') || 'Not specified'}
Value Drivers: ${state.selectedValue?.join(', ') || 'Not specified'}
Solution Capabilities: ${state.selectedCapability?.join(', ') || 'Not specified'}
RISE Opportunity: ${state.isRise ? 'Yes' : 'No'}
ERP System: ${[state.erpSystem?.s4 && 'S/4HANA', state.erpSystem?.ecc && 'SAP ECC', state.erpSystem?.nonSap && 'Non-SAP'].filter(Boolean).join(', ') || 'Not specified'}

Additional Context:
${state.additionalContext || 'None provided'}

Generated Coaching Content:
${state.coachingContent ? state.coachingContent.substring(0, 1500) : 'None'}

Generated Brief Content:
${state.briefContent ? state.briefContent.substring(0, 1500) : 'None'}
`;

    const prompt = `Analyze this sales opportunity using the MEDDIC framework.

CONTEXT:
${contextSummary}

TASK:
For each MEDDIC dimension, provide:
1. A score from 0-100
2. Evidence that supports this score
3. What's missing or unclear
4. One specific question to ask the customer to strengthen this dimension

DIMENSIONS:
- Metrics: Quantifiable business outcomes (ROI, KPIs, savings targets)
- Economic Buyer: Person with budget authority
- Decision Criteria: Technical, business, and political criteria
- Decision Process: Steps, timeline, approval chain
- Identify Pain: Critical business pain driving the initiative
- Champion: Internal advocate who sells on your behalf

Return ONLY valid JSON in this exact format:
{
  "metrics": {"score": 0-100, "evidence": "...", "missing": "...", "question": "..."},
  "economicBuyer": {"score": 0-100, "evidence": "...", "missing": "...", "question": "..."},
  "decisionCriteria": {"score": 0-100, "evidence": "...", "missing": "...", "question": "..."},
  "decisionProcess": {"score": 0-100, "evidence": "...", "missing": "...", "question": "..."},
  "identifyPain": {"score": 0-100, "evidence": "...", "missing": "...", "question": "..."},
  "champion": {"score": 0-100, "evidence": "...", "missing": "...", "question": "..."}
}`;

    try {
      const response = await generateGeminiResponse(
        prompt,
        "You are an expert enterprise sales strategist specializing in MEDDIC qualification. Provide detailed, actionable insights.",
        attachments
      );

      // Clean and parse JSON
      let cleanJson = response.trim();
      // Remove markdown code blocks if present
      cleanJson = cleanJson.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      // Find JSON object
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setAiScores(parsed);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (error) {
      console.error('AI Analysis Error:', error);
      setAiError(t(selectedLanguage, 'meddic', 'aiAnalysisError'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleDimension = (key) => {
    setExpandedDimension(expandedDimension === key ? null : key);
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                <Activity className="text-blue-600" size={28} />
                {t(selectedLanguage, 'meddic', 'title')}
              </h2>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                {t(selectedLanguage, 'meddic', 'subtitle')}
              </p>
            </div>
            <button
              onClick={handleAIAnalysis}
              disabled={isAnalyzing}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all ${
                isAnalyzing
                  ? 'bg-slate-400 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white hover:shadow-lg'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t(selectedLanguage, 'meddic', 'analyzing')}
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  {t(selectedLanguage, 'meddic', 'analyzeAI')}
                </>
              )}
            </button>
          </div>

          {aiError && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
              <span className="text-sm text-red-800 font-medium">{aiError}</span>
            </div>
          )}
        </div>

        {/* Dimension Cards */}
        <div className="space-y-3">
          {dimensions.map((dim) => {
            const ruleScore = ruleBasedScores[dim.key];
            const aiScore = aiScores?.[dim.key];
            const colors = getColorClasses(ruleScore.score);
            const isExpanded = expandedDimension === dim.key;
            const Icon = dim.icon;

            return (
              <div
                key={dim.key}
                className={`bg-white border-2 rounded-lg shadow-sm transition-all ${
                  isExpanded ? colors.border + ' shadow-md' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Card Header - Always Visible */}
                <button
                  onClick={() => toggleDimension(dim.key)}
                  className="w-full p-4 flex items-center gap-4 text-left"
                >
                  {/* Icon */}
                  <div className={`p-3 rounded-lg ${colors.bg}`}>
                    <Icon className={colors.icon} size={24} />
                  </div>

                  {/* Dimension Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-extrabold text-slate-900">{dim.name}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                        {getScoreLabel(ruleScore.score)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{dim.description}</p>
                  </div>

                  {/* Score Display */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm text-slate-500 font-bold mb-1">
                        {t(selectedLanguage, 'meddic', 'ruleBasedScore')}
                      </div>
                      <div className={`text-3xl font-extrabold ${colors.text}`}>
                        {ruleScore.score}
                      </div>
                    </div>

                    {aiScore && (
                      <div className="text-right border-l-2 border-slate-200 pl-4">
                        <div className="text-sm text-purple-600 font-bold mb-1">
                          {t(selectedLanguage, 'meddic', 'aiAssessment')}
                        </div>
                        <div className="text-3xl font-extrabold text-purple-700">
                          {aiScore.score}
                        </div>
                      </div>
                    )}

                    <div className="ml-2">
                      {isExpanded ? (
                        <ChevronDown className="text-slate-400" size={20} />
                      ) : (
                        <ChevronRight className="text-slate-400" size={20} />
                      )}
                    </div>
                  </div>
                </button>

                {/* Progress Bar */}
                <div className="px-4 pb-3">
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors.bar} transition-all duration-500`}
                      style={{ width: `${ruleScore.score}%` }}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t-2 border-slate-100 p-4 bg-slate-50 animate-in slide-in-from-top-2 fade-in duration-200">
                    {/* Rule-Based Signals */}
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <CheckCircle2 size={14} className="text-blue-600" />
                        {t(selectedLanguage, 'meddic', 'signals')}
                      </h4>
                      {ruleScore.signals.length > 0 ? (
                        <ul className="space-y-1">
                          {ruleScore.signals.map((signal, idx) => (
                            <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span className="font-medium">{signal}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-500 italic">
                          {t(selectedLanguage, 'meddic', 'noSignals')}
                        </p>
                      )}
                    </div>

                    {/* AI Analysis */}
                    {aiScore && (
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <Sparkles size={14} />
                            {t(selectedLanguage, 'meddic', 'aiEvidence')}
                          </h4>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed">
                            {aiScore.evidence}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {t(selectedLanguage, 'meddic', 'missing')}
                          </h4>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed">
                            {aiScore.missing}
                          </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <Target size={14} />
                            {t(selectedLanguage, 'meddic', 'questionToAsk')}
                          </h4>
                          <p className="text-sm text-blue-900 font-bold leading-relaxed">
                            "{aiScore.question}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Next Action (Rule-Based) */}
                    {!aiScore && ruleScore.score < 67 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <ArrowRight size={14} />
                          Next Action
                        </h4>
                        {gaps
                          .filter(gap => gap.dimension === dim.name)
                          .map((gap, idx) => (
                            <p key={idx} className="text-sm text-blue-900 font-medium leading-relaxed">
                              {gap.nextAction}
                            </p>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Overall Summary */}
        <div className="mt-6 bg-white border-2 border-slate-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900 mb-3 flex items-center gap-2">
            <BarChart2 className="text-indigo-600" size={20} />
            {t(selectedLanguage, 'meddic', 'overallQualification')}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-green-600">
                {Object.values(ruleBasedScores).filter(s => s.score >= 67).length}
              </div>
              <div className="text-xs text-slate-600 font-bold mt-1">
                {t(selectedLanguage, 'meddic', 'strongDimensions')}
              </div>
            </div>
            <div className="text-center border-x border-slate-200">
              <div className="text-3xl font-extrabold text-yellow-600">
                {Object.values(ruleBasedScores).filter(s => s.score >= 34 && s.score < 67).length}
              </div>
              <div className="text-xs text-slate-600 font-bold mt-1">
                {t(selectedLanguage, 'meddic', 'moderateDimensions')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-red-600">
                {Object.values(ruleBasedScores).filter(s => s.score < 34).length}
              </div>
              <div className="text-xs text-slate-600 font-bold mt-1">
                {t(selectedLanguage, 'meddic', 'weakDimensions')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeddicHeatmap;
