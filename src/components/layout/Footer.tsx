// src/components/layout/Header.tsx
'use client';

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Disclosure, Transition, Menu } from '@headlessui/react';
import { motion } from 'framer-motion';
import { isAuthenticated, getCurrentUser, logout } from '@/services/authService';
import * as AuthServiceModule from '@/services/authService';
import NotificationCenter from '@/components/notifications/NotificationCenter';

// IMPORTANT: Ensure this component is only included ONCE in the application
// This component should only be imported in the root layout.tsx

// Define the default avatar path
const DEFAULT_AVATAR = '/images/default-avatar.png';
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';

// Navigation links - style matches the screenshot
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
  const [lastChecked, setLastChecked] = useState(0); // Track when we last checked auth
  const [isLoginPage, setIsLoginPage] = useState(false);

  // --- Check if current page is login or register page ---
  useEffect(() => {
    if (pathname) {
      setIsLoginPage(['/login', '/register', '/forgot-password'].includes(pathname));
    }
  }, [pathname]);

  // --- Authentication Check ---
  const checkAuthState = () => {
    try {
      // Check if the function exists before calling
      if (typeof isAuthenticated === 'function') {
          const authStatus = isAuthenticated();
          setIsLoggedIn(authStatus);

          if (authStatus && typeof getCurrentUser === 'function') {
              const userInfo = getCurrentUser();
              setCurrentUser(userInfo);
              // Debug
              console.log("[Header] Auth check - User info loaded:", userInfo?.name, "Avatar:", userInfo?.avatar);
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
    setLastChecked(Date.now());
  };

  // Initial auth check + periodic re-check
  useEffect(() => {
    // Check auth immediately on mount
    checkAuthState();

    // Set up periodic checking (every 2 seconds)
    const intervalId = setInterval(() => {
      checkAuthState();
    }, 2000);

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userToken' || e.key === 'user') {
        console.log("Storage changed, re-checking auth state...");
        checkAuthState();
      }
    };

    // Listen for custom login event
    const handleLoginEvent = () => {
      console.log("Login event detected, re-checking auth state...");
      checkAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-login', handleLoginEvent);
    
    // Cleanup listeners on component unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-login', handleLoginEvent);
    };
  }, []); // Empty dependency array ensures this runs once on mount

  // Additional auth check when route changes
  useEffect(() => {
    // Only recheck if we haven't checked very recently
    if (Date.now() - lastChecked > 500) {
      checkAuthState();
    }
  }, [pathname, lastChecked]);

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
  
  // Helper function to get the avatar URL with error handling
  const getAvatarUrl = (user: UserInfo | null): string => {
    if (!user || !user.avatar) return DEFAULT_AVATAR;
    
    // Ensure the avatar path starts with a slash if needed
    const avatarPath = user.avatar.startsWith('/') ? user.avatar : `/${user.avatar}`;
    return `${BACKEND_BASE_URL}${avatarPath}`;
  };

  // Determine background style based on page and scroll position
  const getHeaderBackground = () => {
    if (isLoginPage) {
      return isScrolled 
        ? 'bg-gray-900/95 shadow-lg border-b border-gray-700' 
        : 'bg-gray-900/80 backdrop-blur-md';
    }
    
    return isScrolled
      ? 'bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-800'
      : 'bg-transparent';
  };

  // Determine text color based on page and scroll position
  const getTextColor = (isLink = false) => {
    if (isLoginPage) {
      return isLink 
        ? 'text-white hover:text-emerald-400' 
        : 'text-white';
    }
    
    return isScrolled
      ? 'text-white hover:text-emerald-400'
      : 'text-white hover:text-emerald-400';
  };

  // --- Component Render ---
  // Check if this component has already been mounted to prevent duplicate headers
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    // Check if a header already exists in the DOM
    const existingHeaders = document.querySelectorAll('[data-header-id="sportsbooksl-header"]');
    
    if (existingHeaders.length > 1) {
      // If this is a duplicate header, don't render it
      console.warn("Duplicate header detected! This instance will not render.");
      setIsMounted(false);
    } else {
      setIsMounted(true);
    }
  }, []);

  // If this is a duplicate header, don't render anything
  if (!isMounted) return null;

  return (
    <Disclosure
      as="nav"
      data-header-id="sportsbooksl-header"
      className={`fixed w-full z-[100] transition-all duration-300 ease-in-out ${getHeaderBackground()} ${isLoginPage ? 'py-1' : isScrolled ? 'py-1' : 'py-3'}`}
    >
      {({ open }) => (
        <>
          {/* Main Header Content */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Left Section: Logo & Desktop Nav */}
              <div className="flex items-center">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="flex items-center group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 rounded-sm">
                    <motion.span
                      className={`text-2xl font-extrabold tracking-wider ${isLoginPage || isScrolled ? 'text-white' : 'text-white'} transition-colors duration-300`}
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ duration: 0.5 }}
                    >
                      <span className="font-black text-white">Sports</span><span className="text-emerald-400 font-black">Book</span><span className="text-white font-black">SL</span>
                      <span className="block h-0.5 max-w-0 bg-emerald-500 transition-all duration-500 group-hover:max-w-full"></span>
                    </motion.span>
                  </Link>
                </div>
                <div className="hidden md:ml-8 md:flex md:space-x-6 lg:space-x-8">
                  {navigation.map((item) => (
                    <Link 
                      key={item.name} 
                      href={item.href} 
                      className={`inline-flex items-center px-3 py-1 text-sm font-medium transition-all duration-200 ${
                        isActive(item.href) 
                          ? 'border-b-2 border-emerald-400 text-emerald-400 font-semibold' 
                          : 'text-white hover:text-emerald-400'
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
                      className={`text-sm font-medium transition-colors duration-200 ${getTextColor(true)} relative group`}
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
                            console.log("Avatar load error, using default");
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
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                          {/* Add more relevant user links here */}
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
                ) : ( // Logged Out View
                  <div className="flex items-center gap-4">
                    <Link 
                      href="/login" 
                      className="text-sm font-medium text-white hover:text-emerald-400 transition-all duration-200"
                    > 
                      Login 
                    </Link>
                    <Link 
                      href="/register" 
                      className="rounded-md px-5 py-2 text-sm font-semibold bg-white text-emerald-600 hover:bg-emerald-400 hover:text-white transition-all duration-200 transform hover:scale-[1.03] shadow-md"
                    > 
                      Register 
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="flex items-center md:hidden">
                <Disclosure.Button 
                  className={`inline-flex items-center justify-center rounded-md p-2 transition-colors duration-200 ${
                    isLoginPage || isScrolled
                      ? 'text-gray-500 hover:bg-gray-100 hover:text-emerald-600' 
                      : 'text-white hover:bg-white/10 hover:text-white'
                  } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500`} 
                  aria-expanded={open}
                > 
                  <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span> 
                  {open ? ( 
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg> 
                  ) : ( 
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg> 
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Panel */}
          <Transition 
            as={Fragment} 
            enter="transition duration-200 ease-out" 
            enterFrom="opacity-0 -translate-y-4" 
            enterTo="opacity-100 translate-y-0" 
            leave="transition duration-150 ease-in" 
            leaveFrom="opacity-100 translate-y-0" 
            leaveTo="opacity-0 -translate-y-4"
          >
            <Disclosure.Panel 
              className={`md:hidden shadow-lg border-t ${
                isLoginPage || isScrolled
                  ? 'border-gray-200 bg-white' 
                  : 'border-white/10 bg-gradient-to-b from-emerald-800/95 to-emerald-900/95 backdrop-blur-sm'
              }`}
            >
              {/* Mobile Navigation Links */}
              <div className="space-y-1 px-2 pb-3 pt-2">
                {navigation.map((item) => (
                  <Disclosure.Button 
                    key={item.name} 
                    as={Link} 
                    href={item.href} 
                    className={`block rounded-md px-3 py-2 text-base font-medium ${
                      isActive(item.href) 
                        ? (isLoginPage || isScrolled) 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-emerald-700/50 text-white' 
                        : (isLoginPage || isScrolled) 
                          ? 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600' 
                          : 'text-white hover:bg-white/10'
                    }`} 
                    aria-current={isActive(item.href) ? 'page' : undefined}
                  > 
                    {item.name} 
                  </Disclosure.Button>
                ))}
              </div>
              
              {/* Mobile User/Auth Section */}
              <div 
                className={`border-t ${isLoginPage || isScrolled ? 'border-gray-200' : 'border-white/10'} pb-3 pt-4`}
              >
                {isLoggedIn && currentUser ? (
                  <div>
                    <div className="flex items-center px-5"> 
                      <div className="flex-shrink-0">
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={getAvatarUrl(currentUser)} 
                          alt={currentUser.name} 
                          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR }}
                        />
                      </div>
                      <div className="ml-3"> 
                        <div className={`text-base font-medium ${isLoginPage || isScrolled ? 'text-gray-800' : 'text-white'}`}>
                          {currentUser.name}
                        </div> 
                        <div className={`text-sm font-medium ${isLoginPage || isScrolled ? 'text-gray-500' : 'text-emerald-200'}`}>
                          {currentUser.email}
                        </div> 
                      </div> 
                      <div className="ml-auto">
                        <NotificationCenter />
                      </div> 
                    </div>
                    <div className="mt-3 space-y-1 px-2">
                      {currentUser.role === 'admin' && (
                        <Disclosure.Button 
                          as={Link} 
                          href="/admin" 
                          className={`block rounded-md px-3 py-2 text-base font-medium ${
                            isLoginPage || isScrolled ? 'text-gray-600 hover:bg-gray-50' : 'text-white hover:bg-white/10'
                          }`}
                        >
                          Admin Panel
                        </Disclosure.Button>
                      )}
                      <Disclosure.Button 
                        as={Link} 
                        href="/profile" 
                        className={`block rounded-md px-3 py-2 text-base font-medium ${
                          isLoginPage || isScrolled ? 'text-gray-600 hover:bg-gray-50' : 'text-white hover:bg-white/10'
                        }`}
                      >
                        Profile
                      </Disclosure.Button>
                      <Disclosure.Button 
                        as={Link} 
                        href="/profile#my-bookings" 
                        className={`block rounded-md px-3 py-2 text-base font-medium ${
                          isLoginPage || isScrolled ? 'text-gray-600 hover:bg-gray-50' : 'text-white hover:bg-white/10'
                        }`}
                      >
                        My Bookings
                      </Disclosure.Button>
                      <Disclosure.Button 
                        as="button" 
                        onClick={handleLogout} 
                        className={`block w-full text-left rounded-md px-3 py-2 text-base font-medium ${
                          isLoginPage || isScrolled ? 'text-gray-600 hover:bg-gray-50' : 'text-white hover:bg-white/10'
                        }`}
                      >
                        Sign out
                      </Disclosure.Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col px-4 space-y-3 pt-2"> 
                    <Link 
                      href="/login" 
                      className={`block rounded-md px-3 py-2 text-base font-medium ${
                        isLoginPage || isScrolled ? 'text-gray-600 hover:bg-gray-50' : 'text-white hover:bg-white/10'
                      }`}
                    >
                      Login
                    </Link> 
                    <Link 
                      href="/register" 
                      className={`flex justify-center rounded-md px-3 py-2 text-base font-semibold shadow-sm ${
                        isLoginPage || isScrolled
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                          : 'bg-white text-emerald-600 hover:bg-gray-100'
                      }`}
                    >
                      Register
                    </Link> 
                  </div>
                )}
              </div>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}