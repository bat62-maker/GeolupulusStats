import React, { useState, useMemo } from 'react';
import {
  Compass,
  Users,
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
  Activity,
  MapPin,
  ScrollText
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

import { useEventData } from './hooks/useEventData';
import { getMilestoneStyle } from './utils/milestones';
import StatCard from './components/StatCard';
import ExtremeEventCard from './components/ExtremeEventCard';
import FilterSelect from './components/FilterSelect';
import MilestoneMedal from './components/MilestoneMedal';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend
);

const App = () => {
  const { events, attendanceRecords, isLoading, error, refetch } = useEventData();

  const [selectedOrganizer, setSelectedOrganizer] = useState('Tots');
  const [selectedAttendee, setSelectedAttendee]   = useState('Tots');
  const [selectedYear, setSelectedYear]           = useState('Tots');

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchOrganizer = selectedOrganizer === 'Tots' || event.team === selectedOrganizer;
      const matchYear      = selectedYear === 'Tots'      || event.year === selectedYear;
      const matchAttendee  = selectedAttendee === 'Tots'  ||
        attendanceRecords.some(r => r.eventId === event.id && r.attendee === selectedAttendee);
      return matchOrganizer && matchAttendee && matchYear;
    });
  }, [events, attendanceRecords, selectedOrganizer, selectedAttendee, selectedYear]);

  const visibleMilestones = useMemo(() => {
    return [150, 100, 50].filter(m => filteredEvents.some(e => e.order === m));
  }, [filteredEvents]);

  const stats = useMemo(() => {
    const totalAttendees = filteredEvents.reduce((acc, curr) => acc + curr.attendees, 0);
    const avgAttendees   = filteredEvents.length ? (totalAttendees / filteredEvents.length).toFixed(1) : 0;
    const maxEvent       = filteredEvents.length > 0
      ? filteredEvents.reduce((prev, curr) => (prev.attendees > curr.attendees ? prev : curr))
      : null;
    return {
      totalAttendees,
      avgAttendees,
      totalEvents: filteredEvents.length,
      uniqueTeams: new Set(filteredEvents.map(e => e.team)).size,
      maxEvent,
    };
  }, [filteredEvents]);

  const heatmapData = useMemo(() => {
    const years  = [...new Set(events.map(e => e.year))].sort((a, b) => b - a);
    const months = ['Gen','Feb','Mar','Abr','Mai','Jun','Jul','Ago','Set','Oct','Nov','Des'];
    const matrix = years.map(y =>
      months.map((_, mIndex) =>
        filteredEvents
          .filter(e => e.year === y && e.month === mIndex)
          .reduce((acc, curr) => acc + curr.attendees, 0)
      )
    );
    return { years, months, matrix };
  }, [filteredEvents, events]);

  const organizersList = useMemo(() => ['Tots', ...new Set(events.map(e => e.team))].sort(), [events]);
  const attendeeTeams  = useMemo(() => ['Tots', ...new Set(attendanceRecords.map(a => a.attendee))].sort(), [attendanceRecords]);
  const yearsList      = useMemo(() => ['Tots', ...new Set(events.map(e => e.year))].sort((a, b) => b - a), [events]);

  const barData = useMemo(() => {
    const sorted = [...filteredEvents].sort((a, b) => b.attendees - a.attendees).slice(0, 20);
    return {
      labels: sorted.map(e => (e.name?.substring(0, 50) || '') + '...'),
      datasets: [{
        label: 'Assistents',
        data: sorted.map(e => e.attendees),
        backgroundColor: 'rgba(132, 204, 22, 0.7)',
        borderColor: 'rgb(132, 204, 22)',
        borderWidth: 2,
        borderRadius: 4,
      }],
    };
  }, [filteredEvents]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-8">

      {/* HEADER */}
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
              Dashboard d'Anàlisi Històrica{' '}
              {isLoading && <RefreshCw size={12} className="animate-spin text-lime-500 inline ml-1" />}
            </p>
          </div>

          <div className="flex -space-x-4">
            {visibleMilestones.map(m => (
              <div key={m}>
                <MilestoneMedal number={m} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          <FilterSelect
            icon={<Calendar className="text-lime-500" />}
            label="Any" value={selectedYear}
            options={yearsList} onChange={setSelectedYear}
          />
          <FilterSelect
            icon={<Trophy className="text-amber-500" />}
            label="Organitzador" value={selectedOrganizer}
            options={organizersList} onChange={setSelectedOrganizer}
          />
          <FilterSelect
            icon={<UserPlus className="text-blue-500" />}
            label="Assistència de" value={selectedAttendee}
            options={attendeeTeams} onChange={setSelectedAttendee}
          />
        </div>
      </header>

      {/* ERROR */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6 px-5 py-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-bold">
          ⚠️ {error}
          <button onClick={refetch} className="ml-4 underline hover:text-red-300">Reintentar</button>
        </div>
      )}

      {/* LOADING */}
      {isLoading && events.length === 0 ? (
        <div className="max-w-7xl mx-auto py-20 text-center">
          <RefreshCw size={48} className="mx-auto mb-4 text-slate-800 animate-spin" />
          <h2 className="text-xl font-bold text-slate-600 uppercase tracking-widest">Carregant dades...</h2>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto space-y-8">

          {/* STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Users />}     label="Assistència Total"   value={stats.totalAttendees} color="text-blue-400" />
            <StatCard icon={<Layers />}    label="Esdeveniments"        value={stats.totalEvents}    color="text-lime-400" />
            <StatCard icon={<ScrollText />}label="Mitjana Logs"         value={stats.avgAttendees}   color="text-emerald-400" />
            <StatCard icon={<Trophy />}    label="Organitzadors"        value={stats.uniqueTeams}    color="text-amber-400" />          
          </div>
          {/* Tarjeta de Extremo: Evento Récord Dinámico */}
          <ExtremeEventCard 
            event={stats.maxEvent}
            label="Esdeveniment Rècord" 
          />

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
                          const now = new Date();
                          const cellDate = new Date(parseInt(year), mIdx, 1);
                          const limitDate = new Date(2012, 2, 1); // Marzo 2012
                          
                         // Condición: No sale color antes de Marzo 2012, después de hoy, o si no coincide con el filtro de año
                          const isYearFiltered = selectedYear !== 'Tots' && year !== selectedYear;
                          const outOfBounds = cellDate < limitDate || cellDate > now || isYearFiltered;

                          
                          const intensity = 
                            outOfBounds ? 'bg-slate-950 border border-slate-900/50' : 
                            val === 0  ? 'bg-red-300 border border-slate-900/50' :
                            val < 10   ? 'bg-lime-900/30' :
                            val < 20   ? 'bg-lime-700/50' :
                            val < 35   ? 'bg-lime-500/70' : 'bg-lime-400';
                          return (
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

          {/* CHARTS + ORGANIZERS */}
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
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderWidth: 1,
                      titleColor: '#f1f5f9',
                      bodyColor: '#84cc16',
                      titleFont: { size: 13, weight: 'bold' },
                      bodyFont: { size: 16, weight: 'bold' },
                      padding: 14,
                      cornerRadius: 12,
                      displayColors: false,
                      callbacks: {
                        title: (items) => items[0]?.label?.replace('...', '') || '',
                        label: (item) => `${item.raw} assistents`,
                      },
                    },
                  },
                  scales: {
                    y: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10, weight: 'bold' } } },
                    x: { grid: { color: '#1e293b' }, ticks: { color: '#475569', font: { size: 10 } } },
                  },
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
                  {organizersList.filter(o => o !== 'Tots').map(name => {
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

          {/* EVENTS LIST */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-800/50 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Esdeveniments filtrats</h2>
              <div className="px-5 py-2 bg-lime-500/10 border border-lime-500/20 rounded-full text-[11px] font-black text-lime-500 uppercase tracking-[0.15em]">
                {filteredEvents.length} Resultats
              </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              {[...filteredEvents].sort((a, b) => b.order - a.order).map(event => {
                const milestone = getMilestoneStyle(event.order);
                return (
                  <a
                    key={event.id}
                    href={`https://coord.info/${event.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Veure ${event.name} a coord.info`}
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
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                            <Trophy size={10} /> {event.team}
                          </span> 
                          <span className="text-[10px] text-slate-500 flex items-center gap-2 font-bold uppercase">
                            <MapPin size={10} /> {event.location}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-2 font-mono">
                            <Calendar size={10} /> {event.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-10">
                      <div className="text-right">
                        <div className="text-3xl font-black text-lime-500 leading-none group-hover:scale-110 transition-transform origin-right">
                          {event.attendees}
                        </div>
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
    </div>
  );
};

export default App;
