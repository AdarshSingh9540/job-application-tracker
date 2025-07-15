"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  MessageCircle,
  Calendar,
  Settings,
  LogOut,
  UserRoundPlus,
  ChevronsUpDown,
  Plus,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "../../public/programmer.png";
import Image from "next/image";
import { SiGnuprivacyguard } from "react-icons/si";
import { GrDocumentStore } from "react-icons/gr";
import { signOut, signIn, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CgHome } from "react-icons/cg";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const mainSidebarItems = [
  { icon: CgHome, label: "Dashboard", href: "/" },
  { icon: UserRoundPlus, label: "Add Application", href: "/add-application" },
  { icon: FileText, label: "Application Status", href: "/application-status" },
  // { icon: MessageCircle, label: "Chats", href: "/chat" },
  { icon: Calendar, label: "Add Questions", href: "/add-questions" },
  { icon: GrDocumentStore, label: "Question Bank", href: "/question-bank" },
  {
    icon: SiGnuprivacyguard,
    label: "Personal Assets",
    href: "/personal-assest",
    disabled: true,
  },
];

const bottomSidebarItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="border-b-0 p-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Image
              src={logo || "/placeholder.svg"}
              alt="Let's Connect Logo"
              width={20}
              height={20}
              className="rounded-sm"
            />
          </div>
          <span className="text-lg font-semibold text-foreground">
            Let's Connect
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainSidebarItems.map((item) => {
                const isActive = pathname === item.href;
                const isDisabled = item.disabled;

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild={!isDisabled}
                      isActive={isActive && !isDisabled}
                      disabled={isDisabled}
                      className={cn(
                        "h-11 rounded-full px-4 text-sm font-medium transition-all",
                        isDisabled
                          ? "text-gray-500 cursor-not-allowed hover:bg-transparent"
                          : isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {isDisabled ? (
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </div>
                          <Lock className="h-4 w-4" />
                        </div>
                      ) : (
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* <SidebarGroup className="mt-8">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {bottomSidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "h-11 rounded-full px-4 text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
      </SidebarContent>

      <SidebarFooter className="p-4">
        {isLoading ? (
          <div className="flex items-center gap-2 p-2">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            <div className="flex-1">
              <div className="h-3 bg-muted rounded animate-pulse mb-1" />
              <div className="h-2 bg-muted rounded animate-pulse w-2/3" />
            </div>
          </div>
        ) : session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-2 hover:bg-accent"
              >
                <div className="flex items-center gap-2 w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user.image || ""}
                      alt={session.user.name || ""}
                    />
                    <AvatarFallback className="text-xs">
                      {session.user.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {session.user.email}
                    </p>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={() => signIn()} variant="outline" className="w-full">
            Sign In
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
