import React, { createContext, useContext, useEffect, useState } from "react";
import * as api from "../services/api.js";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getProfile();
        setUser(me);
      } catch {
        /* not logged in */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (body) => {
    await api.login(body);
    const me = await api.getProfile();
    setUser(me);
  };
  const signup = async (body) => {
    await api.signup(body);
    const me = await api.getProfile();
    setUser(me);
  };
  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, setUser, login, signup, logout, loading }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
