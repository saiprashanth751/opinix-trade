"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { WhiteBtn } from "@/components/WhiteBtn";
import { BlackBtn } from "@/components/BlackBtn";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { name: "Events", path: "/events" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Recharge", path: "/wallet/deposit" },
  ];

  const NavButton = ({ children, path }:any) => (
    <Link href={path}>
      <button className="font-medium p-2 rounded transition duration-300">
        {children}
      </button>
    </Link>
  );

  return (
    <nav className="py-3 px-2 border">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href={"/"}>
          <button onClick={() => {}}>
            <div className="text-2xl font-semibold mr-5">OpiniX</div>
          </button>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {navItems.map((item) => (
            <NavButton key={item.name} path={item.path}>
              {item.name}
            </NavButton>
          ))}
        </div>

        {/* Desktop Icons */}
        <div className="hidden md:flex space-x-4">
          <p className="text-xs mb-2 text-right">
            For 18 years and <br />
            above only
          </p>
          <WhiteBtn text="Download App" />
          <BlackBtn text="Trade Online" />
        </div>

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="md:hidden">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white text-black p-4 rounded-md shadow-lg">
          <p className="text-xs w-full text-center mb-2">
            For 18 years and above only
          </p>
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <NavButton
                key={item.name}
                path={item.path}
                onClick={toggleMenu}
              >
                {item.name}
              </NavButton>
            ))}

            <div className="flex gap-3 mt-2">
              <WhiteBtn text="Download App" />
              <BlackBtn text="Trade Online" />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
