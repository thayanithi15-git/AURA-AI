# AURA — AI Digital Wealth Advisor

AURA is a next-generation personalized wealth management and interactive financial advisory platform. Powered by AI and cutting-edge digital avatar technologies, AURA guides users through investment optimization, spending analysis, portfolio strategies, and real-time budgeting projection.

---

## 🌟 Key Features

- **Interactive Digital Avatar**:
  - **D-ID AI Avatar Stream**: Real-time video generation of a speaking avatar responding to your queries.
  - **Interactive SVG Vector Face**: Fully offline, responsive vector representation of the advisor with micro-animations.
- **Advanced AI Advisory Core**:
  - Leverages **Google Gemini** and **Groq** APIs for high-performance financial advisory responses.
  - Smart intent parsing for automated financial visualizations (Line Charts, Bar Charts, Pie Charts).
- **Multi-lingual Support**: Supports English, Hindi (हिंदी), Tamil (தமிழ்), Telugu (తెలుగు), and Kannada (ಕನ್ನಡ) for natural conversation.
- **Dynamic Customizer**: Adjust skin tone, hair color/style, eye color, speech rate, pitch, and voice gender in real-time.

---

## 🛠️ Architecture & Folder Structure

```filepath
├── app/
│   ├── api/
│   │   ├── ai-response/        # AI engine logic handling Gemini & Groq prompts
│   │   ├── copy-avatar/       # Synchronization utilities for D-ID avatars
│   │   ├── did/               # Polling and generation endpoints for D-ID videos
│   │   └── ...
│   ├── globals.css            # Base Tailwind and custom styles
│   ├── layout.tsx             # Root Layout with Font & SEO optimization
│   └── page.tsx               # Main Dashboard view holding AURA core layout
├── components/
│   ├── AdvisoryPanel.tsx      # Main Chat, speech-to-text, and visual response panel
│   ├── Avatar.tsx             # Video playback wrapper for D-ID video streams
│   ├── Customizer.tsx         # Panel controls for styling and configuring the advisor
│   ├── VectorAdvisoryPanel.tsx
│   └── VectorAvatar.tsx       # SVG vector drawing and animation routines
├── public/                    # Assets, logos, and icons
├── next.config.js             # Vercel deployment optimizations
├── tsconfig.json              # TypeScript compilation rules
└── .gitignore                 # Clean environment/dependency exclusions
```

---

## ⚡ Deployment & Vercel Configuration

This repository is optimized for quick, zero-friction deployments on **Vercel**:
- **Bypassed Build Checks**: ESLint and TypeScript checking are set to ignore build-time errors inside `next.config.js` to ensure immediate builds without type compatibility conflicts.
- **Relaxed Compiler Configuration**: TS compile rules inside `tsconfig.json` are configured to skip strict type checking libraries and implicit types.

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` or `.env.local` file in the root directory:
```env
# D-ID Avatar Keys
DID_API_KEY=your_did_api_key
NEXT_PUBLIC_DID_AGENT_ID=your_did_agent_id

# AI Providers
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to interact with AURA.
