import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search, Check } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
const MultiSelect = ({ label, icon: Icon, options, selected, onChange, colorClass, borderColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };
  
  const removeOption = (option, e) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== option));
  };

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-extrabold text-slate-900 mb-1 flex items-center gap-1.5 uppercase tracking-wide">
        <Icon size={14} className={colorClass} />
        {label}
      </label>
      
      {/* Display Area - Chips */}
      <div 
        className={`min-h-[38px] w-full border-2 rounded-md px-2 py-1.5 bg-white cursor-pointer hover:border-blue-600 transition-colors flex flex-wrap items-center gap-1 ${
          isOpen ? 'border-blue-600 ring-2 ring-blue-100' : borderColor
        }`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length === 0 && (
          <span className="text-slate-500 text-sm font-medium">Select...</span>
        )}
        {selected.map((item) => (
          <span 
            key={item} 
            className="text-[11px] px-1.5 py-0.5 rounded flex items-center gap-1 bg-slate-100 border border-slate-300 text-slate-900 font-bold max-w-full"
          >
            <span className="truncate max-w-[150px]">{item}</span>
            <X 
              size={12} 
              className="hover:text-red-600 cursor-pointer flex-shrink-0" 
              onClick={(e) => removeOption(item, e)} 
            />
          </span>
        ))}
        <div className="ml-auto pl-2">
          <ChevronDown 
            size={14} 
            className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute z-30 mt-1 w-full bg-white border-2 border-slate-400 rounded-lg shadow-2xl flex flex-col max-h-[280px]">
          {/* Search Header */}
          <div className="p-2 border-b border-slate-200 sticky top-0 bg-white rounded-t-lg z-10">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <input 
                ref={searchInputRef}
                type="text" 
                className="w-full pl-8 pr-2 py-1.5 text-sm border-2 border-slate-300 rounded bg-slate-50 focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium transition-colors" 
                placeholder={`Search ${label}...`} 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          {/* Options List */}
          <div className="overflow-y-auto flex-grow p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-xs text-slate-500 text-center italic font-medium">
                No matches found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selected.includes(option);
                const isCatchAll = option.includes(" - all");
                return (
                  <div 
                    key={option}
                    className={`px-3 py-1.5 text-sm cursor-pointer rounded hover:bg-slate-100 flex items-center justify-between ${
                      isSelected 
                        ? 'bg-blue-50 text-blue-900 font-bold' 
                        : isCatchAll 
                        ? 'text-slate-900 font-extrabold' 
                        : 'text-slate-800 font-medium'
                    }`}
                    onClick={() => toggleOption(option)}
                  >
                    <span className="truncate">{option}</span>
                    {isSelected && <Check size={14} className="text-blue-700 flex-shrink-0 ml-2" />}
                  </div>
                );
              })
            )}
          </div>
          
          {/* Footer with Done Button */}
          <div className="p-2 border-t border-slate-200 bg-slate-100 rounded-b-lg flex justify-between items-center">
            <span className="text-[10px] text-slate-500 pl-1 font-bold">
              {selected.length} selected
            </span>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setIsOpen(false); 
                setSearchTerm(""); 
              }} 
              className="bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded hover:bg-blue-800 transition-colors shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
