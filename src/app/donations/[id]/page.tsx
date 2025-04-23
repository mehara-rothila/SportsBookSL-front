'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import DonationForm from '@/components/donations/DonationForm'; // Adjust path if needed

// --- Icons ---
import { ArrowLeftIcon, MapPinIcon, StarIcon, TrophyIcon, CurrencyRupeeIcon } from '@heroicons/react/24/solid';

// --- Interface ---
interface AthleteDetail {
    _id: string;
    name: string;
    age: number;
    sport: string;
    goalAmount: number;
    raisedAmount: number;
    image: string;
    achievements: string[];
    story: string;
    location: string;
    // Add any other fields returned by GET /api/athletes/:id
}

// --- Get Base URL & Fallback Image ---
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5001';
const FALLBACK_ATHLETE_IMAGE = '/images/default-athlete.png';

function AthleteDonationPageContent() {
    const router = useRouter();
    const params = useParams();
    const athleteId = typeof params.id === 'string' ? params.id : undefined;

    const [athlete, setAthlete] = useState<AthleteDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!athleteId) {
            setError("Athlete ID not found in URL.");
            setLoading(false);
            return;
        }

        const fetchAthlete = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/athletes/${athleteId}`);
                if (response.data && response.data._id) {
                    setAthlete(response.data);
                } else {
                    throw new Error("Athlete not found or invalid data received.");
                }
            } catch (err: any) {
                console.error("Error fetching athlete details:", err);
                setError(err.response?.data?.message || "Failed to load athlete details.");
                setAthlete(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAthlete();
    }, [athleteId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900">
                <div className="w-16 h-16 border-4 border-emerald-200/30 border-t-emerald-400 rounded-full animate-spin"></div>
                <p className="ml-3 text-white">Loading details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 flex items-center justify-center">
                <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl max-w-lg">
                    <div className="text-red-300 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Error Loading Athlete</h3>
                    <p className="text-red-200">{error}</p>
                    <Link href="/donations" className="mt-6 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Return to Athletes
                    </Link>
                </div>
            </div>
        );
    }

    if (!athlete) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 flex items-center justify-center">
                <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl max-w-lg">
                    <h3 className="text-xl font-bold text-white mb-2">Athlete Not Found</h3>
                    <p className="text-emerald-200">The athlete you're looking for doesn't exist or has been removed.</p>
                    <Link href="/donations" className="mt-6 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Return to Athletes
                    </Link>
                </div>
            </div>
        );
    }

    const imageUrl = athlete.image ? `${BACKEND_BASE_URL}${athlete.image}` : FALLBACK_ATHLETE_IMAGE;
    const percentRaised = Math.min(Math.round((athlete.raisedAmount / athlete.goalAmount) * 100), 100);

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900">
            {/* Cricket Stadium Background */}
            <div className="absolute inset-0">
                {/* Oval field */}
                <div className="absolute top-[10%] left-[5%] right-[5%] bottom-[10%] rounded-full border-2 border-white/20 bg-green-700/30"></div>
                
                {/* Pitch - CENTER */}
                <div className="absolute top-1/2 left-1/2 w-40 h-96 bg-yellow-100/20 -translate-x-1/2 -translate-y-1/2 border border-white/10">
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
                
                {/* Second pitch - LEFT SIDE */}
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
                
                {/* Third pitch - RIGHT SIDE */}
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
                
                {/* Additional fielders */}
                <div className="absolute w-6 h-8 top-[25%] right-[30%] animate-fielder-move animation-delay-300">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
                        <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
                    </div>
                </div>
                
                <div className="absolute w-6 h-8 top-[60%] left-[30%] animate-fielder-move animation-delay-700">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-blue-500/80"></div>
                        <div className="absolute top-4 left-1.5 w-3 h-4 bg-blue-600/60"></div>
                    </div>
                </div>
                
                <div className="absolute w-6 h-8 top-[40%] right-[15%] animate-fielder-move animation-delay-900">
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
                
                {/* Batsman - CENTER */}
                <div className="absolute w-8 h-12 top-[40%] left-[35%] animate-batsman-ready">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
                        <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
                        <div className="absolute top-2 left-5 w-1 h-10 bg-yellow-800/80 rotate-45 origin-top-left animate-bat-swing"></div>
                    </div>
                </div>
                
                {/* Batsman - LEFT SIDE */}
                <div className="absolute w-8 h-12 top-[40%] left-[15%] animate-batsman-ready animation-delay-300">
                  <div className="relative w-full h-full">
                    <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
                    <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
                    <div className="absolute top-2 left-5 w-1 h-10 bg-yellow-800/80 rotate-45 origin-top-left animate-bat-swing"></div>
                  </div>
                </div>
                
                {/* Batsman - RIGHT SIDE */}
                <div className="absolute w-8 h-12 top-[40%] right-[15%] animate-batsman-ready animation-delay-500">
                  <div className="relative w-full h-full">
                    <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
                    <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
                    <div className="absolute top-2 left-5 w-1 h-10 bg-yellow-800/80 rotate-45 origin-top-left animate-bat-swing"></div>
                  </div>
                </div>
                
                {/* Second Batsman at non-striker's end - CENTER */}
                <div className="absolute w-8 h-12 top-[60%] left-[45%] animate-nonstriker-ready">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
                        <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
                    </div>
                </div>
                
                {/* Second Batsmen at non-striker's end - LEFT */}
                <div className="absolute w-8 h-12 top-[55%] left-[18%] animate-nonstriker-ready animation-delay-300">
                  <div className="relative w-full h-full">
                    <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
                    <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
                  </div>
                </div>
                
                {/* Second Batsmen at non-striker's end - RIGHT */}
                <div className="absolute w-8 h-12 top-[55%] right-[18%] animate-nonstriker-ready animation-delay-500">
                  <div className="relative w-full h-full">
                    <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
                    <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
                  </div>
                </div>
                
                {/* Bowler - CENTER */}
                <div className="absolute w-8 h-12 bottom-[35%] right-[35%] animate-bowler-run">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-blue-500/80"></div>
                        <div className="absolute top-4 left-2.5 w-3 h-6 bg-blue-600/60"></div>
                        <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500/80 animate-cricket-ball"></div>
                    </div>
                </div>
                
                {/* Bowler - LEFT SIDE */}
                <div className="absolute w-8 h-12 bottom-[35%] left-[25%] animate-bowler-run animation-delay-300">
                  <div className="relative w-full h-full">
                    <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-blue-500/80"></div>
                    <div className="absolute top-4 left-2.5 w-3 h-6 bg-blue-600/60"></div>
                    <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500/80 animate-cricket-ball"></div>
                  </div>
                </div>
                
                {/* Bowler - RIGHT SIDE */}
                <div className="absolute w-8 h-12 bottom-[35%] right-[25%] animate-bowler-run animation-delay-500">
                  <div className="relative w-full h-full">
                    <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-blue-500/80"></div>
                    <div className="absolute top-4 left-2.5 w-3 h-6 bg-blue-600/60"></div>
                    <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500/80 animate-cricket-ball"></div>
                  </div>
                </div>
                
                {/* Wicket Keeper - CENTER */}
                <div className="absolute w-8 h-12 bottom-[25%] right-[40%] animate-wicketkeeper-ready">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-yellow-500/80"></div>
                        <div className="absolute top-4 left-2.5 w-3 h-6 bg-yellow-600/60"></div>
                    </div>
                </div>
                
                {/* Wicket-keeper - LEFT SIDE (NEW) */}
                <div className="absolute w-6 h-8 top-[35%] left-[15%] animate-wicketkeeper-ready animation-delay-300">
                  <div className="relative w-full h-full">
                    <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-yellow-500/80"></div>
                    <div className="absolute top-4 left-1.5 w-3 h-4 bg-yellow-600/60"></div>
                  </div>
                </div>
                
                {/* Wicket-keeper - RIGHT SIDE (NEW) */}
                <div className="absolute w-6 h-8 top-[35%] right-[15%] animate-wicketkeeper-ready animation-delay-500">
                  <div className="relative w-full h-full">
                    <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-yellow-500/80"></div>
                    <div className="absolute top-4 left-1.5 w-3 h-4 bg-yellow-600/60"></div>
                  </div>
                </div>
                
                {/* Umpire */}
                <div className="absolute w-8 h-12 top-[45%] left-[53%]">
                    <div className="relative w-full h-full">
                        <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-black/80"></div>
                        <div className="absolute top-4 left-2.5 w-3 h-6 bg-white/60"></div>
                    </div>
                </div>
                
                {/* Ball trajectories */}
                <div className="absolute h-0.5 w-0 bg-red-500/30 top-[43%] left-[40%] animate-ball-trajectory"></div>
                <div className="absolute h-0.5 w-0 bg-red-500/30 top-[43%] left-[18%] animate-ball-trajectory animation-delay-300"></div>
                <div className="absolute h-0.5 w-0 bg-red-500/30 top-[43%] right-[18%] animate-ball-trajectory animation-delay-500"></div>
                
                {/* Stadium elements */}
                <div className="absolute top-0 left-0 w-full h-[5%] bg-gradient-to-b from-white/10 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-[5%] bg-gradient-to-t from-white/10 to-transparent"></div>
                <div className="absolute top-0 left-0 h-full w-[5%] bg-gradient-to-r from-white/10 to-transparent"></div>
                <div className="absolute top-0 right-0 h-full w-[5%] bg-gradient-to-l from-white/10 to-transparent"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 pt-40 pb-3 relative z-10">
                <Link href="/donations" className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 transition-colors mb-8 group">
                    <ArrowLeftIcon className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Back to Athletes
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left Column: Athlete Details */}
                    <div className="lg:col-span-7">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/20 mb-4">
                            <div className="flex flex-col sm:flex-row items-start">
                                <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-2 border-emerald-500/30 shadow-lg mb-3 sm:mb-0 sm:mr-4">
                                    <img 
                                        src={imageUrl} 
                                        alt={athlete.name} 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_ATHLETE_IMAGE; }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <span className="inline-block bg-emerald-900/50 backdrop-blur-sm text-emerald-100 px-2 py-0.5 rounded-full text-xs font-semibold mb-1">{athlete.sport}</span>
                                    <h1 className="text-xl font-bold text-white mb-1">{athlete.name}, {athlete.age}</h1>
                                    <div className="flex items-center text-emerald-100 text-sm mb-2">
                                        <MapPinIcon className="h-4 w-4 mr-1 text-emerald-300" /> {athlete.location}
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center text-xs text-emerald-100 mb-1">
                                            <span className="flex items-center">
                                                <CurrencyRupeeIcon className="h-3 w-3 mr-1 text-emerald-300" />
                                                {athlete.raisedAmount.toLocaleString()} raised
                                            </span>
                                            <span className="font-medium">Goal: Rs. {athlete.goalAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-emerald-900/50 backdrop-blur-sm rounded-full h-2 overflow-hidden">
                                            <div 
                                                className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                                                style={{ width: `${percentRaised}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-right text-xs font-medium text-emerald-300 mt-0.5">{percentRaised}% Funded</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/20 mb-4">
                            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-1 mb-2 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Athlete's Story
                            </h2>
                            <div className="text-emerald-100 text-sm leading-relaxed">
                                <p>{athlete.story}</p>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/20">
                            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-1 mb-2 flex items-center">
                                <TrophyIcon className="h-4 w-4 mr-2 text-yellow-400" />
                                Achievements
                            </h2>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                                {athlete.achievements.map((ach, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-900/50 text-emerald-400 mr-2 mt-0.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                        <span className="text-sm text-emerald-100">{ach}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Donation Form */}
                    <div className="lg:col-span-5">
                        <div>
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/20 mb-4">
                                <h2 className="text-lg font-bold text-white mb-3 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Support {athlete.name}
                                </h2>
                                <DonationForm
                                    athleteId={athlete._id}
                                    athleteName={athlete.name}
                                />
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg">
                                <h3 className="text-lg font-bold text-white border-b border-white/10 pb-1 mb-2 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Why Donate?
                                </h3>
                                <ul className="space-y-2 mt-2">
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0 w-6 h-6 bg-emerald-600/20 rounded-lg flex items-center justify-center mr-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-emerald-100">100% of your donation goes directly to the athlete's training and competition needs.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0 w-6 h-6 bg-emerald-600/20 rounded-lg flex items-center justify-center mr-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-emerald-100">Receive updates on {athlete.name}'s progress and achievements.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0 w-6 h-6 bg-emerald-600/20 rounded-lg flex items-center justify-center mr-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-emerald-100">Tax benefits available for donations above Rs. 2,000.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
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
                
                @keyframes ball-trajectory {
                    0% { width: 0; opacity: 0.7; }
                    100% { width: 100%; opacity: 0; }
                }
                .animate-ball-trajectory {
                    animation: ball-trajectory 5s ease-in infinite alternate;
                    transform-origin: left;
                }
                
                .animation-delay-300 {
                    animation-delay: 0.3s;
                }
                
                .animation-delay-400 {
                    animation-delay: 0.4s;
                }
                
                .animation-delay-500 {
                    animation-delay: 0.5s;
                }
                
                .animation-delay-700 {
                    animation-delay: 0.7s;
                }
                
                .animation-delay-900 {
                    animation-delay: 0.9s;
                }
                
                .animation-delay-1000 {
                    animation-delay: 1s;
                }
            `}</style>
        </div>
    );
}

// Wrap with Suspense for useParams
export default function AthleteDonationPageWrapper() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900">
                <div className="w-16 h-16 border-4 border-emerald-200/30 border-t-emerald-400 rounded-full animate-spin"></div>
                <p className="ml-3 text-white">Loading Athlete Details...</p>
            </div>
        }>
            <AthleteDonationPageContent />
        </Suspense>
    );
}