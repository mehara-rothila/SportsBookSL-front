'use client';

import { useState, useEffect, Fragment, useCallback, useRef } from 'react';
import Link from 'next/link';
import { XMarkIcon, BellIcon } from '@heroicons/react/24/outline';
import {
  CalendarIcon, TruckIcon, CloudIcon, CurrencyDollarIcon,
  ExclamationTriangleIcon, CheckCircleIcon, LifebuoyIcon
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { Transition } from '@headlessui/react';
import { format, parseISO } from 'date-fns';
import * as notificationService from '@/services/notificationService';
import type { Notification } from '@/services/notificationService';
import { useNotificationContext } from '@/context/NotificationContext';

export default function NotificationCenter() {
  // Use context for unread count
  const { unreadCount, setUnreadCount } = useNotificationContext();
  // Local state for the list displayed in the dropdown and open state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const notificationPanelRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        notificationPanelRef.current && 
        !notificationPanelRef.current.contains(event.target as Node) && 
        !(event.target as Element).closest('.notification-bell-button')
      ) {
        setIsOpen(false);
      }
    };
    
    // Only add the event listener if the dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch notifications when dropdown opens
  const fetchNotifications = useCallback(async () => {
    if (!isOpen) return; // Only fetch when opening
    setIsLoading(true);
    try {
      const data = await notificationService.getUserNotifications({ limit: 10 }); // Fetch recent ones for dropdown
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0); // Sync count from API
      setHasLoadedOnce(true);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Could not load notifications.");
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, setUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Mark a single notification as read
  const handleMarkAsRead = async (notificationId: string, isCurrentlyRead: boolean) => {
    if (isCurrentlyRead) return;
    try {
      const data = await notificationService.markNotificationsRead({ notificationIds: [notificationId] });
      setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
      setUnreadCount(data.unreadCount); // Update count from API response
    } catch (error: any) {
      toast.error(`Failed to mark notification as read: ${error.message}`);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    const originalNotifications = [...notifications];
    const originalUnreadCount = unreadCount;
    
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    
    try {
      await notificationService.markNotificationsRead({ markAll: true });
      toast.success("All notifications marked as read.");
    } catch (error: any) {
      toast.error(`Failed to mark all as read: ${error.message}`);
      setNotifications(originalNotifications); // Rollback
      setUnreadCount(originalUnreadCount);
    }
  };

  // Delete a single notification
  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const originalNotifications = [...notifications];
    const originalUnreadCount = unreadCount;
    const notificationToDelete = notifications.find(n => n._id === notificationId);
    
    // Optimistic UI update
    setNotifications(prev => prev.filter(n => n._id !== notificationId));
    if (notificationToDelete && !notificationToDelete.isRead) {
      setUnreadCount(Math.max(0, unreadCount - 1));
    }
    
    try {
      const data = await notificationService.deleteNotification(notificationId);
      setUnreadCount(data.unreadCount); // Sync with API response
      toast.success("Notification deleted.");
    } catch (error: any) {
      toast.error(`Failed to delete notification: ${error.message}`);
      setNotifications(originalNotifications); // Rollback
      setUnreadCount(originalUnreadCount);
    }
  };

  // --- Icon logic ---
  const getNotificationIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'booking_created':
      case 'booking_status_update':
      case 'booking_reminder':
        return (
          <div className="p-2 bg-blue-100/80 rounded-full shadow-sm border border-blue-200/50">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
          </div>
        );
      case 'transportation_update':
        return (
          <div className="p-2 bg-emerald-100/80 rounded-full shadow-sm border border-emerald-200/50">
            <TruckIcon className="h-5 w-5 text-emerald-600" />
          </div>
        );
      case 'weather_alert':
        return (
          <div className="p-2 bg-purple-100/80 rounded-full shadow-sm border border-purple-200/50">
            <CloudIcon className="h-5 w-5 text-purple-600" />
          </div>
        );
      case 'donation_received':
      case 'donation_thankyou':
        return (
          <div className="p-2 bg-amber-100/80 rounded-full shadow-sm border border-amber-200/50">
            <CurrencyDollarIcon className="h-5 w-5 text-amber-600" />
          </div>
        );
      case 'financial_aid_update':
      case 'financial_aid_approved':
      case 'financial_aid_rejected':
      case 'financial_aid_needs_info':
        return (
          <div className="p-2 bg-indigo-100/80 rounded-full shadow-sm border border-indigo-200/50">
            <LifebuoyIcon className="h-5 w-5 text-indigo-600" />
          </div>
        );
      case 'system_announcement':
        return (
          <div className="p-2 bg-red-100/80 rounded-full shadow-sm border border-red-200/50">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
          </div>
        );
      default:
        // Provide a generic fallback icon
        return (
          <div className="p-2 bg-gray-100/80 rounded-full shadow-sm border border-gray-200/50">
            <BellIcon className="h-5 w-5 text-gray-600" />
          </div>
        );
    }
  };

  // --- Format Date ---
  const formatNotificationDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    try {
      return format(parseISO(dateStr), 'MMM d, h:mm a');
    } catch { return 'Invalid Date'; }
  };

  return (
    <div className="notification-center relative">
      <button
        type="button"
        className="notification-bell-button relative rounded-full flex items-center justify-center h-8 w-8 focus:outline-none transition-all duration-300"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label="Notifications"
      >
        <span className="sr-only">View notifications</span>
        <BellIcon className={`h-5 w-5 ${unreadCount > 0 ? 'text-white' : 'text-white/80'}`} />
        
        {/* Unread badge with animation */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 w-4 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-[10px] font-bold text-white transform animate-pulse-slow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        
        {/* Subtle ping animation when there are unread notifications */}
        {unreadCount > 0 && (
          <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping-slow opacity-75"></span>
        )}
      </button>

      {/* Dropdown Panel */}
      <Transition
        show={isOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div 
          ref={notificationPanelRef}
          className="notification-panel absolute right-0 mt-2 w-full sm:w-80 md:w-96 origin-top-right rounded-xl overflow-hidden z-50 max-h-[70vh] flex flex-col backdrop-blur-md bg-white/90 shadow-xl border border-white/50 ring-1 ring-black/5"
          style={{ 
            maxWidth: '95vw',
            right: window.innerWidth < 640 ? '50%' : 0,
            transform: window.innerWidth < 640 ? 'translateX(50%)' : 'none'
          }}
        >
          {/* Header with glassmorphism */}
          <div className="p-3 px-4 backdrop-blur-sm bg-gradient-to-r from-emerald-50/80 to-emerald-100/80 border-b border-emerald-200/50 flex justify-between items-center sticky top-0 z-10">
            <h3 className="text-base font-semibold text-emerald-800 flex items-center">
              <BellIcon className="w-4 h-4 mr-2 text-emerald-600" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-medium py-0.5 px-1.5 bg-emerald-100 text-emerald-700 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
            
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <button 
                  type="button" 
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-800 py-1 px-2 rounded hover:bg-emerald-50/80 transition-colors"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all read
                </button>
              )}
              
              <button 
                type="button" 
                className="p-1 rounded-md text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/80 transition-colors" 
                onClick={() => setIsOpen(false)}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-grow">
            {isLoading && !hasLoadedOnce ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto mb-4"></div>
                <p className="text-sm text-emerald-600">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
                  <BellIcon className="h-8 w-8 text-emerald-400" />
                </div>
                <p className="text-base font-medium text-emerald-700 mb-1">All caught up!</p>
                <p className="text-sm text-emerald-600/80">You have no new notifications.</p>
              </div>
            ) : (
              <ul role="list" className="divide-y divide-emerald-100/70">
                {notifications.map((notification) => (
                  <li
                    key={notification._id}
                    className={`relative transition-all duration-200 group ${
                      notification.isRead 
                        ? 'hover:bg-emerald-50/80' 
                        : 'bg-emerald-50/90 hover:bg-emerald-100/90'
                    }`}
                  >
                    {/* Notification container with conditional link */}
                    <ConditionalLink 
                      href={notification.link} 
                      className="block px-4 py-3 focus:outline-none focus:bg-emerald-50/90 relative" 
                      onClick={() => handleMarkAsRead(notification._id, notification.isRead)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon with appropriate styling */}
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-6"> {/* Added right padding for delete button */}
                          <p className={`text-sm leading-5 ${notification.isRead ? 'text-gray-800' : 'text-emerald-900 font-medium'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-emerald-600/80 mt-1 flex items-center">
                            <span className="inline-block w-3 h-3">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="ml-1">{formatNotificationDate(notification.createdAt)}</span>
                          </p>
                        </div>
                      </div>
                      
                      {/* Delete button (moved inside the link for mobile) */}
                      <button 
                        type="button" 
                        className="absolute top-2 right-2 p-1.5 rounded-full text-emerald-400 hover:text-red-500 hover:bg-red-50/80 transition-all duration-200 z-10" 
                        onClick={(e) => handleDeleteNotification(notification._id, e)}
                        title="Delete notification"
                      >
                        <span className="sr-only">Dismiss notification</span>
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </ConditionalLink>
                    
                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse-slow"></span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 bg-gradient-to-r from-emerald-50/80 to-emerald-100/80 border-t border-emerald-200/50 text-center sticky bottom-0 z-10">
              <Link 
                href="/notifications" 
                className="text-sm font-medium text-emerald-600 hover:text-emerald-800 inline-flex items-center py-1 px-3 rounded-lg hover:bg-emerald-200/30 transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                View all
                <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </Transition>
      
      {/* Custom animations */}
      <style jsx>{`
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

// Helper component for conditional linking
const ConditionalLink = ({ href, children, ...props }: any) => {
  // If no href is provided, render a div instead of a link
  return href ? (
    <Link href={href} {...props}>{children}</Link>
  ) : (
    <div {...props}>{children}</div>
  );
};