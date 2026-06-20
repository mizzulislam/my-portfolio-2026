import React, { ReactNode, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#020617] text-slate-200 font-sans">
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-screen z-50 bg-slate-950/50 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-all duration-300 overflow-y-auto no-scrollbar ${
          isCollapsed ? "w-20 px-3 pt-6" : "w-72 pt-6 px-6"
        }`}
      >
        <div className={`flex items-center mb-6 gap-3 px-1 pt-2 ${isCollapsed ? "justify-center" : ""}`}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all shrink-0 cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isLogoHovered ? (
              isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />
            ) : (
              <LayoutDashboard size={20} />
            )}
          </button>

          {!isCollapsed && (
            <div className="overflow-hidden">
              <h2 className="font-black text-lg tracking-tighter text-white uppercase leading-none truncate">
                Admin
              </h2>
              <span className="text-[10px] font-bold text-blue-500 tracking-[0.2em] uppercase whitespace-nowrap">
                Control Center
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          {MENUS.map((m) => {
            const isTabActive = activeMenu === m.key || (m.key === "projects" && activeMenu === "project-detail");
            return (
              <button
                key={m.key}
                onClick={() => setActiveMenu(m.key)}
                className={`flex items-center transition-all duration-300 group ${
                  isCollapsed 
                    ? "w-10 h-10 justify-center rounded-xl mx-auto" 
                    : "w-full px-5 py-3 rounded-2xl text-sm font-bold gap-4"
                } ${
                  isTabActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                }`}
                title={isCollapsed ? m.label : undefined}
              >
                <m.icon
                  size={isCollapsed ? 18 : 20}
                  className={
                    isTabActive
                      ? "text-white"
                      : "text-slate-600 group-hover:text-blue-400"
                  }
                />
                {!isCollapsed && <span>{m.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 pb-8 border-t border-white/5 shrink-0">
          <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? "justify-center" : "px-2"}`}>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
              <UserIcon size={14} className="text-slate-400" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={onLogout}
            className={`flex items-center transition-all duration-300 text-red-400 hover:bg-red-500/10 ${
              isCollapsed 
                ? "w-10 h-10 justify-center rounded-xl mx-auto" 
                : "w-full px-5 py-3 rounded-2xl font-bold text-sm gap-4"
            }`}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Content */}
      <main 
        className={`flex-1 p-6 md:p-12 overflow-y-auto h-full no-scrollbar transition-all duration-300 ease-in-out ${
          isCollapsed ? "md:ml-20" : "md:ml-72"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
