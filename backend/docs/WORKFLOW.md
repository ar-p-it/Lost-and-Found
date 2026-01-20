# Lost & Found Platform — User Workflow

This document describes the end-to-end workflow for a user visiting the platform, covering authentication, hub participation, posting, interactions, moderation, and tokens.

## Prerequisites

- Server running locally on `http://localhost:7777`.
- Cookies enabled; JWT is set as `token` cookie on login.
- MongoDB connection configured in `src/config/databse.js`.

## Authentication

- Sign Up: Create a new account with unique `username` and `email`.
- Login: Authenticate via `email` or `username` and `password`. Sets `token` cookie.
- Profile: Retrieve the authenticated user's profile.
- Logout: Clears `token` cookie.

### API

- POST `/signup`
- POST `/login`
- GET `/profile` (auth required)
- POST `/logout`

### Example

```bash
# Sign up
curl -X POST http://localhost:7777/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username":"alice",
    "email":"alice@example.com",
    "password":"P@ssw0rd!",
    "displayName":"Alice"
  }'

# Login (capture Set-Cookie: token=...)
curl -i -X POST http://localhost:7777/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"alice@example.com",
    "password":"P@ssw0rd!"
  }'
```

## Hubs (Location-based communities)

- Create Hub: Define `name`, `slug`, `category`, and `location` (Point [lng, lat]). Creator becomes moderator by default.
- Join Hub: Become a member of an existing hub by slug or id.
- Requirement: Users must be members (or ADMIN) of a hub to create posts in that hub.

### API

- POST `/hubs` (auth required)
- POST `/hubs/:slugOrId/join` (auth required)

### Example

```bash
# Create a hub
curl -X POST http://localhost:7777/hubs \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_TOKEN" \
  -d '{
    "name":"City Central Station",
    "slug":"city-central-station",
    "category":"TRANSIT",
    "location":{"type":"Point","coordinates":[77.5946,12.9716]},
    "description":"Transit hub",
    "makeModerator": true
  }'

# Join a hub by slug
curl -X POST http://localhost:7777/hubs/city-central-station/join \
  -H "Cookie: token=YOUR_TOKEN"
```

## Posts (LOST/FOUND)

- Create Post: Provide `type` (LOST/FOUND), `title`, `description`, and `hubId` or `hubSlug`. Optional `location`, `tags`, and `images`.
- Feed Behavior: Posts appear in global and hub-specific feeds; indexed by status and recency.
- Lifecycle: `OPEN → MATCHED → RESOLVED` with optional link to `matchedPostId` and `resolvedAt`.

### API

- POST `/posts` (auth required)

### Example

```bash
curl -X POST http://localhost:7777/posts \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_TOKEN" \
  -d '{
    "type":"LOST",
    "title":"Lost black backpack",
    "description":"Near platform 3",
    "hubSlug":"city-central-station",
    "location":{"type":"Point","coordinates":[77.5946,12.9717]},
    "tags":["backpack","black","laptop"]
  }'
```

## Comments & Private Chat

- Comments: Users comment on posts; threaded replies supported.
- Private Chat: 1:1 chat between participants regarding a post; messages can have TTL expiry.

### API (future routes)

- POST `/posts/:postId/comments` (to add a comment)
- POST `/chats` (to start a chat for a post)
- POST `/messages` (to add a message to a chat)

## Moderation

- Hub Moderators: Assigned per hub; can moderate posts.
- Post Moderators: Assigned per post; actions recorded in `PostModeration`.
- Actions: `ASSIGN`, `FLAG`, `HIDE`, `LOCK`, `UNLOCK`, `DELETE`, `WARN_USER`, `ESCALATE`, `NOTE`.

## Tokens & Tickets

- Token System: Users can earn/spend tokens via `TokenTransaction` (e.g., `CREATE_POST`, `MATCH_FOUND`, `RESOLVE_POST`, `TICKET_RAISE`).
- Tickets: Token-based mechanism to raise/resolve cases and incentivize resolution.

## Typical User Journey

1. Visit the site and sign up.
2. Login; `token` cookie is set.
3. Create a new hub (optional) or join an existing hub near you.
4. Create a LOST or FOUND post in that hub.
5. Engage via comments or private chat; share images or locations.
6. If a match is found, mark posts `MATCHED`; once returned/resolved, mark `RESOLVED`.
7. Moderators assist with disputes or enforcement as needed.
8. Tokens reflect actions (earn/spend) and can tie into ticketing flows.

## Notes

- Geo features use 2dsphere indexes for hubs and posts.
- Text search is enabled across users, hubs, posts, and comments.
- Auth-required routes expect the `token` cookie; ensure cookies are sent from the client.
