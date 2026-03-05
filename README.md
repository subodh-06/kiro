
# Kiro 🚀

**The "Zero-Learning-Curve" Project Management Tool.** *Built internally at [Influcraft](https://influcraft.com) to replace Jira.*

---

## 📖 The Story: Why Kiro?

**Kiro** was born out of frustration at **Influcraft** (our AI-powered influencer platform).

At the "Idea Stage," we needed to move fast. We tried Asana and Jira, but they introduced **meta-work**: configuring workflows, managing complex permissions, and navigating bloated UIs. We were spending more time managing tickets than shipping code.

We built Kiro to solve one specific problem: **Sprint-based execution with zero friction.**
* No 4-hour onboarding courses.
* No complex workflow configurations.
* Just **Sprints**, **Issues**, and **Code**.

---

## 🏗 Architecture & Tech Stack

Designed for **velocity** and **type safety**. We chose a stack that allows a small team to ship full-stack features without context switching.

### The "T3-ish" Stack
* **Framework:** Next.js 15 (App Router) - Utilizing Server Actions for all mutations to avoid API boilerplate.
* **Database:** PostgreSQL - Relational integrity is non-negotiable for project hierarchies.
* **ORM:** Prisma - Chosen for its strong type inference and schema migration capabilities.
* **Auth:** Clerk - Offloaded auth complexity (MFA, Session Management) to focus on core product.
* **State:** Server State (via Next.js) + Optimistic UI (via `useOptimistic`) for the Kanban board.

### System Context
Kiro uses a multi-tenant architecture where data is logically separated by Organization (via Clerk).

```mermaid
graph TD
	 Client[Client Browser] -->|Auth & Session| Clerk[Clerk Auth]
	 Client -->|Server Actions| NextServer[Next.js App Router]
    
	 subgraph Data Layer
	 NextServer -->|Query/Mutation| Prisma[Prisma Client]
	 Prisma -->|SQL| Postgres[PostgreSQL DB]
	 end

	 subgraph Feature Modules
	 NextServer -->|Sprint Logic| SprintModule
	 NextServer -->|Kanban Logic| IssueModule
	 end
```

---

## ✨ Key Features (The "Anti-Bloat" Set)
We stripped away everything that slows early-stage startups down.

1. **The 2-Minute Sprint Setup**
	- Lifecycle Management: Create, Start, and Complete sprints in 3 clicks.
	- Auto-Rollover: Unfinished issues in a closed sprint automatically move to the Backlog (Implementation pending).

2. **High-Performance Kanban**
	- Optimistic Updates: Drag-and-drop actions reflect instantly in the UI before the server confirms, making the board feel "native."
	- Stack: Powered by @hello-pangea/dnd for accessible, touch-friendly interactions.

3. **Organization Multi-Tenancy**
	- Single user account, multiple startups. Switch between "Influcraft" and "Side Project" contexts instantly.
	- Role-Based Access Control (RBAC): Granular permissions for Admins (sprint management) vs. Members (issue creation).

---

## 🗄 Database Design
We prioritize Data Integrity over NoSQL flexibility. A Project must belong to an Organization, and an Issue must belong to a Project.

**Core Models:**
- Organization (External ID from Clerk)
- Project (The container for work)
- Sprint (Time-boxed iterations)
- Issue (The unit of work - linked to Sprint & Assignee)

See prisma/schema.prisma for the full definition.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- PostgreSQL Database (Local or Neon/Supabase)
- Clerk Account (for Auth)

### 1. Clone & Install
```bash
git clone https://github.com/purusottam32/kiro.git
cd kiro
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and populate:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/kiro"

# Clerk Auth (Get these from Clerk Dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3. Database Migration
Apply the Prisma schema to your local database:

```bash
pnpx prisma migrate dev --name init_schema
```

### 4. Run Development Server
```bash
pnpm run dev
```
Visit http://localhost:3000.

---

## 🤝 Contribution Guidelines
We welcome contributions from the community! Since this started as an internal tool at Influcraft, we are looking for help in:

- Integrations: GitHub/GitLab webhooks to auto-close issues.
- Reporting: Burn-down charts (currently basic velocity tracking).
- Notifications: Email/Slack digests for sprint updates.

Please read CONTRIBUTING.md before submitting a Pull Request.

---

## 📜 License
Distributed under the MIT License. See LICENSE for more information.

Built with ❤️ by the team at Influcraft.