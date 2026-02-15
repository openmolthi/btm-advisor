import React, { useState, useRef, useEffect } from 'react';
import { Target, ChevronUp, Users, ExternalLink } from 'lucide-react';
import { t } from '../lib/i18n';

const StrategicDropdown = ({ selectedLanguage, onCompetitor, onStakeholder, onSuccess, extraActions = [] }) => {
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
        <Target size={14} /> {t(selectedLanguage, "actions", "insights")} 
        <ChevronUp size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
           <button 
             onClick={() => handleAction(onCompetitor)} 
             className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700 flex items-center gap-2"
           >
             <Target size={12} /> {t(selectedLanguage, "actions", "competitor")}
           </button>
           <button 
             onClick={() => handleAction(onStakeholder)} 
             className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700 flex items-center gap-2"
           >
             <Users size={12} /> {t(selectedLanguage, "actions", "stakeholders")}
           </button>
           <button 
             onClick={() => handleAction(onSuccess)} 
             className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700 flex items-center gap-2"
           >
             <ExternalLink size={12} /> {t(selectedLanguage, "actions", "successStory")}
           </button>
           {extraActions.length > 0 && (
             <>
               <div className="border-t border-slate-100 my-1"></div>
               {extraActions.map((action, idx) => {
                 const Icon = action.icon;
                 return (
                   <button 
                     key={idx}
                     onClick={() => handleAction(action.onClick)} 
                     className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700 flex items-center gap-2"
                   >
                     <Icon size={12} /> {action.label}
                   </button>
                 );
               })}
             </>
           )}
        </div>
      )}
    </div>
  );
};

export default StrategicDropdown;
