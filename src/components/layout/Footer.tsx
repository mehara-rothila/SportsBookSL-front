'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Footer() {
  // 1. Use a static fallback for server rendering
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // Start with current year is safe if updated in useEffect
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null); // Added type for clarity
  const [showBackToTop, setShowBackToTop] = useState(false);

  // 2. Update the year on the client after hydration
  // This ensures the server and client match initially, then update client-side.
  useEffect(() => {
    // Show/hide back to top button based on scroll position
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check in case the page loads already scrolled down
    handleScroll();

    // Cleanup listener on component unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Empty dependency array ensures this runs once on mount

  // FAQ data for accordion
  const faqs = [
    {
      id: 'faq-1', // Add unique IDs for accessibility
      question: "How do I book a sports facility?",
      answer: "Browse our facilities, select your preferred date and time, and complete the booking process online. Payment can be made securely through our platform."
    },
    {
      id: 'faq-2',
      question: "Can I cancel my booking?",
      answer: "Yes, bookings can be cancelled up to 24 hours before the scheduled time for a full refund. Cancellations made later may be subject to our cancellation policy."
    },
    {
      id: 'faq-3',
      question: "Do you offer discounts for students?",
      answer: "Yes, we offer special rates for students with valid ID. You can apply the student discount during checkout."
    }
  ];

  // Sports categories for animated icons
  const sportsIcons = [
    { name: 'cricket', icon: 'M12.5 3.1L6 15l2 6.8 8.8-2.5L20 13l-7.5-9.9zM13 15a2 2 0 110-4 2 2 0 010 4z' },
    { name: 'soccer', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-10.5l1.5-2.5h3l1.5 2.5-1.5 2.5h-3l-1.5-2.5z' },
    { name: 'tennis', icon: 'M12.01 4C8.14 4 5 7.13 5 11c0 4.2 4.01 9 7.01 9s7.01-4.8 7.01-9c0-3.87-3.14-7-7.01-7zm0 2c2.76 0 5.01 2.24 5.01 5 0 2.65-2.35 4.97-5.01 4.97s-5.01-2.32-5.01-4.97c0-2.76 2.25-5 5.01-5z' },
    { name: 'basketball', icon: 'M17.09 11h4.91c-.14-4.2-1.88-5.95-4.06-7.95l-2.84 2.84c1.32 1.31 1.99 3.15 1.99 5.11zM6.91 11c0-1.96.67-3.8 1.99-5.11L6.05 3.05C3.88 5.05 2.14 6.8 2 11h4.91zM17.09 13c0 1.96-.67 3.8-1.99 5.11l2.84 2.84c2.17-2 3.92-3.75 4.06-7.95h-4.91zM6.91 13H2c.14 4.2 1.88 5.95 4.06 7.95l2.84-2.84c-1.32-1.31-1.99-3.15-1.99-5.11zM12 17.95c2.6 0 4.42-2.02 5.64-3.37.78-.85 1.31-2.01 1.36-3.58H5c.05 1.57.58 2.73 1.36 3.58 1.22 1.35 3.04 3.37 5.64 3.37zM12 6.05c-2.6 0-4.42 2.02-5.64 3.37-.78.85-1.31 2.01-1.36 3.58h14c-.05-1.57-.58-2.73-1.36-3.58-1.22-1.35-3.04-3.37-5.64-3.37z' },
    { name: 'volleyball', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 2.07c3.07.38 5.57 2.52 6.54 5.36L13 5.65V4.07zM8 5.08c1.18-.69 2.54-1.08 4-1.08v2.83L8 8.35V5.08zm-2.45 4.3C6.43 8 7.6 6.94 9 6.27v2.93L5.55 9.38zm-1.21 1.96C5.16 7.94 8.28 6.05 12 6.05s6.84 1.89 7.66 5.29l-9.22-4.14L4.34 11.34zM12 18c-1.93 0-3.68-.79-4.94-2.06l4.94-2.22 4.94 2.22C15.68 17.21 13.93 18 12 18zm-1-15.93v2.5L5.36 8.21c.96-2.84 3.46-4.99 6.54-5.36L11 2.07z' },
    { name: 'swimming', icon: 'M22 21c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.08.64-2.19.64-1.11 0-1.73-.37-2.18-.64-.37-.23-.6-.36-1.15-.36s-.78.13-1.15.36c-.46.27-1.08.64-2.19.64v-2c.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64s1.73.37 2.18.64c.37.23.6.36 1.15.36.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64 1.11 0 1.73.37 2.18.64.37.22.6.36 1.15.36s.78-.13 1.15-.36c.46-.27 1.08-.64 2.19-.64s1.73.37 2.18.64c.37.23.59.36 1.15.36v2zm0-4.5c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36s-.78.13-1.15.36c-.47.27-1.09.64-2.2.64v-2c.56 0 .78-.13 1.15-.36.47-.27 1.09-.64 2.2-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36.56 0 .78-.13 1.15-.36.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36s.78-.13 1.15-.36c.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36v2zM8.67 12c.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64 1.11 0 1.73.37 2.18.64.37.22.6.36 1.15.36s.78-.13 1.15-.36c.12-.07.26-.15.41-.23L10.48 5C8.93 3.45 7.5 2.99 5 3v2.5c1.82-.01 2.89.39 4 1.5l1 1-3.25 3.25c.31.12.56.27.77.39.37.23.59.36 1.15.36z' }
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { // Added type for event
    e.preventDefault();
    if (!email || isSubmitting) return; // Basic validation

    setIsSubmitting(true);
    // Simulate API call
    console.log("Submitting email:", email); // Replace with actual API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setEmail('');
      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    }, 1000);
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Toggle FAQ accordion
  const toggleQuestion = (index: number) => { // Added type for index
    setActiveQuestion(activeQuestion === index ? null : index);
  }; // <<<--- ADDED SEMICOLON HERE

  return (
    <>
      {/* Pre-footer CTA Section */}
      <section className="relative py-16 bg-gradient-to-br from-emerald-800 to-emerald-900 overflow-hidden">
        {/* Animated sports balls */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none" aria-hidden="true">
          {/* Using CSS variables for potentially dynamic values later */}
          <div style={{ '--ball-size': '4rem', '--ball-top': '10%', '--ball-left': '5%', '--ball-delay': '0s' } as React.CSSProperties} className="absolute w-[var(--ball-size)] h-[var(--ball-size)] bg-yellow-300 rounded-full top-[var(--ball-top)] left-[var(--ball-left)] opacity-20 animate-float animation-delay-[var(--ball-delay)]"></div>
          <div style={{ '--ball-size': '5rem', '--ball-top': 'auto', '--ball-bottom': '15%', '--ball-left': 'auto', '--ball-right': '10%', '--ball-delay': '1s' } as React.CSSProperties} className="absolute w-[var(--ball-size)] h-[var(--ball-size)] bg-orange-500 rounded-full bottom-[var(--ball-bottom)] right-[var(--ball-right)] opacity-20 animate-float animation-delay-[var(--ball-delay)]"></div>
          <div style={{ '--ball-size': '3rem', '--ball-top': '40%', '--ball-left': 'auto', '--ball-right': '15%', '--ball-delay': '0.5s' } as React.CSSProperties} className="absolute w-[var(--ball-size)] h-[var(--ball-size)] bg-white rounded-full top-[var(--ball-top)] right-[var(--ball-right)] opacity-20 animate-float animation-delay-[var(--ball-delay)]"></div>
          <div style={{ '--ball-size': '2rem', '--ball-top': 'auto', '--ball-bottom': '30%', '--ball-left': '20%', '--ball-delay': '1.5s' } as React.CSSProperties} className="absolute w-[var(--ball-size)] h-[var(--ball-size)] bg-red-600 rounded-full bottom-[var(--ball-bottom)] left-[var(--ball-left)] opacity-20 animate-float animation-delay-[var(--ball-delay)]"></div>
        </div>

        {/* Background pattern */}
        <div className="absolute inset-0 bg-sports-pattern opacity-5" aria-hidden="true"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-5">
              {/* Stadium image - left side */}
              <div className="lg:col-span-2 relative h-64 lg:h-auto overflow-hidden group"> {/* Added group for hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 via-transparent to-transparent z-10" aria-hidden="true"></div>
                {/* Using standard img tag as next/image wasn't imported and might add complexity if not needed */}
                <img
                  src="https://plus.unsplash.com/premium_photo-1666913667023-4bfd0f6cff0a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Abstract view of a sports stadium lighting"
                  loading="lazy" // Add lazy loading
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[3000ms]" // Use milliseconds for Tailwind duration
                />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-900 to-transparent" aria-hidden="true"></div>
              </div>

              {/* Content - right side */}
              <div className="lg:col-span-3 p-8 lg:p-10">
                <div className="flex flex-col h-full justify-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700/60 text-emerald-100 mb-4 w-fit">
                    JOIN OUR COMMUNITY
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-5">Ready to Step Up Your Game?</h3>
                  <p className="text-emerald-100 mb-8 max-w-lg">
                    Book top sports facilities, find professional trainers, and access premium equipment across Sri Lanka.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Added group class for icon animation */}
                    <Link href="/register" className="group inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 px-6 py-3 text-base font-medium text-white shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                      Get Started
                      <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                    <Link href="/donate" className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 px-6 py-3 text-base font-medium text-white shadow-md transform transition-all duration-300 hover:border-white/50">
                      Support Athletes
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {/* Stat Item */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 transform transition-all duration-300 hover:-translate-y-1 hover:bg-white/15">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">300+</div>
              <div className="text-emerald-200 text-sm">Sports Facilities</div>
            </div>
             {/* Stat Item */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 transform transition-all duration-300 hover:-translate-y-1 hover:bg-white/15">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-emerald-200 text-sm">Professional Trainers</div>
            </div>
             {/* Stat Item */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 transform transition-all duration-300 hover:-translate-y-1 hover:bg-white/15">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">20+</div>
              <div className="text-emerald-200 text-sm">Sport Categories</div>
            </div>
             {/* Stat Item */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 transform transition-all duration-300 hover:-translate-y-1 hover:bg-white/15">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">15K+</div>
              <div className="text-emerald-200 text-sm">Satisfied Athletes</div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={faq.id} // Use unique ID for key
                  className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden transition-all duration-300"
                >
                  <button
                    className="w-full px-6 py-4 text-left text-white font-medium flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-400" // Added focus ring
                    onClick={() => toggleQuestion(index)}
                    aria-expanded={activeQuestion === index} // Accessibility
                    aria-controls={faq.id} // Accessibility
                    suppressHydrationWarning={true} // Keep this for accordion button
                  >
                    <span>{faq.question}</span>
                    <svg
                      className={`w-5 h-5 text-emerald-300 transform transition-transform duration-300 ${activeQuestion === index ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true" // Decorative icon
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    id={faq.id} // Accessibility
                    role="region" // Accessibility
                    className={`px-6 overflow-hidden transition-all ease-in-out duration-300 ${
                      activeQuestion === index ? 'max-h-60 pb-4 opacity-100' : 'max-h-0 opacity-0' // Added opacity transition
                    }`}
                  >
                    <p className="text-emerald-100">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="relative z-10 pt-20 pb-8 bg-gradient-to-b from-emerald-900 to-black backdrop-blur-sm text-white overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-sports-pattern opacity-5" aria-hidden="true"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-800 rounded-full opacity-10 blur-3xl pointer-events-none" aria-hidden="true"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-800 rounded-full opacity-10 blur-3xl pointer-events-none" aria-hidden="true"></div>

        {/* Animated sport icons - Deterministic positions */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none" aria-hidden="true">
          {sportsIcons.map((sport, index) => {
            const positions = [
              { top: "60%", left: "18%", delay: "0s", duration: "12.9s" },
              { top: "31%", left: "46%", delay: "0.5s", duration: "12.8s" },
              { top: "46%", left: "73%", delay: "1s", duration: "11.7s" },
              { top: "38%", left: "33%", delay: "1.5s", duration: "11.9s" },
              { top: "41%", left: "27%", delay: "2s", duration: "8.3s" },
              { top: "51%", left: "77%", delay: "2.5s", duration: "8.4s" }
            ];
            const position = positions[index % positions.length]; // Use modulo for safety if more icons than positions

            return (
              <div
                key={`${sport.name}-${index}`} // More specific key
                className="absolute w-8 h-8 text-emerald-500/20 animate-float-random"
                style={{
                  top: position.top,
                  left: position.left,
                  animationDelay: position.delay,
                  animationDuration: position.duration
                } as React.CSSProperties} // Added type assertion for style
                aria-hidden="true" // Decorative element
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d={sport.icon} />
                </svg>
              </div>
            );
          })}
        </div>

        {/* Decorative field lines */}
        <div className="absolute top-1/2 left-1/2 w-[60%] h-[1px] bg-emerald-500/10 -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true"></div>
        <div className="absolute top-1/2 left-1/2 w-[1px] h-[60%] bg-emerald-500/10 -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true"></div>
        <div className="absolute top-1/2 left-1/2 w-[40%] h-[40%] border border-emerald-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true"></div>

        <div className="container mx-auto px-4 relative">
          {/* Footer Top */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 relative">
            {/* Left Column - Brand & Newsletter */}
            <div className="lg:col-span-5 space-y-8">
              <div className="transform transition-all duration-300 hover:-translate-y-1">
                <Link href="/" className="inline-block group" aria-label="SportsBookSL Home">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      <span className="text-white text-2xl font-bold">SB</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      Sports<span className="text-emerald-400">BookSL</span>
                    </div>
                  </div>
                </Link>
                <p className="mt-4 text-gray-400 max-w-md leading-relaxed">
                  Book sports facilities across Sri Lanka, find trainers, rent equipment, and support local athletes - all on one platform.
                </p>

                {/* App download links */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Get it on Google Play" className="flex items-center bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20 transition-all duration-300">
                    <svg className="h-5 w-5 mr-2 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.2777 12.0363L20.3431 15.1017L13.4036 22.0412C13.0131 22.4317 12.3799 22.4317 11.9895 22.0412L5.05012 15.1018L8.11551 12.0364L12.7016 16.6225L17.2777 12.0363Z"/>
                      <path d="M5.05028 8.98195L8.11566 12.0473L12.7018 7.46119L17.2779 12.0373L20.3433 8.97195L13.4038 2.03244C13.0133 1.64192 12.3801 1.64192 11.9896 2.03244L5.05028 8.98195Z"/>
                    </svg>
                    <span className="text-white text-sm">Google Play</span>
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Download on the App Store" className="flex items-center bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20 transition-all duration-300">
                    <svg className="h-5 w-5 mr-2 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M16.53 11.063c-.033-3.307 2.67-4.935 2.796-5.01-1.53-2.248-3.9-2.554-4.733-2.576-1.988-.213-3.934 1.186-4.95 1.186-1.05 0-2.638-1.165-4.347-1.13-2.204.033-4.268 1.3-5.4 3.27-2.336 4.052-.595 10.007 1.65 13.285 1.124 1.61 2.44 3.404 4.166 3.342 1.687-.075 2.312-1.073 4.347-1.073 2.005 0 2.592 1.073 4.347 1.033 1.8-.03 2.94-1.62 4.03-3.246 1.293-1.864 1.813-3.69 1.834-3.783-.043-.016-3.498-1.343-3.532-5.328zm-3.316-9.804c.902-1.127 1.522-2.668 1.35-4.22-1.306.056-2.936.888-3.878 1.986-.836.975-1.584 2.568-1.39 4.07 1.47.112 2.974-.757 3.918-1.836z"/>
                    </svg>
                    <span className="text-white text-sm">App Store</span>
                  </a>
                </div>
              </div>

              {/* Newsletter Form */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6 space-y-4 transform transition-all duration-300 hover:shadow-emerald-700/10 hover:shadow-lg">
                <h3 className="text-xl font-semibold text-white">Stay in the game</h3>
                <p className="text-gray-400">Get the latest updates on new facilities and special promotions.</p>

                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-grow">
                      <label htmlFor="footer-email" className="sr-only">Email address</label>
                      <div className="relative">
                        <input
                          id="footer-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          aria-required="true"
                          className="w-full bg-black/30 text-white border border-emerald-700/30 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-gray-500"
                          suppressHydrationWarning={true} // Keep this for email input
                        />
                        {isSubmitted && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400 pointer-events-none" aria-hidden="true">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {isSubmitted && (
                        <p role="status" className="mt-2 text-sm text-emerald-400">Thank you for subscribing!</p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting || email === ''}
                      className={`flex-shrink-0 px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${ // Added flex for loader alignment
                        isSubmitting || email === ''
                          ? 'bg-emerald-900/50 text-emerald-200/50 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-600/20 hover:-translate-y-0.5'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing
                        </>
                      ) : (
                        'Subscribe'
                      )}
                    </button>
                  </div>
                </form>

                {/* Disclaimer text */}
                <p className="text-xs text-gray-500 mt-3">By subscribing, you agree to our <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 underline">Privacy Policy</Link>. We respect your privacy.</p>
              </div>
            </div>

            {/* Middle Column - Map */}
            <div className="lg:col-span-3 hidden lg:block">
              <div className="h-full w-full rounded-xl overflow-hidden shadow-lg relative border border-white/10"> {/* Added border */}
                <iframe
                  title="Location of SportsBookSL on Google Maps" // Added title
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253840.65294540213!2d79.7651953681139!3d6.922003147285647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2sus!4v1649675979959!5m2!1sen!2sus"
                  className="w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen={false} // Often better false for embeds unless needed
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-20 pointer-events-none" aria-hidden="true">
                  <div className="flex items-center text-white">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">Colombo, Sri Lanka</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Navigation links */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-8">
              {/* Link Section */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4 border-b border-emerald-800/50 pb-2">Bookings</h3>
                <ul className="space-y-3">
                  {[
                    { href: "/facilities", label: "Facility Booking" },
                    { href: "/trainers", label: "Trainer Booking" },
                    { href: "/equipment", label: "Equipment Rental" },
                    { href: "/financial-aid/apply", label: "Financial Aid" },
                    { href: "/donations", label: "Donations" },
                  ].map(link => (
                     <li key={link.href}>
                       <Link href={link.href} className="text-gray-400 hover:text-white transition-colors flex items-center group">
                         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 group-hover:bg-white transition-colors" aria-hidden="true"></span>
                         {link.label}
                       </Link>
                     </li>
                  ))}
                </ul>

                <h3 className="text-lg font-semibold text-emerald-400 mb-4 border-b border-emerald-800/50 pb-2 mt-8">Support</h3>
                <ul className="space-y-3">
                 {[
                    { href: "/help", label: "Help Center" },
                    { href: "/contact", label: "Contact Us" },
                  ].map(link => (
                     <li key={link.href}>
                       <Link href={link.href} className="text-gray-400 hover:text-white transition-colors flex items-center group">
                         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 group-hover:bg-white transition-colors" aria-hidden="true"></span>
                         {link.label}
                       </Link>
                     </li>
                  ))}
                  <li>
                    <Link href="/status" className="flex items-center text-gray-400 hover:text-white transition-colors group">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 group-hover:bg-white transition-colors" aria-hidden="true"></span>
                      System Status
                      <span className="ml-2 inline-flex h-2 w-2 bg-green-500 rounded-full animate-pulse" aria-label="System Status: Operational"></span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Link Section */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4 border-b border-emerald-800/50 pb-2">Company</h3>
                <ul className="space-y-3">
                   {[
                    { href: "/about", label: "About Us" },
                    { href: "/blog", label: "Blog" },
                    { href: "/press", label: "Press" },
                    { href: "/partners", label: "Partners" },
                    { href: "/careers", label: "Careers" },
                  ].map(link => (
                     <li key={link.href}>
                       <Link href={link.href} className="text-gray-400 hover:text-white transition-colors flex items-center group">
                         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 group-hover:bg-white transition-colors" aria-hidden="true"></span>
                         {link.label}
                       </Link>
                     </li>
                  ))}
                </ul>

                <h3 className="text-lg font-semibold text-emerald-400 mb-4 border-b border-emerald-800/50 pb-2 mt-8">Legal</h3>
                <ul className="space-y-3">
                  {[
                    { href: "/privacy", label: "Privacy Policy" },
                    { href: "/terms", label: "Terms of Service" },
                    { href: "/cookies", label: "Cookie Policy" },
                  ].map(link => (
                     <li key={link.href}>
                       <Link href={link.href} className="text-gray-400 hover:text-white transition-colors flex items-center group">
                         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 group-hover:bg-white transition-colors" aria-hidden="true"></span>
                         {link.label}
                       </Link>
                     </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Middle - Contact info & social media */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-10 pb-10">
            {/* Contact Info */}
            <div className="flex flex-col space-y-4">
              <h4 className="text-lg font-semibold text-white">Contact Us</h4>
              {/* Contact Item */}
              <div className="flex items-start space-x-3">
                <svg className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="text-gray-400 text-sm">
                  <p>123 Sports Avenue, Colombo 05</p>
                  <p>Sri Lanka</p>
                </div>
              </div>
              {/* Contact Item */}
              <div className="flex items-start space-x-3">
                <svg className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div className="text-gray-400 text-sm">
                  <a href="tel:+94112345678" className="hover:text-white">+94 112 345 678</a><br/>
                  <a href="tel:+94777123456" className="hover:text-white">+94 777 123 456</a>
                </div>
              </div>
              {/* Contact Item */}
              <div className="flex items-start space-x-3">
                <svg className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="text-gray-400 text-sm">
                 <a href="mailto:info@sportsbooksl.com" className="hover:text-white">info@sportsbooksl.com</a><br/>
                 <a href="mailto:support@sportsbooksl.com" className="hover:text-white">support@sportsbooksl.com</a>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="flex flex-col space-y-4">
              <h4 className="text-lg font-semibold text-white">Business Hours</h4>
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Monday - Friday:</span>
                  <span className="text-white">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Saturday:</span>
                  <span className="text-white">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Sunday:</span>
                  <span className="text-white">Closed</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-white/10">
                <h5 className="text-sm font-medium text-emerald-400 mb-2">Customer Support</h5>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">24/7 Online Support</span>
                  <span className="inline-flex items-center text-emerald-400 bg-emerald-900/50 px-2 py-0.5 rounded text-xs">Available</span>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
              <div className="grid grid-cols-2 gap-3">
                {[ // Define social links data
                    { name: "Facebook", href: "#", iconColor: "text-blue-500", svgPath: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" },
                    { name: "Instagram", href: "#", iconColor: "text-pink-500", svgPath: "M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" },
                    { name: "Twitter", href: "#", iconColor: "text-blue-400", svgPath: "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" },
                    { name: "YouTube", href: "#", iconColor: "text-red-500", svgPath: "M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z", fillRule: "evenodd", clipRule: "evenodd" }, // Added fill/clip rules
                ].map(social => (
                    <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/10 transition-all duration-300">
                      <svg className={`h-5 w-5 ${social.iconColor}`} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d={social.svgPath} fillRule={social.fillRule as 'evenodd' | 'nonzero' | undefined} clipRule={social.clipRule as 'evenodd' | 'nonzero' | undefined} /> {/* Added type assertion */}
                      </svg>
                      <span className="text-white text-sm">{social.name}</span>
                    </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-500 text-sm text-center md:text-left">
                {/* currentYear state is used here, which is updated client-side */}
                © {currentYear} SportsBookSL. All rights reserved.
              </div>

              {/* Language Selector & Social Icons */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                 {/* Language Selector */}
                 <div>
                  <label htmlFor="language-select" className="sr-only">Select Language</label>
                  <select
                    id="language-select"
                    // Add value and onChange handler if you want to control this with state later
                    className="bg-white/10 backdrop-blur-sm text-white text-sm rounded-lg border border-white/20 focus:ring-emerald-500 focus:border-emerald-500 px-3 py-1.5 cursor-pointer"
                    suppressHydrationWarning={true} // Keep this for select dropdown
                  >
                    <option value="en">English</option>
                    <option value="si">සිංහල</option>
                    <option value="ta">தமிழ்</option>
                  </select>
                </div>

                {/* Condensed Social Icons */}
                <div className="flex space-x-6">
                  {[ // Reuse social data
                    { name: "Facebook", href: "#", svgPath: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z", fillRule: "evenodd", clipRule: "evenodd" },
                    { name: "Instagram", href: "#", svgPath: "M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z", fillRule: "evenodd", clipRule: "evenodd" },
                    { name: "Twitter", href: "#", svgPath: "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" },
                    { name: "YouTube", href: "#", svgPath: "M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z", fillRule: "evenodd", clipRule: "evenodd" },
                   ].map(social => (
                      <Link key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors">
                        <span className="sr-only">{social.name}</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                           <path d={social.svgPath} fillRule={social.fillRule as 'evenodd' | 'nonzero' | undefined} clipRule={social.clipRule as 'evenodd' | 'nonzero' | undefined} /> {/* Added type assertion */}
                        </svg>
                      </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional links */}
            <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-xs text-gray-500">
              <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
              <span className="hidden sm:inline" aria-hidden="true">•</span>
              <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
              <span className="hidden sm:inline" aria-hidden="true">•</span>
              <Link href="/cookies" className="hover:text-emerald-400 transition-colors">Cookie Settings</Link>
              <span className="hidden sm:inline" aria-hidden="true">•</span>
              <Link href="/accessibility" className="hover:text-emerald-400 transition-colors">Accessibility</Link>
              <span className="hidden sm:inline" aria-hidden="true">•</span>
              <Link href="/sitemap" className="hover:text-emerald-400 transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to top button */}
      {showBackToTop && ( // Conditional rendering
        <button
          onClick={scrollToTop}
          className="fixed right-6 bottom-6 p-3 rounded-full bg-emerald-600 text-white shadow-lg transform transition-all duration-300 hover:bg-emerald-700 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-emerald-400 z-50 animate-fade-in" // Added simple fade-in animation
          aria-label="Back to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {/* Changed arrow for better visual */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px) rotate(2deg); } /* Slightly more movement */
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float {
          /* Use CSS variables from inline style */
          animation: float 6s ease-in-out infinite;
          animation-delay: var(--ball-delay, 0s);
        }

        @keyframes float-random {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          25% { transform: translate(5px, -15px) rotate(5deg); }
          50% { transform: translate(0px, 0px) rotate(0deg); }
          75% { transform: translate(-5px, 15px) rotate(-5deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        .animate-float-random {
          /* Style is applied inline */
          animation: float-random ease-in-out infinite;
        }

        /* Simple fade-in for back-to-top */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
           animation: fadeIn 0.3s ease-out forwards;
        }

        /* Ensure pattern doesn't cause issues */
        .bg-sports-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          background-repeat: repeat;
        }

        /* Improve focus visibility on dark backgrounds */
        *:focus-visible {
           outline: 2px solid #34d399; /* Emerald-400 */
           outline-offset: 2px;
        }
        button:focus-visible, a:focus-visible, select:focus-visible, input:focus-visible {
           /* Use Tailwind focus rings where possible, this is a fallback */
           outline: 2px solid #34d399;
           outline-offset: 2px;
        }
        /* Override default focus for specific elements if needed */
        button.focus\\:ring-inset:focus-visible {
           outline: none; /* Let Tailwind ring handle it */
        }
      `}</style>
    </>
  );
}