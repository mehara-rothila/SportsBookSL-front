// src/components/notifications/NotificationCenter.tsx
'use client';

import { Fragment, useState, useEffect, useRef } from 'react';
import { Transition, Popover } from '@headlessui/react';
import { BellIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format, formatDistanceToNow } from 'date-fns';
import * as notificationService from '@/services/notificationService';
import { useNotificationContext } from '@/context/NotificationContext';
import type { Notification } from '@/services/notificationService';

export default function NotificationCenter() {
  const { unreadCount, setUnreadCount } = useNotificationContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scrolling for styling adjustments
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load notifications when the dropdown is opened
  const fetchNotifications = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await notificationService.getUserNotifications({ limit: 10 });
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Could not load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark notifications as read
  const markAsRead = async () => {
    if (unreadCount === 0) return;
    
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      // Update local notification list to reflect read status
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  // Handle click outside to close on mobile
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        notificationRef.current && 
        !notificationRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Format notification timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      
      // If timestamp is less than 24 hours ago, show relative time
      const now = new Date();
      const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
      
      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true });
      } else {
        return format(date, 'MMM d, yyyy');
      }
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
        return <CheckCircleIcon className="h-6 w-6 text-emerald-500" />;
      case 'booking_reminder':
        return <ClockIcon className="h-6 w-6 text-yellow-400" />;
      case 'system':
        return <BellIcon className="h-6 w-6 text-emerald-400" />;
      default:
        return <BellIcon className="h-6 w-6 text-emerald-400" />;
    }
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block relative">
        <Popover className="relative">
          {({ open }) => (
            <>
              <Popover.Button 
                className={`relative flex rounded-full p-1.5 focus:outline-none focus:ring-2 ${isScrolled ? 'focus:ring-emerald-500 focus:ring-offset-white' : 'focus:ring-emerald-400 focus:ring-offset-transparent'} focus:ring-offset-2 transition-colors hover:bg-emerald-600/20`}
                onClick={() => {
                  if (!open) {
                    fetchNotifications();
                  }
                }}
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className={`h-6 w-6 ${isScrolled ? 'text-emerald-600' : 'text-white'}`} aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Popover.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute right-0 z-10 mt-2 w-96 origin-top-right rounded-lg bg-white/90 backdrop-blur-md shadow-xl ring-1 ring-emerald-200/50 focus:outline-none overflow-hidden border border-emerald-200/30">
                  <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 py-3 px-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <BellIcon className="h-5 w-5 mr-2 text-emerald-200" />
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="text-sm text-emerald-100 hover:text-white font-medium px-3 py-1 rounded bg-emerald-500/30 hover:bg-emerald-500/50 transition-colors"
                        onClick={markAsRead}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-[70vh] overflow-y-auto">
                    {loading && (
                      <div className="py-8 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
                      </div>
                    )}

                    {error && (
                      <div className="py-6 text-center text-red-500 bg-red-50/60 mx-2 my-2 rounded-md">{error}</div>
                    )}

                    {!loading && !error && notifications.length === 0 && (
                      <div className="py-12 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                          <BellIcon className="h-8 w-8 text-emerald-500" />
                        </div>
                        <p className="text-emerald-800 font-medium">No notifications yet</p>
                        <p className="text-emerald-600 text-sm mt-1">We'll notify you of important updates here</p>
                      </div>
                    )}

                    {!loading && notifications.length > 0 && (
                      <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                          <div 
                            key={notification._id} 
                            className={`p-4 flex items-start gap-3 ${!notification.read ? 'bg-emerald-50/90' : ''} hover:bg-emerald-50 transition-colors`}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              <div className={`p-2 rounded-full ${!notification.read ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1 py-1">
                              <div className="flex justify-between items-start">
                                <p className="text-sm font-medium text-emerald-900">{notification.title}</p>
                                <p className="text-xs text-emerald-600 ml-2">{formatTimestamp(notification.createdAt)}</p>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-emerald-100 bg-gradient-to-r from-emerald-50 to-emerald-100/50 py-3">
                    <div className="flex justify-center">
                      <a
                        href="/notifications"
                        className="px-4 py-2 text-sm text-emerald-700 hover:text-emerald-900 font-medium flex items-center"
                      >
                        View all notifications
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <button
          ref={buttonRef}
          type="button"
          className="relative inline-flex items-center justify-center p-2 text-white transition-colors"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              fetchNotifications();
            }
          }}
        >
          <span className="sr-only">View notifications</span>
          <BellIcon className="h-6 w-6" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Mobile Notification Panel */}
        <Transition
          show={isOpen}
          as={Fragment}
          enter="transform transition ease-in-out duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition ease-in-out duration-300"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <div 
            ref={notificationRef}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-gradient-to-b from-emerald-800 via-emerald-800 to-emerald-900 shadow-lg"
          >
            <div className="flex h-full flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-700">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <BellIcon className="h-5 w-5 mr-2 text-emerald-200" />
                  Notifications
                </h2>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="text-sm text-emerald-300 hover:text-emerald-100 font-medium bg-emerald-700/50 hover:bg-emerald-700 px-3 py-1 rounded-md transition-colors"
                      onClick={markAsRead}
                    >
                      Mark all as read
                    </button>
                  )}
                  <button
                    type="button"
                    className="p-1 rounded-md text-white hover:text-emerald-200 focus:outline-none"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="sr-only">Close panel</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-2">
                {loading && (
                  <div className="py-12 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-300 border-r-transparent"></div>
                  </div>
                )}

                {error && (
                  <div className="py-6 text-center text-red-300 bg-red-900/20 mt-4 rounded-lg">{error}</div>
                )}

                {!loading && !error && notifications.length === 0 && (
                  <div className="py-12 text-center text-emerald-200">
                    <div className="mx-auto w-16 h-16 rounded-full bg-emerald-700/50 flex items-center justify-center mb-3">
                      <BellIcon className="h-8 w-8 text-emerald-300" />
                    </div>
                    <p className="font-medium">No notifications yet</p>
                    <p className="text-emerald-300/80 text-sm mt-1">We'll notify you of important updates here</p>
                  </div>
                )}

                <div className="divide-y divide-emerald-700/50">
                  {notifications.map((notification) => (
                    <div 
                      key={notification._id} 
                      className={`py-4 flex items-start gap-3 ${!notification.read ? 'bg-emerald-700/20 -mx-4 px-4 rounded' : ''}`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <div className={`p-2 rounded-full ${!notification.read ? 'bg-emerald-700/30' : 'bg-emerald-900/40'}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 py-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-white">{notification.title}</p>
                          <p className="text-xs text-emerald-300/80 ml-2">{formatTimestamp(notification.createdAt)}</p>
                        </div>
                        <p className="text-sm text-emerald-200 mt-1">{notification.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="py-3 border-t border-emerald-700 bg-emerald-800/50">
                <div className="flex justify-center">
                  <a
                    href="/notifications"
                    className="px-4 py-2 text-sm bg-emerald-700/50 hover:bg-emerald-700 text-emerald-200 hover:text-white font-medium rounded-md flex items-center transition-colors"
                  >
                    View all notifications
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        {/* Backdrop Overlay */}
        <Transition
          show={isOpen}
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-30"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-30"
          leaveTo="opacity-0"
        >
          <div 
            className="fixed inset-0 bg-black z-40"
            onClick={() => setIsOpen(false)}
          />
        </Transition>
      </div>
    </>
  );
}

// Missing ClockIcon definition, add it if not imported
const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);