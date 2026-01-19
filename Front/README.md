# Lost & Found Frontend

React (Vite) frontend for the Lost & Found platform.

## Run

```bash
cd Front
npm install
npm run dev
# open http://localhost:5173
```

Set backend base URL via `.env`:

```
VITE_API_BASE=http://localhost:7777
```

## Structure

- src/main.js — entry
- src/App.js — routes
- src/styles.css — global styles and animated map background
- src/layout/AppLayout.js — navbar + sidebar
- src/pages — Landing, Login, Signup, Feed, CreatePost, Hub, PostDetail
- src/components/PostCard.js — post card UI
- src/context/AuthContext.js — auth state (uses backend cookies)
- src/services/api.js — API helpers to your existing endpoints

## Notes

- Feed and Hub pages include placeholders; wire them to GET endpoints when available.
- Create Post only requires `hubSlug` (or change to `hubId`) matching backend `/posts`.
- Post detail’s Message Author uses `/chats/start` with `postId`.
