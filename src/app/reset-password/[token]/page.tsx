// src/app/reset-password/[token]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as authService from '@/services/authService';
import toast from 'react-hot-toast';
import { EnvelopeIcon, KeyIcon, ArrowPathIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon, HashtagIcon } from '@heroicons/react/24/outline';

export default function ResetPasswordPage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get token from URL path parameter
  const token = params.token;
  
  // Get email from URL query parameters if available
  const emailFromQuery = searchParams ? searchParams.get('email') : null;

  const [email, setEmail] = useState(emailFromQuery || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // If token is "otp", we'll use the email+otp flow
  // Otherwise, we'll treat the token as the reset token itself (if your API supports this)
  const isOtpFlow = token === 'otp';

  // Animation on mount
  useEffect(() => {
    setMounted(true);
    
    // Add floating particles effect (optional)
    const addParticles = () => {
      const container = document.getElementById('particles-container');
      if (!container) return;
      // Clear existing particles if re-mounting
      container.innerHTML = '';
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 6 + 2;
        particle.className = `absolute rounded-full bg-white/10 blur-sm animate-float`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(particle);
      }
    };
    addParticles();
    
    // If the token isn't "otp" and looks like a proper token, we could use it directly
    if (!isOtpFlow && token && token.length > 5) {
      setOtp(token);
    }
  }, [token, isOtpFlow]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
        setError('Please fill in all required fields.');
        return;
    }
    
    // For OTP flow, require the OTP field to be filled
    if (isOtpFlow && !otp) {
        setError('Please enter the OTP sent to your email.');
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
      let response;
      if (isOtpFlow) {
        // Use the OTP flow with email + OTP + new password
        response = await authService.resetPassword(email, otp, password);
      } else {
        // If your API supports token-based reset, you could use this instead
        // response = await authService.resetPasswordWithToken(token, password);
        // For now, just use the token as the OTP
        response = await authService.resetPassword(email, token, password);
      }
      
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
      setError(err.message || 'An unexpected error occurred. The OTP/token might be invalid or expired.');
      toast.error(err.message || 'Failed to reset password. OTP/token might be invalid or expired.');
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
          
          {/* Goal posts left */}
          <div className="absolute top-[calc(50%-64px)] left-0 w-2 h-5 bg-white/80"></div>
          <div className="absolute top-[calc(50%+60px)] left-0 w-2 h-5 bg-white/80"></div>
          <div className="absolute top-[calc(50%-66px)] left-0 w-1 h-132 bg-white/80"></div>
          
          {/* Goal posts right */}
          <div className="absolute top-[calc(50%-64px)] right-0 w-2 h-5 bg-white/80"></div>
          <div className="absolute top-[calc(50%+60px)] right-0 w-2 h-5 bg-white/80"></div>
          <div className="absolute top-[calc(50%-66px)] right-0 w-1 h-132 bg-white/80"></div>
          
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
        
        {/* Player 3 - Red team dribbling */}
        <div className="absolute w-6 h-10 bottom-[35%] left-[40%] animate-player-dribble">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1.5 w-3 h-3 rounded-full bg-red-500/90"></div>
            <div className="absolute top-3 left-1 w-4 h-5 bg-red-600/80"></div>
            <div className="absolute bottom-0 left-1 w-1.5 h-2 rounded-full bg-red-800/80 animate-player-dribble-legs"></div>
            <div className="absolute bottom-0 left-3.5 w-1.5 h-2 rounded-full bg-red-800/80 animate-player-dribble-legs animation-delay-200"></div>
          </div>
        </div>
        
        {/* Player 4 - Goalkeeper */}
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
        
        {/* Player 5 - Passing */}
        <div className="absolute w-6 h-10 top-[60%] left-[20%] animate-player-pass">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1.5 w-3 h-3 rounded-full bg-blue-500/90"></div>
            <div className="absolute top-3 left-1 w-4 h-5 bg-blue-600/80"></div>
            <div className="absolute bottom-0 left-1 w-1.5 h-2 rounded-full bg-blue-800/80 animate-player-pass-legs"></div>
            <div className="absolute bottom-0 left-3.5 w-1.5 h-2 rounded-full bg-blue-800/80 animate-player-pass-legs animation-delay-100"></div>
          </div>
        </div>
        
        {/* Player 6 - Red team running */}
        <div className="absolute w-6 h-10 bottom-[40%] right-[30%] animate-player-run animation-delay-700">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1.5 w-3 h-3 rounded-full bg-red-500/90"></div>
            <div className="absolute top-3 left-1 w-4 h-5 bg-red-600/80"></div>
            <div className="absolute bottom-0 left-1 w-1.5 h-2 rounded-full bg-red-800/80 animate-player-legs"></div>
            <div className="absolute bottom-0 left-3.5 w-1.5 h-2 rounded-full bg-red-800/80 animate-player-legs animation-delay-300"></div>
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

      {/* Particles container */}
      <div id="particles-container" className="absolute inset-0 z-10 pointer-events-none"></div>

      {/* Radial light effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl animate-pulse-slow animation-delay-700"></div>

      <div
        className={`relative z-20 max-w-md w-full backdrop-blur-md bg-white/20 p-8 md:p-10 rounded-2xl shadow-2xl border border-white/30 transition-all duration-700 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        {/* Light effect and prism */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute -inset-[1px] bg-gradient-to-tr from-emerald-200/20 via-transparent to-emerald-200/20 z-[-1] rounded-2xl"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-2xl rounded-full transform rotate-12 translate-x-10 -translate-y-10"></div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-200/20 blur-2xl rounded-full"></div>
        </div>

        <div className="space-y-6 relative">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full shadow-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full shadow-lg transform -translate-y-1"></div>
            <KeyIcon className="h-8 w-8 text-white relative z-10 drop-shadow-md" />
            <div className="absolute -inset-1 bg-emerald-400/20 blur-xl rounded-full animate-pulse-slow"></div>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white pb-1">
              Reset Your Password
            </h2>
            {!success && (
              <p className="mt-2 text-sm text-white/80">
                {isOtpFlow 
                  ? "Enter your email, the OTP sent to it, and your new password." 
                  : "Enter your email and new password to complete the reset process."}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/30 backdrop-blur-sm p-4 border-l-4 border-red-400 animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0"><svg className="h-5 w-5 text-red-200" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.707-4.293a1 1 0 001.414 0L12 12.414l1.293 1.293a1 1 0 101.414-1.414L13.414 11l1.293-1.293a1 1 0 10-1.414-1.414L12 9.586l-1.293-1.293a1 1 0 00-1.414 1.414L10.586 11l-1.293 1.293a1 1 0 000 1.414z" clipRule="evenodd" /></svg></div>
                <div className="ml-3"><p className="text-sm font-medium text-white">{error}</p></div>
              </div>
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
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* Email Input */}
                <div className="group relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/60 group-focus-within:text-emerald-300 transition-colors">
                    <EnvelopeIcon className="h-5 w-5" aria-hidden="true"/>
                  </div>
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="peer appearance-none block w-full pl-10 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white sm:text-sm transition-all duration-200"
                    placeholder="Your account email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label htmlFor="reset-email" className="absolute left-10 -top-2.5 bg-emerald-800/80 px-1 text-sm text-white/80 transition-all peer-placeholder-shown:text-white/60 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-emerald-300 peer-focus:text-sm">Email address</label>
                </div>
                
                {/* OTP Input - Only show in OTP flow */}
                {isOtpFlow && (
                  <div className="group relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/60 group-focus-within:text-emerald-300 transition-colors">
                      <HashtagIcon className="h-5 w-5" aria-hidden="true"/>
                    </div>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                      maxLength={6}
                      className="peer appearance-none block w-full pl-10 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white sm:text-sm tracking-[0.3em] font-mono transition-all duration-200"
                      placeholder="6-Digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      autoFocus={!!emailFromQuery}
                    />
                    <label htmlFor="otp" className="absolute left-10 -top-2.5 bg-emerald-800/80 px-1 text-sm text-white/80 transition-all peer-placeholder-shown:text-white/60 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-emerald-300 peer-focus:text-sm">6-Digit OTP</label>
                  </div>
                )}
                
                {/* New Password */}
                <div className="group relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/60 group-focus-within:text-emerald-300 transition-colors">
                    <KeyIcon className="h-5 w-5" aria-hidden="true"/>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="peer appearance-none block w-full pl-10 pr-10 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white sm:text-sm transition-all duration-200"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label htmlFor="password" className="absolute left-10 -top-2.5 bg-emerald-800/80 px-1 text-sm text-white/80 transition-all peer-placeholder-shown:text-white/60 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-emerald-300 peer-focus:text-sm">New Password (min. 6 characters)</label>
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
                <div className="group relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/60 group-focus-within:text-emerald-300 transition-colors">
                    <KeyIcon className="h-5 w-5" aria-hidden="true"/>
                  </div>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="peer appearance-none block w-full pl-10 pr-10 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white sm:text-sm transition-all duration-200"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <label htmlFor="confirm-password" className="absolute left-10 -top-2.5 bg-emerald-800/80 px-1 text-sm text-white/80 transition-all peer-placeholder-shown:text-white/60 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-emerald-300 peer-focus:text-sm">Confirm Password</label>
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
                  disabled={isLoading || !email || !password || !confirmPassword || (isOtpFlow && !otp)}
                  className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-150 ease-in-out relative overflow-hidden ${isLoading || !email || !password || !confirmPassword || (isOtpFlow && !otp) ? 'opacity-90 cursor-not-allowed' : ''}`}
                >
                  <span className="absolute inset-0 overflow-hidden"><span className="absolute inset-0 rounded-xl bg-emerald-400/20 shine-effect"></span></span>
                  <span className="relative flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span className="text-white/80">Resetting...</span>
                      </>
                    ) : (
                      <span className="flex items-center"><span>Reset Password</span></span>
                    )}
                  </span>
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link href="/login" className="font-medium text-emerald-300 hover:text-emerald-200 transition-colors relative inline-block group">
              Back to Sign in
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-emerald-400 group-hover:w-full transition-all duration-200"></span>
            </Link>
          </div>
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
        
        @keyframes player-dribble {
          0% { transform: translate(0, 0); }
          25% { transform: translate(80px, 30px); }
          50% { transform: translate(160px, 0); }
          75% { transform: translate(80px, -30px); }
          100% { transform: translate(0, 0); }
        }
        .animate-player-dribble {
          animation: player-dribble 15s infinite;
        }
        
        @keyframes player-dribble-legs {
          0%, 100% { transform: translateX(-2px); }
          50% { transform: translateX(2px); }
        }
        .animate-player-dribble-legs {
          animation: player-dribble-legs 0.2s infinite;
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
        
        @keyframes player-pass {
          0%, 20%, 80%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(10deg); }
        }
        .animate-player-pass {
          animation: player-pass 4s infinite;
        }
        
        @keyframes player-pass-legs {
          0%, 40%, 60%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        .animate-player-pass-legs {
          animation: player-pass-legs 4s infinite;
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
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
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
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        .animation-delay-700 {
          animation-delay: 0.7s;
        }
      `}</style>
    </div>
  );
}