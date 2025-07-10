"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Gift,
  MessageCircle,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// import logo from "../../public/logo/Frame 1437253029.jpg";
import Image from "next/image";
const mainSidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "My Guild", href: "/guild" },
  { icon: FileText, label: "Content Feed", href: "/content" },
  { icon: Gift, label: "My Offerings", href: "/offerings" },
  { icon: MessageCircle, label: "Chats", href: "/chat" },
  { icon: Calendar, label: "Bookings", href: "/bookings" },
  { icon: CreditCard, label: "Payments", href: "/payments" },
];

const bottomSidebarItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: LogOut, label: "Logout", href: "/logout" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-primary-foreground transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4">
          <Link href="/" className="flex items-center space-x-2">
            {/* <Image src={logo} alt="guildup" width={120} height={120} /> */}
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex flex-col h-full">
          {/* Main Navigation */}
          <nav className="mt-8 px-4 flex-1">
            <ul className="space-y-2">
              {mainSidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.label}>
                    <Button
                      asChild
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start text-muted hover:bg-primary/80 hover:text-primary-foreground",
                        isActive && "bg-primary/80 text-primary-foreground"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </Link>
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom Navigation */}
          <nav className="px-4 pb-20">
            <ul className="space-y-2">
              {bottomSidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.label}>
                    <Button
                      asChild
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start text-muted hover:bg-primary/80 hover:text-primary-foreground",
                        isActive && "bg-primary/80 text-primary-foreground"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </Link>
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
