const BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:7777";

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, { credentials: "include", ...opts });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

export const signup = (body) =>
  req("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
export const login = (body) =>
  req("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
export const logout = () => req("/logout", { method: "POST" });
export const getProfile = () => req("/profile");

// Hubs
export const createHub = (body) =>
  req("/hubs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
export const joinHub = (slugOrId) =>
  req(`/hubs/${encodeURIComponent(slugOrId)}/join`, { method: "POST" });

// Posts
export const createPost = (body) =>
  req("/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

// Chat
export const startChat = (postId) =>
  req("/chats/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId }),
  });
export const sendMessage = (chatId, body) =>
  req(`/chats/${chatId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
export const getMessages = (chatId) => req(`/chats/${chatId}/messages`);
