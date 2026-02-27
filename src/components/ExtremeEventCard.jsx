import React from 'react';
import{
  Calendar,
  Flame,
  MapPin,
  ExternalLink,
  Zap
} from 'lucide-react';

// Nueva Tarjeta de Extremo Récord
const ExtremeEventCard = ({ event, label }) => {
  if (!event) return null;
  return (
    <div className="relative group bg-slate-900/80 border border-orange-500/30 p-8 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-orange-500/10">
      {/* Fondo con brillo dinámico animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-transparent to-orange-500/5 opacity-40 animate-gradient" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-orange-500 border border-orange-400 rounded-3xl flex items-center justify-center text-slate-950 shadow-xl shadow-orange-500/30 shrink-0">
            <Flame size={40} fill="currentColor" />
          </div>
          <div>
            <p className="text-orange-500 text-xs font-black uppercase tracking-[0.2em] mb-1">{label}</p>
            <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter leading-tight uppercase max-w-lg">
              {event.name}
            </h3>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-[10px] text-slate-400 flex items-center gap-2 font-mono"><Calendar size={12} className="text-orange-500/50" /> {event.date}</span>
              <span className="text-[10px] text-slate-400 flex items-center gap-2 font-bold uppercase"><MapPin size={12} className="text-orange-500/50" /> {event.location}</span>
              <span className="text-[10px] text-orange-500/70 font-black uppercase tracking-widest">{event.team}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 pr-4">
          <div className="text-right">
            <div className="text-6xl md:text-7xl font-black text-white tracking-tighter italic leading-none flex items-baseline gap-2">
              {event.attendees}
              <span className="text-orange-500 text-lg not-italic">Logs</span>
            </div>
            <div className="px-3 py-1 bg-orange-500/20 border border-orange-500/40 rounded-full inline-block mt-2">
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-tighter flex items-center gap-2">
                <Zap size={10} fill="currentColor" /> RÈCORD ACTUAL
              </span>
            </div>
          </div>
          <a 
            href={`https://coord.info/${event.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-16 h-16 rounded-full bg-orange-500 text-slate-950 flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-orange-500/20 group/btn"
          >
            <ExternalLink size={24} className="group-hover:rotate-12 transition-transform" />
          </a>
        </div>
      </div>
      
      {/* Decoración visual de éxito */}
      <Zap className="absolute -top-10 -right-10 text-orange-500/5 w-64 h-64 rotate-12 pointer-events-none" />
    </div>
  );
};

export default ExtremeEventCard;
