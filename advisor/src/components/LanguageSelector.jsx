import React, { useState, useRef, useEffect } from 'react';
import { Languages, ChevronDown, Check } from 'lucide-react';
import { LANGUAGE_OPTIONS } from '../lib/constants';

const LanguageSelector = ({ selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = LANGUAGE_OPTIONS.find(l => l.label === selected) || LANGUAGE_OPTIONS[0]; 

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1.5 rounded-md text-xs font-bold transition-colors border border-transparent hover:border-slate-300"
        title="Change Language"
      >
        <Languages size={14} />
        <span>{selectedOption ? selectedOption.code : "EN"}</span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {LANGUAGE_OPTIONS.map((opt) => (
            <div
              key={opt.code}
              className={`px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 flex items-center justify-between ${
                selected === opt.label ? 'font-bold text-blue-700 bg-blue-50' : 'text-slate-700'
              }`}
              onClick={() => {
                onChange(opt.label);
                setIsOpen(false);
              }}
            >
              <span className="truncate">{opt.label}</span>
              {selected === opt.label && <Check size={12} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
