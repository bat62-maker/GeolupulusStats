import React, { useState, useMemo, useEffect } from 'react';
import { 
  Compass, 
  Users, 
  MapPin, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  Layers,
  ExternalLink,
  UserPlus,
  BarChart3,
  Award,
  RefreshCw,
  Flame,
  Activity
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SHEET_URL_EVENTS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR91easWtf62oWneZFBEAAK6FUAxPoCxlr5lJi-JcLdl0BQB0CPbnGUbGnQO5MZJlYHLVOxNtTctCe5/pub?gid=0&single=true&output=csv'; 
const SHEET_URL_ATTENDANCE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR91easWtf62oWneZFBEAAK6FUAxPoCxlr5lJi-JcLdl0BQB0CPbnGUbGnQO5MZJlYHLVOxNtTctCe5/pub?gid=803611553&single=true&output=csv';

// MEJORA: getMilestoneStyle fuera del componente (función pura, no depende de estado)
const getMilestoneStyle = (order) => {
  if (order === 150) return { bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'HISTÒRIC 150' };
  if (order === 100) return { bg: 'bg-slate-400/10', text: 'text-slate-300', label: 'EDICIÓ 100' };
  if (order === 50) return { bg: 'bg-orange-800/10', text: 'text-orange-400', label: 'EDICIÓ 50' };
  return null;
};

const MilestoneMedal = ({ number }) => {
  const configs = {
    50: { color: '#CD7F32', label: 'BRONZE', secondary: '#78350f' },
    100: { color: '#C0C0C0', label: 'PLATA', secondary: '#475569' },
    150: { color: '#EAB308', label: 'OR / 150', secondary: '#854D0E' }
  };
  const config = configs[number] || configs[150];

  return (
    <div className="relative flex flex-col items-center justify-center animate-pulse-slow group cursor-help scale-75 sm:scale-90" title={`Edició Històrica ${number}`}>
      <svg width="60" height="80" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
        <path d="M35 0L25 40H45L35 0Z" fill="#EF4444" />
        <path d="M65 0L55 40H75L65 0Z" fill="#EF4444" />
        <path d="M50 0L40 45H60L50 0Z" fill="#B91C1C" />
        <circle cx="50" cy="70" r="40" fill={config.color} stroke={config.secondary} strokeWidth="2" />
        <circle cx="50" cy="70" r="32" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
        <text x="50" y="72" textAnchor="middle" fill={config.secondary} fontSize="22" fontWeight="900" fontFamily="sans-serif">{number}</text>
        <text x="50" y="88" textAnchor="middle" fill={config.secondary} fontSize="8" fontWeight="800" fontFamily="sans-serif" letterSpacing="1">{config.label}</text>
      </svg>
    </div>
  );
};

// MEJORA: normaliza las cabeceras a minúsculas para evitar fallbacks frágiles
const parseCSV = (text) => {
  if (!text) return [];
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];
  const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
  const headers = lines[0].split(regex).map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
  return lines.slice(1).map(line => {
    const values = line.split(regex).map(v => v.replace(/^"|"$/g, '').trim());
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i];
      return obj;
    }, {});
  });
};

const App = () => {
  const [events, setEvents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedOrganizer, setSelectedOrganizer] = useState('Tots');
  const [selectedAttendee, setSelectedAttendee] = useState('Tots');
  const [selectedYear, setSelectedYear] = useState('Tots');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [eventsRes, attendanceRes] = await Promise.all([
        fetch(SHEET_URL_EVENTS),
        fetch(SHEET_URL_ATTENDANCE)
      ]);
      if (!eventsRes.ok || !attendanceRes.ok) throw new Error("Error de connexió amb el servidor");
      const eventsText = await eventsRes.text();
      const attendanceText = await attendanceRes.text();

      // MEJORA: cabeceras normalizadas a minúsculas; se accede con claves lowercase
      const parsedEvents = parseCSV(eventsText)
        .filter(e => e.codi || e.id || e.event || e.code) // MEJORA: filtra filas sin ID
        .map((e, index) => {
          const dateStr = e.data || e.date;
          let year = 'N/A';
          let month = -1;
          if (dateStr) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              year = parts[2];
              month = parseInt(parts[1]) - 1;
            }
          }
          return {
            id: e.codi || e.id || e.event || e.code,
            name: e.nom || e.name || e.eventname,
            team: e.organitzador || e.team || e.organizer,
            date: dateStr,
            year,
            month,
            attendees: parseInt(e.assistents || e.attendees || 0),
            location: e.localitzacio || e.location || 'Sabadell',
            order: index + 1
          };
        })
        // MEJORA: filtra eventos con year N/A para evitar índices -1 en el heatmap
        .filter(e => e.year !== 'N/A');

      setEvents(parsedEvents);
      setAttendanceRecords(
        parseCSV(attendanceText).map(a => ({
          eventId: a.event || a.eventid || a.codi,
          attendee: a.equip || a.attendee || a.user
        }))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchOrganizer = selectedOrganizer === 'Tots' || event.team === selectedOrganizer;
      const matchYear = selectedYear === 'Tots' || event.year === selectedYear;
      const matchAttendee = selectedAttendee === 'Tots' ||
        attendanceRecords.some(record => record.eventId === event.id && record.attendee === selectedAttendee);
      return matchOrganizer && matchAttendee && matchYear;
    });
  }, [events, attendanceRecords, selectedOrganizer, selectedAttendee, selectedYear]);

  const visibleMilestones = useMemo(() => {
    const milestones = [150, 100, 50];
    return milestones.filter(m => filteredEvents.some(e => e.order === m));
  }, [filteredEvents]);

  const stats = useMemo(() => {
    const totalAttendees = filteredEvents.reduce((acc, curr) => acc + curr.attendees, 0);
    const avgAttendees = filteredEvents.length ? (totalAttendees / filteredEvents.length).toFixed(1) : 0;
    const maxEvent = filteredEvents.length > 0
      ? filteredEvents.reduce((prev, curr) => (prev.attendees > curr.attendees) ? prev : curr)
      : null;
    return {
      totalAttendees,
      avgAttendees,
      totalEvents: filteredEvents.length,
      uniqueTeams: new Set(filteredEvents.map(e => e.team)).size,
      maxEvent
    };
  }, [filteredEvents]);

  const heatmapData = useMemo(() => {
    const years = [...new Set(events.map(e => e.year))].sort((a, b) => b - a);
    const months = ['Gen', 'Feb', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Des'];

    const matrix = years.map(y =>
      months.map((_, mIndex) => {
        const matches = filteredEvents.filter(e => e.year === y && e.month === mIndex);
        return matches.reduce((acc, curr) => acc + curr.attendees, 0);
      })
    );

    return { years, months, matrix };
  }, [filteredEvents, events]);

  const organizersList = useMemo(() => ['Tots', ...new Set(events.map(e => e.team))].sort(), [events]);
  const attendeeTeams = useMemo(() => ['Tots', ...new Set(attendanceRecords.map(a => a.attendee))].sort(), [attendanceRecords]);
  const yearsList = useMemo(() => ['Tots', ...new Set(events.map(e => e.year))].sort((a, b) => b - a), [events]);

  // MEJORA: barData como useMemo para evitar recálculo en cada render
  const barData = useMemo(() => ({
    labels: [...filteredEvents].sort((a, b) => b.attendees - a.attendees).slice(0, 20).map(e => (e.name?.substring(0, 15) || '') + "..."),
    datasets: [{
      label: 'Assistents',
      data: [...filteredEvents].sort((a, b) => b.attendees - a.attendees).slice(0, 20).map(e => e.attendees),
      backgroundColor: 'rgba(132, 204, 22, 0.7)',
      borderColor: 'rgb(132, 204, 22)',
      borderWidth: 2,
      borderRadius: 4,
    }]
  }), [filteredEvents]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-8">
      <header className="max-w-7xl mx-auto flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-6">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-lime-500 rounded-lg shadow-lg shadow-lime-500/20">
                <Compass className="text-slate-950 w-6 h-6" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">
                Geo<span className="text-lime-500">Lúpulus</span>
              </h1>
            </div>
            <p className="text-slate-400 font-medium ml-1 text-sm tracking-wide uppercase">
              Dashboard d'Anàlisi Històrica {isLoading && <RefreshCw size={12} className="animate-spin text-lime-500 inline ml-1" />}
            </p>
          </div>

          <div className="flex -space-x-4">
            {visibleMilestones.map(m => (
              <div key={m} className="animate-in zoom-in duration-500">
                <MilestoneMedal number={m} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          <FilterSelect icon={<Calendar className="text-lime-500" />} label="Any" value={selectedYear} options={yearsList} onChange={setSelectedYear} />
          <FilterSelect icon={<Trophy className="text-amber-500" />} label="Organitzador" value={selectedOrganizer} options={organizersList} onChange={setSelectedOrganizer} />
          <FilterSelect icon={<UserPlus className="text-blue-500" />} label="Assistència de" value={selectedAttendee} options={attendeeTeams} onChange={setSelectedAttendee} />
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto mb-6 px-5 py-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-bold">
          ⚠️ {error}
        </div>
      )}

      {isLoading && events.length === 0 ? (
        <div className="max-w-7xl mx-auto py-20 text-center animate-pulse">
          <RefreshCw size={48} className="mx-auto mb-4 text-slate-800 animate-spin" />
          <h2 className="text-xl font-bold text-slate-600 uppercase tracking-widest text-center">Carregant dades...</h2>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard icon={<Users />} label="Assistència Total" value={stats.totalAttendees} color="text-blue-400" />
            <StatCard icon={<Layers />} label="Esdeveniments" value={stats.totalEvents} color="text-lime-400" />
            <StatCard icon={<TrendingUp />} label="Mitjana Logs" value={stats.avgAttendees} color="text-emerald-400" />
            <StatCard icon={<Trophy />} label="Organitzadors" value={stats.uniqueTeams} color="text-amber-400" />
            <StatCard
              icon={<Flame />}
              label="Esdeveniment Rècord"
              value={stats.maxEvent?.attendees || 0}
              subValue={stats.maxEvent?.name?.substring(0, 15) + '...'}
              color="text-orange-500"
            />
          </div>

          {/* HEATMAP */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-8">
              <Activity className="text-lime-500 w-5 h-5" />
              Mapa d'Activitat Històrica
            </h2>
            <div className="overflow-x-auto custom-scrollbar-h">
              <div className="min-w-[800px] pb-4">
                <div className="flex mb-4">
                  <div className="w-20 shrink-0"></div>
                  {heatmapData.months.map(m => (
                    <div key={m} className="flex-1 text-center text-[10px] font-black text-slate-600 uppercase tracking-tighter">{m}</div>
                  ))}
                </div>
                <div className="space-y-1">
                  {heatmapData.years.map((year, yIdx) => (
                    <div key={year} className="flex items-center group/row">
                      <div className="w-20 shrink-0 text-xs font-black text-slate-500 group-hover/row:text-lime-500 transition-colors">{year}</div>
                      <div className="flex flex-1 gap-1">
                        {heatmapData.matrix[yIdx].map((val, mIdx) => {
                          const intensity = val === 0 ? 'bg-slate-950 border border-slate-900/50' :
                            val < 10 ? 'bg-lime-900/30' :
                            val < 20 ? 'bg-lime-700/50' :
                            val < 35 ? 'bg-lime-500/70' : 'bg-lime-400';
                          return (
                            // MEJORA: tooltip en el heatmap con info útil
                            <div
                              key={mIdx}
                              title={val > 0 ? `${year} ${heatmapData.months[mIdx]}: ${val} assistents` : undefined}
                              className={`flex-1 h-10 rounded-md transition-all flex items-center justify-center ${intensity}`}
                            >
                              {val > 0 && <span className="text-[10px] font-black text-white/30">{val}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-lg">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                <BarChart3 className="text-lime-500 w-5 h-5" />
                Rànquing d'Assistència (Top 20)
              </h2>
              <div className="h-[400px]">
                <Bar data={barData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10, weight: 'bold' } } },
                    x: { grid: { color: '#1e293b' }, ticks: { color: '#475569', font: { size: 10 } } }
                  }
                }} />
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm flex flex-col shadow-lg">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-2 text-white">
                <Award className="text-blue-500 w-5 h-5" />
                Dades per Organitzador
              </h2>
              <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 max-h-[400px]">
                <div className="space-y-3">
                  {organizersList.filter(o => o !== 'Tots').map((name) => {
                    const count = filteredEvents.filter(e => e.team === name).length;
                    if (count === 0 && selectedOrganizer !== 'Tots') return null;
                    return (
                      <div key={name} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800/50 rounded-2xl hover:bg-slate-800/30 transition-colors">
                        <span className="text-sm font-bold text-slate-300">{name}</span>
                        <span className="text-xl font-black text-blue-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* LISTADO DE EVENTOS */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-800/50 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Esdeveniments filtrats</h2>
              <div className="px-5 py-2 bg-lime-500/10 border border-lime-500/20 rounded-full text-[11px] font-black text-lime-500 uppercase tracking-[0.15em]">{filteredEvents.length} Resultats</div>
            </div>
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              {[...filteredEvents].sort((a, b) => b.order - a.order).map((event) => {
                const milestone = getMilestoneStyle(event.order);
                return (
                  // MEJORA: aria-label para accesibilidad; eliminado "block" redundante
                  <a
                    key={event.id}
                    href={`https://coord.info/${event.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Veure ${event.name} a Geoccaching.com`}
                    className={`p-6 hover:bg-white/[0.03] transition-all border-b border-slate-800/30 group flex flex-col md:flex-row md:items-center justify-between gap-6 no-underline ${milestone ? milestone.bg : ''}`}
                  >
                    <div className="flex items-center gap-6">
                      <span className={`text-2xl font-black shrink-0 ${milestone ? milestone.text : 'text-slate-800 group-hover:text-lime-500/20'}`}>
                        {String(event.order).padStart(3, '0')}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-100 group-hover:text-lime-400 transition-colors text-xl leading-tight flex items-center gap-3">
                          {event.name}
                          {milestone && (
                            <span className={`${milestone.text.replace('text-', 'bg-')}/20 ${milestone.text} text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-tighter border border-current opacity-80`}>
                              {milestone.label}
                            </span>
                          )}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2"><Trophy size={10} /> {event.team}</span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-2 font-bold uppercase"><MapPin size={10} /> {event.location}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-2 font-mono"><Calendar size={10} /> {event.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-10">
                      <div className="text-right">
                        <div className="text-3xl font-black text-lime-500 leading-none group-hover:scale-110 transition-transform origin-right">{event.attendees}</div>
                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">Logs</div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:border-lime-500 transition-all">
                        <ExternalLink className="text-slate-700 group-hover:text-lime-500 w-4 h-4" />
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </main>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar-h::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar-h::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        @keyframes pulse-slow { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.9; } }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
      `}} />
    </div>
  );
};

const StatCard = ({ icon, label, value, subValue, color }) => (
  <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-[2rem] hover:border-slate-700 transition-all group relative overflow-hidden flex flex-col justify-between">
    <div className="relative z-10">
      <div className={`w-12 h-12 bg-slate-950 border border-white/5 rounded-2xl flex items-center justify-center mb-5 ${color}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.15em] mb-1">{label}</p>
      <h3 className="text-4xl font-black text-white tracking-tighter italic leading-none">{value}</h3>
      {subValue && <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase truncate">{subValue}</p>}
    </div>
  </div>
);

const FilterSelect = ({ icon, label, value, options, onChange }) => (
  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 flex-1 md:w-56 focus-within:border-lime-500/50 transition-all group">
    <div className="mr-4 shrink-0 transition-transform group-hover:scale-110">{React.cloneElement(icon, { size: 18 })}</div>
    <div className="flex flex-col w-full">
      <span className="text-[10px] uppercase font-black text-slate-500 mb-1 tracking-widest">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none outline-none text-sm font-black text-slate-100 cursor-pointer w-full appearance-none"
      >
        {options.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
      </select>
    </div>
  </div>
);

export default App;
