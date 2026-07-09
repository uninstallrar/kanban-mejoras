"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "corporativo" | "recursos-humanos" | "lobo-negro";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  coverPhoto: string | null;
  setCoverPhoto: (photo: string | null) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("lobo-negro"); // Lobo Negro default
  const [coverPhoto, setCoverPhotoState] = useState<string | null>(null);

  useEffect(() => {
    // Carga de localStorage en cliente
    const savedTheme = localStorage.getItem("kanban-theme") as Theme | null;
    if (savedTheme && ["corporativo", "recursos-humanos", "lobo-negro"].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
    const savedCover = localStorage.getItem("kanban-cover-photo");
    if (savedCover) {
      setCoverPhotoState(savedCover);
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("kanban-theme", t);
    // Aplicamos clase de modo oscuro global si es lobo-negro
    if (t === "lobo-negro") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const setCoverPhoto = (photo: string | null) => {
    setCoverPhotoState(photo);
    if (photo) {
      localStorage.setItem("kanban-cover-photo", photo);
    } else {
      localStorage.removeItem("kanban-cover-photo");
    }
  };

  // Sincronizar clase oscura del documento al cambiar el tema
  useEffect(() => {
    if (theme === "lobo-negro") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, coverPhoto, setCoverPhoto }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return ctx;
}
