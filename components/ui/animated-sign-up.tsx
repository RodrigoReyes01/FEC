"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Sun,
  Moon,
} from "lucide-react";
import LionLogoTransparent from "../../app/components/LionLogoTransparent";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

const SignUpPage: React.FC = () => {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { signup } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isFirstNameFocused, setIsFirstNameFocused] = useState(false);
  const [isLastNameFocused, setIsLastNameFocused] = useState(false);
  const [isUniversityIdFocused, setIsUniversityIdFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

  const [isEmailValid, setIsEmailValid] = useState(true);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

  // Email validation - Enforce @ufm.edu
  const validateEmail = (email: string) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase()) && email.toLowerCase().endsWith("@ufm.edu");
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

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (confirmPassword) {
      setPasswordsMatch(e.target.value === confirmPassword);
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setPasswordsMatch(password === e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitted(true);
    setSignupError("");

    // Verificar que se hayan aceptado los términos y condiciones
    if (!rememberMe) {
      alert("Debes aceptar los términos y condiciones para continuar");
      return;
    }

    if (firstName && lastName && universityId && email && password && confirmPassword && validateEmail(email) && passwordsMatch) {
      try {
        // 1. Create Auth User
        const { data, error } = await signup(email, password, {
          first_name: firstName,
          last_name: lastName,
          university_id: universityId,
        });

        if (error) {
          setSignupError(error.message);
          return;
        }

        if (data?.user) {
          setIsCreatingWallet(true);

          try {
            // Get session token
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;

            if (!token) {
              throw new Error('No session token');
            }

            // Call API to create wallet
            const response = await fetch('/api/wallet/create', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
              throw new Error(result.error || 'Failed to create wallet');
            }

            // Success - redirect to main page
            router.push("/");
          } catch (walletErr: any) {
            console.error("Error creating wallet:", walletErr);
            setSignupError("Cuenta creada pero hubo un error generando la billetera. Por favor contacta soporte.");
          } finally {
            setIsCreatingWallet(false);
          }
        }
      } catch (err: any) {
        setSignupError(err.message || "Ocurrió un error inesperado");
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

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className={`rainbow-glow-border-thick ${isDarkMode
            ? 'bg-gray-900/95 border-gray-700/20'
            : 'bg-white/95 border-white/20'
            } backdrop-blur-sm rounded-3xl shadow-2xl p-8 border transition-all duration-300`}>
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <LionLogoTransparent size={80} />
              </div>
              <h1 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>Crear Cuenta</h1>
              <p className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Únete a tu billetera universitaria</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Name Field */}
              <div className="relative">
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onFocus={() => setIsFirstNameFocused(true)}
                  onBlur={() => setIsFirstNameFocused(false)}
                  className={`w-full px-4 py-3 border-2 rounded-xl backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-0 ${isDarkMode
                    ? 'bg-gray-800/50 text-white'
                    : 'bg-white/50 text-gray-900'
                    } ${isFirstNameFocused || firstName
                      ? 'border-university-red pt-6 pb-2'
                      : isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}
                  required
                />
                <label
                  htmlFor="firstName"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${isFirstNameFocused || firstName
                    ? 'top-2 text-xs text-university-red font-medium'
                    : `top-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`
                    }`}
                >
                  Nombre
                </label>
              </div>

              {/* Last Name Field */}
              <div className="relative">
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onFocus={() => setIsLastNameFocused(true)}
                  onBlur={() => setIsLastNameFocused(false)}
                  className={`w-full px-4 py-3 border-2 rounded-xl backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-0 ${isDarkMode
                    ? 'bg-gray-800/50 text-white'
                    : 'bg-white/50 text-gray-900'
                    } ${isLastNameFocused || lastName
                      ? 'border-university-red pt-6 pb-2'
                      : isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}
                  required
                />
                <label
                  htmlFor="lastName"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${isLastNameFocused || lastName
                    ? 'top-2 text-xs text-university-red font-medium'
                    : `top-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`
                    }`}
                >
                  Apellido
                </label>
              </div>

              {/* University ID Field */}
              <div className="relative">
                <input
                  type="text"
                  id="universityId"
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value)}
                  onFocus={() => setIsUniversityIdFocused(true)}
                  onBlur={() => setIsUniversityIdFocused(false)}
                  className={`w-full px-4 py-3 border-2 rounded-xl backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-0 ${isDarkMode
                    ? 'bg-gray-800/50 text-white'
                    : 'bg-white/50 text-gray-900'
                    } ${isUniversityIdFocused || universityId
                      ? 'border-university-red pt-6 pb-2'
                      : isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}
                  required
                />
                <label
                  htmlFor="universityId"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${isUniversityIdFocused || universityId
                    ? 'top-2 text-xs text-university-red font-medium'
                    : `top-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`
                    }`}
                >
                  Número de Carnet
                </label>
              </div>

              {/* Email Field */}
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  className={`w-full px-4 py-3 border-2 rounded-xl backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-0 ${isDarkMode
                    ? 'bg-gray-800/50 text-white'
                    : 'bg-white/50 text-gray-900'
                    } ${isEmailFocused || email
                      ? 'border-university-red pt-6 pb-2'
                      : isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    } ${!isEmailValid && email ? 'border-red-500' : ''
                    }`}
                  required
                />
                <label
                  htmlFor="email"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${isEmailFocused || email
                    ? 'top-2 text-xs text-university-red font-medium'
                    : `top-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`
                    }`}
                >
                  Correo Electrónico (@ufm.edu)
                </label>
                {!isEmailValid && email && (
                  <span className="text-red-500 text-sm mt-1 block">
                    Por favor ingresa un correo válido @ufm.edu
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  className={`w-full px-4 py-3 border-2 rounded-xl backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-0 pr-12 ${isDarkMode
                    ? 'bg-gray-800/50 text-white'
                    : 'bg-white/50 text-gray-900'
                    } ${isPasswordFocused || password
                      ? 'border-university-red pt-6 pb-2'
                      : isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}
                  required
                />
                <label
                  htmlFor="password"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${isPasswordFocused || password
                    ? 'top-2 text-xs text-university-red font-medium'
                    : `top-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`
                    }`}
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  className={`absolute right-4 top-3 transition-colors ${isDarkMode
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  onFocus={() => setIsConfirmPasswordFocused(true)}
                  onBlur={() => setIsConfirmPasswordFocused(false)}
                  className={`w-full px-4 py-3 border-2 rounded-xl backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-0 pr-12 ${isDarkMode
                    ? 'bg-gray-800/50 text-white'
                    : 'bg-white/50 text-gray-900'
                    } ${isConfirmPasswordFocused || confirmPassword
                      ? 'border-university-red pt-6 pb-2'
                      : isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    } ${!passwordsMatch && confirmPassword ? 'border-red-500' : ''
                    }`}
                  required
                />
                <label
                  htmlFor="confirmPassword"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${isConfirmPasswordFocused || confirmPassword
                    ? 'top-2 text-xs text-university-red font-medium'
                    : `top-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`
                    }`}
                >
                  Confirmar Contraseña
                </label>
                <button
                  type="button"
                  className={`absolute right-4 top-3 transition-colors ${isDarkMode
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {!passwordsMatch && confirmPassword && (
                  <span className="text-red-500 text-sm mt-1 block">
                    Las contraseñas no coinciden
                  </span>
                )}
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
                  <span className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Acepto los Términos y Condiciones</span>
                </label>
              </div>

              {/* Error Message */}
              {signupError && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-xl text-sm">
                  {signupError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-university-red text-white py-3 rounded-xl font-semibold hover:bg-university-red-light transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isCreatingWallet || (isFormSubmitted && (!firstName || !lastName || !universityId || !email || !password || !confirmPassword || !isEmailValid || !passwordsMatch))}
              >
                {isCreatingWallet ? 'Creando billetera...' : 'Crear Cuenta'}
              </button>
            </form>

            {/* Sign In Link */}
            <p className={`text-center text-sm mt-6 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
              ¿Ya tienes una cuenta?{" "}
              <button
                onClick={() => router.push("/login")}
                className="text-university-red hover:underline font-medium bg-transparent border-none cursor-pointer"
              >
                Iniciar sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;