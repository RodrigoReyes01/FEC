import React, { useState } from "react";
import CurvedMenu, { MenuButton } from "../CurvedMenu";

const CurvedMenuDemo = () => {
  const [isMenuActive, setIsMenuActive] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      {/* Your existing header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Hamburger Menu Button */}
          <MenuButton 
            isActive={isMenuActive} 
            onClick={() => setIsMenuActive(!isMenuActive)} 
          />
          
          {/* Your Logo - Centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">L</span>
              </div>
              <span className="text-white font-semibold">Your Brand</span>
            </div>
          </div>
          
          {/* Right side content (if any) */}
          <div className="w-10 h-10"></div>
        </div>
      </header>

      {/* Curved Menu Component */}
      <CurvedMenu 
        isActive={isMenuActive}
        setIsActive={setIsMenuActive}
      />
      
      {/* Main content */}
      <main className="pt-20">
        <div className="text-white h-screen text-7xl text-center flex justify-center items-center">
          hello<span className="italic">!</span>
        </div>
      </main>
    </div>
  );
};

export { CurvedMenuDemo };