// src/components/layout/Header.tsx
'use client';

import { useState, useEffect, Fragment, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Disclosure, Transition, Menu } from '@headlessui/react';
import { motion } from 'framer-motion';
import { isAuthenticated, getCurrentUser, logout, getFullAvatarUrl } from '@/services/authService';
import * as AuthServiceModule from '@/services/authService';
import NotificationCenter from '@/components/notifications/NotificationCenter';

// Define the default avatar path
const DEFAULT_AVATAR = '/images/default-avatar.png';
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Facilities', href: '/facilities' },
  { name: 'Trainers', href: '/trainers' },
  { name: 'Financial Aid', href: '/financial-aid' },
  { name: 'Donations', href: '/donations' },
];

// Define UserInfo type locally or import from a shared types file
interface UserInfo {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string; // Make avatar optional
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // --- Authentication Check ---
  useEffect(() => {
    const checkAuthState = () => {
      try {
        // Check if the function exists before calling
        if (typeof isAuthenticated === 'function') {
            const authStatus = isAuthenticated();
            setIsLoggedIn(authStatus);

            if (authStatus && typeof getCurrentUser === 'function') {
                const userInfo = getCurrentUser();
                setCurrentUser(userInfo);
                console.log("Current user loaded:", userInfo);
                if (userInfo?.avatar) {
                  console.log("Avatar path:", userInfo.avatar);
                  console.log("Full avatar URL:", getAvatarUrl(userInfo));
                }
            } else {
                setCurrentUser(null);
            }
        } else {
            console.error("isAuthenticated is NOT a function or not imported correctly!");
            setIsLoggedIn(false); // Assume not logged in if function is missing
            setCurrentUser(null);
        }
      } catch (err) {
          console.error("Error during checkAuthState:", err);
          setIsLoggedIn(false);
          setCurrentUser(null);
      }
    };

    checkAuthState(); // Initial check

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userToken' || e.key === 'user') {
        console.log("Storage changed, re-checking auth state...");
        checkAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Listen for auth events from other components
    const handleUserLogin = () => {
      console.log("Login event detected");
      checkAuthState();
    };
    
    const handleUserUpdated = () => {
      console.log("User updated event detected");
      checkAuthState();
    };
    
    window.addEventListener('user-login', handleUserLogin);
    window.addEventListener('user-updated', handleUserUpdated);
    
    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-login', handleUserLogin);
      window.removeEventListener('user-updated', handleUserUpdated);
    };
  }, []); // Empty dependency array ensures this runs once on mount

  // --- Scroll Tracking ---
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check on load
    // Cleanup listener on component unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Close mobile menu on route change ---
  useEffect(() => {
    // Close the mobile menu when pathname changes (page navigation)
    setMobileMenuOpen(false);
  }, [pathname]);

  // --- Close mobile menu on outside click ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    
    // Only add the event listener if the mobile menu is open
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // --- Helper Functions ---
  const isActive = (href: string): boolean => {
    if (!pathname) return false; // Guard against pathname being null/undefined initially
    // Exact match for home page
    if (href === '/') return pathname === '/';
    // Ensure paths end with '/' for comparison to avoid partial matches like /admin matching /admin/users
    const normalizedPathname = pathname.endsWith('/') ? pathname : pathname + '/';
    const normalizedHref = href.endsWith('/') ? href : href + '/';
    // Check if current path starts with the link's path
    return normalizedPathname.startsWith(normalizedHref);
  };

  const handleLogout = () => {
    if (typeof logout === 'function') {
        logout();
        setIsLoggedIn(false);
        setCurrentUser(null);
        router.push('/'); // Redirect to home after logout
        console.log("User logged out.");
    } else {
        console.error("logout function is not available in authService!");
    }
  };
  
  // Helper function to get the avatar URL
  const getAvatarUrl = (user: UserInfo | null): string => {
    if (!user || !user.avatar) return DEFAULT_AVATAR;
    
    if (user.avatar.startsWith('http')) {
      // Already a complete URL
      return user.avatar;
    }
    
    // Create proper URL from backend base and avatar path
    const baseUrl = BACKEND_BASE_URL.endsWith('/') ? BACKEND_BASE_URL : `${BACKEND_BASE_URL}/`;
    const avatarPath = user.avatar.startsWith('/') ? user.avatar.substring(1) : user.avatar;
    return `${baseUrl}${avatarPath}`;
  };

  // --- Component Render ---
  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/75 py-2' // Added border when scrolled
          : 'bg-transparent py-4'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section: Logo & Desktop Nav */}
          <div className="flex items-center">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="flex items-center group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 rounded-sm">
                <motion.span
                  className={`text-2xl font-extrabold ${ isScrolled ? 'text-emerald-600' : 'text-white' } transition-colors duration-300`}
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  Sports<span className="text-emerald-500">Book</span>SL
                  <span className="block h-0.5 max-w-0 bg-emerald-500 transition-all duration-500 group-hover:max-w-full"></span>
                </motion.span>
              </Link>
            </div>
            <div className="hidden md:ml-8 md:flex md:space-x-6 lg:space-x-8">
              {navigation.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`inline-flex items-center px-1 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${ 
                    isActive(item.href) 
                      ? (isScrolled ? 'border-emerald-500 text-emerald-600' : 'border-white text-white') 
                      : (isScrolled ? 'border-transparent text-gray-500 hover:text-emerald-600 hover:border-emerald-300' : 'border-transparent text-white/90 hover:text-white hover:border-white/50') 
                  }`} 
                  aria-current={isActive(item.href) ? 'page' : undefined}
                > 
                  {item.name} 
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section: Auth / User Actions (Desktop) */}
          <div className="hidden md:flex md:items-center gap-4"> {/* Base gap */}
            {isLoggedIn ? (
              <div className="flex items-center gap-5"> {/* Increased gap when logged in */}
                {/* My Bookings Link */}
                <Link 
                  href="/profile#my-bookings" 
                  className={`text-sm font-medium transition-colors duration-200 ${ 
                    isScrolled ? 'text-gray-500 hover:text-emerald-600' : 'text-white/90 hover:text-white' 
                  } relative group`}
                > 
                  My Bookings 
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all group-hover:w-full"></span> 
                </Link>

                {/* Notification Center */}
                <NotificationCenter />

                {/* User Profile Menu */}
                <Menu as="div" className="relative">
                  <Menu.Button className="relative flex rounded-full bg-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 hover:ring-emerald-400 transition-all ring-1 ring-gray-300"> 
                    <span className="sr-only">Open user menu</span> 
                    <img 
                      className="h-8 w-8 rounded-full object-cover" 
                      src={getAvatarUrl(currentUser)} 
                      alt={currentUser?.name || 'User avatar'} 
                      onError={(e) => { 
                        console.error("Avatar load error, falling back to default"); 
                        (e.target as HTMLImageElement).src = DEFAULT_AVATAR; 
                      }}
                    />
                  </Menu.Button>
                  <Transition 
                    as={Fragment} 
                    enter="transition ease-out duration-100" 
                    enterFrom="transform opacity-0 scale-95" 
                    enterTo="transform opacity-100 scale-100" 
                    leave="transition ease-in duration-75" 
                    leaveFrom="transform opacity-100 scale-100" 
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white/90 backdrop-blur-sm py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-white/50">
                      {/* Conditionally render Admin Panel link */}
                      {currentUser?.role === 'admin' && (
                        <Menu.Item>
                          {({ active }) => (
                            <Link 
                              href="/admin" 
                              className={`${active ? 'bg-emerald-50' : ''} block px-4 py-2 text-sm text-gray-700`}
                            >
                              Admin Panel
                            </Link>
                          )}
                        </Menu.Item>
                      )}
                      <Menu.Item>
                        {({ active }) => (
                          <Link 
                            href="/profile" 
                            className={`${active ? 'bg-emerald-50' : ''} block px-4 py-2 text-sm text-gray-700`}
                          >
                            Your Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button 
                            className={`${active ? 'bg-emerald-50' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700`} 
                            onClick={handleLogout}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            ) : ( 
              // Logged Out View
              <div className="flex items-center gap-4">
                <Link 
                  href="/login" 
                  className={`text-sm font-medium transition-colors duration-200 relative group ${ 
                    isScrolled ? 'text-gray-600 hover:text-emerald-600' : 'text-white hover:text-white/80' 
                  }`} 
                > 
                  Login 
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all group-hover:w-full"></span> 
                </Link>
                <Link 
                  href="/register" 
                  className={`rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 transform hover:scale-[1.03] ${ 
                    isScrolled ? 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-700' : 'bg-white text-emerald-600 hover:bg-emerald-50 focus-visible:outline-white' 
                  } focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`} 
                > 
                  Register 
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className={`inline-flex items-center justify-center rounded-md p-2 transition-colors duration-200 ${ 
                isScrolled ? 'text-gray-500 hover:bg-gray-100 hover:text-emerald-600' : 'text-white hover:bg-white/10 hover:text-white' 
              } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500`}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            > 
              <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span> 
              {mobileMenuOpen ? ( 
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg> 
              ) : ( 
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg> 
              )} 
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <Transition
        show={mobileMenuOpen}
        as={Fragment}
        enter="transition duration-200 ease-out"
        enterFrom="opacity-0 -translate-y-4"
        enterTo="opacity-100 translate-y-0"
        leave="transition duration-150 ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-4"
      >
        <div 
          ref={mobileMenuRef}
          className={`md:hidden shadow-lg border-t ${
            isScrolled ? 'border-gray-200 bg-white/95 backdrop-blur-sm' : 'border-white/10 bg-gradient-to-b from-emerald-800/95 to-emerald-900/95 backdrop-blur-sm'
          }`}
        >
          {/* Mobile Navigation Links */}
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navigation.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`block rounded-md px-3 py-2 text-base font-medium ${ 
                  isActive(item.href) 
                    ? (isScrolled ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-700/50 text-white') 
                    : (isScrolled ? 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600' : 'text-white hover:bg-white/10') 
                }`} 
                aria-current={isActive(item.href) ? 'page' : undefined}
                onClick={() => setMobileMenuOpen(false)}
              > 
                {item.name} 
              </Link>
            ))}
          </div>
          
          {/* Mobile User/Auth Section */}
          <div className={`border-t ${isScrolled ? 'border-gray-200' : 'border-white/10'} pb-3 pt-4`}>
            {isLoggedIn && currentUser ? (
              <div>
                <div className="flex items-center px-5"> 
                  <div className="flex-shrink-0">
                    <img 
                      className="h-10 w-10 rounded-full object-cover" 
                      src={getAvatarUrl(currentUser)} 
                      alt={currentUser.name} 
                      onError={(e) => { 
                        console.error("Mobile avatar load error, falling back to default"); 
                        (e.target as HTMLImageElement).src = DEFAULT_AVATAR; 
                      }}
                    />
                  </div>
                  <div className="ml-3"> 
                    <div className={`text-base font-medium ${isScrolled ? 'text-gray-800' : 'text-white'}`}>
                      {currentUser.name}
                    </div> 
                    <div className={`text-sm font-medium ${isScrolled ? 'text-gray-500' : 'text-emerald-200'}`}>
                      {currentUser.email}
                    </div> 
                  </div> 
                  <div className="ml-auto">
                    <NotificationCenter />
                  </div> 
                </div>
                <div className="mt-3 space-y-1 px-2">
                  {currentUser.role === 'admin' && (
                    <Link 
                      href="/admin" 
                      className={`block rounded-md px-3 py-2 text-base font-medium ${
                        isScrolled ? 'text-gray-600 hover:bg-gray-50' : 'text-white hover:bg-white/10'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link 
                    href="/profile" 
                    className={`block rounded-md px-3 py-2 text-base font-medium ${
                      isScrolled ? 'text-gray-600 hover:bg-gray-50' : 'text-white hover:bg-white/10'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    href="/profile#my-bookings" 
                    className={`block rounded-md px-3 py-2 text-base font-medium ${
                      isScrolled ? 'text-gray-600 hover:bg-gray-50' : 'text-white hover:bg-white/10'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left rounded-md px-3 py-2 text-base font-medium ${
                      isScrolled ? 'text-gray-600 hover:bg-gray-50' : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col px-4 space-y-3 pt-2"> 
                <Link 
                  href="/login" 
                  className={`block rounded-md px-3 py-2 text-base font-medium ${
                    isScrolled ? 'text-gray-600 hover:bg-gray-50' : 'text-white hover:bg-white/10'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link> 
                <Link 
                  href="/register" 
                  className={`flex justify-center rounded-md px-3 py-2 text-base font-semibold shadow-sm ${ 
                    isScrolled ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white text-emerald-600 hover:bg-gray-100' 
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link> 
              </div>
            )}
          </div>
        </div>
      </Transition>
    </header>
  );
}