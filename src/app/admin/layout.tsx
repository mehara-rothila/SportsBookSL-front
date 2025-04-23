// src/app/admin/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import * as authService from '@/services/authService'; // Adjust path if needed
import { Toaster } from 'react-hot-toast';

// --- Icons ---
import {
    UsersIcon,
    BuildingOfficeIcon,
    UserGroupIcon,
    HomeIcon,
    ShieldCheckIcon,
    LifebuoyIcon,
    GiftIcon,
    NewspaperIcon,
    PhotoIcon,
    CalendarDaysIcon,
    StarIcon
} from '@heroicons/react/24/outline';

// Helper function for conditional classes
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in and is an admin
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'admin') {
      console.warn("AdminLayout: User not logged in or not an admin. Redirecting...");
      // router.replace('/login?message=Admin access required');
      setIsAdmin(false); // Assume not admin if check fails
    } else {
      setIsAdmin(true);
    }
    setIsLoading(false);
  }, [router]);

  // Navigation items for admin buttons
  const adminNavigation = [
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Facilities', href: '/admin/facilities', icon: BuildingOfficeIcon },
    { name: 'Categories', href: '/admin/categories', icon: NewspaperIcon },
    { name: 'Trainers', href: '/admin/trainers', icon: UserGroupIcon },
    { name: 'Bookings', href: '/admin/bookings', icon: CalendarDaysIcon },
    { name: 'Donations', href: '/admin/donations', icon: GiftIcon },
    { name: 'Athletes', href: '/admin/athletes', icon: StarIcon },
    { name: 'Financial Aid', href: '/admin/financial-aid', icon: LifebuoyIcon },
    { name: 'Testimonials', href: '/admin/testimonials', icon: PhotoIcon },
  ];

  // Helper function to determine if a nav link is active
  const isActive = (href: string) => {
      if (href === '/admin' || href === '/admin/') return pathname === '/admin' || pathname === '/admin/';
      const normalizedPathname = pathname.endsWith('/') ? pathname : pathname + '/';
      const normalizedHref = href.endsWith('/') ? href : href + '/';
      return normalizedPathname.startsWith(normalizedHref);
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-800">
        <div className="w-12 h-12 border-4 border-emerald-200/30 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="ml-4 text-white">Loading Admin Area...</p>
      </div>
    );
  }

  // If check complete and user is not admin, render message or redirect
  if (!isAdmin && !isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-800">
        <p className="text-emerald-400 font-medium">Access Denied. Redirecting...</p>
      </div>
    );
  }

  // Render the admin layout if user is admin
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-800 relative pb-10">
      {/* Basketball Court Background */}
      <div className="absolute inset-0 overflow-hidden mt-28">
        {/* Full Court with enhanced styling */}
        <div className="absolute top-[10%] left-[5%] right-[5%] bottom-[5%] rounded-lg bg-gradient-to-b from-emerald-700/30 to-emerald-600/20 border-2 border-white/10 shadow-inner"></div>
        
        {/* Center Circle with glow */}
        <div className="absolute top-1/2 left-1/2 w-36 h-36 rounded-full border-2 border-white/20 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_30px_rgba(16,185,129,0.1)]"></div>
        
        {/* Center Line */}
        <div className="absolute top-[10%] left-1/2 bottom-[5%] w-0.5 bg-white/20 -translate-x-1/2"></div>
        
        {/* Three-Point Line - Left */}
        <div className="absolute top-[25%] left-[10%] w-64 h-96 border-2 border-white/20 rounded-tr-full rounded-br-full border-l-0 shadow-inner"></div>
        
        {/* Three-Point Line - Right */}
        <div className="absolute top-[25%] right-[10%] w-64 h-96 border-2 border-white/20 rounded-tl-full rounded-bl-full border-r-0 shadow-inner"></div>
        
        {/* Free Throw Line - Left */}
        <div className="absolute top-[40%] left-[10%] w-40 h-0.5 bg-white/20"></div>
        
        {/* Free Throw Line - Right */}
        <div className="absolute top-[40%] right-[10%] w-40 h-0.5 bg-white/20"></div>
        
        {/* Free Throw Circle - Left */}
        <div className="absolute top-[40%] left-[20%] w-24 h-24 border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Free Throw Circle - Right */}
        <div className="absolute top-[40%] right-[20%] w-24 h-24 border-2 border-white/20 rounded-full translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Key/Paint - Left */}
        <div className="absolute top-[30%] left-[10%] w-40 h-80 border-2 border-white/20 border-l-0 bg-emerald-800/10"></div>
        
        {/* Key/Paint - Right */}
        <div className="absolute top-[30%] right-[10%] w-40 h-80 border-2 border-white/20 border-r-0 bg-emerald-800/10"></div>
        
        {/* Backboard - Left */}
        <div className="absolute top-[70%] left-[10%] w-20 h-1 bg-white/40 -translate-y-1/2"></div>
        
        {/* Backboard - Right */}
        <div className="absolute top-[70%] right-[10%] w-20 h-1 bg-white/40 -translate-y-1/2"></div>
        
        {/* Rim - Left */}
        <div className="absolute top-[70%] left-[10%] w-8 h-8 rounded-full border-2 border-emerald-500/60 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
        
        {/* Rim - Right */}
        <div className="absolute top-[70%] right-[10%] w-8 h-8 rounded-full border-2 border-emerald-500/60 translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
        
        {/* Basketball players - Team Green */}
        <div className="absolute w-6 h-8 top-[30%] left-[30%] animate-player-move">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-emerald-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-emerald-600/60"></div>
          </div>
        </div>
        
        <div className="absolute w-6 h-8 bottom-[40%] left-[20%] animate-player-move animation-delay-1000">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-emerald-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-emerald-600/60"></div>
          </div>
        </div>
        
        <div className="absolute w-6 h-8 top-[20%] left-[40%] animate-player-move animation-delay-700">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-emerald-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-emerald-600/60"></div>
          </div>
        </div>
        
        <div className="absolute w-6 h-8 bottom-[30%] left-[35%] animate-player-move animation-delay-300">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-emerald-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-emerald-600/60"></div>
          </div>
        </div>
        
        <div className="absolute w-6 h-8 top-[50%] left-[25%] animate-player-move animation-delay-500">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-emerald-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-emerald-600/60"></div>
          </div>
        </div>
        
        <div className="absolute w-6 h-8 top-[65%] left-[15%] animate-player-move animation-delay-850">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-emerald-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-emerald-600/60"></div>
          </div>
        </div>
        
        <div className="absolute w-6 h-8 bottom-[20%] left-[40%] animate-player-move animation-delay-420">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-emerald-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-emerald-600/60"></div>
          </div>
        </div>
        
        {/* Basketball players - Team Purple */}
        <div className="absolute w-6 h-8 top-[60%] right-[35%] animate-player-move animation-delay-500">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-purple-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-purple-600/60"></div>
          </div>
        </div>
        
        <div className="absolute w-6 h-8 top-[20%] right-[25%] animate-player-move animation-delay-200">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-purple-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-purple-600/60"></div>
          </div>
        </div>
        
        <div className="absolute w-6 h-8 bottom-[25%] right-[30%] animate-player-move animation-delay-800">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-purple-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-purple-600/60"></div>
          </div>
        </div>
        
        <div className="absolute w-6 h-8 top-[40%] right-[15%] animate-player-move animation-delay-100">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-purple-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-purple-600/60"></div>
          </div>
        </div>
        
        <div className="absolute w-6 h-8 bottom-[45%] right-[50%] animate-player-move animation-delay-600">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-purple-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-purple-600/60"></div>
          </div>
        </div>
        
        <div className="absolute w-6 h-8 top-[70%] right-[20%] animate-player-move animation-delay-750">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-purple-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-purple-600/60"></div>
          </div>
        </div>
        
        <div className="absolute w-6 h-8 bottom-[60%] right-[10%] animate-player-move animation-delay-350">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-purple-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-purple-600/60"></div>
          </div>
        </div>
        
        {/* Basketballs - animated */}
        <div className="absolute w-6 h-6 top-[45%] left-[45%] animate-basketball-bounce">
          <div className="w-full h-full rounded-full bg-emerald-500/80 border border-emerald-700/60"></div>
        </div>
        
        <div className="absolute w-5 h-5 top-[25%] right-[45%] animate-basketball-bounce animation-delay-700">
          <div className="w-full h-full rounded-full bg-emerald-500/80 border border-emerald-700/60"></div>
        </div>
        
        <div className="absolute w-5 h-5 bottom-[35%] left-[55%] animate-basketball-bounce animation-delay-300">
          <div className="w-full h-full rounded-full bg-emerald-500/80 border border-emerald-700/60"></div>
        </div>
        
        <div className="absolute w-4 h-4 bottom-[55%] right-[25%] animate-basketball-bounce animation-delay-150">
          <div className="w-full h-full rounded-full bg-emerald-500/80 border border-emerald-700/60"></div>
        </div>
        
        <div className="absolute w-4 h-4 top-[65%] left-[25%] animate-basketball-bounce animation-delay-550">
          <div className="w-full h-full rounded-full bg-emerald-500/80 border border-emerald-700/60"></div>
        </div>
        
        {/* Court shadows and glows */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/5 to-emerald-800/10 pointer-events-none"></div>
        <div className="absolute top-[5%] left-[50%] w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/4 pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[10%] w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Toaster component */}
      <div><Toaster position="top-right" reverseOrder={false} /></div>

      {/* Admin Header */}
      <header className="relative z-10 bg-gradient-to-r from-emerald-900/90 to-green-800/90 backdrop-blur-md border-b border-emerald-700/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo Only */}
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center">
                <ShieldCheckIcon className="h-10 w-10 text-emerald-500"/>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation Buttons */}
      <div className="relative z-10 bg-emerald-900/40 backdrop-blur-sm border-b border-emerald-700/30 overflow-x-auto mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-3 w-max min-w-full">
            {adminNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  isActive(item.href) 
                    ? 'bg-emerald-700/50 text-white font-medium border-b-2 border-emerald-500' 
                    : 'text-emerald-100 hover:bg-emerald-800/30 hover:text-white',
                  'group flex items-center px-4 py-2.5 text-sm rounded-t-md transition-all duration-200 mx-1 whitespace-nowrap'
                )}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                <item.icon
                  className={classNames(
                    isActive(item.href) ? 'text-emerald-400' : 'text-emerald-300 group-hover:text-emerald-100',
                    'mr-2 flex-shrink-0 h-5 w-5 transition-colors duration-200'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {children}
      </main>

      {/* Custom CSS Animations and Theme Overrides */}
      <style jsx global>{`
        /* Color scheme overrides to match green theme */
        .bg-primary-600 { background-color: #10B981 !important; } /* emerald-500 */
        .hover\\:bg-primary-700:hover { background-color: #047857 !important; } /* emerald-600 */
        .text-primary-600 { color: #10B981 !important; } /* emerald-500 */
        .text-primary-700 { color: #047857 !important; } /* emerald-600 */
        .focus\\:ring-primary-500:focus { --tw-ring-color: #10B981 !important; } /* emerald-500 */
        .border-primary-500 { border-color: #10B981 !important; } /* emerald-500 */
        .border-t-primary-600 { border-top-color: #10B981 !important; } /* emerald-500 */
        
        /* Button overrides for green theme */
        .btn-primary {
          background-color: #10B981 !important;
          border-color: #047857 !important;
          color: white !important;
        }
        .btn-primary:hover {
          background-color: #047857 !important;
        }
        
        /* Add custom shadows to match the theme */
        .shadow-basketball {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        
        /* Make headers and important text stand out */
        h1, h2, .text-header {
          color: white !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        
        /* Form control styling */
        input, select, textarea {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(16, 185, 129, 0.3) !important;
          color: white !important;
        }
        input::placeholder, select::placeholder, textarea::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
        }
        input:focus, select:focus, textarea:focus {
          border-color: #10B981 !important;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
        }

        /* Animations for basketball elements */
        @keyframes player-move {
          0% { transform: translate(0, 0); }
          25% { transform: translate(30px, 20px); }
          50% { transform: translate(10px, 40px); }
          75% { transform: translate(-20px, 10px); }
          100% { transform: translate(0, 0); }
        }
        .animate-player-move {
          animation: player-move 10s ease-in-out infinite;
        }
        
        @keyframes basketball-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(40px) scale(0.9); }
        }
        .animate-basketball-bounce {
          animation: basketball-bounce 1.5s ease-in-out infinite;
        }
        
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-350 { animation-delay: 0.35s; }
        .animation-delay-420 { animation-delay: 0.42s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-550 { animation-delay: 0.55s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-700 { animation-delay: 0.7s; }
        .animation-delay-750 { animation-delay: 0.75s; }
        .animation-delay-800 { animation-delay: 0.8s; }
        .animation-delay-850 { animation-delay: 0.85s; }
        .animation-delay-1000 { animation-delay: 1s; }

        /* ========== TABLE STYLES FOR ADMIN PAGES ========== */
        /* Table styling improvements */
        table {
          border-collapse: separate;
          border-spacing: 0;
          width: 100%;
        }

        table th {
          color: white;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          padding: 0.75rem 1rem;
        }

        table td {
          padding: 1rem;
          vertical-align: middle;
        }

        /* Progress bar styling */
        .progress-bar {
          height: 0.5rem;
          border-radius: 9999px;
          background-color: rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }
        
        .progress-bar-fill {
          height: 100%;
          background-color: #10B981;
          transition: width 0.3s ease;
        }

        /* Status badge */
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .status-badge.active {
          background-color: rgba(16, 185, 129, 0.2);
          color: #10B981;
        }
        
        .status-badge.inactive {
          background-color: rgba(239, 68, 68, 0.2);
          color: #EF4444;
        }
      `}</style>
    </div>
  );
}