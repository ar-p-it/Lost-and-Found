import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const body = identifier.includes("@")
        ? { email: identifier, password }
        : { username: identifier, password };
      await login(body);
      navigate("/app");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="auth-wrap container">
      <form className="auth-card" onSubmit={submit}>
        <h2 style={{ marginTop: 0 }}>Login</h2>
        <div className="field">
          <label>Username or Email</label>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <div className="error">{error}</div>}
        <div className="cta" style={{ justifyContent: "space-between" }}>
          <button className="btn primary" type="submit">
            Login
          </button>
          <Link to="/signup" className="btn">
            Create Account
          </Link>
        </div>
      </form>
    </div>
  );
}
