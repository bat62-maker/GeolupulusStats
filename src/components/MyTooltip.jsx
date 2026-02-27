/**
 * Tooltip personalitzat que substitueix els title natius del navegador.
 * Apareix a sobre de l'element, centrat, amb animació.
 *
 * Ús:
 *   <MyTooltip text="El meu tooltip">
 *     <div>hover me</div>
 *   </MyTooltip>
 *
 * Props:
 *   text     — contingut del tooltip (string o JSX)
 *   position — 'top' | 'bottom' | 'left' | 'right'  (default: 'top')
 *   className — classes extra per al wrapper
 */
const MyTooltip = ({ text, children, position = 'top', className = '' }) => {
  if (!text) return children;

  const posClasses = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top:    'top-full left-1/2 -translate-x-1/2 border-t-slate-700 border-x-transparent border-b-transparent border-[6px]',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-700 border-x-transparent border-t-transparent border-[6px]',
    left:   'left-full top-1/2 -translate-y-1/2 border-l-slate-700 border-y-transparent border-r-transparent border-[6px]',
    right:  'right-full top-1/2 -translate-y-1/2 border-r-slate-700 border-y-transparent border-l-transparent border-[6px]',
  };

  return (
    <div className={`relative inline-flex group/tooltip ${className}`}>
      {children}
      <div
        className={`
          pointer-events-none absolute z-50 whitespace-normal w-max max-w-xs 
          ${posClasses[position]}
          opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100
          transition-all duration-150 ease-out
        `}
      >
        {/* Bubble */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 shadow-2xl shadow-black/50">
          <span className="text-sm font-bold text-slate-100 leading-snug">{text}</span>
        </div>
        {/* Arrow */}
        <div className={`absolute border-solid ${arrowClasses[position]}`} />
      </div>
    </div>
  );
};

export default MyTooltip;
