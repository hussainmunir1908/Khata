# 💸 Khata - Built for Micathon'26

> **Frictionless peer-to-peer debt tracking, powered by AI.**

## 🎯 Our Purpose

On campus, money is constantly moving—splitting rickshaw rides, printing lab manuals, or grabbing lunch at the tuck shop. But tracking these micro-debts is socially awkward and manually tedious. People lose track, and trust erodes. 

**Khata** isn't a banking app; it's an intelligent social ledger designed specifically for university students. We built this to eliminate the friction of data entry. No more typing numbers or scrolling through contacts. Just speak, and let the AI do the rest.

## ✨ Key Features

* **🎙️ Zero-Touch Voice Logging:** Hold a button and say, *"I paid 500 for Fatima's lunch."* Our Gemini-powered engine instantly parses the amount, the person, and the context.
* **🔒 Privacy-First Contact Sync:** Smart "History-First" fuzzy matching finds your friends without exposing or scraping a global user directory.
* **⭕ Financial Circle Dashboard:** A beautiful, real-time aggregate view of exactly who owes you, and who you owe, keeping your social capital clear.
* **🔔 Frictionless Reminders:** Settle debts and send gentle nudges with automated in-app notifications.

## 🛠️ Tech Stack & Architecture

### **Frontend Ecosystem**
* **Core Framework:** Next.js (App Router) for server-side rendering and streamlined API routes.
* **UI & Styling:** React, Tailwind CSS.
* **Component Library:** `shadcn/ui` (leveraging primitive components like Tabs, Cards, and Forms for a consistent, accessible FinTech aesthetic).
* **User Feedback:** `Sonner` for real-time, non-blocking toast notifications during transactions and mock payment flows.
* **Native Integration:** **Web Contact Picker API** (`navigator.contacts.select`) for seamless, secure access to the user's mobile address book without requiring manual phone number entry.

### **Backend & Database Infrastructure**
* **BaaS:** Supabase.
* **Database:** PostgreSQL with a highly relational schema (`ledger`, `profiles`, and `notifications` tables).
* **Security:** Strict **Row Level Security (RLS)** policies implemented at the database level. Queries are explicitly scoped with `auth.uid()` to ensure users can only `SELECT`, `INSERT`, or `UPDATE` their own financial data, preventing unauthorized global directory scraping.
* **Data Aggregation:** Custom PostgreSQL Views (e.g., the `financial_circle` view) to calculate net debt/credit balances on the fly without heavy client-side JavaScript math.

### **AI Engine & Algorithmic Logic**
* **Core AI:** OpenAI GPT 4-o API.
* **Voice & OCR Pipeline:** Custom prompt engineering to parse unstructured audio transcripts and receipt images into structured JSON payloads (amount, person, description, transaction type).
* **Privacy-First Association Engine:** A custom "History-First" fuzzy matching algorithm (using Postgres `ILIKE`) that checks a user's local ledger history to auto-fill contact details before falling back to a global, exact-phone-number match. This ensures rapid data entry while strictly protecting user privacy.

## 💼 Business Model

Designed for sustainability, Khata operates on a high-margin **Freemium SaaS** model. Core tracking is free (with capped AI compute), while a Rs. 250/month Pro tier unlocks unlimited AI voice logs and advanced receipt splitting.

## 🚀 Installation & Setup

Follow these steps to run Khata locally on your machine.

### 1. Environment Variables
Create a `.env` file in the root directory of the project and add the following keys. You will need to provision a Supabase project and get a Google Gemini API key.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key

```
### 2. Backend Setup (FastAPI & AI Engine)
Open a terminal and set up the Python environment for the backend service:

```bash
# Navigate to the backend folder
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# For Windows:
.\venv\Scripts\activate
# For macOS/Linux:
source venv/bin/activate

# Install the required dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup (Next.js)
Open a **new** terminal window (keep the backend running) and set up the Node environment:

```bash
# Return to the root directory if you are in the backend folder
cd ..

# Install Node dependencies
npm install

# Start the development server
npm run dev
```

### 🏆 Built for Micathon'26

Built by Hussain Munir, Fatima Liaquat, Marium Imran for Micathon'26 <3
