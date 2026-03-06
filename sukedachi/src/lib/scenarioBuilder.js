const STORAGE_KEY = 'sukedachi_custom_scenarios'

function loadScenarios() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persist(scenarios) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios))
}

export function getScenarios() {
  return loadScenarios()
}

export function saveScenario(scenario) {
  const scenarios = loadScenarios()
  const newScenario = {
    ...scenario,
    id: `custom-${crypto.randomUUID()}`,
    isCustom: true,
    createdAt: new Date().toISOString(),
  }
  scenarios.push(newScenario)
  persist(scenarios)
  return newScenario
}

export function updateScenario(id, data) {
  const scenarios = loadScenarios()
  const index = scenarios.findIndex(s => s.id === id)
  if (index === -1) return null
  scenarios[index] = { ...scenarios[index], ...data, updatedAt: new Date().toISOString() }
  persist(scenarios)
  return scenarios[index]
}

export function deleteScenario(id) {
  const scenarios = loadScenarios()
  const filtered = scenarios.filter(s => s.id !== id)
  persist(filtered)
}

// Convert a custom scenario to the format expected by the Dojo roleplay system
export function toGymScenario(custom) {
  const difficultyMap = {
    '普通': '普通',
    '難しい': '難しい',
    '非常に難しい': '難しい',
  }

  const roleLabel = custom.role === 'その他' ? custom.roleCustom : custom.role
  const solutionNames = (custom.solutions || []).join(', ')

  return {
    id: custom.id,
    title: `${getIndustryEmoji(custom.industry)} ${custom.name}`,
    subtitle: `${custom.industry} — ${roleLabel}`,
    difficulty: difficultyMap[custom.difficulty] || '普通',
    persona: `${roleLabel} at a ${custom.industry} company. Context: ${custom.situation}. Difficulty: ${custom.difficulty}. Challenge the SSE on ${solutionNames || 'BTM portfolio'}.`,
    opening: buildOpening(custom),
    relevantPlays: custom.salesPlays || [],
    isCustom: true,
  }
}

function getIndustryEmoji(industry) {
  const map = {
    '製造業': '🏭',
    '金融': '🏦',
    '小売': '🛒',
    '物流': '🚚',
    '製薬': '💊',
    '公共': '🏛️',
    'その他': '🏢',
  }
  return map[industry] || '🏢'
}

function buildOpening(custom) {
  const roleLabel = custom.role === 'その他' ? custom.roleCustom : custom.role
  return `私は${custom.industry}の${roleLabel}です。${custom.situation} どのようなご提案がありますか？`
}
