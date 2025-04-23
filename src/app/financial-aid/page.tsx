'use client';

import Link from 'next/link';
import {
    AcademicCapIcon, // Represents achievement/training
    BanknotesIcon,   // Represents financial aspect - Still imported but not used in header icon
    ClipboardDocumentListIcon, // Represents application/documents
    ClockIcon,       // Represents process/timeline
    EnvelopeIcon,    // Represents contact
    InformationCircleIcon, // Represents info/eligibility
    ArrowRightIcon,
    SparklesIcon,    // Represents opportunity/talent
    UserGroupIcon    // Represents community/support
} from '@heroicons/react/24/outline'; // Use outline for a lighter feel here
import { CheckBadgeIcon } from '@heroicons/react/24/solid'; // Solid for success/impact

export default function FinancialAidOverviewPage() {
  return (
    <div className="bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 min-h-screen relative overflow-hidden">
      {/* Cricket Stadium Background Elements */}
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

        {/* Batsman - RIGHT SIDE */}
        <div className="absolute w-8 h-12 top-[40%] right-[15%] animate-batsman-ready animation-delay-500">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
            <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
            <div className="absolute top-2 left-5 w-1 h-10 bg-yellow-800/80 rotate-45 origin-top-left animate-bat-swing"></div>
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

        {/* Additional players */}

        {/* Wicket-keeper - LEFT SIDE */}
        <div className="absolute w-6 h-8 top-[35%] left-[15%] animate-wicketkeeper-ready">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-yellow-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-yellow-600/60"></div>
          </div>
        </div>

        {/* Wicket-keeper - RIGHT SIDE */}
        <div className="absolute w-6 h-8 top-[35%] right-[15%] animate-wicketkeeper-ready animation-delay-500">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1 w-4 h-4 rounded-full bg-yellow-500/80"></div>
            <div className="absolute top-4 left-1.5 w-3 h-4 bg-yellow-600/60"></div>
          </div>
        </div>

        {/* Non-striker - LEFT SIDE */}
        <div className="absolute w-8 h-12 top-[55%] left-[18%] animate-nonstriker-ready">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
            <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
          </div>
        </div>

        {/* Non-striker - RIGHT SIDE */}
        <div className="absolute w-8 h-12 top-[55%] right-[18%] animate-nonstriker-ready animation-delay-500">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-2 w-4 h-4 rounded-full bg-red-500/80"></div>
            <div className="absolute top-4 left-2.5 w-3 h-6 bg-red-600/60"></div>
          </div>
        </div>

        {/* Ball trajectories */}
        <div className="absolute h-0.5 w-0 bg-red-500/30 top-[43%] left-[18%] animate-ball-trajectory"></div>
        <div className="absolute h-0.5 w-0 bg-red-500/30 top-[43%] right-[18%] animate-ball-trajectory animation-delay-500"></div>

        {/* Stadium elements */}
        <div className="absolute top-0 left-0 w-full h-[5%] bg-gradient-to-b from-white/10 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-[5%] bg-gradient-to-t from-white/10 to-transparent"></div>
        <div className="absolute top-0 left-0 h-full w-[5%] bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="absolute top-0 right-0 h-full w-[5%] bg-gradient-to-l from-white/10 to-transparent"></div>

      </div>

      {/* Header Section */}
      {/* CHANGED pb-32 to pb-40 here */}
      <div className="relative pt-24 pb-40 mb-0 overflow-hidden">
        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center animate-fade-in-down">
          {/* Icon was removed in previous step */}
          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl mb-4">
            SportsBookSL Financial Aid
          </h1>
          <div className="relative flex justify-center py-5 items-center">
            <div className="w-16 h-1 bg-yellow-500 rounded-full animate-pulse-slow"></div>
            <div className="w-3 h-3 mx-2 bg-yellow-400 rounded-full"></div>
            <div className="w-24 h-1 bg-yellow-500 rounded-full animate-pulse-slow animation-delay-200"></div>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto animate-fade-in-up animation-delay-300">
            Supporting talented athletes across Sri Lanka by providing access to essential training facilities and resources.
          </p>
        </div>

        {/* Wave Separator - Position is relative to the parent div above */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto block">
            <path fill="#F9FAFB" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      {/* Main Content Area - Starts below the header area */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-16 relative z-10">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 border border-white/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

            {/* Left Column: Program Info */}
            <div className="md:col-span-2 space-y-10">
              {/* Introduction */}
              <section className="animate-fade-in animation-delay-100">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <SparklesIcon className="h-6 w-6 mr-2 text-yellow-400" />
                  Our Mission
                </h2>
                <p className="text-white/90 leading-relaxed">
                  SportsBookSL believes that financial constraints should not be a barrier to athletic potential. Our Financial Aid Program aims to bridge the gap for dedicated athletes who demonstrate talent and commitment but lack the necessary resources to access quality training environments. We provide support for booking facilities available on our platform, helping athletes train consistently and pursue their sporting dreams.
                </p>
              </section>

              {/* Eligibility */}
              <section className="animate-fade-in animation-delay-300">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <InformationCircleIcon className="h-6 w-6 mr-2 text-yellow-400" />
                  Who Can Apply?
                </h2>
                <div className="bg-emerald-900/40 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-inner">
                  <ul className="list-disc list-outside pl-5 space-y-2 text-white/90">
                    <li>Athletes actively training in any sport listed on SportsBookSL.</li>
                    <li>Individuals demonstrating significant sporting achievements or potential (school, district, provincial, national levels preferred).</li>
                    <li>Applicants facing verifiable financial hardship limiting their access to training facilities.</li>
                    <li>Residents of Sri Lanka.</li>
                    <li>Commitment to regular training and progress reporting (if aid is granted).</li>
                  </ul>
                  <p className="text-sm text-white/70 mt-3">
                    (Specific age criteria or other requirements may apply based on funding availability and program focus.)
                  </p>
                </div>
              </section>

              {/* Application Process */}
              <section className="animate-fade-in animation-delay-500">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <ClipboardDocumentListIcon className="h-6 w-6 mr-2 text-yellow-400" />
                  Application Process
                </h2>
                <div className="bg-emerald-900/40 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-inner">
                  <ol className="list-decimal list-outside pl-5 space-y-3 text-white/90">
                    <li>
                      <span className="font-medium text-white">Submit Application:</span> Complete the online form with personal details, sports background, financial need description, and reference information.
                    </li>
                    <li>
                      <span className="font-medium text-white">Upload Documents:</span> Attach supporting documents like achievement certificates, recommendation letters, and optionally, proof of income/need.
                    </li>
                    <li>
                      <span className="font-medium text-white">Review:</span> Our committee reviews applications based on merit, need, and potential impact. This typically takes 7-10 business days.
                    </li>
                    <li>
                      <span className="font-medium text-white">Notification:</span> You will be notified of the decision via email. Approved applicants receive details on accessing their aid (usually as credits on the platform).
                    </li>
                  </ol>
                </div>
              </section>

              {/* Impact */}
              <section className="animate-fade-in animation-delay-700">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <CheckBadgeIcon className="h-6 w-6 mr-2 text-yellow-400" />
                  Program Impact
                </h2>
                <div className="bg-emerald-900/40 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-inner">
                  <p className="text-white/90 leading-relaxed">
                    Since its inception, the SportsBookSL Financial Aid program has supported numerous athletes, enabling them to access crucial training hours, leading to improved performance and participation in higher-level competitions. Your application could be the next success story!
                  </p>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-emerald-800/60 backdrop-blur-sm rounded-lg text-center">
                      <div className="text-2xl font-bold text-white">150+</div>
                      <div className="text-sm text-white/80">Athletes Supported</div>
                    </div>
                    <div className="p-3 bg-emerald-800/60 backdrop-blur-sm rounded-lg text-center">
                      <div className="text-2xl font-bold text-white">₹3.2M</div>
                      <div className="text-sm text-white/80">Aid Distributed</div>
                    </div>
                    <div className="p-3 bg-emerald-800/60 backdrop-blur-sm rounded-lg text-center">
                      <div className="text-2xl font-bold text-white">12</div>
                      <div className="text-sm text-white/80">National Athletes</div>
                    </div>
                  </div>
                </div>
              </section>

            </div>

            {/* Right Column: Quick Info & CTA */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-emerald-900/60 to-emerald-800/60 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg animate-fade-in animation-delay-100">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-yellow-400" />
                  Required Documents
                </h3>
                <ul className="list-disc list-outside pl-5 space-y-1 text-sm text-white/90">
                  <li>Achievement Certificates</li>
                  <li>Recommendation Letter (Coach/Teacher)</li>
                  <li>Personal Statement</li>
                  <li>Proof of Financial Need (Optional but helpful)</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-emerald-900/60 to-emerald-800/60 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg animate-fade-in animation-delay-300">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-yellow-400" />
                  Review Timeline
                </h3>
                <p className="text-sm text-white/90">
                  Applications are typically reviewed within <span className="font-medium text-white">7-10 business days</span> after submission. You will receive an email notification.
                </p>
                <div className="mt-4 relative pt-2">
                  <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                    <div className="w-3/5 bg-yellow-400 h-full rounded-full animate-pulse-slow"></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-white/70">
                    <span>Submission</span>
                    <span>Review</span>
                    <span>Decision</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-900/60 to-emerald-800/60 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg animate-fade-in animation-delay-500">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <EnvelopeIcon className="h-5 w-5 mr-2 text-yellow-400" />
                  Need Help?
                </h3>
                <p className="text-sm text-white/90 mb-3">
                  Have questions about the application process or eligibility?
                </p>
                <a href="mailto:support@sportsbooksl.com" className="inline-block text-sm font-medium text-yellow-400 hover:text-yellow-300 hover:underline transition-colors">
                  Contact Support
                </a>
              </div>

              {/* Apply Now Button */}
              <div className="mt-8 animate-fade-in animation-delay-700">
                <Link
                  href="/financial-aid/apply"
                  className="w-full group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:shadow-emerald-500/30 hover:shadow-xl hover:scale-105"
                >
                  <span className="relative z-10 flex items-center">
                    Apply for Financial Aid Now
                    <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 h-full w-full bg-white/[0.08] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
                </Link>

                <div className="mt-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white backdrop-blur-sm border border-white/20 shadow-sm">
                    Applications for Q3 2025 now open
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Success Stories Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Success Stories</h2>
          <div className="mt-4 max-w-3xl mx-auto">
            <p className="text-lg text-emerald-100">Meet some of the talented athletes who have benefited from our financial aid program.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Story 1 */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl overflow-hidden border border-white/30 shadow-lg transform hover:scale-[1.02] transition-all duration-300 animate-fade-in animation-delay-100">
            <div className="h-48 bg-emerald-800/60">
              {/* Placeholder for athlete image */}
              <div className="w-full h-full flex items-center justify-center">
                <UserGroupIcon className="w-20 h-20 text-emerald-300/50" />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">Dinuka Jayawardene</h3>
              <p className="text-sm text-emerald-100 mb-3">Cricket • Colombo</p>
              <p className="text-white/80 text-sm">
                "The financial aid program helped me access quality coaching and facilities that would have been out of reach. Within six months, I improved enough to be selected for my district team."
              </p>
            </div>
          </div>

          {/* Story 2 */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl overflow-hidden border border-white/30 shadow-lg transform hover:scale-[1.02] transition-all duration-300 animate-fade-in animation-delay-300">
            <div className="h-48 bg-emerald-800/60">
              {/* Placeholder for athlete image */}
              <div className="w-full h-full flex items-center justify-center">
                <UserGroupIcon className="w-20 h-20 text-emerald-300/50" />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">Malsha Fernando</h3>
              <p className="text-sm text-emerald-100 mb-3">Swimming • Kandy</p>
              <p className="text-white/80 text-sm">
                "With SportsBookSL's financial support, I was able to train consistently at a professional pool. This year, I represented Sri Lanka at the South Asian Aquatic Championship."
              </p>
            </div>
          </div>

          {/* Story 3 */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl overflow-hidden border border-white/30 shadow-lg transform hover:scale-[1.02] transition-all duration-300 animate-fade-in animation-delay-500">
            <div className="h-48 bg-emerald-800/60">
              {/* Placeholder for athlete image */}
              <div className="w-full h-full flex items-center justify-center">
                <UserGroupIcon className="w-20 h-20 text-emerald-300/50" />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">Rashid Hussein</h3>
              <p className="text-sm text-emerald-100 mb-3">Basketball • Galle</p>
              <p className="text-white/80 text-sm">
                "Coming from a small town, I had limited opportunities. The financial aid program covered my court bookings and coaching fees, which led to me earning a sports scholarship at university."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-emerald-900/40 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-inner animate-fade-in animation-delay-100">
              <h3 className="text-lg font-bold text-white mb-2">How much financial aid can I receive?</h3>
              <p className="text-white/90 text-sm">Aid amounts vary based on individual circumstances, sport requirements, and available funds. Typically, support ranges from 30% to 80% of facility booking costs, with most recipients receiving ₹15,000 to ₹35,000 worth of credits per season.</p>
            </div>

            <div className="bg-emerald-900/40 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-inner animate-fade-in animation-delay-200">
              <h3 className="text-lg font-bold text-white mb-2">Can I apply multiple times?</h3>
              <p className="text-white/90 text-sm">Yes, you can apply for renewal each season. Renewals are based on your training consistency, progress reports, and continued financial need. Regular recipients typically submit updated documentation every 3-6 months.</p>
            </div>

            <div className="bg-emerald-900/40 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-inner animate-fade-in animation-delay-300">
              <h3 className="text-lg font-bold text-white mb-2">Is there an age requirement?</h3>
              <p className="text-white/90 text-sm">While we support athletes of all ages, our primary focus is on youth development (ages 10-22). However, exceptional applicants outside this range are considered, especially those representing or with potential to represent Sri Lanka nationally.</p>
            </div>

            <div className="bg-emerald-900/40 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-inner animate-fade-in animation-delay-400">
              <h3 className="text-lg font-bold text-white mb-2">How are recipients selected?</h3>
              <p className="text-white/90 text-sm">Our selection committee evaluates applications based on athletic achievement/potential, financial need verification, coach recommendations, and the applicant's commitment to their sporting development. Available funding and seasonal priorities may also influence selection.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30">
          <div className="relative px-6 py-12 sm:px-12 sm:py-20 md:py-24 lg:px-16 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Ready to Apply?</h2>
            <p className="mt-4 text-lg text-emerald-100 max-w-3xl mx-auto">
              Take the first step toward accessing the training facilities you need to achieve your sporting potential.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/financial-aid/apply"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105"
              >
                Start Your Application
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300"
              >
                Contact a Coordinator
              </Link>
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

        @keyframes ball-trajectory {
          0% { width: 0; opacity: 0.7; }
          100% { width: 100%; opacity: 0; }
        }
        .animate-ball-trajectory {
          animation: ball-trajectory 5s ease-in infinite alternate;
          transform-origin: left;
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes pulse-slow {
          50% { opacity: .7; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out forwards;
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
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

        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}