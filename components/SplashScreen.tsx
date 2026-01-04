import React from 'react';

interface Props {
  onNext: () => void;
}

const SplashScreen: React.FC<Props> = ({ onNext }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gray-900 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/10 rounded-full blur-[120px]"></div>
      
      {/* Top spacer */}
      <div className="h-20"></div>

      {/* Main Logo Section */}
      <div className="text-center z-10 flex flex-col items-center">
        <h1 className="text-6xl font-black tracking-tighter text-red-600 animate-pulse drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
          ETM module <span className="text-3xl block mt-2 opacity-80">v3.1.1.8</span>
        </h1>
        <div className="mt-4 flex flex-col items-center">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-red-900 to-transparent mb-2"></div>
          <p className="text-gray-500 font-mono tracking-[0.3em] text-xs uppercase">
            CAN Interface Systems
          </p>
        </div>
      </div>

      {/* Bottom section */}
      <div className="w-full flex justify-end items-end z-10 pb-6 pr-4">
        <button
          onClick={onNext}
          className="w-32 py-2.5 px-4 bg-gradient-to-b from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white font-black rounded-lg shadow-[0_5px_15px_rgba(34,197,94,0.3)] border-t border-white/20 transition-all active:scale-95 text-xs uppercase tracking-widest"
        >
          ДАЛЕЕ
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;