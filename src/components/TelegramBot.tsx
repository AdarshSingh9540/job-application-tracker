"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

export function TelegramBotIndicator() {
  const botUsername = "ApplyIQ_bot";
  const telegramUrl = `https://t.me/${botUsername}`;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative group">
        <Button
          asChild
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200 group"
        >
          <Link
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with our Telegram bot"
          >
            <MessageCircle className="h-7 w-7 text-primary-foreground group-hover:scale-110 transition-transform" />
          </Link>
        </Button>

        {/* Speech bubble tooltip */}
        <div className="absolute right-20 bottom-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="relative bg-gray-800 text-white text-sm px-4 py-3 rounded-lg shadow-lg w-72">
            <p>
              👋 Hi! I’m your Telegram assistant. Manage your applications
              seamlessly — all it takes is one click! just send /start.
            </p>
            {/* Triangle pointer */}
            <div className="absolute top-1/2 right-[-8px] -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-gray-800"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
