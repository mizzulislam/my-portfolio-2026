import { useState, useEffect, useRef } from "react";
import React from 'react'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'motion/react'
import { ReplyModal } from './ReplyModal'
import CertificateManager from "./admin/CertificateManager";
import ExperienceManager from "./admin/ExperienceManager";
import ProjectManager from "./admin/ProjectManager";
import SkillManager from "./admin/SkillManager";
import MessageManager from "./admin/MessageManager";
import { Project, Message, CertificationItem, Experience, Skill } from "../types";
import { AdminCard, AdminBtn, AdminInput, AdminTextArea, AdminSelect, ImageUpload } from './admin/AdminSharedUI';
import { translateToIndonesian, translateArrayToIndonesian } from '../lib/translate'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Folder,
  MessageSquare,
  Award,
  Briefcase,
  Zap,
  LogOut,
  LayoutDashboard,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
  Github,
  Calendar,
  Building2,
  User as UserIcon,
  Tag,
  ListFilter,
  Filter,
  ChevronDown,
  Eye,
  GripVertical, 
  RefreshCw, 
  Search, 
  Mail, 
  MailOpen, 
  ChevronLeft, 
  Send,
  MoreVertical
} from "lucide-react";

// ─── Types ───────────────────────────────────────────
const isDark = true; // Forcing dark mode for admin

// ─── Main Component ───────────────────────────────────
export default function Admin() {
  const [user, setUser] = useState<User | null>(null)
  const [activeMenu, setActiveMenu] = useState('projects')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: import('@supabase/supabase-js').Session | null } }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
          <UserIcon className="text-blue-500" size={40} />
        </div>
        <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Access Denied</h1>
        <p className="text-slate-400 mb-8 max-w-sm">Please login with your administrator credentials to access the panel.</p>
        <a href="/login" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
          Return to Login
        </a>
      </div>
    )
  }

  const menus = [
    { key: 'projects', label: 'Projects', icon: Folder },
    { key: 'messages', label: 'Messages', icon: MessageSquare },
    { key: 'certifications', label: 'Certificate', icon: Award },
    { key: 'experience', label: 'Experience', icon: Briefcase },
    { key: 'skills', label: 'Skills', icon: Zap },
  ]

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
          {menus.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveMenu(m.key)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-300 group ${
                activeMenu === m.key
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 translate-x-1"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              <m.icon
                size={20}
                className={
                  activeMenu === m.key
                    ? "text-white"
                    : "text-slate-600 group-hover:text-blue-400"
                }
              />
              {m.label}
              {activeMenu === m.key && (
                <motion.div
                  layoutId="activeInd"
                  className="ml-auto w-1.5 h-6 bg-white/40 rounded-full"
                />
              )}
            </button>
          ))}
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
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm text-red-400 hover:bg-red-500/10 transition-all duration-300"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMenu}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto pb-20"
          >
            {activeMenu === "projects" && <ProjectManager />}
            {activeMenu === "messages" && <MessageManager />}
            {activeMenu === "certifications" && <CertificateManager />}
            {activeMenu === "experience" && <ExperienceManager />}
            {activeMenu === "skills" && <SkillManager />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─── Messages Manager ─────────────────────────────────
// ─── Certifications Manager ───────────────────────────
// ─── Experience Manager ───────────────────────────────
// ─── Skills Manager ───────────────────────────────────

