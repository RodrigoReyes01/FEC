"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Github,
  Twitter,
  Linkedin,
  Sun,
  Moon,
} from "lucide-react";
import LionLogoTransparent from "../../app/components/LionLogoTransparent";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Email validation
  const validateEmail = (email: string) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (e.target.value) {
      setIsEmailValid(validateEmail(e.target.value));
    } else {
      setIsEmailValid(true);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitted(true);
    setLoginError("");
    
    if (email && password && validateEmail(email)) {
      const success = login(email, password);
      if (success) {
        // Redirect to main wallet page
        router.push("/");
      } else {
        setLoginError("Invalid credentials. Please try again.");
      }
    }
  };

  // Theme is now managed by ThemeContext

  // Create particles
  useEffect(() => {
    const canvas = document.getElementById("particles") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = isDarkMode
          ? `rgba(255, 255, 255, ${Math.random() * 0.2})`
          : `rgba(255, 255, 255, ${Math.random() * 0.3})`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000));

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const particle of particles) {
        particle.update();
        particle.draw();
      }
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
    };
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-university-red relative overflow-hidden">
      <canvas id="particles" className="absolute inset-0 pointer-events-none"></canvas>
      
      <button
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
        onClick={toggleDarkMode}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          <div className={`rainbow-glow-border-thick relative ${
            isDarkMode 
              ? 'bg-gray-900/95 border-gray-700/20' 
              : 'bg-white/95 border-white/20'
          } backdrop-blur-sm rounded-3xl shadow-2xl p-8 border transition-all duration-300`}>
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <LionLogoTransparent size={80} />
              </div>
              <h1 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Welcome Back</h1>
              <p className={`transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Sign in to your university wallet</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  className={`w-full px-4 py-3 border-2 rounded-xl backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-0 ${
                    isDarkMode 
                      ? 'bg-gray-800/50 text-white' 
                      : 'bg-white/50 text-gray-900'
                  } ${
                    isEmailFocused || email
                      ? 'border-university-red pt-6 pb-2'
                      : isDarkMode ? 'border-gray-600' : 'border-gray-200'
                  } ${
                    !isEmailValid && email ? 'border-red-500' : ''
                  }`}
                  required
                />
                <label
                  htmlFor="email"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    isEmailFocused || email
                      ? 'top-2 text-xs text-university-red font-medium'
                      : `top-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`
                  }`}
                >
                  Email Address
                </label>
                {!isEmailValid && email && (
                  <span className="text-red-500 text-sm mt-1 block">
                    Please enter a valid email
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  className={`w-full px-4 py-3 border-2 rounded-xl backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-0 pr-12 ${
                    isDarkMode 
                      ? 'bg-gray-800/50 text-white' 
                      : 'bg-white/50 text-gray-900'
                  } ${
                    isPasswordFocused || password
                      ? 'border-university-red pt-6 pb-2'
                      : isDarkMode ? 'border-gray-600' : 'border-gray-200'
                  }`}
                  required
                />
                <label
                  htmlFor="password"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    isPasswordFocused || password
                      ? 'top-2 text-xs text-university-red font-medium'
                      : `top-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`
                  }`}
                >
                  Password
                </label>
                <button
                  type="button"
                  className={`absolute right-4 top-3 transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Form Options */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="w-4 h-4 text-university-red border-gray-300 rounded focus:ring-university-red"
                  />
                  <span className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Remember me</span>
                </label>
                <a href="#" className="text-sm text-university-red hover:underline">
                  Forgot Password?
                </a>
              </div>

              {/* Error Message */}
              {loginError && (
                <div className="text-red-500 text-sm text-center">
                  {loginError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-university-red text-white py-3 rounded-xl font-semibold hover:bg-university-red-light transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isFormSubmitted && (!email || !password || !isEmailValid)}
              >
                Sign In
              </button>
            </form>

            {/* Sign Up Link */}
            <p className={`text-center text-sm mt-6 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Don't have an account?{" "}
              <button 
                onClick={() => router.push("/signup")}
                className="text-university-red hover:underline font-medium bg-transparent border-none cursor-pointer"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;