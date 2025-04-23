// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next'; // Keep 'type' import for TSX
import Header from '../components/layout/Header'; // Adjust path if needed
import Footer from '../components/layout/Footer'; // Adjust path if needed
import { NotificationProvider } from '@/context/NotificationContext'; // Adjust path
import { Toaster } from 'react-hot-toast'; // Import Toaster

// Keep the type annotation for metadata
export const metadata: Metadata = {
  title: 'SportsBookSL - Sports Facility Booking Platform',
  description: 'Book sports facilities, equipment, and trainers across Sri Lanka',
};

// Keep the type annotation for props
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    return (
        // Keep suppressHydrationWarning if needed, it's valid
        <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
            <body className="font-sans h-full" suppressHydrationWarning>
                {/* Wrap the main content area with the NotificationProvider */}
                <NotificationProvider>
                    <div className="flex flex-col min-h-screen">
                        {/* Place Toaster inside the provider */}
                        <Toaster position="top-right" reverseOrder={false} />
                        <Header />
                        <main className="flex-grow">{children}</main>
                        <Footer />
                    </div>
                </NotificationProvider>
            </body>
        </html>
      );
}