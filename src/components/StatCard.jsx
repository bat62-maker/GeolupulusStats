import React from 'react';

const StatCard = ({ icon, label, value, subValue, color }) => (
  <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-6 rounded-3xl sm:rounded-[2rem] hover:border-slate-700 transition-all group relative overflow-hidden flex flex-col justify-between">
    <div className="relative z-10">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-slate-950 border border-white/5 rounded-2xl flex items-center justify-center mb-3 sm:mb-5 ${color}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.15em] mb-1">{label}</p>
      <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tighter italic leading-none">{value}</h3>
      {subValue && <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase truncate">{subValue}</p>}
    </div>
  </div>
);

export default StatCard;
