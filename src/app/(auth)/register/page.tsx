'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as authService from '@/services/authService';

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

     
     
      
      // Uncomment this for actual API call
      const registeredUser = await authService.register(userData);
      console.log('Registration successful:', registeredUser);

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
        
        {/* Player 7 - Sliding tackle */}
        <div className="absolute w-8 h-10 top-[80%] left-[60%] animate-slide-tackle">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1.5 w-3 h-3 rounded-full bg-blue-500/90"></div>
            <div className="absolute top-3 left-1 w-4 h-5 bg-blue-600/80 rotate-90 origin-top"></div>
            <div className="absolute top-3 left-6 w-1.5 h-5 rounded-full bg-blue-800/80"></div>
          </div>
        </div>
        
        {/* Player 8 - Jumping */}
        <div className="absolute w-6 h-10 top-[25%] right-[50%] animate-player-jump">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1.5 w-3 h-3 rounded-full bg-red-500/90"></div>
            <div className="absolute top-3 left-1 w-4 h-5 bg-red-600/80"></div>
            <div className="absolute bottom-0 left-0 w-4 h-2 bg-red-800/80"></div>
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
      
      {/* Particles container for floating elements */}
      <div id="particles-container" className="absolute inset-0 z-10 pointer-events-none"></div>

      {/* Radial light effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl animate-pulse-slow animation-delay-700"></div>
      
      {/* Registration Form Container */}
      <div 
        id="register-form"
        className={`relative z-20 max-w-xl w-full backdrop-blur-md bg-white/20 p-8 md:p-10 rounded-2xl shadow-2xl border border-white/30 transition-all duration-700 ease-out ${
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
          {/* Logo with 3D effect and glow */}
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full shadow-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full shadow-lg transform -translate-y-1"></div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white relative z-10 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <div className="absolute -inset-1 bg-emerald-400/20 blur-xl rounded-full animate-pulse-slow"></div>
          </div>
          
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white pb-1">
              Create Your Account
            </h2>
            <p className="mt-2 text-sm text-white/80">
              Join{' '}
              <span className="font-semibold text-white relative inline-block">
                SportsBookSL
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-200"></span>
              </span>
              {' '}to book sports facilities across Sri Lanka
            </p>
          </div>

          {/* Enhanced error message with animation */}
          {error && (
            <div className="rounded-lg bg-red-500/30 backdrop-blur-sm p-4 border-l-4 border-red-400 animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-200" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.707-4.293a1 1 0 001.414 0L12 12.414l1.293 1.293a1 1 0 101.414-1.414L13.414 11l1.293-1.293a1 1 0 10-1.414-1.414L12 9.586l-1.293-1.293a1 1 0 00-1.414 1.414L10.586 11l-1.293 1.293a1 1 0 000 1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Full Name */}
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/60 group-focus-within:text-emerald-300 transition-colors">
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
                  className="peer appearance-none block w-full pl-10 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white sm:text-sm transition-all duration-200"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                <label 
                  htmlFor="name" 
                  className="absolute left-10 -top-2.5 bg-emerald-800/80 px-1 text-sm text-white/80 transition-all peer-placeholder-shown:text-white/60 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-emerald-300 peer-focus:text-sm"
                >
                  Full Name
                </label>
              </div>
              
              {/* Email */}
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/60 group-focus-within:text-emerald-300 transition-colors">
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
                  className="peer appearance-none block w-full pl-10 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white sm:text-sm transition-all duration-200"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <label 
                  htmlFor="email" 
                  className="absolute left-10 -top-2.5 bg-emerald-800/80 px-1 text-sm text-white/80 transition-all peer-placeholder-shown:text-white/60 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-emerald-300 peer-focus:text-sm"
                >
                  Email address
                </label>
              </div>
              
              {/* Phone */}
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/60 group-focus-within:text-emerald-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className="peer appearance-none block w-full pl-10 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white sm:text-sm transition-all duration-200"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                <label 
                  htmlFor="phone" 
                  className="absolute left-10 -top-2.5 bg-emerald-800/80 px-1 text-sm text-white/80 transition-all peer-placeholder-shown:text-white/60 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-emerald-300 peer-focus:text-sm"
                >
                  Phone number (optional)
                </label>
              </div>
              
              {/* Password */}
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/60 group-focus-within:text-emerald-300 transition-colors">
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
                  className="peer appearance-none block w-full pl-10 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white sm:text-sm transition-all duration-200"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <label 
                  htmlFor="password" 
                  className="absolute left-10 -top-2.5 bg-emerald-800/80 px-1 text-sm text-white/80 transition-all peer-placeholder-shown:text-white/60 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-emerald-300 peer-focus:text-sm"
                >
                  Password
                </label>
                <p className="mt-1 ml-2 text-xs text-emerald-100/80">Must be at least 6 characters long.</p>
              </div>
              
              {/* Confirm Password */}
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/60 group-focus-within:text-emerald-300 transition-colors">
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
                  className="peer appearance-none block w-full pl-10 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white sm:text-sm transition-all duration-200"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <label 
                  htmlFor="confirmPassword" 
                  className="absolute left-10 -top-2.5 bg-emerald-800/80 px-1 text-sm text-white/80 transition-all peer-placeholder-shown:text-white/60 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-emerald-300 peer-focus:text-sm"
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
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="acceptTerms" className="text-white/80 cursor-pointer">
                  I agree to the{' '}
                  <Link href="/terms" className="font-medium text-emerald-300 hover:text-emerald-200 transition-colors relative inline-block group">
                    Terms of Service
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-emerald-400 group-hover:w-full transition-all duration-200"></span>
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="font-medium text-emerald-300 hover:text-emerald-200 transition-colors relative inline-block group">
                    Privacy Policy
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-emerald-400 group-hover:w-full transition-all duration-200"></span>
                  </Link>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-150 ease-in-out relative overflow-hidden ${isLoading ? 'opacity-90' : ''}`}
                disabled={isLoading}
              >
                <span className="absolute inset-0 overflow-hidden">
                  <span className="absolute inset-0 rounded-xl bg-emerald-400/20 shine-effect"></span>
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
              <p className="text-sm text-white/80">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-emerald-300 hover:text-emerald-200 transition-colors relative inline-block group">
                  Sign in
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-emerald-400 group-hover:w-full transition-all duration-200"></span>
                </Link>
              </p>
            </div>
          </form>
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
        
        @keyframes slide-tackle {
          0%, 100% { transform: rotate(0); }
          50% { transform: rotate(-90deg); }
        }
        .animate-slide-tackle {
          animation: slide-tackle 6s infinite;
        }
        
        @keyframes player-jump {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
        .animate-player-jump {
          animation: player-jump 2s infinite;
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