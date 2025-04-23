import Link from 'next/link';

interface DonationCardProps {
  athleteId: string;
  name: string;
  age: number;
  sport: string;
  goal: number;
  raised: number;
  image: string;
  achievements: string[];
  story: string;
  location: string;
}

export default function DonationCard({
  athleteId,
  name,
  age,
  sport,
  goal,
  raised,
  image,
  achievements,
  story,
  location
}: DonationCardProps) {
  // Calculate percentage raised
  const percentRaised = Math.min(Math.round((raised / goal) * 100), 100);
  
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full group transform hover:scale-[1.02]">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-all duration-700"
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/default-athlete.png'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-lg font-bold">{name}, {age}</h3>
          <div className="flex items-center text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location}
          </div>
        </div>
        <div className="absolute top-4 right-4 bg-emerald-600/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full border border-emerald-500/50">
          {sport}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-4 flex-1">
          <p className="text-white/90 line-clamp-3 text-sm">{story}</p>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm text-white/80 mb-1">
            <span>Rs. {raised.toLocaleString()} raised</span>
            <span>Goal: Rs. {goal.toLocaleString()}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2.5 backdrop-blur-sm">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2.5 rounded-full" 
              style={{ width: `${percentRaised}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-white uppercase mb-2">Achievements</h4>
          <div className="flex flex-wrap gap-1">
            {achievements.map((achievement, index) => (
              <span 
                key={index}
                className="inline-block text-xs px-2 py-1 rounded-md bg-emerald-900/50 backdrop-blur-sm text-emerald-50 border border-emerald-700/30"
              >
                {achievement}
              </span>
            ))}
          </div>
        </div>
        
        <Link
          href={`/donations/${athleteId}`}
          className="w-full text-center bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-2.5 px-4 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:translate-y-[-2px] flex items-center justify-center"
        >
          Support {name}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H3a1 1 0 110-2h9.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
}