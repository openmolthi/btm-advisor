import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp, MoreHorizontal } from 'lucide-react';

const StrategicDropdown = ({ label = "More", actions = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) 
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-white border border-slate-300 hover:border-blue-600 text-slate-700 text-xs font-bold py-2 px-3 rounded shadow-sm flex items-center gap-2 whitespace-nowrap transition-colors"
      >
        <MoreHorizontal size={14} /> {label}
        <ChevronUp size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
           {actions.map((action, idx) => {
             const Icon = action.icon;
             return (
               <button 
                 key={idx}
                 onClick={() => handleAction(action.onClick)} 
                 className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700 flex items-center gap-2"
               >
                 {Icon && <Icon size={12} />} {action.label}
               </button>
             );
           })}
        </div>
      )}
    </div>
  );
};

export default StrategicDropdown;
