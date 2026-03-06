# 助太刀 (Sukedachi) — Requirements Document
**Name:** 助太刀 — "Coming to your aid in battle" (samurai term)
**Author:** Molthi (requirements) + Thi (build)
**Build tool:** Claude Code + Corporate GitHub Enterprise
**Timeline:** 1 week (Japan trip, live-build with team)
**Audience:** New SSEs (Solution Sales Experts) — specialist sales focused on SAP BTM portfolio

---

## 1. Problem Statement

New SSEs (Solution Sales Experts) in Japan don't yet understand SAP's BTM portfolio. They can't articulate value, don't believe in the market ("no market for BPM", "no market for EA"), and lack the confidence to position big deals at enterprise accounts. Pre-sales is complacent, waiting for sales to push — but sales can't push what they don't understand.

**助太刀 is a battle companion, not a deal tracker.**

Like the samurai tradition of rushing to a comrade's aid, 助太刀 stands beside new SSEs — teaching, challenging, and coaching them until they can hold their own sword. By week's end, they walk into any customer meeting ready to fight.

---

## 2. Portfolio Scope

| Product | Domain | Key Differentiator |
|---------|--------|-------------------|
| **Signavio** | Process Mining & Management | End-to-end process intelligence, SAP-native integration |
| **LeanIX** | Enterprise Architecture Management | Application rationalization, transformation planning |
| **Syniti** | Data Quality & Migration | Master data management, S/4HANA migration readiness |
| **Tricentis** | Testing & QA Automation | Continuous testing, SAP change impact analysis |

**Secondary:** WalkMe (digital adoption — rarely but possibly engaged by SSEs)
**Not in scope:** CRM, account intelligence, footprint tools (they have their own)

### Sales Plays (6 GTM Plays — full detail in `knowledge/sales-plays.md`)

| Play | Focus | Products |
|------|-------|----------|
| **SP1** Integrated Toolchain for ERP Transformation | People + Process + Apps + Data as one story | Signavio + LeanIX + Syniti + Tricentis (+ WalkMe) |
| **SP2** Process Excellence for LoBs | Prepare → Build → Run continuous improvement | Signavio |
| **SP3** Manage IT Complexity with EA | Landscape transparency, portfolio optimization | LeanIX |
| **SP4** Manage & Govern AI Agents | AI agent lifecycle: discover → deploy → govern → optimize | LeanIX + Signavio |
| **SP5** Enterprise Application QA | Assess → Test → Assure continuous quality | Tricentis |
| **SP6** Enterprise Digital Adoption *(secondary)* | Close the digital adoption gap | WalkMe |

SP1–SP5 are the primary plays. The Coach should understand all 6 deeply and help SSEs pick the right play for a given scenario.

**Full sales play content:** `knowledge/SP1-integrated-toolchain.md` through `knowledge/SP6-walkme-adoption.md`

---

## 3. Design Principles

1. **Chat-first** — The coach chatbot is the core experience, always accessible
2. **Conviction over information** — Don't just explain, build belief in the market
3. **Japan-contextual** — Japanese labor shortage, 2025 cliff, Keidanren DX, manufacturing dominance
4. **Portfolio thinking** — Teach combinations, not just individual products
5. **Safe to be wrong** — Practice space where asking "dumb questions" is encouraged
6. **Japanese-first** — Entire UI in Japanese. AI responds in Japanese. No English toggle (this is built for the Japan team only).
7. **Japanese-only UI** — All text, labels, chips, placeholders in Japanese. No language toggle needed.
8. **Japanese typography** — Noto Sans JP, generous line-height (1.8), letter-spacing for readability
9. **Mobile-friendly** — They'll use it on phones between meetings
10. **Simple to deploy** — GitHub Pages or similar, no backend dependencies beyond AI proxy
11. **Deal sizes in yen** — Always ¥, not $. Use Japanese business conventions.
12. **Cultural context** — Honorifics in roleplay (様), formal register in AI responses, Japan-specific scenarios

---

## 4. Modules

### 4.1 助太刀コーチ (Core — 80% of value)

**What:** AI battle companion deeply knowledgeable about the 4 BTM products, competitive landscape, Japan market dynamics, and SAP positioning. Always at your side.

**Two modes (toggle):**

#### 📚 学ぶ (Learn Mode)
- "What is process mining?"
- "How does Signavio compare to Celonis?"
- "What does LeanIX do that a spreadsheet can't?"
- "Give me the 30-second elevator pitch for Syniti"
- "Why would a Japanese manufacturer care about EA?"
- Answers are clear, structured, jargon-light, with concrete examples

#### 🥊 挑戦する (Challenge Mode)
- AI pushes back like a skeptical colleague OR a skeptical customer
- "There's no market for BPM in Japan" → Coach provides data, analogies, reframes
- "Our customers already have Celonis" → Coach explains differentiation and co-existence
- "EA is just PowerPoint architecture diagrams" → Coach reframes with business value
- "Nobody's asking for testing automation" → Coach connects to S/4 migration wave
- Scores responses on: value articulation, business language (not features), confidence

**Knowledge base requirements:**
- **6 Sales Plays** with elevator pitches, discovery questions, buyer maps, green/red lights, operating models, and "Why We Win" (see `knowledge/SP1–SP6*.md`)
- Competitive battlecards (Celonis, Mega, ServiceNow, Tricentis competitors)
- Japan market data (IDC, Gartner, METI reports on DX adoption)
- Common internal objections + rebuttals (from sales plays + Thi's experience)
- SAP-native integration stories (why BTM + S/4 is powerful together)
- Customer reference stories (anonymized if needed)
- Cross-sell triggers mapped to sales plays (SP1 is the portfolio play, SP2-SP5 are product-led entry points)

**Chat UX:**
- Persistent left panel (or bottom sheet on mobile)
- Conversation history within session
- Suggested starter questions (rotating)
- "Ask about: [Signavio] [LeanIX] [Syniti] [Tricentis]" quick chips
- Mode toggle clearly visible: Explain 📚 ↔ Challenge 🥊

**Document Upload (📎):**
- Upload button next to chat input (both desktop and mobile)
- Supported formats: PDF, DOCX, PPTX, TXT, MD, images
- Use case: SSE uploads a customer deck, RFP excerpt, or meeting notes → Coach analyzes and suggests relevant sales play, discovery questions, positioning
- Implementation: FileReader for text; pdf.js for PDFs; or pass file to AI proxy if model supports multimodal input
- Desktop: drag-and-drop zone in chat area + click upload
- Mobile: standard file picker (iOS/Android browser `<input type="file">`)
- Show uploaded filename as a chip in the conversation

**Voice Input (🎤):**
- Microphone button next to chat input (mobile primary, desktop optional)
- **Recommended approach — two tiers:**
  1. **Tier 1 (zero effort):** Rely on native OS dictation (iOS keyboard mic, Gboard voice) — works with no code, types into the text field naturally. Add a small hint tooltip: "ヒント：キーボードの🎤で音声入力できます"
- Visual: subtle mic hint near input field
- Language: relies on device Japanese input (set device language to Japanese)

---

### 4.2 製品ナビゲーター (Portfolio Navigator)

**What:** Visual, interactive map of the 4 products and how they connect.

**Views:**

#### Product Cards
- Each product: one-liner, 30s pitch, 2min pitch, 5min pitch (expandable)
- Key personas who care (CIO, CFO, COO, Head of IT, Head of Quality)
- "When to lead with this" trigger scenarios

#### Cross-sell Map
- Visual showing which products pull each other in
- Example flows:
  - "Customer mentions S/4 migration" → Signavio (process discovery) + Syniti (data readiness) + Tricentis (test automation)
  - "Customer has shadow IT problem" → LeanIX (rationalization) → Signavio (process standardization)
  - "Customer failing UAT" → Tricentis → upsell to Signavio for root cause

#### Japan Context Layer
- Overlay: why each product matters specifically in Japan NOW
- 2025 cliff / legacy modernization pressure
- Labor shortage → automation imperative
- Keidanren Society 5.0 / DX push
- Manufacturing / automotive dominance → process mining sweet spot

**UX:**
- Card-based, tappable
- No scrolling walls of text
- Each card has a "Copy pitch" button (for pasting into emails/chats)

---

### 4.3 実践練習 (Pitch Gym / 道場)

**What:** The training dojo — role-play simulator where SSEs spar with an AI customer.

**Flow:**
1. Pick a scenario (or random):
   - "CIO of a large Japanese bank, concerned about regulatory compliance"
   - "VP Engineering at an automotive OEM, mid-S/4HANA migration"
   - "CFO asking why they need another software tool"
   - "IT Director who already bought Celonis"
2. AI plays the customer — realistic, not adversarial but not easy
3. Conversation runs 5-10 exchanges
4. Scorecard at the end:
   - ✅ Led with business value (not features)
   - ✅ Asked discovery questions
   - ✅ Positioned the right product(s)
   - ✅ Handled objections with data
   - ⚠️ Thought big enough on scope/deal size
   - ❌ Feature-dumped / got too technical
5. "Try again" or "See ideal conversation" (AI shows a model response)

**Scenarios should be:**
- Japan-specific (company types, cultural dynamics)
- Multi-product where appropriate
- Varied difficulty (some friendly, some skeptical, some hostile)

---

## 5. What This App Does NOT Do

- ❌ Account intelligence or footprint data (use existing SAP tools)
- ❌ CRM integration or pipeline tracking
- ❌ Replace formal onboarding/training
- ❌ Cover the full SAP portfolio (BTM only, scoped products)
- ❌ Store customer data or deal information

---

## 6. Technical Architecture (Suggested)

```
┌─────────────────────────────┐
│   GitHub Pages (Static)     │
│   React SPA                 │
│   - Coach (chat)            │
│   - Navigator (cards)       │
│   - Pitch Gym (roleplay)    │
└──────────┬──────────────────┘
           │ API calls
           ▼
┌─────────────────────────────┐
│   AI Proxy                  │
│   (Cloudflare Worker or     │
│    corporate API gateway)   │
│   - Injects API key         │
│   - Rate limiting           │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│   LLM (Gemini / GPT /      │
│   Claude — whatever corp    │
│   allows)                   │
└─────────────────────────────┘
```

**System prompt architecture:**
- Base system prompt: role as 助太刀 (Sukedachi)
- Product knowledge: injected as structured context (not fine-tuned)
- Mode-specific instructions: Explain vs Challenge vs Pitch Gym
- Language: responds in user's selected language

**Knowledge injection approach:**
- Curated markdown files per product (not raw docs)
- Competitive intel as structured battlecards
- Japan market context as a separate knowledge chunk
- Cross-sell playbook as decision tree / if-then rules

---

## 7. Build Sequence (The Week)

| Day | Build | Team Experience |
|-----|-------|----------------|
| Mon | 助太刀コーチ (Learn mode) + basic UI | Live demo of vibe coding, team watches 助太刀 come to life |
| Tue | Challenge mode + 製品ナビゲーター | Team starts sparring with 助太刀, asking questions |
| Wed | 道場 (Pitch Gym) scaffolding + scenarios | Navigator as reference for their meetings |
| Thu | 道場 polish + scoring | Group sparring sessions — 助太刀 coaches them |
| Fri | Final polish, deploy, handoff | They own 助太刀 + saw it built in 5 days |

---

## 8. Success Criteria — 助太刀の成果

After the week with 助太刀, each SSE should be able to:
1. Deliver the 30-second elevator pitch for each sales play (SP1–SP5) without jargon
2. Articulate why there IS a market for BPM/EA/data quality/testing/AI governance in Japan
3. Pick the right sales play for a given customer scenario (green lights / red lights)
4. Ask the right discovery questions to qualify and expand opportunities
5. Handle the top objections per play with data and reframes
6. Think in terms of portfolio deals (SP1), not single-product transactions
7. Know the buyer map — who to talk to and who are key allies

---

## 9. Internal Objections Playbook (Seed Content for 助太刀)

These are real objections Thi hears from his own team. The Coach needs strong answers.

| Objection | Reframe |
|-----------|---------|
| "There's no market for BPM in Japan" | Process mining market growing 40%+ YoY globally. Japan manufacturing sector is the #1 use case. Celonis just opened Tokyo office — they see the market, why don't we? |
| "Nobody asks for EA tools" | Nobody asks for it by name. But every CIO dealing with 300+ applications, M&A integration, or cloud migration is doing EA — just badly, in spreadsheets. LeanIX makes the invisible visible. |
| "Testing? That's too technical, not strategic" | Every S/4HANA migration has a testing phase. 60% of migration delays are testing-related. Tricentis is the de-risk play every CFO understands. |
| "Syniti? Never heard of it from customers" | Because data quality is the thing everyone suffers from but nobody budgets for — until their S/4 migration fails. Syniti is the insurance policy. |
| "These deals are too small to bother" | A single Signavio deal at a large manufacturer can be $500K+. Add Tricentis and Syniti for migration, you're at $1.5M. BTM is a portfolio play, not a point product. |
| "The customer already has Celonis" | Great — Celonis finds the problems, Signavio fixes them. And Celonis doesn't do process design, simulation, or SAP-native integration. Different value, complementary. |

---

## 10. Open Questions

1. **LLM choice:** What does SAP corporate allow? Gemini via proxy (like AIDE-visor)? Azure OpenAI? Internal SAP AI?
2. **Knowledge base:** Can we use official product positioning decks, or do we need to write from scratch?
3. **Customer stories:** Any Japan-specific wins we can reference (anonymized)?
4. **Access control:** Password gate (like AIDE-visor) or SSO?
5. **Longevity:** Is 助太刀 a throwaway for the week, or should it survive and evolve?
