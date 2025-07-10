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
  UserRoundPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "../../public/programmer.png";
import Image from "next/image";
import { SiGnuprivacyguard } from "react-icons/si";
import { GrDocumentStore } from "react-icons/gr";

const mainSidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: UserRoundPlus, label: "Add Application", href: "/application" },
  { icon: FileText, label: "Applcation Status", href: "/status" },
  {
    icon: SiGnuprivacyguard,
    label: "Personal Assests",
    href: "/personal-assest",
  },
  { icon: MessageCircle, label: "Chats", href: "/chat" },
  { icon: Calendar, label: "Add Questions", href: "/add-question" },
  { icon: GrDocumentStore, label: "Question Bank", href: "/question-bank" },
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
          "fixed inset-y-0 left-0 z-50 w-64 bg-background transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-center h-16  ">
          <Link href="/" className="flex items-center ">
            <Image
              src={logo}
              alt="GuildUp Logo"
              width={40}
              height={60}
              className="rounded-md"
            />
            <span className="text-lg font-bold text-gray-900 mx-3">
              Let&apos;s Connect
            </span>
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
