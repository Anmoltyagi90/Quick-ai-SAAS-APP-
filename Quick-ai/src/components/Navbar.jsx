import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { openSignIn } = useClerk();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-2xl bg-white/70 py-3 px-4 sm:px-20 xl:px-32 flex justify-between items-center">
      
      {/* Logo */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img
          src={assets.logo}
          alt="Quick.ai Logo"
          className="w-32 sm:w-40"
        />
      </div>

      {/* Auth Section */}
      {user ? (
        <UserButton afterSignOutUrl="/" />
      ) : (
        <button
          onClick={() => openSignIn()}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 transition px-4 py-2 rounded-xl text-white font-medium"
        >
          Get Started
          <ArrowRight size={18} />
        </button>
      )}
    </nav>
  );
};

export default Navbar;
