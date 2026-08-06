import React from 'react';
import Sidebar from './Sidebar';
import { X } from 'lucide-react';

export default function MobileNav({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
      />

      {/* Drawer Panel */}
      <div
        className="fixed inset-y-0 left-0 w-64 bg-slate-900 z-50 lg:hidden shadow-2xl flex flex-col transition-transform duration-200 ease-in-out"
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <Sidebar onCloseMobile={onClose} />
      </div>
    </>
  );
}
