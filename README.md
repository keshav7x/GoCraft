# GoCraft

**Learn to code by building real things.**

GoCraft is a hands-on developer learning platform designed to help developers understand programming concepts through practical lessons, challenges, and real-world problem solving.

Instead of passively watching tutorials, developers learn through structured learning paths, interactive content, and progressively challenging exercises.

The goal is simple: **turn learning into building.**

---

## What is GoCraft?

GoCraft brings structured technical education and hands-on coding practice together.

Learning content is organized into three levels:

- **Modules** – Structured learning paths covering a particular subject.
- **Lessons** – Individual topics within a module.
- **Blocks** – Rich, flexible content inside lessons, including explanations, code snippets, images, and other learning resources.

The platform is designed to make technical concepts easier to understand while encouraging developers to experiment, practice, and build.

## Features

### Learning experience
- Structured modules and lessons.
- Rich, block-based lesson content.
- Technical explanations and code examples.
- Progressive learning paths.
- Practical programming challenges.

### Gamification
- XP and experience tracking.
- Learning progress tracking.
- Streaks and achievements.
- Friends and social learning.
- Virtual marketplace with collectible items.

### Developer experience
- Organized learning content.
- Progress tracking.
- Interactive learning environment.
- A foundation for future code execution and evaluation.

## Tech Stack

GoCraft is built using a modern TypeScript ecosystem.

| Layer | Technologies |
|---|---|
| Monorepo | Turborepo |
| Runtime & Package Manager | Bun |
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Backend | Fastify |
| API | tRPC |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Data Fetching | TanStack Query |
| Validation | Zod |
| State Management | Zustand |

## Architecture

GoCraft follows a monorepo architecture to keep the frontend, backend, and shared packages organized.

```text
gocraft/
├── apps/
│   ├── web/              # Next.js application
│   └── api/              # Fastify + tRPC API
│
├── packages/
│   ├── db/               # Database schema and queries
│   ├── contract/         # Shared contracts and types
│   └── ...               # Shared packages
│
├── package.json
├── turbo.json
└── bun.lock
```

The backend uses Fastify as its HTTP server and tRPC for type-safe communication between the frontend and backend.

PostgreSQL handles persistent application data, with Drizzle ORM providing the database abstraction and schema management.

## Learning Content Structure

GoCraft uses a hierarchical content model:

```text
Module
  │
  ├── Lesson
  │     │
  │     ├── Block
  │     ├── Block
  │     └── Block
  │
  ├── Lesson
  │     │
  │     ├── Block
  │     └── Block
  │
  └── Lesson
```

Each lesson belongs to a module, and each block belongs to a lesson.

This structure makes it possible to create flexible learning experiences without restricting lessons to a single content format.

## Getting Started

### Prerequisites

- Node.js 24+
- Bun 1.4+

### Installation

Clone the repository:

```bash
git clone https://github.com/Keshav7x/GoCraft.git

cd GoCraft
```

Install dependencies:

```bash
bun install
```

Configure the environment variables for the applications and database.

Start the development environment using the configured workspace scripts.

> Development commands and environment requirements may evolve as the project develops.

## Project Status

<details>
<summary>Development roadmap</summary>

- [x] Monorepo foundation
- [x] Next.js frontend foundation
- [x] Fastify API foundation
- [x] tRPC integration
- [x] Database schema foundation
- [x] Module, lesson, and block content model
- [ ] Complete learning experience
- [ ] Admin content management system
- [ ] Progress and XP system
- [ ] Interactive coding challenges
- [ ] Code execution and evaluation
- [ ] Social learning features
- [ ] Virtual marketplace

</details>

GoCraft is actively evolving. Some features are still under development, and the roadmap represents the intended direction rather than a claim that everything is production-ready.

## Vision

Learning to program shouldn't be limited to reading documentation or following tutorials.

Developers should be able to explore concepts, understand what's happening under the hood, experiment with code, make mistakes, and gradually develop the confidence to build real-world software.

That's what GoCraft aims to make possible.

**Learn. Experiment. Build. Repeat.**

---

Built with curiosity by [Keshav](https://github.com/Keshav7x).
