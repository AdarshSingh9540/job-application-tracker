"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  onMenuClick: () => void;
  title?: string;
}

export function Navbar({ onMenuClick, title = "Dashboard" }: NavbarProps) {
  const { data: session, status } = useSession();

  return (
    <header className="shadow-sm border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden mr-2"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5 text-gray-950" />
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="search"
              placeholder="Search"
              className="pl-10 w-80 border-input"
            />
          </div>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 w-2 h-2 p-0 flex items-center justify-center"
            >
              <span className="sr-only">New notifications</span>
            </Badge>
          </Button>

          {status === "loading" ? (
            <p>Loading...</p>
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-1 h-auto p-2 cursor-pointer"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={
                        session.user?.image ||
                        "/placeholder.svg?height=32&width=32"
                      }
                      alt={session.user?.name || "User"}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {session.user?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-foreground">
                      {session.user?.name || "User"}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => signOut()}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button onClick={() => signIn()}>Login</Button>
              <Button>Get Started</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
