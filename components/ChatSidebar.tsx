"use client";

import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageCircle, PlusCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import axios from "axios";
import SubscriptionButton from "./SubscriptionButton";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
  isPro: boolean;
};

const ChatSidebar: React.FC<Props> = ({ chatId, chats, isPro }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubcription = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/stripe");
      window.location.href = response.data.url;
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen p-4 text-gray-200 bg-gray-900">
      <Link href="/">
        <Button className="w-full border-dotted border-white border">
          <PlusCircleIcon className="w-6 h-6 mr-2" />
          New Chat
        </Button>
      </Link>

      <div className="flex flex-col gap-2 mt-4">
        {chats.map((chat) => (
          <Link href={`/chat/${chat.id}`} key={chat.id}>
            <div
              className={cn("rounded-lg p-3 text-slate-300 items-center", {
                "bg-blue-800 text-white": chatId === chat.id,
                "hover:text-white": chatId !== chat.id,
              })}
            >
              <MessageCircle className="mr-2" />
              <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                {chat.pdfName}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="absolute bottom-4 left-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
          <Link href="/">Home</Link>
          <Link href="/">Source</Link>
          <SubscriptionButton isPro={isPro}/>
        </div>
        
      </div>
    </div>
  );
};

export default ChatSidebar;
