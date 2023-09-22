import { UserButton } from "@clerk/nextjs";
import MobileSidebar from "@/components/mobile-sidebar";
import { DrizzleChat } from "@/lib/db/schema";

type Props = {
    chats: DrizzleChat[];
}
const Navbar = async (
    { chats }: Props
) => {

  return (
    <div className="flex items-center p-4">
      <MobileSidebar chats={chats}/>
      <div className="flex w-full justify-end">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default Navbar;
