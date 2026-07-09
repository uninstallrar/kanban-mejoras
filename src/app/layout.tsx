import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { isSupabaseConfigured } from "@/services/supabaseClient";
import { ConfigMissingScreen } from "@/components/ConfigMissingScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "../index.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "CRM Kanban - Sistema de Gestión de Mejoras",
  description: "Sistema interno de seguimiento y priorización de mejoras y demandas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable}`}>
      <body className="antialiased min-h-screen text-slate-900 bg-slate-50 dark:bg-slate-950 dark:text-slate-50">
        <ErrorBoundary>
          {isSupabaseConfigured ? (
            <AuthProvider>
              <ThemeProvider>
                {children}
              </ThemeProvider>
            </AuthProvider>
          ) : (
            <ConfigMissingScreen />
          )}
        </ErrorBoundary>
      </body>
    </html>
  );
}
