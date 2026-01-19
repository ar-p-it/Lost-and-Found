import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    displayName: "",
  });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signup(form);
      navigate("/app");
    } catch (err) {
      setError(err.message || "Signup failed");
    }
  };

  return (
    <div className="auth-wrap container">
      <form className="auth-card" onSubmit={submit}>
        <h2 style={{ marginTop: 0 }}>Create Account</h2>
        <div className="field">
          <label>Username</label>
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Email</label>
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Display name (optional)</label>
          <input
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          />
        </div>
        {error && <div className="error">{error}</div>}
        <div className="cta" style={{ justifyContent: "space-between" }}>
          <button className="btn primary" type="submit">
            Create Account
          </button>
          <Link to="/login" className="btn">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}
