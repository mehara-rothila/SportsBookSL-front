// src/components/notifications/NotificationCenter.tsx
'use client';

import { useState, useEffect, Fragment, useCallback } from 'react';
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
import { useNotificationContext } from '@/context/NotificationContext'; // Import the context hook

export default function NotificationCenter() {
  // Use context for unread count
  const { unreadCount, setUnreadCount } = useNotificationContext();
  // Local state for the list displayed in the dropdown and open state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications when dropdown opens
  const fetchNotifications = useCallback(async () => {
    if (!isOpen) return; // Only fetch when opening
    setIsLoading(true);
    try {
      const data = await notificationService.getUserNotifications({ limit: 10 }); // Fetch recent ones for dropdown
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0); // Sync count from API
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      toast.error("Could not load notifications.");
    } finally {
      setIsLoading(false);
    }
  // Add setUnreadCount to dependency array as it comes from context
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
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0); // Optimistic UI update
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
  const handleDeleteNotification = async (notificationId: string) => {
      const originalNotifications = [...notifications];
      const originalUnreadCount = unreadCount;
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1)); // Optimistic decrease
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

  // Close dropdown when clicking outside (keep this logic)
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          if (isOpen && !target.closest('.notification-center') && !target.closest('.notification-bell-button')) {
              setIsOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [isOpen]);

  // --- Icon logic (keep the same) ---
  const getNotificationIcon = (type: string) => { /* ... same as before ... */
    switch (type) {
      case 'booking_created': case 'booking_status_update': case 'booking_reminder':
        return <CalendarIcon className="h-6 w-6 text-blue-500" />;
      case 'transportation_update': // Example type
        return <TruckIcon className="h-6 w-6 text-green-500" />;
      case 'weather_alert':
        return <CloudIcon className="h-6 w-6 text-purple-500" />;
      case 'donation_received': case 'donation_thankyou':
        return <CurrencyDollarIcon className="h-6 w-6 text-amber-500" />;
      case 'financial_aid_update':
         return <LifebuoyIcon className="h-6 w-6 text-indigo-500" />; // Example for Aid
      case 'system_announcement':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <CheckCircleIcon className="h-6 w-6 text-gray-500" />;
    }
  };

   // --- Format Date (keep the same) ---
    const formatNotificationDate = (dateStr: string): string => { /* ... same as before ... */
        try {
             // Implement more user-friendly relative time later (e.g., using date-fns formatDistanceToNow)
            return format(parseISO(dateStr), 'MMM d, h:mm a');
        } catch { return 'Invalid Date'; }
    };

  return (
    <div className="notification-center relative">
      <button
        type="button"
        className="notification-bell-button relative p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sr-only">View notifications</span>
        <BellIcon className="h-6 w-6" />
        {/* Use unreadCount from context */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-xs font-medium text-white pointer-events-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <Transition
         show={isOpen}
         as={Fragment}
         enter="transition ease-out duration-100"
         enterFrom="transform opacity-0 scale-95"
         enterTo="transform opacity-100 scale-100"
         leave="transition ease-in duration-75"
         leaveFrom="transform opacity-100 scale-100"
         leaveTo="transform opacity-0 scale-95"
       >
        {/* Keep the rest of the Transition content (panel, header, body, list, footer) exactly the same as before */}
        <div className="notification-panel absolute right-0 mt-2 w-80 sm:w-96 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden z-50 max-h-[70vh] flex flex-col">
          {/* Header */}
          <div className="p-3 px-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
            <h3 className="text-base font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button type="button" className="text-xs font-medium text-primary-600 hover:text-primary-700" onClick={handleMarkAllAsRead} > Mark all as read </button>
            )}
             <button type="button" className="-mr-1 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100" onClick={() => setIsOpen(false)}><span className='sr-only'>Close</span><XMarkIcon className="h-5 w-5" /></button>
          </div>

           {/* Body */}
          <div className="overflow-y-auto flex-grow">
            {isLoading ? (
                 <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
                 <div className="p-8 text-center"> <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> <p className="text-sm text-gray-500">You're all caught up!</p> </div>
            ) : (
                 <ul role="list" className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <li key={notification._id} className={`relative transition-colors duration-150 group ${notification.isRead ? 'hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'}`} >
                         <ConditionalLink href={notification.link} className="block px-4 py-3" onClick={() => handleMarkAsRead(notification._id, notification.isRead)}>
                          <div className="flex items-start">
                             <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                             <div className="ml-3 flex-1">
                               <p className="text-sm text-gray-800 leading-snug">{notification.message}</p>
                               <p className="text-xs text-gray-500 mt-1">{formatNotificationDate(notification.createdAt)}</p>
                             </div>
                          </div>
                        </ConditionalLink>
                         <button type="button" className="absolute top-2 right-2 p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-100 opacity-0 focus-within:opacity-100 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notification._id); }} title="Delete notification" > <span className="sr-only">Dismiss notification</span> <XMarkIcon className="h-4 w-4" /> </button>
                         {!notification.isRead && ( <span className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500"></span> )}
                      </li>
                    ))}
                 </ul>
             )}
           </div>

           {/* Footer */}
           {notifications.length > 0 && (
             <div className="p-2 bg-gray-50 border-t border-gray-200 text-center sticky bottom-0 z-10">
                <Link href="/notifications" className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"> View all </Link>
             </div>
           )}
         </div>
       </Transition>
    </div>
  );
}


// Helper component (keep the same)
const ConditionalLink = ({ href, children, ...props }: any) => {
    return href ? ( <Link href={href} {...props}>{children}</Link> ) : ( <div {...props}>{children}</div> );
};