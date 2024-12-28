import { useState, useEffect } from 'react';

export function useGameSession(key) {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  });

  const saveSession = (data) => {
    localStorage.setItem(key, JSON.stringify(data));
    setSession(data);
  };

  const clearSession = () => {
    localStorage.removeItem(key);
    setSession(null);
  };

  return [session, saveSession, clearSession];
} 