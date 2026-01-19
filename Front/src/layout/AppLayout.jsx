import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    return saved === "light" ? "light" : "dark";
  });
  useEffect(() => {
    const cls = theme === "light" ? "theme-light" : "";
    document.documentElement.className = cls;
    localStorage.setItem("theme", theme);
  }, [theme]);
  const canPost = (user?.memberships || []).length > 0;
  return (
    <div className="navbar">
      <div className="inner container">
        <Link to="/app" className="brand">
          <div className="logo">L&F</div>
          <span>Lost & Found</span>
        </Link>
        <div className="search">
          <input placeholder="Search posts, tags, hubs" />
        </div>
        <div className="user-menu">
          <div className="avatar" />
          <span>{user?.displayName || user?.username}</span>
          <button
            className="btn"
            onClick={() => navigate("/app/create")}
            disabled={!canPost}
            title={!canPost ? "Join a hub to post" : ""}
          >
            Create Post
          </button>
          <button
            className="btn"
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          >
            {theme === "light" ? "Dark" : "Light"} Mode
          </button>
          <button className="btn ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <h4>Navigation</h4>
      <Link className="navlink" to="/app/feed">
        Global Feed
      </Link>
      <Link className="navlink" to="/app/feed?filter=open">
        Open
      </Link>
      <Link className="navlink" to="/app/feed?filter=lost">
        Lost
      </Link>
      <Link className="navlink" to="/app/feed?filter=found">
        Found
      </Link>
      <h4>Hubs</h4>
      <Link className="navlink" to="/app/h/city-central-station">
        City Central Station
      </Link>
    </aside>
  );
}

export default function AppLayout() {
  return (
    <>
      <Navbar />
      <div className="layout container">
        <Sidebar />
        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
}
