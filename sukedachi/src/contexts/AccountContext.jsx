import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'sukedachi_account_context'

const defaultState = {
  company: '',
  industry: '',
  pains: [],
  bom: [],
}

const AccountContext = createContext()

export function AccountProvider({ children }) {
  const [account, setAccount] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState
    } catch {
      return defaultState
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account))
  }, [account])

  const setCompany = useCallback((company) => setAccount(prev => ({ ...prev, company })), [])
  const setIndustry = useCallback((industry) => setAccount(prev => ({ ...prev, industry })), [])
  const setPains = useCallback((pains) => setAccount(prev => ({ ...prev, pains })), [])
  const setBom = useCallback((bom) => setAccount(prev => ({ ...prev, bom })), [])
  const clearAccount = useCallback(() => setAccount(defaultState), [])
  const setAccountData = useCallback((data) => setAccount(prev => ({ ...prev, ...data })), [])

  const hasContext = !!(account.company || account.industry || account.pains.length || account.bom.length)

  return (
    <AccountContext value={{
      ...account,
      hasContext,
      setCompany,
      setIndustry,
      setPains,
      setBom,
      clearAccount,
      setAccountData,
    }}>
      {children}
    </AccountContext>
  )
}

export function useAccount() {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error('useAccount must be used within AccountProvider')
  return ctx
}

export function buildAccountContextString(account) {
  if (!account || (!account.company && !account.industry && !account.pains?.length && !account.bom?.length)) {
    return ''
  }
  const parts = []
  if (account.company) parts.push(`企業名: ${account.company}`)
  if (account.industry) parts.push(`業種: ${account.industry}`)
  if (account.pains?.length) parts.push(`課題: ${account.pains.join(', ')}`)
  if (account.bom?.length) parts.push(`関連製品: ${account.bom.join(', ')}`)
  return `\n\n【ターゲット顧客コンテキスト — 必ず以下に基づいて回答をカスタマイズしてください】
${parts.join('\n')}

重要な指示: 上記の顧客情報に基づき、すべての回答・提案・例をこの顧客に特化してください。
- ${account.company ? `「${account.company}」の事業・業界特性を踏まえて具体的に説明` : ''}
- ${account.industry ? `${account.industry}業界の課題・トレンド・用語を使って説明` : ''}
- ${account.pains?.length ? `顧客の課題（${account.pains.join('、')}）に直接結びつけて説明` : ''}
- 汎用的な回答ではなく、この顧客のために書かれたかのように回答してください`
}
