import React from "react";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ChatSidebar from "@/components/ChatSidebar";
import Navbar from "@/components/navbar";

type Props = {
  params: {
    chatId: string;
  };
  // add children prop
  children: React.ReactNode;
};
const DashboardLayout = async ({ params: { chatId }, children }: Props) => {
  const { userId } = await auth();
  if (!userId) return redirect("/sign-in");

  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));

  if (!_chats) return redirect("/");

  if (!_chats.find((chat) => chat.id === parseInt(chatId)))
    return redirect("/");

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-gray-900">
        <ChatSidebar chats={_chats} />
      </div>
      <main className="md:pl-72">
        <Navbar chats={_chats}/>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
