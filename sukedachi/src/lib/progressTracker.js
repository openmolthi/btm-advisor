const STORAGE_KEY = 'sukedachi-progress'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function getDefaults() {
  return {
    flashCards: {
      seen: {},       // { [cardId]: viewCount }
      lastDate: null,
    },
    quiz: {
      completed: 0,
      bestScore: 0,
      totalScore: 0,
      lastScores: [],  // last 5 scores as percentages
      lastDate: null,
    },
    dojo: {
      sessionsCompleted: 0,
      scenariosAttempted: [], // scenario IDs
      lastDate: null,
    },
    coach: {
      messagesSent: 0,
      sessions: 0,
      lastDate: null,
    },
    streak: {
      current: 0,
      lastActiveDate: null,
    },
  }
}

function getProgress() {
  return load() || getDefaults()
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function updateStreak(data) {
  const d = today()
  const last = data.streak.lastActiveDate
  if (last === d) return // already counted today

  if (last) {
    const lastDate = new Date(last)
    const todayDate = new Date(d)
    const diff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24))
    if (diff === 1) {
      data.streak.current += 1
    } else if (diff > 1) {
      data.streak.current = 1
    }
  } else {
    data.streak.current = 1
  }
  data.streak.lastActiveDate = d
}

export function trackFlashCard(cardId) {
  const data = getProgress()
  data.flashCards.seen[cardId] = (data.flashCards.seen[cardId] || 0) + 1
  data.flashCards.lastDate = today()
  updateStreak(data)
  save(data)
}

export function trackQuiz(score, total) {
  const data = getProgress()
  const pct = Math.round((score / total) * 100)
  data.quiz.completed += 1
  data.quiz.totalScore += pct
  if (pct > data.quiz.bestScore) data.quiz.bestScore = pct
  data.quiz.lastScores = [...data.quiz.lastScores, pct].slice(-5)
  data.quiz.lastDate = today()
  updateStreak(data)
  save(data)
}

export function trackDojo(scenarioId) {
  const data = getProgress()
  data.dojo.sessionsCompleted += 1
  if (!data.dojo.scenariosAttempted.includes(scenarioId)) {
    data.dojo.scenariosAttempted.push(scenarioId)
  }
  data.dojo.lastDate = today()
  updateStreak(data)
  save(data)
}

export function trackCoachMessage() {
  const data = getProgress()
  const d = today()
  if (data.coach.lastDate !== d) {
    data.coach.sessions += 1
  }
  data.coach.messagesSent += 1
  data.coach.lastDate = d
  updateStreak(data)
  save(data)
}

export function trackDailyDrill(date, results) {
  const data = getProgress()
  if (!data.dailyDrill) {
    data.dailyDrill = { completedDates: [], results: {} }
  }
  if (!data.dailyDrill.completedDates.includes(date)) {
    data.dailyDrill.completedDates.push(date)
  }
  data.dailyDrill.results[date] = results
  updateStreak(data)
  save(data)
}

export function isDrillCompletedToday() {
  const data = getProgress()
  return data.dailyDrill?.completedDates?.includes(today()) || false
}

export { getProgress, today }

export function resetAll() {
  localStorage.removeItem(STORAGE_KEY)
}
