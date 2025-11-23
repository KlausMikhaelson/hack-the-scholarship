# Scholarship Optimizer - AI-Powered Application Assistant

A modern, responsive web application built with Next.js, TypeScript, and TailwindCSS that helps students optimize their scholarship applications using AI-powered analysis.

## 🚀 Features

### Core Functionality
- **Scholarship Personality Analysis**: AI-extracted values, themes, and hidden patterns from scholarship descriptions
- **Adaptive Weight Visualization**: Dynamic calculation of criteria importance with interactive bar charts
- **Student Strength Mapping**: Intelligent matching of student profiles to scholarship values
- **Tailored Essay Generation**: Personalized essay drafts optimized for specific scholarships
- **Explainability Matrix**: Transparent breakdown of AI decision-making
- **Before/After Comparison**: Side-by-side view of generic vs. tailored essays

### UI/UX Highlights
- Clean, modern, minimal design
- Fully responsive layout
- Interactive data visualizations using Recharts
- Multi-step form workflow
- Loading states with animated progress indicators
- Card-based layout for easy readability

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Icons**: Lucide React

## 🏗️ Project Structure

```
frontend/
├── app/
│   ├── api/                    # API route handlers (mock)
│   │   ├── analyzeScholarship/
│   │   ├── analyzeStudent/
│   │   ├── generateEssay/
│   │   ├── generateExplainability/
│   │   ├── generateWeights/
│   │   └── runPipeline/
│   ├── apply/                  # Application workflow page
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/
│   ├── EssayComparison.tsx     # Before/after essay view
│   ├── ExplainabilityTable.tsx # AI explainability matrix
│   ├── LoadingState.tsx        # Loading animation
│   ├── PipelineOutput.tsx      # Main results container
│   ├── ScholarshipInput.tsx    # Scholarship form
│   ├── ScholarshipPersonality.tsx
│   ├── StrengthMappingTable.tsx
│   ├── StudentForm.tsx         # Student profile form
│   ├── TailoredEssay.tsx       # Essay display with actions
│   └── WeightChart.tsx         # Bar chart visualization
├── data/
│   └── sample_scholarships.json # Pre-loaded scholarship examples
├── types/
│   └── index.ts                # TypeScript type definitions
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 Usage Guide

### Home Page
- View the main landing page with feature highlights
- Click "Start Application" to begin
- Browse sample scholarships

### Application Workflow
1. **Fill Student Profile**: Enter your academic information, achievements, and background
2. **Select Scholarship**: Choose from samples or paste your own
3. **Run Analysis**: Click the big button to start the AI pipeline
4. **Review Results**: Explore the multi-step output with visualizations

### Available Sample Scholarships
- Gates Millennium Scholarship (Leadership & Service)
- Google Generation Scholarship (Innovation & Technology)
- Coca-Cola Scholars Program (Community Impact)
- National Merit Scholarship (Academic Excellence)
- Dell Scholars Program (Grit & Determination)

## 🎨 Key Components

### StudentForm
Collects student profile information including GPA, major, extracurriculars, achievements, and personal background.

### ScholarshipInput
Allows users to either select from pre-loaded scholarships or paste their own scholarship descriptions.

### WeightChart
Visualizes the adaptive weight profile using a responsive bar chart showing how different criteria are prioritized.

### ScholarshipPersonality
Displays extracted values, priority themes, and hidden patterns identified by the AI.

### StrengthMappingTable
Shows how student strengths align with scholarship values, with evidence citations.

### TailoredEssay
Displays the generated essay with copy, download, and regenerate functionality.

### ExplainabilityTable
Provides transparent breakdown of AI decisions, showing weights and justifications.

### EssayComparison
Side-by-side comparison of generic writing sample vs. tailored essay.

## 🔌 API Routes

All API routes are currently stubbed with mock data for demonstration purposes:

- `POST /api/runPipeline` - Main pipeline orchestrator
- `POST /api/analyzeScholarship` - Analyzes scholarship personality
- `POST /api/analyzeStudent` - Analyzes student profile
- `POST /api/generateWeights` - Calculates adaptive weights
- `POST /api/generateEssay` - Generates tailored essay
- `POST /api/generateExplainability` - Creates explainability matrix

## 🎯 Hackathon Demo Tips

1. **Start with Student Form**: Fill in realistic data for better mock responses
2. **Try Different Scholarships**: Each sample has different focus areas
3. **Use Writing Sample**: Include one to see the before/after comparison
4. **Regenerate Essays**: Click regenerate to see different essay variations
5. **Highlight Explainability**: This is the key differentiator from basic LLM apps

## 🔄 Future Enhancements

- Connect to real AI backend (OpenAI, Claude, etc.)
- PDF resume parsing
- Multiple scholarship comparison
- Save and export applications
- User authentication and profile storage
- Analytics dashboard

## 📝 Development

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Lint Code
```bash
npm run lint
```

## 🎨 Design Philosophy

- **Clean & Minimal**: Focus on content and readability
- **Card-Based Layout**: Logical grouping of information
- **Progressive Disclosure**: Multi-step workflow prevents overwhelm
- **Visual Hierarchy**: Clear typography and spacing
- **Responsive Design**: Works on all device sizes
- **Hackathon-Ready**: Polished UI that impresses judges

## 📄 License

This project was created for the Hack the Scholarship hackathon.

## 🙏 Acknowledgments

Built with modern web technologies and designed for student success.

