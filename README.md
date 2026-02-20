# SAP BTM AIDE-visor

AI-powered sales coaching tool for SAP Business Transformation Management deals. Helps solution advisors prepare for customer engagements with context-aware coaching, executive briefs, objection handling, and competitive intelligence.

**Live:** [openmolthi.github.io/btm-advisor](https://openmolthi.github.io/btm-advisor/)

## Features

- **Smart Start** — Type a company name, AI auto-fills industry, processes, value drivers
- **Coaching Ideas** — Context-aware deal coaching with talk tracks
- **Executive Briefs** — Formal brief generation from coaching notes
- **AI Chat** — Conversational deal advisor with full context
- **Objection Battlecards** — Predicted objections with rebuttals and practice mode
- **Email Starter Kit** — Cold outreach, follow-up, and value-hook email drafts
- **Value Expansion** — Deepen, broaden, and phase strategies
- **MEDDIC Heatmap** — Real-time deal qualification scoring
- **Context Map** — Visual node-link diagram of deal context (with PNG export)
- **Competitor Intel** — Competitive landscape analysis
- **Stakeholder Map** — Key persona identification and strategy
- **Signavio BPMN** — Industry-specific process flow generation
- **LeanIX Model** — IT landscape inventory with LDIF export and diagram
- **Workshop Agenda** — Facilitation agenda generation
- **Deal Import/Export** — Save and load deals as JSON
- **Debrief Extraction** — Extract stakeholders and insights from meeting notes
- **Multi-language** — English, Japanese, Vietnamese support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 7 |
| Styling | Tailwind CSS 4 |
| AI Model | Gemini 2.5 Flash (text) + Imagen 4.0 (images) |
| API Proxy | Cloudflare Worker (`btm-advisor-proxy.openmolthi.workers.dev`) |
| Icons | Lucide React |
| Markdown | react-markdown |
| Hosting | GitHub Pages |

## Architecture

```
src/
├── App.jsx                    # Main app shell + layout
├── PasswordGate.jsx           # Password-protected entry
├── ErrorBoundary.jsx          # Error boundary wrapper
├── main.jsx                   # Vite entry point
├── hooks/
│   ├── usePersistedState.js   # useState + localStorage sync
│   ├── useDealState.js        # Deal context state + handlers
│   ├── useAIActions.js        # All AI generation handlers
│   └── useModals.js           # Modal state management
├── lib/
│   ├── api.js                 # Cloudflare proxy API client
│   ├── prompts.js             # AI prompt templates
│   ├── parseAIJson.js         # Safe JSON extraction from AI responses
│   ├── meddic.js              # MEDDIC scoring logic
│   ├── glossary.js            # SAP term glossary
│   ├── i18n.js                # Translation helper
│   ├── constants.js           # Barrel re-export
│   ├── ui-strings.js          # Multi-language UI strings
│   ├── domain-data.js         # Industries, processes, capabilities
│   └── defaults.js            # Default methodology & guardrails
├── components/
│   ├── ChatInterface.jsx      # AI chat with message history
│   ├── ContextMap.jsx         # Visual context diagram
│   ├── MeddicHeatmap.jsx      # Deal qualification heatmap
│   ├── MultiSelect.jsx        # Searchable multi-select dropdown
│   ├── Modal.jsx              # Modal system (Admin, Confirm, Map, Agenda)
│   ├── DealTimeline.jsx       # Deal milestone tracker
│   ├── EmailPanel.jsx         # Email draft cards
│   ├── ObjectionPanel.jsx     # Objection battlecards
│   ├── ValuePanel.jsx         # Value expansion strategies
│   ├── StakeholderList.jsx    # Stakeholder management
│   ├── LanguageSelector.jsx   # Language picker
│   ├── StrategicDropdown.jsx  # Strategic actions menu
│   └── ToastContainer.jsx     # Toast notifications
└── assets/
```

## Setup

```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Configuration

The app connects to a Cloudflare Worker proxy for API calls. No API keys are needed client-side.

1. Open the app and enter the access token in **Settings (⚙️)**
2. Select your deal context (industry, processes, value drivers, capabilities)
3. Click **"Give me ideas"** to generate coaching content

## Deployment

```bash
# Build and deploy to GitHub Pages
npm run build
npx gh-pages -d dist
```

## License

Private — internal use only.
