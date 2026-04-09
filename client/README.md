# Gitlytics AI Agent

A full-stack Next.js 16 AI chat application built with **AI SDK v6**, **LangGraph.js**, **MCP (Model Context Protocol)**, **Drizzle ORM**, **Neon PostgreSQL**, and **Better Auth** with GitHub OAuth.

This is a clone of the `refer` project, modernized with:

- **Drizzle ORM** (instead of Prisma) with **Neon PostgreSQL**
- **AI SDK v6** + Vercel AI SDK UI for the chat interface
- **Better Auth** with GitHub OAuth + JWT sessions
- **LangGraph.js** agentic graph with human-in-the-loop tool approval
- **MCP** server integration for extensible tools
- **Google Gemini** as the sole AI provider (API key configurable at runtime)
- Local file storage (no S3/MinIO dependency)

## Tech Stack

### Frontend

- **Next.js 16** (App Router, React 19, TypeScript)
- **AI SDK v6** (`ai`, `@ai-sdk/react`, `@ai-sdk/google`) - useChat hook with DefaultChatTransport
- **Tailwind CSS v4** + **shadcn/ui** components
- **Framer Motion** for animations
- **React Markdown** with KaTeX and GFM plugins

### Backend

- **Node.js** runtime (Next.js API routes)
- **Drizzle ORM** with **Neon PostgreSQL**
- **Better Auth** (GitHub OAuth + email/password + JWT)
- **Server-Sent Events (SSE)** for real-time streaming

### AI Stack

- **LangGraph.js** - StateGraph with MessagesAnnotation, human-in-the-loop tool approval
- **LangChain.js** (`@langchain/core`, `@langchain/google-genai`)
- **`@langchain/mcp-adapters`** - MCP client adapter
- **`@modelcontextprotocol/sdk`** - MCP SDK
- **Google Gemini** - sole AI provider

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.local` and fill in your values:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/agent

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-change-this-in-production
BETTER_AUTH_URL=http://localhost:3000

# GitHub OAuth (create at https://github.com/settings/developers)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Neon PostgreSQL
DATABASE_URL=postgresql://user:password@db.neon.tech/neondb?sslmode=require

# Google Gemini API Key
GOOGLE_API_KEY=your_google_api_key_here
```

### 3. Set up the database

```bash
# Push schema to Neon PostgreSQL
npm run db:push

# Or generate migrations
npm run db:generate
npm run db:migrate
```

### 4. Set up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set **Homepage URL** to `http://localhost:3000`
4. Set **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`
5. Copy the **Client ID** and **Client Secret** to your `.env.local`

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
client/
├── app/
│   ├── layout.tsx                 # Root layout with ChatProvider
│   ├── page.tsx                   # Home page with Chat + Sidebar
│   ├── globals.css                # Tailwind v4 + theme variables
│   └── api/
│       ├── auth/[...all]/         # Better Auth catch-all route
│       ├── threads/               # Thread CRUD API
│       ├── mcp-servers/           # MCP Server CRUD API
│       └── agent/
│           ├── stream/            # AI chat streaming endpoint
│           └── upload/            # File upload (local storage)
├── components/
│   ├── Chat.tsx                   # Main chat component (useChat hook)
│   ├── ChatProvider.tsx           # React context for chat settings
│   ├── ThreadContext.tsx          # React context for active thread
│   ├── Sidebar.tsx                # Thread list sidebar
│   ├── MessageList.tsx            # Message display with auto-scroll
│   ├── MessageInput.tsx           # Chat input with settings toggle
│   ├── ChatSettings.tsx           # API key, model, tool approval settings
│   ├── AIMessage.tsx              # AI message with Markdown rendering
│   ├── HumanMessage.tsx           # User message bubble
│   ├── MCPServerConfig.tsx        # MCP server configuration modal
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── auth.ts                    # Better Auth server config
│   ├── auth-client.ts             # Better Auth client hooks
│   ├── db/
│   │   ├── index.ts               # Drizzle + Neon connection
│   │   └── schema.ts              # Database schema (users, threads, mcp_servers, etc.)
│   └── agent/
│       ├── index.ts               # Agent factory (ensureAgent, getAgent)
│       ├── builder.ts             # LangGraph StateGraph with tool approval
│       ├── memory.ts              # PostgresSaver checkpointer
│       ├── mcp.ts                 # MCP client + tool loading
│       ├── util.ts                # Model factory + schema sanitization
│       └── prompt.ts              # System prompt
├── drizzle.config.ts              # Drizzle Kit configuration
└── package.json
```

## Key Features

### LangGraph Agent with Tool Approval

The agent uses a `StateGraph` with three nodes:

1. **agent** - Calls the LLM with all bound tools
2. **tool_approval** - Human-in-the-loop pause for tool execution approval
3. **tools** - Executes approved tools

```
START → agent → (conditional) → tool_approval → tools → agent → ... → END
```

### AI SDK v6 Chat Interface

Uses `useChat` from `@ai-sdk/react` with `DefaultChatTransport` for:

- Real-time SSE streaming
- Message state management
- Stop/regenerate responses
- Custom body parameters (threadId, apiKey, model)

### MCP Server Integration

Configure MCP servers (stdio or http transport) through the UI. Tools are automatically loaded and sanitized for Gemini compatibility.

### Runtime API Key Configuration

Users can enter their Google API key in the chat settings panel, which is passed to the streaming endpoint per-request.

## Database Schema

- **user** - User accounts (Better Auth)
- **session** - User sessions (Better Auth)
- **account** - OAuth provider accounts (Better Auth)
- **verification** - Email verification tokens (Better Auth)
- **thread** - Chat threads (scoped to user)
- **mcp_server** - MCP server configurations (scoped to user)
- **attachment** - Uploaded file metadata (scoped to thread)

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema directly to database
npm run db:studio    # Open Drizzle Studio
```

## Differences from `refer` Project

| Feature      | refer                    | client (this project)            |
| ------------ | ------------------------ | -------------------------------- |
| ORM          | Prisma                   | Drizzle ORM                      |
| Database     | PostgreSQL (Docker)      | Neon PostgreSQL                  |
| Auth         | None (MCP OAuth only)    | Better Auth + GitHub OAuth + JWT |
| AI SDK       | None (LangGraph only)    | AI SDK v6 + useChat + LangGraph  |
| AI Provider  | OpenAI + Gemini          | Gemini only                      |
| File Storage | S3/MinIO                 | Local filesystem                 |
| Chat UI      | Custom SSE + React Query | AI SDK DefaultChatTransport      |
| Checkpointer | PostgresSaver (Prisma)   | PostgresSaver (Drizzle)          |
