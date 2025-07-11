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
  LucideChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "../../public/programmer.png";
import Image from "next/image";
import { SiGnuprivacyguard } from "react-icons/si";
import { GrDocumentStore } from "react-icons/gr";
import { signOut, signIn, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CgHome } from "react-icons/cg";
const mainSidebarItems = [
  { icon: CgHome, label: "Dashboard", href: "/" },
  { icon: UserRoundPlus, label: "Add Application", href: "/add-application" },
  { icon: FileText, label: "Application Status", href: "/status" },
  {
    icon: SiGnuprivacyguard,
    label: "Personal Assets",
    href: "/personal-assest",
  },
  { icon: MessageCircle, label: "Chats", href: "/chat" },
  { icon: Calendar, label: "Add Questions", href: "/add-question" },
  { icon: GrDocumentStore, label: "Question Bank", href: "/question-bank" },
];

const bottomSidebarItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
  // Logout will be handled explicitly
  // { icon: LogOut, label: "Logout", href: null },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isLoading = status === "loading";

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
        <div className="flex items-center justify-center h-16">
          <Link href="/" className="flex items-center">
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
          <nav className="mt-4 px-4 flex-1">
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
                        <item.icon className="w-6 h-6 mr-2" />
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
              {/* User Info */}

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
                      <Link href={item.href!}>
                        <item.icon className="w-6 h-6 mr-2" />
                        {item.label}
                      </Link>
                    </Button>
                  </li>
                );
              })}
              <div className=" mt-4">
                {isLoading ? (
                  <p>Loading user...</p>
                ) : session?.user ? (
                  <div className="flex items-center text-white space-x-2 p-2 rounded">
                    <Avatar className="h-8 w-8 rounded-sm">
                      <AvatarImage
                        src={session.user.image || ""}
                        alt={session.user.name || ""}
                        className="rounded-none"
                      />
                      <AvatarFallback>
                        {session.user.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex justify-center items-center ">
                      <div>
                        {" "}
                        <p className="text-sm font-medium">
                          {session.user.name}
                        </p>
                        <p className="text-xs">{session.user.email}</p>
                      </div>
                      <LucideChevronsUpDown className="ml-2 h-4 w-4 cursor-pointer" />
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full mt-2"
                    onClick={() => signIn()}
                    variant="secondary"
                  >
                    Login
                  </Button>
                )}
              </div>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
