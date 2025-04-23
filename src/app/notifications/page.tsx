'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import * as authService from '@/services/authService';
import * as notificationService from '@/services/notificationService';
import type { Notification } from '@/services/notificationService'; // Import type

// --- Import Icons ---
import {
    XMarkIcon, BellAlertIcon, CalendarIcon, TruckIcon, CloudIcon,
    CurrencyDollarIcon, ExclamationTriangleIcon, CheckCircleIcon,
    LifebuoyIcon, ArrowPathIcon
} from '@heroicons/react/24/outline'; // Use outline for consistency

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    // Add state for pagination if needed later

    // --- Authentication Check ---
    useEffect(() => {
        if (!authService.isAuthenticated()) {
            toast.error("Please log in to view notifications.");
            router.push('/login?redirect=/notifications');
        } else {
            setIsAuthChecked(true);
        }
    }, [router]);

    // --- Fetch Notifications ---
    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch all notifications for the user (adjust params for pagination later)
            const data = await notificationService.getUserNotifications({ limit: 50 }); // Fetch more for a page view
            setNotifications(data.notifications || []);
            // Note: We don't need to set unreadCount here, context handles it
        } catch (err: any) {
            console.error("Error fetching notifications page:", err);
            const errMsg = err.message || "Could not load notifications.";
            setError(errMsg);
            toast.error(errMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthChecked) {
            fetchNotifications();
        }
    }, [isAuthChecked, fetchNotifications]);

    // --- Handlers ---
    const handleMarkAsRead = async (notificationId: string, isCurrentlyRead: boolean) => {
        if (isCurrentlyRead) return;
        try {
            // Call service to mark read on backend (this also updates context count via socket)
            await notificationService.markNotificationsRead({ notificationIds: [notificationId] });
            // Update local state for immediate UI feedback
            setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
        } catch (error: any) {
            toast.error(`Failed to mark as read: ${error.message}`);
        }
    };

    const handleDeleteNotification = async (notificationId: string) => {
        const originalNotifications = [...notifications];
        // Optimistic UI update
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        try {
            // Call service to delete on backend (this also updates context count via socket)
            await notificationService.deleteNotification(notificationId);
            toast.success("Notification deleted.");
        } catch (error: any) {
            toast.error(`Failed to delete: ${error.message}`);
            setNotifications(originalNotifications); // Rollback on error
        }
    };

    // --- Helpers ---
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'booking_created': case 'booking_status_update': case 'booking_reminder': return <CalendarIcon className="h-6 w-6 text-blue-500" />;
            case 'transportation_update': return <TruckIcon className="h-6 w-6 text-green-500" />;
            case 'weather_alert': return <CloudIcon className="h-6 w-6 text-purple-500" />;
            case 'donation_received': case 'donation_thankyou': return <CurrencyDollarIcon className="h-6 w-6 text-amber-500" />;
            case 'financial_aid_update': return <LifebuoyIcon className="h-6 w-6 text-indigo-500" />;
            case 'system_announcement': return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
            default: return <CheckCircleIcon className="h-6 w-6 text-gray-500" />;
        }
    };

    const formatNotificationDate = (dateStr: string): string => {
        try {
            // Example: Sep 23, 2024 at 9:30 AM
            return format(parseISO(dateStr), 'MMM d, yyyy \'at\' h:mm a');
        } catch { return 'Invalid Date'; }
    };

    // --- Render Logic ---
    if (!isAuthChecked) {
        // Show a minimal loading/redirecting state
        return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p>Checking authentication...</p></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 pt-20 pb-12 sm:py-16 relative overflow-hidden">
            {/* Cricket Stadium Background */}
            <div className="absolute inset-0">
                {/* Oval field */}
                <div className="absolute top-[10%] left-[5%] right-[5%] bottom-[10%] rounded-full border-2 border-white/20 bg-green-700/30"></div>
                
                {/* Pitch - LEFT SIDE */}
                <div className="absolute top-1/2 left-[20%] w-40 h-96 bg-yellow-100/20 -translate-x-1/2 -translate-y-1/2 border border-white/10">
                    {/* Crease markings */}
                    <div className="absolute top-[15%] left-0 right-0 h-1 bg-white/30"></div>
                    <div className="absolute bottom-[15%] left-0 right-0 h-1 bg-white/30"></div>
                    <div className="absolute top-[15%] bottom-[15%] left-1/2 w-1 bg-white/10 -translate-x-1/2"></div>
                    
                    {/* Wickets */}
                    <div className="absolute top-[5%] left-1/2 -translate-x-1/2 flex space-x-1">
                        <div className="w-1 h-8 bg-white/80"></div>
                        <div className="w-1 h-8 bg-white/80"></div>
                        <div className="w-1 h-8 bg-white/80"></div>
                    </div>
                    
                    <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 flex space-x-1">
                        <div className="w-1 h-8 bg-white/80"></div>
                        <div className="w-1 h-8 bg-white/80"></div>
                        <div className="w-1 h-8 bg-white/80"></div>
                    </div>
                </div>
                
                {/* Second pitch - RIGHT SIDE */}
                <div className="absolute top-1/2 right-[20%] w-40 h-96 bg-yellow-100/20 translate-x-1/2 -translate-y-1/2 border border-white/10">
                    {/* Crease markings */}
                    <div className="absolute top-[15%] left-0 right-0 h-1 bg-white/30"></div>
                    <div className="absolute bottom-[15%] left-0 right-0 h-1 bg-white/30"></div>
                    <div className="absolute top-[15%] bottom-[15%] left-1/2 w-1 bg-white/10 -translate-x-1/2"></div>
                    
                    {/* Wickets */}
                    <div className="absolute top-[5%] left-1/2 -translate-x-1/2 flex space-x-1">
                        <div className="w-1 h-8 bg-white/80"></div>
                        <div className="w-1 h-8 bg-white/80"></div>
                        <div className="w-1 h-8 bg-white/80"></div>
                    </div>
                    
                    <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 flex space-x-1">
                        <div className="w-1 h-8 bg-white/80"></div>
                        <div className="w-1 h-8 bg-white/80"></div>
                        <div className="w-1 h-8 bg-white/80"></div>
                    </div>
                </div>
                
                {/* Boundary rope */}
                <div className="absolute top-[15%] left-[10%] right-[10%] bottom-[15%] rounded-full border-dashed border-4 border-white/20"></div>
                
                {/* Animated players - FIELDERS */}
                <div className="absolute w-6 h-8 top-[30%] left-[10%] animate-fielder-move">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
                        <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
                    </div>
                </div>
                
                <div className="absolute w-6 h-8 top-[70%] right-[10%] animate-fielder-move animation-delay-500">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
                        <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
                    </div>
                </div>
                
                <div className="absolute w-6 h-8 bottom-[40%] left-[5%] animate-fielder-move animation-delay-1000">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
                        <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
                    </div>
                </div>
                
                {/* Batsman - LEFT SIDE */}
                <div className="absolute w-8 h-12 top-[40%] left-[15%] animate-batsman-ready">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
                        <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
                        <div className="absolute top-2 left-5 w-1 h-10 bg-yellow-800/80 rotate-45 origin-top-left animate-bat-swing"></div>
                    </div>
                </div>
                
                {/* Bowler - LEFT SIDE */}
                <div className="absolute w-8 h-12 bottom-[35%] left-[25%] animate-bowler-run">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-blue-500/80"></div>
                        <div className="absolute top-4 left-2.5 w-3 h-6 bg-blue-600/60"></div>
                        <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500/80 animate-cricket-ball"></div>
                    </div>
                </div>
            </div>
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-8">
                                <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-white/20">
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center">
                            <BellAlertIcon className="h-7 w-7 mr-3 text-yellow-400" />
                            Your Notifications
                        </h1>
                        <button
                            onClick={fetchNotifications}
                            disabled={isLoading}
                            className="inline-flex items-center px-3 py-1.5 border border-white/30 shadow-sm text-xs font-medium rounded-md text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
                        >
                            <ArrowPathIcon className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    <div className="p-6">
                        {isLoading ? (
                            <div className="text-center py-10">
                                <div className="inline-block w-8 h-8 border-4 border-emerald-200/30 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
                                <p className="text-white/80">Loading notifications...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-900/30 backdrop-blur-sm text-red-100 px-4 py-3 rounded-lg relative border border-red-700/30" role="alert">
                                <strong className="font-bold">Error: </strong>
                                <span className="block sm:inline">{error}</span>
                                <button onClick={fetchNotifications} className="ml-4 text-red-100 underline">Retry</button>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-16 bg-white/10 backdrop-blur-sm rounded-lg shadow border border-white/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white/60 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                <h3 className="text-lg font-medium text-white mb-2">No Notifications Yet</h3>
                                <p className="mt-1 text-sm text-emerald-100">You're all caught up!</p>
                            </div>
                        ) : (
                            <ul role="list" className="space-y-4">
                                {notifications.map((notification) => (
                                  <li key={notification._id} className={`relative backdrop-blur-sm rounded-lg shadow-md border transition-all duration-200 group ${notification.isRead ? 'bg-white/15 border-white/30 hover:bg-white/25' : 'bg-emerald-800/50 border-emerald-500/40 hover:bg-emerald-800/70'}`}>
                                    <ConditionalLinkPage href={notification.link} className="block p-5 pr-12" onClick={() => handleMarkAsRead(notification._id, notification.isRead)}>
                                      <div className="flex items-start space-x-4">
                                        <div className={`flex-shrink-0 mt-1 p-2.5 rounded-full ${notification.isRead ? 'bg-white/15 ring-1 ring-white/30' : 'bg-emerald-600/70 ring-1 ring-emerald-400/30'}`}>
                                          {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className={`text-sm leading-relaxed tracking-wide ${notification.isRead ? 'text-white/90' : 'text-white font-medium'}`}>
                                            {notification.message}
                                          </p>
                                          <p className={`text-xs mt-2 ${notification.isRead ? 'text-white/60' : 'text-emerald-200 font-medium'}`}>
                                            {formatNotificationDate(notification.createdAt)}
                                          </p>
                                        </div>
                                      </div>
                                    </ConditionalLinkPage>
                                    
                                    {/* Delete Button */}
                                    <button
                                      type="button"
                                      className="absolute top-3 right-3 p-1.5 rounded-full text-white/50 hover:text-red-300 hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:ring-offset-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteNotification(notification._id);
                                      }}
                                      title="Delete notification"
                                    >
                                      <span className="sr-only">Dismiss notification</span>
                                      <XMarkIcon className="h-5 w-5" />
                                    </button>
                                    
                                    {/* Unread Indicator */}
                                    {!notification.isRead && (
                                      <span className="absolute top-5 left-3 h-3 w-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/30 pointer-events-none animate-pulse"></span>
                                    )}
                                  </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
            
            {/* CSS Animations */}
            <style jsx>{`
                @keyframes fielder-move {
                    0% { transform: translate(0, 0); }
                    25% { transform: translate(50px, 20px); }
                    50% { transform: translate(20px, 50px); }
                    75% { transform: translate(-30px, 20px); }
                    100% { transform: translate(0, 0); }
                }
                .animate-fielder-move {
                    animation: fielder-move 12s ease-in-out infinite;
                }
                
                @keyframes batsman-ready {
                    0%, 100% { transform: rotate(-5deg); }
                    50% { transform: rotate(5deg); }
                }
                .animate-batsman-ready {
                    animation: batsman-ready 3s ease-in-out infinite;
                }
                
                @keyframes nonstriker-ready {
                    0% { transform: translateX(0); }
                    50% { transform: translateX(10px); }
                    100% { transform: translateX(0); }
                }
                .animate-nonstriker-ready {
                    animation: nonstriker-ready 5s ease-in-out infinite;
                }
                
                @keyframes wicketkeeper-ready {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-5px) rotate(5deg); }
                }
                .animate-wicketkeeper-ready {
                    animation: wicketkeeper-ready 2s ease-in-out infinite;
                }
                
                @keyframes bowler-run {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-100px); }
                }
                .animate-bowler-run {
                    animation: bowler-run 5s ease-in-out infinite alternate;
                }
                
                @keyframes cricket-ball {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(-80px, -100px); }
                }
                .animate-cricket-ball {
                    animation: cricket-ball 5s ease-in infinite alternate;
                }
                
                @keyframes bat-swing {
                    0%, 70%, 100% { transform: rotate(45deg); }
                    80%, 90% { transform: rotate(-45deg); }
                }
                .animate-bat-swing {
                    animation: bat-swing 5s ease-in-out infinite;
                }
                
                .animation-delay-100 { animation-delay: 0.1s; }
                .animation-delay-300 { animation-delay: 0.3s; }
                .animation-delay-500 { animation-delay: 0.5s; }
                .animation-delay-700 { animation-delay: 0.7s; }
                .animation-delay-1000 { animation-delay: 1s; }
            `}</style>
        </div>
    );
}

// Helper component to conditionally render as Link or div for the page
const ConditionalLinkPage = ({ href, children, ...props }: any) => {
    // Only render as Link if href is a valid internal path
    const isInternalLink = href && href.startsWith('/');
    return isInternalLink ? (
        <Link href={href} {...props}>
            {children}
        </Link>
    ) : (
        // Render as a div but keep onClick for marking as read
        <div {...props}>
            {children}
        </div>
    );
};