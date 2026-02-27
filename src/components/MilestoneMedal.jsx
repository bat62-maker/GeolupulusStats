import { MEDAL_CONFIGS } from '../utils/milestones';
import MyTooltip from './MyTooltip';

const MilestoneMedal = ({ number, onClick }) => {
  const config = MEDAL_CONFIGS[number] || MEDAL_CONFIGS[150];

  return (
    <MyTooltip text={`Edició Històrica ${number} — ${config.label}`} position="bottom">
    <div
      onClick={onClick}
      className="relative flex flex-col items-center justify-center animate-pulse-slow group cursor-help scale-75 sm:scale-90"
      title={`Veure l'any de l'Edició Històrica ${number}`}
    >
      <svg
        width="60" height="80" viewBox="0 0 100 120"
        fill="none" xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
      >
        <path d="M35 0L25 40H45L35 0Z" fill="#EF4444" />
        <path d="M65 0L55 40H75L65 0Z" fill="#EF4444" />
        <path d="M50 0L40 45H60L50 0Z" fill="#B91C1C" />
        <circle cx="50" cy="70" r="40" fill={config.color} stroke={config.secondary} strokeWidth="2" />
        <circle cx="50" cy="70" r="32" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
        <text x="50" y="72" textAnchor="middle" fill={config.secondary} fontSize="22" fontWeight="900" fontFamily="sans-serif">
          {number}
        </text>
        <text x="50" y="88" textAnchor="middle" fill={config.secondary} fontSize="8" fontWeight="800" fontFamily="sans-serif" letterSpacing="1">
          {config.label}
        </text>
      </svg>
    </div>
    </MyTooltip>
  );
};

export default MilestoneMedal;
