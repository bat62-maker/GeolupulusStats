import React from 'react';
import{
  X
} from 'lucide-react';

const FilterSelect = ({ icon, label, value, options, onChange, onClear }) => (
  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 flex-1 md:w-56 focus-within:border-lime-500/50 transition-all group relative">
    <div className="mr-4 shrink-0 transition-transform group-hover:scale-110">{React.cloneElement(icon, { size: 18 })}</div>
    <div className="flex flex-col w-full">
      <span className="text-[10px] uppercase font-black text-slate-500 mb-1 tracking-widest">{label}</span>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none outline-none text-sm font-black text-slate-100 cursor-pointer w-full appearance-none pr-8"
      >
        {options.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
      </select>
    </div>
    
    {value !== 'Tots' && (
      <button 
        onClick={onClear}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all"
        title="Esborrar filtre"
      >
        <X size={14} />
      </button>
    )}
    
    {value === 'Tots' && (
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
        {/*<div className="w-1 h-1 bg-white rounded-full"></div>*/}
      </div>
    )}
  </div>
);

export default FilterSelect;
