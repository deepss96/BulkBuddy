'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Page = 'dashboard' | 'bulk-messages' | 'scheduled' | 'templates' | 'broadcast' | 'contacts' | 'groups' | 'jobs' | 'logs' | 'settings' | 'connections' | 'imports' | 'profile';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
}

interface AppContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  connectedSession: { number: string; name: string; status: 'connected' | 'disconnected' | 'connecting' } | null;
  setConnectedSession: (s: any) => void;
  isLoggedIn: boolean;
  isInitializing: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  user: User | null;
  refreshUser: () => Promise<void>;
  apiUrl: string;
  phones: any[];
  fetchConnections: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({} as any);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [connectedSession, setConnectedSession] = useState<any>({
    number: '+91 85271 84400',
    name: 'Local test',
    status: 'connected',
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = useCallback(async (token: string): Promise<User | null> => {
    try {
      const res = await fetch(`${API_URL}/api/v1/user/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        return data as User;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const userData = await fetchUser(token);
    if (userData) {
      setUser(userData);
    }
  }, [fetchUser]);

  const [phones, setPhones] = useState<any[]>([]);

  const fetchConnections = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/whatsapp/connections`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.error) setPhones(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch connections whenever logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchConnections();
    }
  }, [isLoggedIn, fetchConnections]);

  // Heartbeat for WhatsApp session safety
  useEffect(() => {
    if (!isLoggedIn) return;
    const token = localStorage.getItem('token');
    
    const sendHeartbeat = async () => {
      if (!token) return;
      try {
        await fetch(`${API_URL}/api/v1/whatsapp/heartbeat`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) {
        console.error('Heartbeat failed', e);
      }
    };

    // Send immediately and then every 30 seconds
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');

      if (urlToken) {
        localStorage.setItem('token', urlToken);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Register PWA service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(console.error);
      }

      const token = localStorage.getItem('token');
      if (token) {
        fetchUser(token).then(userData => {
          if (userData) {
            setUser(userData);
            setIsLoggedIn(true);
          } else {
            localStorage.removeItem('token');
          }
          setIsInitializing(false);
        });
      } else {
        setIsInitializing(false);
      }
    }
  }, [fetchUser]);

  const login = async (token: string) => {
    localStorage.setItem('token', token);
    const userData = await fetchUser(token);
    if (userData) {
      setUser(userData);
    }
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage('dashboard');
  };

  return (
    <AppContext.Provider value={{
      currentPage,
      setCurrentPage,
      connectedSession,
      setConnectedSession,
      isLoggedIn,
      isInitializing,
      login,
      logout,
      user,
      refreshUser,
      apiUrl: API_URL,
      phones,
      fetchConnections,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
