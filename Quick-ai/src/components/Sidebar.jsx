import { NavLink } from "react-router-dom";
import { Protect, useClerk, useUser } from "@clerk/clerk-react";
import {
  Eraser,
  FileText,
  Hash,
  House,
  Image,
  LogOut,
  Scissors,
  SquarePen,
  User,
  Users,
} from "lucide-react";
import React from "react";

const navItems = [
  { to: "/ai", label: "Dashboard", Icon: House },
  { to: "/ai/write-article", label: "Write Article", Icon: SquarePen },
  { to: "/ai/blog-titles", label: "Blog Titles", Icon: Hash },
  { to: "/ai/generate-images", label: "Generate Images", Icon: Image },
  { to: "/ai/remove-background", label: "Remove Background", Icon: Eraser },
  { to: "/ai/remove-object", label: "Remove Object", Icon: Scissors },
  { to: "/ai/review-resume", label: "Review Resume", Icon: FileText },
  { to: "/ai/community", label: "Community", Icon: Users },
];

const Sidebar = ({ sidebar }) => {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  return (
    <div
      className={`w-60 bg-white border-r border-gray-200 flex flex-col max-sm:absolute top-14 bottom-0
      ${sidebar ? "translate-x-0" : "max-sm:-translate-x-full"}
      transition-all duration-300`}
    >
      {/* User */}
      <div className="my-7 w-full text-center">
        <img
          src={user.imageUrl}
          alt=""
          className="w-14 h-14 rounded-full mx-auto"
        />
        <h1 className="mt-1 font-medium">{user.fullName}</h1>
      </div>

      <div className="flex flex-col gap-2 px-4">
        {navItems.map(({ to, label, Icon }, index) => (
          <NavLink
            key={index}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm
              ${
                isActive
                  ? "bg-gradient-to-r frm-[#3C81F6] to-[#9234EA] font-semibold"
                  : "hover:bg-gray-50"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </div>

      <div className="w-full border-t border-gray-200 p-4 px-9 py-18 flex items-center justify-between">
        <div onClick={openUserProfile} className="flex gap-2 items-center cursor-pointer"> 
          <img src={user.imageUrl} alt="" className="w-8 rounded-full flex items-center"/>
          <div>
            <h1 className="text-sm font-medium">{user.fullName}</h1>
            <p className="text-xs text-gray-500">
              <Protect plan='premium' fallback="Free">Premium</Protect>
              Plan
            </p>
          </div>
        </div>
        <LogOut onClick={signOut} />
      </div>
    </div>
  );
};

export default Sidebar;
