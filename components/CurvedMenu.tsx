"use client";

import React, { useState, useRef } from "react";
import { motion, useMotionValue, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, History, QrCode, LogOut } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useWallet } from "../contexts/WalletContext";

interface iNavItem {
  heading: string;
  href: string;
  subheading?: string;
  icon?: React.ReactNode;
  external?: boolean;
}

interface iNavLinkProps extends iNavItem {
  setIsActive: (isActive: boolean) => void;
  index: number;
  isDarkMode: boolean;
  isLogout?: boolean;
}

interface iCurvedNavbarProps {
  setIsActive: (isActive: boolean) => void;
  navItems: iNavItem[];
  isDarkMode: boolean;
}

interface iHeaderProps {
  navItems?: iNavItem[];
  footer?: React.ReactNode;
  isActive?: boolean;
  setIsActive?: (isActive: boolean) => void;
}

const MENU_SLIDE_ANIMATION = {
  initial: { x: "-100%" },
  enter: {
    x: "0",
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      type: "tween" as const
    }
  },
  exit: {
    x: "-100%",
    transition: {
      duration: 0.5,
      ease: [0.55, 0.06, 0.68, 0.19] as [number, number, number, number],
      type: "tween" as const
    },
  },
};

const CustomFooter: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  return (
    <div className="flex w-full text-sm justify-center text-university-red px-10 md:px-24 py-5">
      <div className="flex items-center space-x-2">
        <User size={20} />
        <span className="font-medium">MoWa - Mobile Wallet</span>
      </div>
    </div>
  );
};

const NavLink: React.FC<iNavLinkProps> = ({
  heading,
  href,
  setIsActive,
  index,
  icon,
  subheading,
  isDarkMode,
  isLogout,
  external,
}) => {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const router = useRouter();
  const { logout } = useAuth();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    const rect = ref.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLogout) {
      e.preventDefault();
      logout();
      router.push('/login');
    }
    setIsActive(false);
  };

  return (
    <motion.div
      onClick={handleClick}
      initial="initial"
      whileHover="whileHover"
      className="group relative flex items-center justify-between border-b border-university-red/30 py-4 transition-colors duration-500 md:py-6 uppercase"
    >
      <Link
        ref={ref}
        onMouseMove={handleMouseMove}
        href={href}
        className="w-full"
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        <div className="relative flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-university-red transition-colors duration-500 text-2xl font-thin mr-4">
              {index}.
            </span>
            <div className="flex items-center gap-3">
              <div className="text-university-red">{icon}</div>
              <div className="flex flex-col">
                <motion.span
                  variants={{
                    initial: { x: 0 },
                    whileHover: { x: 8 },
                  }}
                  transition={{
                    type: "spring",
                    staggerChildren: 0.075,
                    delayChildren: 0.25,
                  }}
                  className={`relative z-10 block text-2xl font-medium transition-colors duration-500 md:text-3xl ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                >
                  {heading.split("").map((letter, i) => {
                    return (
                      <motion.span
                        key={i}
                        variants={{
                          initial: { x: 0 },
                          whileHover: { x: 4 },
                        }}
                        transition={{ type: "spring" }}
                        className="inline-block"
                      >
                        {letter}
                      </motion.span>
                    );
                  })}
                </motion.span>
                {subheading && (
                  <span className={`text-sm normal-case ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    {subheading}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const Curve: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const height = typeof window !== 'undefined' ? window.innerHeight : 800;
  const width = 100;
  const initialPath = `M100 0 L200 0 L200 ${height} L100 ${height} Q-100 ${height / 2} 100 0`;
  const targetPath = `M100 0 L200 0 L200 ${height} L100 ${height} Q100 ${height / 2} 100 0`;

  const curve = {
    initial: { d: initialPath },
    enter: {
      d: targetPath,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
        delay: 0.1
      },
    },
    exit: {
      d: initialPath,
      transition: {
        duration: 0.6,
        ease: [0.55, 0.06, 0.68, 0.19] as [number, number, number, number]
      },
    },
  };

  return (
    <svg
      className="absolute top-0 right-0 w-[100px] stroke-none h-full pointer-events-none"
      style={{ fill: isDarkMode ? "#111827" : "#ffffff" }}
      viewBox="0 0 200 800"
      preserveAspectRatio="none"
    >
      <motion.path
        variants={curve}
        initial="initial"
        animate="enter"
        exit="exit"
      />
    </svg>
  );
};

const CurvedNavbar: React.FC<iCurvedNavbarProps & { footer?: React.ReactNode }> = ({
  setIsActive,
  navItems,
  footer,
  isDarkMode,
}) => {
  return (
    <motion.div
      variants={MENU_SLIDE_ANIMATION}
      initial="initial"
      animate="enter"
      exit="exit"
      className={`h-[100dvh] w-screen max-w-screen-sm fixed left-0 top-0 z-40 overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}
    >
      {/* Close Button - positioned at header height */}
      <button
        onClick={() => setIsActive(false)}
        className="absolute top-4 left-5 p-2 rounded-lg bg-university-red/10 hover:bg-university-red/20 transition-colors z-50"
      >
        <div className="relative w-5 h-5 flex items-center justify-center">
          <span className="block h-0.5 w-5 bg-university-red rotate-45 absolute"></span>
          <span className="block h-0.5 w-5 bg-university-red -rotate-45 absolute"></span>
        </div>
      </button>

      <div className="h-full pt-11 flex flex-col justify-between">
        <div className="flex flex-col text-5xl gap-3 mt-0 px-10 md:px-24">
          <div className="text-university-red border-b border-university-red/30 uppercase text-sm mb-4">
            <p className="font-medium">Navigation</p>
          </div>
          <section className="bg-transparent mt-0">
            <div className="mx-auto max-w-7xl">
              {navItems.map((item, index) => {
                return (
                  <NavLink
                    key={item.href}
                    {...item}
                    setIsActive={setIsActive}
                    index={index + 1}
                    isDarkMode={isDarkMode}
                    isLogout={item.heading === "Log Out"}
                  />
                );
              })}
            </div>
          </section>
        </div>
        {footer}
      </div>
      <Curve isDarkMode={isDarkMode} />
    </motion.div>
  );
};

// Menu Button Component (to be used in header)
export const MenuButton: React.FC<{
  isActive: boolean;
  onClick: () => void;
}> = ({ isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg flex items-center justify-center cursor-pointer bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
    >
      <div className="relative w-6 h-5 flex flex-col justify-between items-center">
        <span
          className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${isActive ? "rotate-45 translate-y-2" : ""
            }`}
        ></span>
        <span
          className={`block h-0.5 w-6 bg-white transition-opacity duration-300 ${isActive ? "opacity-0" : ""
            }`}
        ></span>
        <span
          className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${isActive ? "-rotate-45 -translate-y-2" : ""
            }`}
        ></span>
      </div>
    </button>
  );
};

const Header: React.FC<iHeaderProps> = ({ isActive, setIsActive }) => {
  const { isDarkMode } = useTheme();
  const { walletAddress } = useWallet();

  const navItems: iNavItem[] = [
    {
      heading: "Home",
      href: "/",
      icon: <User size={24} />,
    },
    {
      heading: "History",
      href: walletAddress
        ? `https://sepolia.etherscan.io/address/${walletAddress}`
        : "/history",
      icon: <History size={24} />,
      external: !!walletAddress,
    },
    {
      heading: "Scan",
      href: "/scan",
      icon: <QrCode size={24} />,
    },
    {
      heading: "Log Out",
      href: "/logout",
      icon: <LogOut size={24} />,
    },
  ];

  return (
    <>
      <AnimatePresence mode="wait">
        {isActive && (
          <CurvedNavbar
            setIsActive={setIsActive!}
            navItems={navItems}
            isDarkMode={isDarkMode}
            footer={<CustomFooter isDarkMode={isDarkMode} />}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
