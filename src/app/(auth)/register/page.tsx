'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as authService from '@/services/authService';

// Sports-themed decorative element
const CricketBallPattern = () => (
  <svg className="absolute w-full h-full opacity-5" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <pattern id="cricketPattern" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(45)">
      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
      <path d="M10 3 L10 17 M3 10 L17 10" stroke="currentColor" strokeWidth="0.5" />
    </pattern>
    <rect width="100%" height="100%" fill="url(#cricketPattern)" />
  </svg>
);

export default function RegisterPage() {
  const router = useRouter();

  // --- State ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptTerms: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Animation on mount
  useEffect(() => {
    setMounted(true);
    
    // Add floating particles effect
    const addParticles = () => {
      const container = document.getElementById('particles-container');
      if (!container) return;
      
      for (let i = 0; i < 15; i++) {
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

  // --- Input Handler ---
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? e.target.checked : value;

    setFormData({ ...formData, [name]: val });
  };

  // --- Submit Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic Client-Side Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }
    if (!formData.acceptTerms) {
      setError('You must accept the terms and conditions');
      setIsLoading(false);
      return;
    }

    // Prepare data for the API
    const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
    };

    try {
      console.log('Registering with:', userData);

      // Mock registration success with delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Uncomment this for actual API call
      // const registeredUser = await authService.register(userData);
      // console.log('Registration successful:', registeredUser);

      // Success animation before redirect
      document.getElementById('register-form').classList.add('scale-95', 'opacity-0');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect on success
      router.push('/');

    } catch (err) {
      console.error("Registration error:", err);
      setError(typeof err === 'string' ? err : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Blueprint Sports Court Background - Reused from main page for consistency */}
      <div className="absolute inset-0 z-0 overflow-hidden border-l border-b border-gray-100">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-sky-50"></div>
        
        {/* Blueprint grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), 
                            linear-gradient(to right, rgba(59, 130, 246, 0.2) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}></div>
        
        {/* Larger grid lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), 
                            linear-gradient(to right, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }}></div>
        
        {/* Technical annotations */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/3 right-1/4 w-32 h-16 border border-blue-400 rounded flex items-center justify-center">
            <span className="text-xs text-blue-600">SPEC: AUTH-02</span>
          </div>
          <div className="absolute bottom-1/3 left-1/4 w-32 h-16 border border-blue-400 rounded flex items-center justify-center">
            <span className="text-xs text-blue-600">SPEC: REGISTER-01</span>
          </div>
        </div>
        
        {/* Soccer field in background */}
        <div className="absolute top-1/4 right-1/4 w-1/3 h-1/4 border-2 border-blue-400/40 rounded overflow-hidden">
          <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-blue-400/40 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-blue-400/40 transform -translate-x-1/2"></div>
          <div className="absolute top-1/5 bottom-1/5 left-0 w-1/6 border-r-2 border-blue-400/40"></div>
          <div className="absolute top-1/5 bottom-1/5 right-0 w-1/6 border-l-2 border-blue-400/40"></div>
        </div>
        
        {/* Technical circles */}
        <div className="absolute top-1/4 left-1/4 w-6 h-6 border-2 border-blue-400/40 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-blue-400/40 rounded-full"></div>
        </div>
        <div className="absolute bottom-1/4 right-1/4 w-6 h-6 border-2 border-blue-400/40 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-blue-400/40 rounded-full"></div>
        </div>
      </div>
      
      {/* Particles container for floating elements */}
      <div id="particles-container" className="absolute inset-0 z-10 pointer-events-none"></div>

      {/* Radial light effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-accent-500/5 blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-primary-500/10 blur-3xl animate-pulse-slow animation-delay-700"></div>
      
      {/* Registration Form Container */}
      <div 
        id="register-form"
        className={`relative z-20 max-w-xl w-full backdrop-blur-md bg-white/90 p-8 md:p-10 rounded-2xl shadow-2xl border border-white/30 transition-all duration-700 ease-out ${
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
          {/* Logo with 3D effect and glow */}
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full shadow-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full shadow-lg transform -translate-y-1"></div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white relative z-10 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <div className="absolute -inset-1 bg-primary-400/20 blur-xl rounded-full animate-pulse-slow"></div>
          </div>
          
          <div className="text-center">
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500 pb-1">
              Create Your Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join{' '}
              <span className="font-semibold text-primary-600 relative inline-block">
                SportsBookSL
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-200"></span>
              </span>
              {' '}to book sports facilities across Sri Lanka
            </p>
          </div>

          {/* Enhanced error message with animation */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 border-l-4 border-red-400 animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.707-4.293a1 1 0 001.414 0L12 12.414l1.293 1.293a1 1 0 101.414-1.414L13.414 11l1.293-1.293a1 1 0 10-1.414-1.414L12 9.586l-1.293-1.293a1 1 0 00-1.414 1.414L10.586 11l-1.293 1.293a1 1 0 000 1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Full Name */}
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="peer appearance-none block w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl shadow-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all duration-200"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                <label 
                  htmlFor="name" 
                  className="absolute left-10 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-primary-600 peer-focus:text-sm"
                >
                  Full Name
                </label>
              </div>
              
              {/* Email */}
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="peer appearance-none block w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl shadow-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all duration-200"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <label 
                  htmlFor="email" 
                  className="absolute left-10 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-primary-600 peer-focus:text-sm"
                >
                  Email address
                </label>
              </div>
              
              {/* Phone */}
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className="peer appearance-none block w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl shadow-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all duration-200"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                <label 
                  htmlFor="phone" 
                  className="absolute left-10 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-primary-600 peer-focus:text-sm"
                >
                  Phone number (optional)
                </label>
              </div>
              
              {/* Password */}
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="peer appearance-none block w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl shadow-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all duration-200"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <label 
                  htmlFor="password" 
                  className="absolute left-10 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-primary-600 peer-focus:text-sm"
                >
                  Password
                </label>
                <p className="mt-1 ml-2 text-xs text-gray-500">Must be at least 6 characters long.</p>
              </div>
              
              {/* Confirm Password */}
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="peer appearance-none block w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl shadow-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all duration-200"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <label 
                  htmlFor="confirmPassword" 
                  className="absolute left-10 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-primary-600 peer-focus:text-sm"
                >
                  Confirm Password
                </label>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-center pt-2">
              <div className="flex items-center h-5">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="acceptTerms" className="text-gray-700 cursor-pointer">
                  I agree to the{' '}
                  <Link href="/terms" className="font-medium text-primary-600 hover:text-primary-500 transition-colors relative inline-block group">
                    Terms of Service
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-400 group-hover:w-full transition-all duration-200"></span>
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="font-medium text-primary-600 hover:text-primary-500 transition-colors relative inline-block group">
                    Privacy Policy
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-400 group-hover:w-full transition-all duration-200"></span>
                  </Link>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-150 ease-in-out relative overflow-hidden ${isLoading ? 'opacity-90' : ''}`}
                disabled={isLoading}
              >
                <span className="absolute inset-0 overflow-hidden">
                  <span className="absolute inset-0 rounded-xl bg-primary-400/20 shine-effect"></span>
                </span>
                <span className="relative flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span className="flex items-center">
                      Create Account
                      <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </span>
                  )}
                </span>
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors relative inline-block group">
                  Sign in
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-400 group-hover:w-full transition-all duration-200"></span>
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}