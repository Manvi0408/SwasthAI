# SwasthAI: AI-Powered Emergency Healthcare Network 🩺🇮🇳

SwasthAI is a production-ready, full-stack emergency healthcare coordination platform designed to solve India's fragmented medical dispatch and resource routing problems. Built with an Apple Vision Pro-inspired glassmorphism interface, it provides instant access to proximity-sorted hospitals, real-time blood stock lookups, generic medicine savings, and emergency SOS services.

---

## 🚨 The Real-World Problem

Emergency healthcare coordination in India is highly fragmented, leading to critical delays and high costs:
1. **Critical SOS Ambiguity**: In emergencies, victims or bystanders lack a simple, unified interface to trigger geo-located distress alerts and locate the closest matching trauma facilities.
2. **Hidden Blood stock Levels**: Patients and families frequently search blindly for blood bank units during critical surgeries due to a lack of live, searchable stock directories.
3. **Overpriced Brand-Name Medicines**: Essential branded medicines are heavily marked up. Many citizens are unaware of identical, affordable generic alternatives (e.g. Jan Aushadhi generic equivalents).
4. **Delayed Clinical Assessment**: Hospital emergency rooms suffer from congestion because patients lack access to quick, preliminary AI-driven symptom sorting (triage) to guide them to the right specialist.

---

## 💡 How SwasthAI Solves This

SwasthAI acts as a centralized, high-fidelity healthcare dashboard:
* **One-Click SOS Panic System**: Triggers a 5-second countdown to prevent accidental activations, acquires live GPS coordinates, logs the emergency, and instantly routes first-aid steps along with the nearest trauma hospital coordinates.
* **Proximity-Sorted Hospital Bed Finder**: Utilizes the **Haversine formula** to calculate distance between user coordinates and seeded medical institutions, sorting AIIMS, Government, Private, and Trauma centers by proximity and displaying bed availability.
* **Live Blood stock Inventory Lookup**: Searchable directory by state, city, and blood type showing detailed unit levels (A+, O-, AB+, etc.) to find matching units instantly.
* **Branded vs. Generic Jan Aushadhi Savings Calculator**: Calculates and visualizes savings (often 75%+ cost reduction) by matching branded search terms against exact generic medicine equivalents.
* **AI Triage Command Center**: An interactive symptom analyzer styled like premium search menus. Categorizes symptom severity (Critical, Moderate, Mild), highlights possible diagnoses, and recommends immediate actionable medical paths.
* **Interactive Admin Control Panel**: Provides hospital, blood bank, and medicine management for network supervisors.

---

## 🛠️ The Tech Stack

* **Frontend**: React 18, React Router 6 (SPA mode), TypeScript, TailwindCSS 3, Lucide React icons, Framer Motion (premium animations).
* **Backend**: Express.js server, Node.js.
* **ORM & Database**: Prisma v6 client, SQLite (`dev.db`) for zero-setup local storage (can be swapped instantly to PostgreSQL/MySQL).
* **Internationalization**: Localized context dictionary supporting **10 Indian languages** (English, हिन्दी, தமிழ், తెలుగు, বাংলা, मराठी, ગુજરાતી, ਕੰਨੜ, മലയാളം, ਪੰਜਾਬੀ).
* **Styling**: Curated HSL color palette, customized dark/light theme options, and premium glassmorphism layouts.

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18+) and [PNPM](https://pnpm.io/) installed.

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Manvi0408/SwasthAI.git
cd SwasthAI

# Install dependencies
pnpm install
```

### 3. Database Initialization & Seeding
Initialize the database tables and seed them with hospitals, blood bank stocks, and medicine alternative prices:
```bash
# Generate the Prisma client
npx prisma generate

# Push database schema to SQLite (dev.db is created automatically)
npx prisma db push

# Seed resources
npx prisma db seed
```

### 4. Running the Dev Server
Start the client + backend API server on a single port (`8080`):
```bash
pnpm dev
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 🌍 Production Deployment

### Option 1: Vercel (Instant Setup)
The project is pre-configured for Vercel deployment via `vercel.json` and a serverless backend adapter.

1. Connect your Github repository to [Vercel](https://vercel.com).
2. Set the build directory to standard defaults (it runs `pnpm build` and serves static files from `dist/spa`).
3. Set up a cloud database (like **Supabase** or **Neon.tech**) and add your database URL under **DATABASE_URL** in Vercel's Environment Variables.
4. Vercel automatically deploys the backend server under `/api/*` via the [api/index.ts](file:///c:/Users/Manvi/Downloads/swasthai-healthcare-platform-7b2/api/index.ts) Node function.

### Option 2: Render.com / Railway.app
Ideal for hosting the full Node.js Express server persistent container.
1. Connect your GitHub repository.
2. Build command: `pnpm build`
3. Start command: `pnpm start`
4. Set the **DATABASE_URL** environment variable pointing to your cloud PostgreSQL database.
