import React from 'react';

interface FooterProps {
  isDark: boolean;
}

export function Footer({ isDark }: FooterProps) {
  return (
    <footer className={`py-12 border-t px-6 transition-colors ${isDark ? 'border-white/5' : 'border-slate-200 bg-white'}`}>
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 text-center">
        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>© 2026 Muhammad Izzul Islam. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
