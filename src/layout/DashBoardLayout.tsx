"use client";

import type React from "react";

import { useState } from "react";
import { AppSidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-white">
      <SidebarProvider>
        <AppSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </header>
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <Navbar
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            title={title}
          />

          <main className="flex-1 overflow-y-auto">
            <div className="p-4">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
