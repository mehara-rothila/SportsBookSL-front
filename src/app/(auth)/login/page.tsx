// src/app/(auth)/login/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Import useRouter
import * as authService from '@/services/authService'; // Use correct path: '../../services/authService' or alias

// --- Social Icons ---
const GoogleIcon = () => (
  <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path d="M12 5.38c1.63 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    <path fill="none" d="M1 1h22v22H1z" />
  </svg>
);

const GithubIcon = () => (
   <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
     <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"></path>
   </svg>
);
// --- End Social Icons ---

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

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
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    console.log('Login form submitted with:', { email, password, rememberMe });

    try {
      // Call the actual authService login function
      const loginResponse = await authService.login(email, password);
      console.log('Login successful on frontend:', loginResponse);

      // Only proceed if login was truly successful (token received)
      if (loginResponse?.token) {
          // Optional: Success animation before redirect
          const loginFormElement = document.getElementById('login-form');
          if (loginFormElement) {
              loginFormElement.classList.add('scale-95', 'opacity-0');
              await new Promise(resolve => setTimeout(resolve, 300)); // Shorter delay
          }
          // Redirect on success using Next.js router
          router.push('/'); // Redirect to homepage or dashboard
          return; // Stop execution here after successful redirect
      } else {
          console.error("Login seemed successful but no token received.");
          setError('Login failed. Please try again.');
      }

    } catch (err: any) {
      // Handle errors thrown by authService.login
      console.error('Login failed on frontend:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      // Set loading to false only if we didn't redirect
      // Check if component might have unmounted due to redirect race condition
       if (typeof window !== 'undefined') { // Basic check if still in browser context
           setIsLoading(false);
       }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Blueprint Background */}
      <div className="absolute inset-0 z-0 overflow-hidden border-l border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-sky-50"></div>
        <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(to right, rgba(59, 130, 246, 0.2) 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
        <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(to right, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`, backgroundSize: '100px 100px' }}></div>
        {/* Other blueprint elements */}
      </div>

      {/* Particles container */}
      <div id="particles-container" className="absolute inset-0 z-10 pointer-events-none"></div>

      {/* Radial light effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-accent-500/5 blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-primary-500/10 blur-3xl animate-pulse-slow animation-delay-700"></div>

      {/* Form container */}
      <div
        id="login-form"
        className={`relative z-20 max-w-md w-full backdrop-blur-md bg-white/90 p-8 md:p-10 rounded-2xl shadow-2xl border border-white/30 transition-all duration-700 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        {/* Light effect and prism */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute -inset-[1px] bg-gradient-to-tr from-primary-200/20 via-transparent to-accent-200/20 z-[-1] rounded-2xl"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-2xl rounded-full transform rotate-12 translate-x-10 -translate-y-10"></div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary-200/20 blur-2xl rounded-full"></div>
        </div>

        <div className="space-y-6 relative">
          {/* Logo */}
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full shadow-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full shadow-lg transform -translate-y-1"></div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white relative z-10 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <div className="absolute -inset-1 bg-primary-400/20 blur-xl rounded-full animate-pulse-slow"></div>
          </div>

          {/* Welcome Text */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500 pb-1">Welcome Back!</h2>
            <p className="mt-2 text-sm text-gray-600">Sign in to continue to <span className="font-semibold text-primary-600 relative inline-block">SportsBookSL<span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-200"></span></span></p>
          </div>

          {/* Error message display */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 border-l-4 border-red-400 animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0"><svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.707-4.293a1 1 0 001.414 0L12 12.414l1.293 1.293a1 1 0 101.414-1.414L13.414 11l1.293-1.293a1 1 0 10-1.414-1.414L12 9.586l-1.293-1.293a1 1 0 00-1.414 1.414L10.586 11l-1.293 1.293a1 1 0 000 1.414z" clipRule="evenodd" /></svg></div>
                <div className="ml-3"><p className="text-sm font-medium text-red-800">{error}</p></div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Input Fields */}
            <div className="space-y-5">
              {/* Email */}
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg></div>
                <input id="email-address" name="email" type="email" autoComplete="email" required className="peer appearance-none block w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl shadow-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all duration-200" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}/>
                <label htmlFor="email-address" className="absolute left-10 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-primary-600 peer-focus:text-sm">Email address</label>
              </div>
              {/* Password */}
              <div className="group relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>
                <input id="password" name="password" type="password" autoComplete="current-password" required className="peer appearance-none block w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl shadow-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all duration-200" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                <label htmlFor="password" className="absolute left-10 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-primary-600 peer-focus:text-sm">Password</label>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative inline-block">
                  <input id="remember-me" name="remember-me" type="checkbox" className="sr-only peer" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}/>
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
                </div>
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
              </div>
              {/* --- MODIFIED: Used Next.js Link --- */}
              <div className="text-sm">
                  <Link href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-150 ease-in-out relative group">
                    Forgot password?
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500/50 group-hover:w-full transition-all duration-200"></span>
                  </Link>
              </div>
              {/* --- END MODIFIED --- */}
            </div>

            {/* Submit Button */}
            <div>
              <button type="submit" className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-150 ease-in-out relative overflow-hidden ${isLoading ? 'opacity-90 cursor-not-allowed' : ''}`} disabled={isLoading}>
                <span className="absolute inset-0 overflow-hidden"><span className="absolute inset-0 rounded-xl bg-primary-400/20 shine-effect"></span></span>
                <span className="relative flex items-center justify-center">
                  {isLoading ? ( <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span className="text-white/80">Processing...</span></> ) : ( <span className="flex items-center"><span>Sign in</span><svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></span> )}
                </span>
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6"><div className="relative"><div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300" /></div><div className="relative flex justify-center text-sm"><span className="px-4 py-1 bg-white text-gray-500 rounded-full shadow-md border border-gray-100">Or sign in with</span></div></div>
            {/* Social Login Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button type="button" className="group w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 ease-in-out relative overflow-hidden"><span className="absolute inset-0 bg-gradient-to-r from-red-50 to-red-100 opacity-0 group-hover:opacity-80 transition-opacity duration-300"></span><span className="relative flex items-center"><span className="bg-white p-1.5 rounded-full mr-2 shadow-sm border border-gray-100 group-hover:shadow-md transition-all duration-200"><GoogleIcon /></span><span className="font-medium group-hover:translate-x-0.5 transition-transform">Google</span></span></button>
              <button type="button" className="group w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 ease-in-out relative overflow-hidden"><span className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 opacity-0 group-hover:opacity-80 transition-opacity duration-300"></span><span className="relative flex items-center"><span className="bg-white p-1.5 rounded-full mr-2 shadow-sm border border-gray-100 group-hover:shadow-md transition-all duration-200"><GithubIcon /></span><span className="font-medium group-hover:translate-x-0.5 transition-transform">GitHub</span></span></button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-3">Don't have an account?</p>
            <Link href="/register" className="inline-flex items-center justify-center px-6 py-2.5 border border-primary-300 text-sm font-medium rounded-xl text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 ease-in-out group">
              <span className="group-hover:translate-x-0.5 transition-transform">Register now</span>
              <svg className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}