# ⚡ FocusFlow — Smart Productivity Platform

FocusFlow is an AI-powered productivity web application designed to help users plan, track, and execute their daily tasks with clarity and focus. It bridges the gap between vague goals and clear execution by combining intelligent scheduling, task tracking, and focused work sessions into a single, minimal dashboard.

## 🖼️ Preview
The screenshots below illustrate the core workflow of FocusFlow. By using the Gemini 2.5 Flash API, the app converts natural language goals into a structured, time-blocked daily routine.

**1. Central Dashboard**
The central hub displaying your chronological timeline, task progress, and the active Focus Clock.

<p align="center">
 <img width="90%" alt="FocusFlow Dashboard" src="https://github.com/user-attachments/assets/929da5db-1e33-4daf-b8a6-72627f785033" />
</p>

### 2 & 3. AI Planning Flow**
*Left:* A modal where you can describe your day in plain English.
*Right:* The final generated plan that populates your dashboard with specific time slots.

FocusFlow’s **AI Planning Flow** is powered by the **Google Gemini 2.5 Flash API**, which transforms vague, natural language goals into a structured, actionable daily routine.

1. **Natural Language Input**: User enters goals.
2. **Constraint Logic**: Availability and constraints are formatted.
3. **Gemini API Processing**: Generates a structured JSON schedule.
4. **Dashboard Integration**: Plan converts into actionable timeline cards.


<p align="center"> <img width="45%" alt="AI Plan Input" src="https://github.com/user-attachments/assets/e2b2ce67-6118-4176-8716-2e9c67138e9e" /> &nbsp; <img width="35%" alt="AI Generated Plan" src="https://github.com/user-attachments/assets/2a0fa820-bf78-4919-914d-81f3f536a1ff" /> </p>
## 🚀 Key Features

### 🧠 AI Plan My Day
- Generate a realistic, time-based daily schedule using AI.
- Accepts natural language goals (e.g., "Study DSA, Work on React project, Busy from 2-4 PM").
- Automatically respects available start times, unavailable slots, and breaks.
- Powered by **Google Gemini 2.5 Flash API**.

### 🗓️ Smart Daily Timeline
- Clear, chronological view of today’s tasks.
- Visual separation for Focus Sessions, Breaks, and Completed Tasks.
- Easy task status updates to keep you on track.

### ⏱️ Focus Clock
- Built-in focus timer for deep work sessions.
- Encourages time-boxed productivity.
- Helps track daily focus goals vs. actual time spent.

### 📌 Task & Revision Management
- Track tasks completed vs. total.
- Bookmark important topics for revision.
- Categorize tasks (DSA, Dev, Cloud, etc.) for better organization.

## 🛠️ Tech Stack

**Frontend**
- React + TypeScript
- Vite
- Tailwind CSS (Styling)
- Framer Motion (Animations)

**Backend / Services**
- **Gemini 2.5 Flash API** (AI scheduling engine)
- **Supabase** (Authentication & Database)

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fullfocuss
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
