/**
 * DashboardLayout - Layout avec Sidebar pour les pages Dashboard et Editor
 * Projet Spé 4 - Layout principal de l'application
 */

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import React, { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex overflow-hidden relative">
        {/* Bouton menu mobile */}
        <Button
          variant="outline"
          size="sm"
          className="md:hidden fixed bottom-4 left-4 z-50 shadow-lg h-11 w-11 rounded-full p-0"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>

        {/* Overlay mobile */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Desktop */}
        <aside className="w-56 md:w-64 lg:w-80 border-r bg-background hidden md:block">
          <Sidebar />
        </aside>

        {/* Sidebar Mobile */}
        <aside
          className={`md:hidden fixed left-0 top-0 bottom-0 w-[90vw] sm:w-[85vw] max-w-80 border-r bg-background z-50 transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Navigation</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Sidebar />
            </div>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
