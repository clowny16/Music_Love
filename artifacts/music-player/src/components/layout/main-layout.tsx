import React from "react";
import { Sidebar } from "./sidebar";
import { TopNavBar } from "./top-nav-bar";
import { MobileNav } from "./mobile-nav";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary-container selection:text-on-primary-container">
      <TopNavBar />
      <Sidebar />
      
      <main className="md:pl-64 pt-20 pb-24 md:pb-8 px-6 min-h-screen custom-scrollbar">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
