import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { getApiKey, setApiKey as saveApiKey } from '../lib/api';
import { 
  XCircle, RefreshCw, Download, FileJson, AlertTriangle, 
  Settings, Lock, Calendar, Sparkles, Network, Maximize2 
} from 'lucide-react';
import { t } from '../lib/i18n';
import ContextMap from './ContextMap';

// --- Confirm Modal ---
export const ConfirmModal = ({ isOpen, onClose, title, message, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 border-t-4 border-red-500">
        <h3 className="text-lg font-extrabold text-slate-900 mb-2 flex items-center gap-2">
          <AlertTriangle className="text-red-500" size={24} /> {title}
        </h3>
        <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className="px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-700 shadow-md"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Admin Modal ---
export const AdminModal = ({ isOpen, onClose, config, onSave, addToast, selectedLanguage }) => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [localConfig, setLocalConfig] = useState(config);
  const [activeTab, setActiveTab] = useState("apikey");
  const [apiKeyInput, setApiKeyInput] = useState("");
  
  useEffect(() => { 
    if(isOpen) {
      const timer = setTimeout(() => setLocalConfig(config), 0);
      setApiKeyInput(getApiKey());
      return () => clearTimeout(timer);
    }
  }, [isOpen, config]);
  
  const handleLogin = () => { 
    if(password === "Signavio321!") { 
      setIsAuthenticated(true); 
      addToast(t(selectedLanguage, "accessGranted"), "success"); 
    } else {
      addToast(t(selectedLanguage, "incorrectPass"), "error"); 
    }
  };
  
  const handleSave = () => { 
    onSave(localConfig); 
    addToast(t(selectedLanguage, "configSaved"), "success"); 
    onClose(); 
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-slate-800 text-white flex justify-between items-center">
          <h2 className="font-bold flex gap-2">
            <Settings/> Admin
          </h2>
          <button onClick={onClose}>
            <XCircle/>
          </button>
        </div>
        <div className="flex-grow p-6 overflow-y-auto">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Lock size={48} className="text-slate-300"/>
              <input 
                type="password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                className="border p-2 rounded" 
                placeholder="Password"
              />
              <button 
                onClick={handleLogin} 
                className="bg-blue-600 text-white px-6 py-2 rounded font-bold"
              >
                Unlock
              </button>
            </div>
          ) : (
            <div className="flex h-full gap-4">
              <div className="w-48 border-r space-y-1">
                <button 
                  onClick={()=>setActiveTab("apikey")} 
                  className={`w-full text-left px-2 py-1 rounded ${activeTab==="apikey" ? "bg-blue-50 text-blue-700" : ""}`}
                >
                  🔑 API Key
                </button>
                <button 
                  onClick={()=>setActiveTab("guardrails")} 
                  className={`w-full text-left px-2 py-1 rounded ${activeTab==="guardrails" ? "bg-blue-50 text-blue-700" : ""}`}
                >
                  AI Guardrails
                </button>
                <button 
                  onClick={()=>setActiveTab("methodology")} 
                  className={`w-full text-left px-2 py-1 rounded ${activeTab==="methodology" ? "bg-blue-50 text-blue-700" : ""}`}
                >
                  Methodology
                </button>
              </div>
              <div className="flex-grow space-y-4">
                {activeTab === "apikey" && (
                  <div>
                    <label className="font-bold block mb-1">Gemini API Key</label>
                    <p className="text-sm text-slate-500 mb-3">Get a free key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google AI Studio</a>. Stored locally in your browser only.</p>
                    <input 
                      type="password" 
                      className="w-full border p-2 rounded text-sm font-mono" 
                      value={apiKeyInput} 
                      onChange={e=>setApiKeyInput(e.target.value)}
                      placeholder="AIzaSy..."
                    />
                    <button 
                      onClick={() => { saveApiKey(apiKeyInput); addToast("API key saved!", "success"); }} 
                      className="bg-blue-600 text-white px-4 py-2 rounded font-bold mt-3"
                    >
                      Save API Key
                    </button>
                  </div>
                )}
                {activeTab === "guardrails" && (
                  <div>
                    <label className="font-bold block mb-1">AI Guardrails</label>
                    <textarea 
                      className="w-full h-64 border p-2 rounded text-sm font-mono" 
                      value={localConfig.aiGuardrails} 
                      onChange={e=>setLocalConfig({...localConfig, aiGuardrails: e.target.value})}
                    />
                  </div>
                )}
                {activeTab === "methodology" && (
                  <div>
                    <label className="font-bold block mb-1">Methodology</label>
                    <textarea 
                      className="w-full h-64 border p-2 rounded text-sm font-mono" 
                      value={localConfig.valueMethodology} 
                      onChange={e=>setLocalConfig({...localConfig, valueMethodology: e.target.value})}
                    />
                  </div>
                )}
                <button 
                  onClick={handleSave} 
                  className="bg-green-600 text-white px-4 py-2 rounded font-bold w-full"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Visual Map Modal ---
export const VisualMapModal = ({ isOpen, onClose, industries, processes, values, capabilities, adoptionRelated }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-100 rounded-t-xl shrink-0">
          <div className="flex items-center gap-2 text-slate-800 font-extrabold text-lg">
            <Network size={24} className="text-orange-600" />
            Full Context Map
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-slate-800 p-2 hover:bg-slate-300 rounded-full transition-colors"
          >
            <XCircle size={28} />
          </button>
        </div>
        <div className="flex-grow p-4 bg-slate-50 overflow-hidden">
          <ContextMap 
            industries={industries} 
            processes={processes} 
            values={values} 
            capabilities={capabilities} 
            adoptionRelated={adoptionRelated} 
          />
        </div>
      </div>
    </div>
  );
};

// --- Agenda Settings Modal ---
export const AgendaSettingsModal = ({ isOpen, onClose, onGenerate }) => {
  const [duration, setDuration] = useState("2 Hours");
  const [customDuration, setCustomDuration] = useState("");
  
  if (!isOpen) return null;
  
  const handleGenerate = () => { 
    onGenerate(duration === "Custom" ? customDuration : duration); 
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar size={22} className="text-purple-600" /> Workshop Settings
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XCircle size={24} />
          </button>
        </div>
        <div className="mb-5">
          <label className="block text-sm font-bold text-slate-700 mb-2">Duration</label>
          <select 
            value={duration} 
            onChange={(e) => setDuration(e.target.value)} 
            className="w-full border-2 border-slate-300 rounded-lg p-2.5 text-sm font-medium text-slate-900 focus:border-purple-600 outline-none bg-white"
          >
            <option value="2 Hours">2 Hours (Standard Discovery)</option>
            <option value="4 Hours">4 Hours (Half Day Deep Dive)</option>
            <option value="1 Day">1 Day (Full Architecture Workshop)</option>
            <option value="Custom">Custom...</option>
          </select>
        </div>
        {duration === "Custom" && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="block text-sm font-bold text-slate-700 mb-2">Specify Duration</label>
            <input 
              type="text" 
              value={customDuration} 
              onChange={(e) => setCustomDuration(e.target.value)} 
              placeholder="E.g., 3 Days, 90 mins, 1 Week..." 
              className="w-full border-2 border-slate-300 rounded-lg p-2.5 text-sm font-medium text-slate-900 focus:border-purple-600 outline-none" 
              autoFocus 
            />
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleGenerate} 
            disabled={duration === "Custom" && !customDuration.trim()} 
            className="px-4 py-2 bg-purple-600 text-white font-bold text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
          >
            <Sparkles size={14} /> Generate Agenda
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Modal Component ---
const Modal = ({ isOpen, onClose, title, content, isLoading, icon: Icon, media }) => {
  if (!isOpen) return null;
  
  const handleDownloadImage = () => {
    if (media?.imageUrl) {
      const link = document.createElement('a'); 
      link.href = media.imageUrl; 
      link.download = 'leanix-diagram.png'; 
      document.body.appendChild(link); 
      link.click(); 
      document.body.removeChild(link);
    }
  };
  
  const handleDownloadImportFile = () => {
    if (media?.importData) {
      const blob = new Blob([media.importData], { type: 'application/json' }); 
      const url = URL.createObjectURL(blob); 
      const link = document.createElement('a'); 
      link.href = url; 
      link.download = 'leanix-import.json'; 
      document.body.appendChild(link); 
      link.click(); 
      document.body.removeChild(link);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="p-3 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            {Icon && <Icon size={20}/>}
            {title}
          </div>
          <button onClick={onClose}>
            <XCircle size={20}/>
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <RefreshCw className="animate-spin text-blue-600 mb-2"/>
              <p className="text-sm text-slate-500">Generating...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {media && media.imageUrl && (
                <img src={media.imageUrl} className="w-full rounded-lg shadow border"/>
              )}
              
              {/* Highlighted JSON Download as Leading Output */}
              {media && media.importData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center mb-4">
                  <p className="text-sm text-blue-800 font-bold mb-2">
                    Primary Output: LeanIX Inventory File (LDIF)
                  </p>
                  <button 
                    onClick={handleDownloadImportFile} 
                    className="w-full py-3 bg-blue-600 text-white font-extrabold text-sm rounded-lg hover:bg-blue-700 shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                  >
                    <FileJson size={18} /> Download JSON for Inventory
                  </button>
                </div>
              )}
              
              {media && media.imageUrl && (
                <div className="flex justify-end">
                  <button 
                    onClick={handleDownloadImage} 
                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-300"
                  >
                    <Download size={14} /> Download Diagram PNG
                  </button>
                </div>
              )}
              
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
