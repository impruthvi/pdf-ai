"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ChatSidebar from "./ChatSidebar";
import { useEffect, useState } from "react";
import { DrizzleChat } from "@/lib/db/schema";

interface MobileSidebarProps {
  chats: DrizzleChat[];
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ chats }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Sheet>
      <SheetTrigger>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <ChatSidebar chats={chats} />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
