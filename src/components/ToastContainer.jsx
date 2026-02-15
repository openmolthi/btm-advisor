import React from 'react';
import { X, CheckCircle, Info } from 'lucide-react';

const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
    {toasts.map((toast) => (
      <div 
        key={toast.id} 
        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-semibold animate-in slide-in-from-right-10 fade-in duration-300 ${
          toast.type === 'success' 
            ? 'bg-white border-green-200 text-green-800' 
            : toast.type === 'error' 
            ? 'bg-white border-red-200 text-red-800' 
            : 'bg-white border-blue-200 text-blue-800'
        }`}
      >
        {toast.type === 'success' ? (
          <CheckCircle size={18} className="text-green-500"/>
        ) : (
          <Info size={18} className="text-blue-500"/>
        )}
        {toast.message}
        <button onClick={() => removeToast(toast.id)}>
          <X size={14} className="opacity-50 hover:opacity-100" />
        </button>
      </div>
    ))}
  </div>
);

export default ToastContainer;
