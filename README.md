# Lost and Found — Location-Based Lost & Found Platform

Lost and Found is a hub-driven, community‑moderated Lost & Found platform designed to solve lost‑item recovery using location intelligence, role‑based trust, AI‑assisted matching, smart feeds, and structured verification workflows.

It replaces scattered WhatsApp groups, posters, and informal messages with a scalable, verifiable, civic‑ready system.

## 🌟 Core Vision / USP

Lost items are local problems — solve them locally, but intelligently.

Lost and Found introduces location‑based hubs (similar to Reddit communities) combined with:

- Route‑aware broadcasts
- Trust‑aware private verification chats
- AI‑assisted matching & feed ranking
- Community moderation and accountability

## 🚀 Key Features

- 📍 Location‑based hubs (colleges, stations, malls, public places)
- 🔔 Route‑based broadcast of LOST reports
- 🧠 AI‑assisted matching (rule‑based MVP + Gemini trust scoring)
- 📊 Feed ranking (recency + relevance)
- 💬 Trust‑aware private chat
- 🛡️ Hub & post moderation
- 🎖️ Reputation & trust score (foundational)
- 🪙 Token & ticket‑based incentives (foundational)
- 🧑‍💼 Admin dashboard (basic)

## 🧠 High‑Level Architecture

Frontend (React + Vite + Tailwind)
|
v
Backend API (Node.js + Express)
|
+-- MongoDB (Users, Hubs, Posts, Chats, Messages, Claims, Moderation)
|
+-- Geo Queries (2dsphere, $nearSphere)

## 🧱 Architecture Components

### Frontend

**Tech:** React, Vite, Tailwind CSS, Redux Toolkit, React Router, Leaflet

**Responsibilities:**

- Hub discovery & joining
- LOST / FOUND post creation
- Global & hub‑specific feed rendering
- Chat UI for verification
- Broadcast UI for route‑based loss
- Admin & moderator views

### Backend API

**Tech:** Node.js, Express, MongoDB (Mongoose)

**Responsibilities:**

- JWT authentication (HTTP‑only cookies)
- Role‑based access control
- Hub & membership management
- LOST / FOUND post lifecycle
- Route‑based broadcast engine
- Chat & message handling
- AI‑assisted matching & feed ranking
- Token & ticket accounting
- Admin moderation actions

### Database (MongoDB)

**Core Collections**

- users
- hubs
- posts
- chats
- messages
- claims
- postModerations
- tokenTransactions

**Key Capabilities**

- GeoJSON + 2dsphere indexes
- Text search across users, hubs, posts
- Role & membership enforcement
- Scalable chat/message separation
- Auditable moderation actions

## 🧩 Core Concepts

### 1) Hubs (Location‑Based Communities)

Hubs represent real‑world locations:

| Category    | Examples                        |
| ----------- | ------------------------------- |
| Educational | Colleges, Universities, Schools |
| Transit     | Railway Stations, Airports      |
| Commercial  | Malls, Tech Parks               |
| Public      | Parks, Streets, Events          |

Each hub has:

- Geo‑location & coverage radius
- Moderators & posting rules
- Member count & activity stats

Users must join a hub before creating posts inside it.

### 2) LOST / FOUND Posts

Posts are always created inside a hub.

**Types:** LOST, FOUND

**Lifecycle:** OPEN → MATCHED → RESOLVED

Each post may include:

- Title & description
- Optional precise location
- Images & tags
- Linked matched post
- Resolution timestamp
- Security questions (for verification)

### 3) Roles & Permissions

**Global Roles:** USER, ADMIN

**Hub Roles:** MEMBER, MODERATOR

**Permissions:**

- Members can post & chat
- Moderators manage hub posts
- Admins manage platform‑level controls

### 4) Route‑Based Broadcast System (USP)

Designed for items lost while moving.

**Flow**

- User provides start & end coordinates (LOST) or a single location (FOUND)
- Backend interpolates route points (LOST)
- Nearby hubs discovered via geo queries
- LOST/FOUND posts auto‑created in relevant hubs

**Benefits:**

- High visibility
- No spam
- Context‑aware discovery

### 5) Trust‑Aware Chat Verification

Private chats are controlled and auditable.

Rules:

- Only hub members can start chats
- Only between post author & viewer
- Author cannot chat with self

Used to:

- Verify ownership
- Share proof images
- Coordinate item return safely

**Chat Architecture**

- chats → metadata (participants, post, status)
- messages → content

## 🔌 API Endpoints (Implemented)

### Auth

- POST /signup
- POST /login
- POST /logout
- GET /profile
- GET /profile/view
- PATCH /profile

### Hubs

- GET /gethubs
- GET /hubs (user’s joined hubs)
- GET /hubs/search?q=...
- POST /hubs
- POST /hubs/:slugOrId/join

### Posts & Broadcast

- GET /posts (filters: type, status, hubId, hubSlug, q, tag, lat, lng)
- GET /posts/:id
- POST /posts
- POST /broadcast (route‑based; LOST uses start/end, FOUND uses location)

### Chats

- POST /chats/start
- POST /chats/:chatId/messages
- GET /chats/:chatId/messages

### Verification / Claims

- POST /api/verification/request/:postId (multipart, evidenceImage)
- GET /api/verification/incoming
- GET /api/verification/my-claims
- PUT /api/verification/decision/:claimId
- DELETE /api/verification/:claimId

## 🛠️ Local Setup

### Prerequisites

- Node.js
- MongoDB
- Cloudinary account (for verification images)
- Google Gemini API key (for trust scoring)

### 1) Backend (API)

From the repository root:

- Install dependencies: npm install
- Start API (dev): npm run build
- Start API (prod): npm start

The API runs on: http://localhost:7777

### 2) Frontend (Vite)

From clientfromdev:

- Install dependencies: npm install
- Start dev server: npm run dev

Frontend runs on: http://localhost:5173

## ⚙️ Environment Variables

Create a .env file in the repository root (backend) with:

- GOOGLE_API_KEY
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

**Note:** MongoDB connection string is currently hard‑coded in src/config/databse.js. Update it with your own URI or move it to an environment variable.

## 🧪 Notes on Implementation

- CORS is configured for http://localhost:5173 with credentials enabled.
- Uploaded proof images are stored in Cloudinary. Local fallback is supported.
- AI trust scoring uses Gemini with a heuristic fallback if the model fails.
- Geo‑filtering uses MongoDB $nearSphere and 2dsphere indexes.

## 📂 Project Structure (High‑Level)

- src/ → Backend API (Express)
- clientfromdev/ → Frontend (React + Vite)
- uploads/ → Local uploads (fallback)

## 📄 License

MIT
