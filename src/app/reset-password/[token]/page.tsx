// src/app/reset-password/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as authService from '@/services/authService'; // Adjust path if needed
import toast from 'react-hot-toast';
import { EnvelopeIcon, KeyIcon, ArrowPathIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon, HashtagIcon } from '@heroicons/react/24/outline';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState(''); // <-- Need email input
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Animation on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !otp || !password || !confirmPassword) {
        setError('Please fill in all fields.');
        return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Resetting password...");

    try {
      // Call service with email, otp, and password
      const response = await authService.resetPassword(email, otp, password);
      toast.dismiss(loadingToast);
      if (response.success) {
        setSuccess(true);
        toast.success(response.message || "Password reset successfully!");
        setTimeout(() => {
            router.push('/login');
        }, 2500);
      } else {
          setError(response.message || 'Failed to reset password.');
          toast.error(response.message || 'Failed to reset password.');
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error("Reset Password Error:", err);
      setError(err.message || 'An unexpected error occurred. The OTP might be invalid or expired.');
      toast.error(err.message || 'Failed to reset password. OTP might be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-36 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Soccer Stadium Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Field base */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900"></div>
        
        {/* Soccer field */}
        <div className="absolute top-[10%] left-[5%] right-[5%] bottom-[10%] bg-green-700/70 border-2 border-white/20 rounded-lg overflow-hidden">
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 w-48 h-48 border-2 border-white/30 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Center line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white/30 transform -translate-x-1/2"></div>
          
          {/* Center spot */}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white/50 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Goals */}
          <div className="absolute top-1/2 left-0 w-12 h-32 border-2 border-white/30 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-12 h-32 border-2 border-white/30 transform -translate-y-1/2"></div>
          
          {/* Penalty boxes */}
          <div className="absolute top-1/2 left-0 w-48 h-80 border-2 border-white/30 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-48 h-80 border-2 border-white/30 transform -translate-y-1/2"></div>
          
          {/* Goal area */}
          <div className="absolute top-1/2 left-0 w-24 h-48 border-2 border-white/30 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-24 h-48 border-2 border-white/30 transform -translate-y-1/2"></div>
          
          {/* Penalty spot left */}
          <div className="absolute top-1/2 left-36 w-2 h-2 bg-white/50 rounded-full transform -translate-y-1/2"></div>
          
          {/* Penalty spot right */}
          <div className="absolute top-1/2 right-36 w-2 h-2 bg-white/50 rounded-full transform -translate-y-1/2"></div>
          
          {/* Corner arcs */}
          <div className="absolute top-0 left-0 w-10 h-10 border-r-2 border-white/30 rounded-br-full"></div>
          <div className="absolute top-0 right-0 w-10 h-10 border-l-2 border-white/30 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-10 h-10 border-r-2 border-white/30 rounded-tr-full"></div>
          <div className="absolute bottom-0 right-0 w-10 h-10 border-l-2 border-white/30 rounded-tl-full"></div>
        </div>
        
        {/* Animated soccer players */}
        {/* Player 1 - Running */}
        <div className="absolute w-6 h-10 top-[30%] left-[10%] animate-player-run">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1.5 w-3 h-3 rounded-full bg-blue-500/90"></div>
            <div className="absolute top-3 left-1 w-4 h-5 bg-blue-600/80"></div>
            <div className="absolute bottom-0 left-1 w-1.5 h-2 rounded-full bg-blue-800/80 animate-player-legs"></div>
            <div className="absolute bottom-0 left-3.5 w-1.5 h-2 rounded-full bg-blue-800/80 animate-player-legs animation-delay-100"></div>
          </div>
        </div>
        
        {/* Player 2 - Defending */}
        <div className="absolute w-6 h-10 top-[40%] right-[25%] animate-player-defend">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1.5 w-3 h-3 rounded-full bg-blue-500/90"></div>
            <div className="absolute top-3 left-1 w-4 h-5 bg-blue-600/80"></div>
            <div className="absolute bottom-0 left-0 w-1.5 h-2 rounded-full bg-blue-800/80 animate-player-defend-legs"></div>
            <div className="absolute bottom-0 left-4.5 w-1.5 h-2 rounded-full bg-blue-800/80 animate-player-defend-legs animation-delay-100"></div>
          </div>
        </div>
        
        {/* Player 3 - Goalkeeper */}
        <div className="absolute w-6 h-10 top-[50%] right-[5%] animate-goalkeeper">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1.5 w-3 h-3 rounded-full bg-yellow-500/90"></div>
            <div className="absolute top-3 left-1 w-4 h-5 bg-yellow-600/80"></div>
            <div className="absolute bottom-0 left-0 w-1.5 h-2 rounded-full bg-yellow-800/80"></div>
            <div className="absolute bottom-0 left-4.5 w-1.5 h-2 rounded-full bg-yellow-800/80"></div>
            <div className="absolute top-4 right-0 h-4 w-0.5 bg-yellow-500/90 animate-goalkeeper-arms"></div>
            <div className="absolute top-4 left-0 h-4 w-0.5 bg-yellow-500/90 animate-goalkeeper-arms animation-delay-100"></div>
          </div>
        </div>
        
        {/* Soccer Ball */}
        <div className="absolute w-4 h-4 top-[45%] left-[35%] animate-ball">
          <div className="w-full h-full rounded-full bg-white/90 shadow-md"></div>
        </div>
        
        {/* Stadium elements */}
        <div className="absolute top-0 left-0 w-full h-[5%] bg-gradient-to-b from-white/10 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-[5%] bg-gradient-to-t from-white/10 to-transparent"></div>
        <div className="absolute top-0 left-0 h-full w-[5%] bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="absolute top-0 right-0 h-full w-[5%] bg-gradient-to-l from-white/10 to-transparent"></div>
      </div>

      {/* Radial light effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

      <div
        className={`relative z-10 max-w-md w-full space-y-8 backdrop-blur-md bg-white/20 p-8 md:p-10 rounded-2xl shadow-2xl border border-white/30 transition-all duration-700 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        {/* Light effect and prism */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute -inset-[1px] bg-gradient-to-tr from-emerald-200/20 via-transparent to-emerald-200/20 z-[-1] rounded-2xl"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-2xl rounded-full transform rotate-12 translate-x-10 -translate-y-10"></div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-200/20 blur-2xl rounded-full"></div>
        </div>

        <div>
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full shadow-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full shadow-lg transform -translate-y-1"></div>
            <KeyIcon className="h-8 w-8 text-white relative z-10 drop-shadow-md" />
            <div className="absolute -inset-1 bg-emerald-400/20 blur-xl rounded-full animate-pulse-slow"></div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Reset Your Password
          </h2>
          {!success && (
            <p className="mt-2 text-center text-sm text-white/80">
              Enter your email, the OTP sent to it, and your new password.
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-red-500/30 backdrop-blur-sm p-4 border-l-4 border-red-400 animate-fade-in">
            <p className="text-sm font-medium text-white">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-emerald-500/30 backdrop-blur-sm p-4 border-l-4 border-emerald-400 animate-fade-in">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-emerald-200 mr-2" />
              <p className="text-sm font-medium text-white">Password reset successfully! Redirecting to login...</p>
            </div>
          </div>
        )}

        {!success && ( // Only show form if not successful
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              {/* Email Input */}
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/60 group-focus-within:text-emerald-300 transition-colors">
                  <EnvelopeIcon className="h-5 w-5" aria-hidden="true"/>
                </span>
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="peer appearance-none block w-full pl-10 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm transition-all duration-200"
                  placeholder="Your account email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {/* OTP Input */}
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/60 group-focus-within:text-emerald-300 transition-colors">
                  <HashtagIcon className="h-5 w-5" aria-hidden="true"/>
                </span>
                <input
                  id="otp"
                  name="otp"
                  type="text" // Use text, pattern optional for numbers
                  inputMode="numeric" // Hint for mobile keyboards
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                  className="peer appearance-none block w-full pl-10 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm tracking-[0.3em] font-mono"
                  placeholder="6-Digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // Allow only numbers
                />
              </div>
              {/* New Password */}
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/60 group-focus-within:text-emerald-300 transition-colors">
                  <KeyIcon className="h-5 w-5" aria-hidden="true"/>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="peer appearance-none block w-full pl-10 pr-10 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm transition-all duration-200"
                  placeholder="New Password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white/80 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                </button>
              </div>
              {/* Confirm New Password */}
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/60 group-focus-within:text-emerald-300 transition-colors">
                  <KeyIcon className="h-5 w-5" aria-hidden="true"/>
                </span>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="peer appearance-none block w-full pl-10 pr-10 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm transition-all duration-200"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white/80 focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !email || !otp || !password || !confirmPassword}
                className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-150 ease-in-out relative overflow-hidden ${isLoading || !email || !otp || !password || !confirmPassword ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span className="absolute inset-0 overflow-hidden"><span className="absolute inset-0 rounded-xl bg-emerald-400/20 shine-effect"></span></span>
                <span className="relative flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </span>
              </button>
            </div>
          </form>
        )}

        <div className="text-sm text-center mt-6">
          <Link href="/login" className="font-medium text-emerald-300 hover:text-emerald-200 transition-colors relative inline-block group">
            Back to Sign in
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-emerald-400 group-hover:w-full transition-all duration-200"></span>
          </Link>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes shine-effect {
          0% {
            transform: translateX(-100%) rotate(20deg);
          }
          20%, 100% {
            transform: translateX(100%) rotate(20deg);
          }
        }
        .shine-effect {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shine-effect 4s infinite;
        }
        
        @keyframes player-run {
          0% { transform: translate(0, 0); }
          25% { transform: translate(50px, -20px); }
          50% { transform: translate(100px, 0); }
          75% { transform: translate(50px, 20px); }
          100% { transform: translate(0, 0); }
        }
        .animate-player-run {
          animation: player-run 10s infinite;
        }
        
        @keyframes player-legs {
          0%, 100% { transform: translateX(-1px); }
          50% { transform: translateX(1px); }
        }
        .animate-player-legs {
          animation: player-legs 0.3s infinite;
        }
        
        @keyframes player-defend {
          0% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          50% { transform: translateX(0); }
          75% { transform: translateX(10px); }
          100% { transform: translateX(0); }
        }
        .animate-player-defend {
          animation: player-defend 3s infinite;
        }
        
        @keyframes player-defend-legs {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .animate-player-defend-legs {
          animation: player-defend-legs 0.5s infinite;
        }
        
        @keyframes goalkeeper {
          0%, 40%, 60%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-goalkeeper {
          animation: goalkeeper 5s infinite;
        }
        
        @keyframes goalkeeper-arms {
          0%, 40%, 60%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(45deg); }
        }
        .animate-goalkeeper-arms {
          animation: goalkeeper-arms 5s infinite;
        }
        
        @keyframes ball {
          0% { transform: translate(0, 0); }
          20% { transform: translate(60px, -30px); }
          40% { transform: translate(120px, 0); }
          60% { transform: translate(180px, -20px); }
          80% { transform: translate(240px, 0); }
          100% { transform: translate(0, 0); }
        }
        .animate-ball {
          animation: ball 15s infinite;
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
      `}</style>
    </div>
  );
}