import { createContext, useContext, useState } from 'react';
import { api, clearAuth, getSavedUser, saveAuth } from '../api/client';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSavedUser());
  async function login(email, password) {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    saveAuth(data.token, data.user);
    setUser(data.user);
    return data.user;
  }
  async function signup(form) {
    const data = await api('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    saveAuth(data.token, data.user);
    setUser(data.user);
    return data.user;
  }
  function logout() {
    clearAuth();
    setUser(null);
  }
  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
