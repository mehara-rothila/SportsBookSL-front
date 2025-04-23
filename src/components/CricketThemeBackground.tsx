'use client';

export default function CricketThemeBackground() {
  return (
    <div className="absolute inset-0">
      {/* Simplified oval field */}
      <div className="absolute top-[10%] left-[5%] right-[5%] bottom-[10%] rounded-full border-2 border-white/10 bg-green-700/20"></div>
      
      {/* Simplified boundary rope */}
      <div className="absolute top-[15%] left-[10%] right-[10%] bottom-[15%] rounded-full border-dashed border-2 border-white/10"></div>
      
      {/* Simplified cricket pitch - centered */}
      <div className="absolute top-1/2 left-1/2 w-40 h-96 bg-yellow-100/10 -translate-x-1/2 -translate-y-1/2 border border-white/5">
        {/* Crease markings - simplified */}
        <div className="absolute top-[15%] left-0 right-0 h-1 bg-white/20"></div>
        <div className="absolute bottom-[15%] left-0 right-0 h-1 bg-white/20"></div>
        
        {/* Wickets - simplified */}
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 flex space-x-1">
          <div className="w-1 h-8 bg-white/50"></div>
          <div className="w-1 h-8 bg-white/50"></div>
          <div className="w-1 h-8 bg-white/50"></div>
        </div>
        
        <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 flex space-x-1">
          <div className="w-1 h-8 bg-white/50"></div>
          <div className="w-1 h-8 bg-white/50"></div>
          <div className="w-1 h-8 bg-white/50"></div>
        </div>
      </div>
      
      {/* Stadium atmosphere elements - simplified */}
      <div className="absolute top-0 left-0 w-full h-[5%] bg-gradient-to-b from-white/5 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-[5%] bg-gradient-to-t from-white/5 to-transparent"></div>
      
      {/* Optional subtle scoreboard - can be removed for simplicity */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-black/30 px-4 py-1 rounded-lg border border-white/5 backdrop-blur-sm">
        <div className="text-white text-xs flex gap-3">
          <span className="text-blue-300">SRI LANKA</span>
          <span className="text-white/80">SPORTS</span>
        </div>
      </div>
    </div>
  );
}