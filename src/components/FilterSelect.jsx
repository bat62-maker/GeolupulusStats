import React from 'react';

const FilterSelect = ({ icon, label, value, options, onChange }) => (
  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 flex-1 md:w-56 focus-within:border-lime-500/50 transition-all group">
    <div className="mr-4 shrink-0 transition-transform group-hover:scale-110">
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <div className="flex flex-col w-full">
      <span className="text-[10px] uppercase font-black text-slate-500 mb-1 tracking-widest">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none outline-none text-sm font-black text-slate-100 cursor-pointer w-full appearance-none"
      >
        {options.map(opt => (
          <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
        ))}
      </select>
    </div>
  </div>
);

export default FilterSelect;
