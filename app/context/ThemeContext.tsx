"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  autoRefresh: boolean;
  toggleAutoRefresh: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedDark = localStorage.getItem("darkMode");
    const savedAuto = localStorage.getItem("autoRefresh");
    if (savedDark !== null) {
      setDarkMode(JSON.parse(savedDark));
    }
    if (savedAuto !== null) {
      setAutoRefresh(JSON.parse(savedAuto));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("autoRefresh", JSON.stringify(autoRefresh));
  }, [autoRefresh, mounted]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleAutoRefresh = () => setAutoRefresh(!autoRefresh);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, autoRefresh, toggleAutoRefresh }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
