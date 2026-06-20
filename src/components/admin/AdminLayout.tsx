import React, { ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { motion } from "motion/react";
import {
  Folder,
  MessageSquare,
  Award,
  Briefcase,
  Zap,
  Image,
  LogOut,
  LayoutDashboard,
  User as UserIcon,
} from "lucide-react";

export const MENUS = [
  { key: "projects", label: "Projects", icon: Folder },
  { key: "messages", label: "Messages", icon: MessageSquare },
  { key: "certifications", label: "Certificate", icon: Award },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "skills", label: "Skills", icon: Zap },
  { key: "about", label: "About Photos", icon: Image },
];

interface AdminLayoutProps {
  user: User;
  onLogout: () => void;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  children: ReactNode;
}

export default function AdminLayout({
  user,
  onLogout,
  activeMenu,
  setActiveMenu,
  children,
}: AdminLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#020617] text-slate-200 font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-950/50 backdrop-blur-2xl border-b md:border-b-0 md:border-r border-white/5 flex flex-col p-6 md:sticky md:top-0 z-50 md:h-screen md:overflow-y-auto">
        <div className="flex items-center gap-3 mb-10 px-2 pt-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <LayoutDashboard className="text-white" size={20} />
          </div>
          <div>
            <h2 className="font-black text-lg tracking-tighter text-white uppercase leading-none">
              Admin
            </h2>
            <span className="text-[10px] font-bold text-blue-500 tracking-[0.2em] uppercase">
              Control Center
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {MENUS.map((m) => {
            const isTabActive = activeMenu === m.key || (m.key === "projects" && activeMenu === "project-detail");
            return (
              <button
                key={m.key}
                onClick={() => setActiveMenu(m.key)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-300 group ${
                  isTabActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 translate-x-1"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                }`}
              >
                <m.icon
                  size={20}
                  className={
                    isTabActive
                      ? "text-white"
                      : "text-slate-600 group-hover:text-blue-400"
                  }
                />
                {m.label}
                {isTabActive && (
                  <motion.div
                    layoutId="activeInd"
                    className="ml-auto w-1.5 h-6 bg-white/40 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-10 pt-6 border-t border-white/5 px-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
              <UserIcon size={14} className="text-slate-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm text-red-400 hover:bg-red-500/10 transition-all duration-300"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto h-full">
        {children}
      </main>
    </div>
  );
}
