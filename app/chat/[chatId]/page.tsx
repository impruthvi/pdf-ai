import React from "react";
import { auth } from '@clerk/nextjs'
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from 'drizzle-orm';
import ChatSidebar from "@/components/ChatSidebar";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage: React.FC<Props> = async ({ params: { chatId } }) => {
    const { userId } = await auth()
    if(!userId) return redirect('/sign-in')

    const _chats = await db.select().from(chats).where(eq(chats.userId, userId));

    if(!_chats) return redirect('/');

    if(!_chats.find(chat => chat.id === parseInt(chatId))) return redirect('/');

  return <div className="flex max-h-screen overflow-scroll">
    <div className="flex w-full max-h-screen overflow-scroll">
        {/* Chat sidebar */}
        <div className="flex-[1] mx-w-xs">
            <ChatSidebar chats={_chats} chatId={parseInt(chatId)}/>
        </div>
        {/* PDF viewer */}
        <div className="max-h-screen p-4 overflow-scroll flex-[5]">
            {/* <PdfViewer /> */}
        </div>
        {/* Chat Component */}
        <div className="flex-[3] border-l-4 border-l-slate-250">
            {/* <ChatComponent /> */}
        </div>
    </div>
  </div>;
};

export default ChatPage;