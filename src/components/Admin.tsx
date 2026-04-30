import { useState, useEffect, useRef } from "react";
import React from 'react'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'motion/react'
import { ReplyModal } from './ReplyModal'
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
} from "lucide-react";

// ─── Types ───────────────────────────────────────────
interface Project {
  id?: string;
  title: string;
  title_id: string;
  description: string;
  desc_id: string;
  category: string;
  category_id: string;
  image_url: string;
  github_url: string;
  live_url: string;
  tags: string[]
  tags_id: string[];
}

interface Message {
  id: string
  name: string
  lastname: string
  email: string
  message: string
  is_read: boolean
  created_at: string
}

interface CertificationItem {
  id?: string;
  category_id: string;
  title: string;
  title_id: string;
  issuer: string;
  issue_month: string;
  issue_year: string;
  expiry_month: string;
  expiry_year: string;
  credential_id: string;
  image_url: string;
  link: string;
  order: number;
}

interface Experience {
  id?: string;
  company: string;
  role: string;
  type: "work" | "org";
  start_date: string;
  end_date: string;
  location: string;
  logo_url: string;
  details: string[];
  role_id: string;
  company_id: string;
  location_id: string;
  details_id: string[];
}

interface Skill {
  id?: string
  name: string
  category: string
}

const isDark = true; // Forcing dark mode for admin

// ─── Shared Components ───────────────────────────────
function ImageUpload({
  value,
  onChange,
  label = "Upload Image",
  resetKey,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  resetKey?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value);
  useEffect(() => {
    setPreview(value);
  }, [resetKey, value]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("key", import.meta.env.VITE_IMGBB_API_KEY);

      const res = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        const url = data.data.url;
        setPreview(url);
        onChange(url);
      } else {
        alert("Upload gagal, coba lagi!");
      }
    } catch (err) {
      alert("Upload error!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      {preview ? (
        <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-white/10 group">
          <img
            src={preview}
            alt="preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
            <button
              onClick={() => inputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              {uploading ? "Uploading..." : "Ganti Gambar"}
            </button>
            <button
              onClick={() => {
                setPreview("");
                onChange("");
              }}
              className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 rounded-2xl border-2 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-blue-400 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-xs font-bold">Uploading...</span>
            </>
          ) : (
            <>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-widest">
                {label}
              </span>
              <span className="text-[10px] text-slate-600">PNG, JPG, WEBP</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
function AdminCard({ children, title, icon: Icon }: { children: React.ReactNode, title: string, icon?: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-visible p-6 md:p-8 shadow-2xl relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/[0.03] to-transparent pointer-events-none" />
      <div className="flex items-center gap-3 mb-8 relative z-10">
        {Icon && <Icon className="text-blue-500" size={24} />}
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">{title}</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-2" />
      </div>
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

function AdminInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      {...props} 
      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 mb-4"
    />
  )
}

function AdminSelect({
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-3.5 text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 mb-4 appearance-none cursor-pointer"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 1.25rem center",
        colorScheme: "dark",
      }}
    />
  );
}

function AdminTextArea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea 
      {...props} 
      rows={4}
      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 mb-4 resize-none"
    />
  )
}

function AdminBtn({
  children,
  variant = "primary",
  size = "normal", // Tambahkan parameter size
  ...props
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost"; // Tambah 'ghost'
  size?: "normal" | "icon"; // Tambah tipe size
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  title?: string;
}) {
  const styles = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]",
    secondary:
      "bg-slate-800/80 border border-white/10 text-slate-300 hover:bg-slate-700",
    danger:
      "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20",
    ghost:
      "bg-white/5 border border-white/10 text-slate-400 hover:text-blue-400 hover:border-blue-500/30",
  };

  // Jika size='icon', padding dibuat sama sisi (square)
  const sizeStyles =
    size === "icon" ? "p-2.5 rounded-xl" : "px-6 py-3 rounded-2xl";

  return (
    <button
      {...props}
      className={`${sizeStyles} font-bold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

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
            {activeMenu === "projects" && <ProjectsManager />}
            {activeMenu === "messages" && <MessagesManager />}
            {activeMenu === "certifications" && <CertificationsManager />}
            {activeMenu === "experience" && <ExperienceManager />}
            {activeMenu === "skills" && <SkillsManager />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function SortableCard({
  item,
  onEdit,
  onDelete,
  isDraggable = false,
}: {
  item: Project;
  onEdit: (item: Project) => void;
  onDelete: (id: string) => void;
  isDraggable?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: item.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease",
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 1,
    scale: isDragging ? "1.05" : "1",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-6 rounded-3xl border bg-slate-900/40 backdrop-blur-xl group transition-all duration-200 relative ${
        isDragging
          ? "border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.4)] cursor-grabbing"
          : "border-white/5 hover:border-blue-500/30 cursor-default"
      }`}
    >
      {/* Indikator posisi saat di-drag */}
      {isDraggable && (
        <div className="absolute inset-0 rounded-3xl bg-blue-500/10 border-2 border-blue-500 border-dashed pointer-events-none z-10" />
      )}

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 cursor-grab active:cursor-grabbing text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
        title="Drag to change order"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="4" r="1.5" />
          <circle cx="11" cy="4" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="11" cy="12" r="1.5" />
        </svg>
      </div>

      <div className="h-40 w-full rounded-2xl bg-slate-800 mb-6 overflow-hidden border border-white/5">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-700">
            No Image
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-white tracking-tighter uppercase pr-8">
          {item.title}
        </h3>
        <p className="text-xs font-medium text-slate-400 leading-relaxed line-clamp-2">
          {item.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="pt-4 flex gap-3 border-t border-white/5 mt-4">
          <AdminBtn variant="secondary" onClick={() => onEdit(item)}>
            <Edit2 size={14} /> Edit
          </AdminBtn>
          <AdminBtn variant="danger" onClick={() => onDelete(item.id!)}>
            <Trash2 size={14} />
          </AdminBtn>
        </div>
      </div>
    </div>
  );
}

// ─── Projects Manager ─────────────────────────────────
function ProjectsManager() {
  const [dragSuccess, setDragSuccess] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Project[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [items, setItems] = useState<Project[]>([])
  const [form, setForm] = useState<Project>({
    title: "",
    title_id: "",
    description: "",
    desc_id: "",
    category: "",
    category_id: "",
    image_url: "",
    github_url: "",
    live_url: "",
    tags: [],
    tags_id: [],
  });
  const [editId, setEditId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);

    // Simpan urutan baru sementara, belum ke Supabase
    setPendingOrder(newItems);
    setItems(newItems);
  };

  const handleConfirmOrder = async () => {
    await Promise.all(
      pendingOrder.map((item, index) =>
        supabase
          .from("projects")
          .update({ order: index + 1 })
          .eq("id", item.id!),
      ),
    );
    setPendingOrder([]);
    setShowConfirm(false);
    setIsReordering(false);
    setDragSuccess(true);
    setTimeout(() => setDragSuccess(false), 3000);
  };

  const handleCancelOrder = () => {
    setShowConfirm(false);
  };

  const handleDiscardOrder = () => {
    fetchItems(); // kembalikan ke urutan Supabase
    setPendingOrder([]);
    setIsReordering(false);
  };

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("order", { ascending: true });
    if (data) setItems(data)
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      // Auto-translate ke Bahasa Indonesia
      const [title_id, desc_id, category_id, tags_id] = await Promise.all([
        translateToIndonesian(form.title),
        translateToIndonesian(form.description),
        translateToIndonesian(form.category),
        translateArrayToIndonesian(form.tags),
      ]);

      const dataToSave = { ...form, title_id, desc_id, category_id, tags_id };

      if (editId) {
        await supabase.from("projects").update(dataToSave).eq("id", editId);
      } else {
        await supabase.from("projects").insert(dataToSave);
      }
      setForm({
        title: "",
        title_id: "",
        description: "",
        desc_id: "",
        category: "",
        category_id: "",
        image_url: "",
        github_url: "",
        live_url: "",
        tags: [],
        tags_id: [],
      });
      setEditId(null);
      fetchItems();
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (item: Project) => {
    setForm(item)
    setEditId(item.id!)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await supabase.from('projects').delete().eq('id', id)
      fetchItems()
    }
  }

  return (
    <div className="space-y-10">
      <AdminCard title="Add / Edit Project" icon={Plus}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div className="col-span-full md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Project Title
            </label>
            <AdminInput
              placeholder="Enter project title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="col-span-full md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Project Category
            </label>
            <AdminInput
              placeholder="Personal Project, Capstone, Web..."
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>

          {/* Baris 2: Description */}
          <div className="col-span-full">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Description
            </label>
            <AdminTextArea
              placeholder="Write a short description..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          {/* Baris 3: GitHub + Live Demo */}
          <div className="col-span-full md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              GitHub URL
            </label>
            <AdminInput
              placeholder="https://github.com/..."
              value={form.github_url}
              onChange={(e) => setForm({ ...form, github_url: e.target.value })}
            />
          </div>
          <div className="col-span-full md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Live Demo URL
            </label>
            <AdminInput
              placeholder="https://..."
              value={form.live_url}
              onChange={(e) => setForm({ ...form, live_url: e.target.value })}
            />
          </div>

          {/* Baris 4: Tags */}
          <div className="col-span-full">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Tags (Semicolon separated)
            </label>
            <AdminInput
              placeholder="React; Tailwind; Supabase..."
              value={form.tags.join(";")}
              onChange={(e) =>
                setForm({
                  ...form,
                  tags: e.target.value.split(";").map((s) => s.trim()),
                })
              }
            />
          </div>

          {/* Baris 5: Project Image — di atas button */}
          <div className="col-span-full">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Project Image
            </label>
            <ImageUpload
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              label="Upload Project Image"
            />
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <AdminBtn onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : editId ? (
              <Check size={18} />
            ) : (
              <Plus size={18} />
            )}
            {editId ? "Apply Updates" : "Launch Project"}
          </AdminBtn>
          {editId && (
            <AdminBtn
              variant="secondary"
              onClick={() => {
                setEditId(null);
                setForm({
                  title: "",
                  title_id: "",
                  description: "",
                  desc_id: "",
                  category: "",
                  category_id: "",
                  image_url: "",
                  github_url: "",
                  live_url: "",
                  tags: [],
                  tags_id: [],
                });
              }}
            >
              <X size={18} /> Cancel
            </AdminBtn>
          )}
        </div>
        {dragSuccess && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] bg-green-500/20 border border-green-500/40 text-green-400 px-6 py-3 rounded-2xl font-bold text-sm backdrop-blur-xl shadow-2xl flex items-center gap-3 animate-fade-in">
            <Check size={18} /> The order has been successfully saved!
          </div>
        )}
      </AdminCard>

      {/* Tombol Edit Urutan */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-black uppercase tracking-widest text-sm">
          {items.length} Projects
        </h3>
        <div className="flex gap-3">
          {isReordering ? (
            <>
              {pendingOrder.length > 0 && (
                <AdminBtn onClick={() => setShowConfirm(true)}>
                  <Check size={16} /> Simpan Urutan
                </AdminBtn>
              )}
              <AdminBtn variant="secondary" onClick={handleDiscardOrder}>
                <X size={16} /> Batal
              </AdminBtn>
            </>
          ) : (
            <AdminBtn variant="secondary" onClick={() => setIsReordering(true)}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <circle cx="5" cy="4" r="1.5" />
                <circle cx="11" cy="4" r="1.5" />
                <circle cx="5" cy="8" r="1.5" />
                <circle cx="11" cy="8" r="1.5" />
                <circle cx="5" cy="12" r="1.5" />
                <circle cx="11" cy="12" r="1.5" />
              </svg>
              Edit Urutan
            </AdminBtn>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={isReordering ? handleDragEnd : () => {}}
      >
        <SortableContext
          items={items.map((i) => i.id!)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <SortableCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDraggable={isReordering} // ← tambahkan prop ini
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {/* Popup Konfirmasi */}
      {showConfirm && (
        <div className="fixed inset-0 z-[999] flex items-end justify-center pb-12 px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl max-w-md w-full">
            <h3 className="text-white font-black text-lg uppercase tracking-tight mb-2">
              Simpan Urutan Baru?
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Urutan project akan diperbarui dan langsung terlihat di halaman
              portfolio.
            </p>
            <div className="flex gap-3">
              <AdminBtn onClick={handleConfirmOrder}>
                <Check size={16} /> Ya, Simpan
              </AdminBtn>
              <AdminBtn variant="secondary" onClick={handleCancelOrder}>
                <X size={16} /> Batal
              </AdminBtn>
            </div>
          </div>
        </div>
      )}

      {/* Notifikasi Sukses */}
      {dragSuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] bg-green-500/20 border border-green-500/40 text-green-400 px-8 py-4 rounded-2xl font-bold text-sm backdrop-blur-xl shadow-2xl flex items-center gap-3">
          <Check size={18} /> Urutan berhasil disimpan!
        </div>
      )}
    </div>
  );
}

// ─── Messages Manager ─────────────────────────────────
const MessagesManager = () => {
  // 1. STATE MANAGEMENT
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. FUNGSI AMBIL DATA (FETCH)
  const fetchMessages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setMessages(data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  // 3. LOGIKA SELEKSI (CHECKBOX)
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(messages.map((msg) => msg.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 4. LOGIKA PENGHAPUSAN (DELETE)
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Hapus ${selectedIds.length} pesan terpilih?`)) {
      const { error } = await supabase
        .from("messages")
        .delete()
        .in("id", selectedIds);
      
      if (!error) {
        fetchMessages();
        setSelectedIds([]);
      }
    }
  };

  // 5. TAMPILAN DETAIL PESAN (Body Email)
  if (selectedMessage) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => setSelectedMessage(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Kembali ke Kotak Masuk
        </button>

        <div className="bg-slate-900 border border-white/5 rounded-3xl p-8 shadow-2xl relative">
          <div className="border-b border-white/5 pb-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {selectedMessage.name} {selectedMessage.lastname}
            </h2>
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-400 font-medium">{selectedMessage.email}</span>
              <span className="text-slate-500 tabular-nums">
                {new Date(selectedMessage.created_at).toLocaleString('id-ID', {
                  dateStyle: 'long',
                  timeStyle: 'short'
                })}
              </span>
            </div>
          </div>
          
          <div className="text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[200px] bg-slate-950/30 p-6 rounded-2xl border border-white/5">
            {selectedMessage.message}
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95"
            >
              Balas Pesan
            </button>
          </div>
        </div>

        {/* MODAL BALAS PESAN */}
        <ReplyModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          recipientEmail={selectedMessage.email}
          subject={`Re: Pesan dari ${selectedMessage.name}`}
          onSuccess={() => setIsModalOpen(false)}
        />
      </div>
    );
  }

  // 6. TAMPILAN DAFTAR PESAN (Inbox List)
  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 rounded-3xl border border-white/5 overflow-hidden animate-in fade-in duration-500">
      
      {/* SEARCH BAR */}
      <div className="p-4 border-b border-white/5 bg-white/[0.01]">
        <div className="relative max-w-2xl mx-auto">
          <input 
            type="text" 
            placeholder="Cari nama pengirim..." 
            className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 px-11 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute left-4 top-3 opacity-40">🔍</span>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="flex items-center gap-4 px-6 py-3 bg-white/[0.02] border-b border-white/5">
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-blue-600 transition-all cursor-pointer"
            onChange={handleSelectAll}
            checked={selectedIds.length === messages.length && messages.length > 0}
          />
          
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-200">
              <button 
                onClick={handleDeleteSelected}
                className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-lg transition-colors" 
                title="Hapus terpilih"
              >
                🗑️
              </button>
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
        
        <button 
          onClick={fetchMessages} 
          className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
          title="Segarkan"
        >
          🔄
        </button>
      </div>

      {/* LIST PESAN */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-20 text-center text-slate-500 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">Menyelaraskan kotak masuk...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-20 text-center text-slate-500">
            <p className="text-sm font-medium">Kotak masuk kosong.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {messages
              .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((msg) => (
              <div 
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`flex items-center gap-4 px-6 py-3 hover:bg-white/[0.04] cursor-pointer group transition-all border-l-2 ${
                  selectedIds.includes(msg.id) ? "bg-blue-500/10 border-blue-500" : "border-transparent"
                }`}
              >
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-blue-600 transition-all cursor-pointer"
                  checked={selectedIds.includes(msg.id)}
                  onClick={(e) => e.stopPropagation()} 
                  onChange={() => toggleSelect(msg.id)}
                />

                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 border border-blue-500/10 uppercase">
                  {msg.name[0]}
                </div>

                <span className="w-40 font-semibold truncate text-slate-200 text-sm">
                  {msg.name}
                </span>

                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-sm text-slate-300 font-medium truncate shrink-0">
                    {msg.lastname || "Pesan Baru"}
                  </span>
                  <span className="text-sm text-slate-500 truncate opacity-60">
                    — {msg.message}
                  </span>
                </div>

                <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap tabular-nums">
                  {new Date(msg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Certifications Manager ───────────────────────────
function SortableCertCard({
  item,
  onEdit,
  onDelete,
  isDraggable,
  categoryName,
  categoryColor,
}: {
  item: CertificationItem;
  onEdit: (item: CertificationItem) => void;
  onDelete: (id: string) => void;
  isDraggable: boolean;
  categoryName?: string;
  categoryColor?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease",
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  // Warna otomatis berdasarkan index atau fallback
  const colorPalette = [
    "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    "text-blue-400 bg-blue-500/10 border-blue-500/20",
    "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    "text-purple-400 bg-purple-500/10 border-purple-500/20",
    "text-pink-400 bg-pink-500/10 border-pink-500/20",
    "text-orange-400 bg-orange-500/10 border-orange-500/20",
  ];

  const meta = {
    label: categoryName || item.category_id,
    color: categoryColor || colorPalette[0],
  };

  // Format tanggal untuk tampilan
  const issuedDate = [item.issue_month, item.issue_year]
    .filter(Boolean)
    .join(" ");
  const expiryDate = [item.expiry_month, item.expiry_year]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-5 rounded-3xl border bg-slate-900/40 backdrop-blur-xl group transition-all duration-200 relative flex gap-5 items-start ${
        isDragging
          ? "border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.4)] cursor-grabbing"
          : "border-white/5 hover:border-blue-500/30 cursor-default"
      }`}
    >
      {/* Drag Handle */}
      {isDraggable && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 cursor-grab active:cursor-grabbing text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
          title="Geser untuk mengubah urutan"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="4" r="1.5" />
            <circle cx="11" cy="4" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="11" cy="12" r="1.5" />
          </svg>
        </div>
      )}

      {/* Thumbnail */}
      <div className="w-28 h-20 rounded-2xl bg-slate-800 border border-white/5 overflow-hidden shrink-0">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-bold">
            No Image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 pr-32">
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border mb-2 ${meta.color}`}
        >
          {meta.label}
        </span>
        <h3 className="text-sm font-black text-white tracking-tight leading-snug line-clamp-2 mb-1">
          {item.title}
        </h3>
        {/* Issuer & Date */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
          {item.issuer && (
            <span className="text-[10px] text-blue-400 font-bold">
              {item.issuer}
            </span>
          )}
          {issuedDate && (
            <span className="text-[10px] text-slate-500 font-mono">
              Issued: {issuedDate}
              {expiryDate ? ` · Expires: ${expiryDate}` : " · No Expiration"}
            </span>
          )}
        </div>
        {item.credential_id && (
          <p className="text-[9px] text-slate-600 font-mono mt-0.5">
            ID: {item.credential_id}
          </p>
        )}
        {/* Terjemahan ID */}
        {item.title_id && (
          <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">
            {item.title_id}
          </p>
        )}
      </div>

      {/* Tombol Aksi Box Icon */}
      <div className="absolute bottom-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
        <AdminBtn
          variant="ghost"
          size="icon"
          onClick={() => window.open(item.link, "_blank")}
          title="View Detail"
        >
          <Eye size={16} />
        </AdminBtn>
        <AdminBtn
          variant="secondary"
          size="icon"
          onClick={() => onEdit(item)}
          title="Edit"
        >
          <Edit2 size={16} />
        </AdminBtn>
        <AdminBtn
          variant="danger"
          size="icon"
          onClick={() => onDelete(item.id!)}
          title="Delete"
        >
          <Trash2 size={16} />
        </AdminBtn>
      </div>

      {isDraggable && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-4 right-4 p-2 text-slate-600 hover:text-blue-400 cursor-grab"
        >
          <GripVertical size={18} />
        </div>
      )}
    </div>
  );
}

// Urutan bulan untuk keperluan sorting
  const MONTH_ORDER: Record<string, number> = {
    Jan: 1,
    Feb: 2,
    Mar: 3,
    Apr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Aug: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dec: 12,
  };
  function toSortValue(year: string, month: string): number {
    const y = parseInt(year) || 0;
    const m = MONTH_ORDER[month] || 0;
    return y * 100 + m; // contoh: Jun 2024 → 202406
  }

// ─── Manager Utama ────────────────────────────────────────────
function CertificationsManager() {
  const EMPTY_FORM: CertificationItem = {
    category_id: "",
    title: "",
    title_id: "",
    issuer: "",
    issue_month: "",
    issue_year: "",
    expiry_month: "",
    expiry_year: "",
    credential_id: "",
    image_url: "",
    link: "",
    order: 0,
  };

  const EMPTY_CAT = { name: "", icon: "", description: "" };

  const [items, setItems] = useState<CertificationItem[]>([]);
  const [form, setForm] = useState<CertificationItem>(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<CertificationItem[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dragSuccess, setDragSuccess] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [dbCategories, setDbCategories] = useState<
    { id: string; name: string; icon: string; description: string }[]
  >([]);
  const [imageResetKey, setImageResetKey] = useState(0);
  const [catForm, setCatForm] = useState(EMPTY_CAT);
  const [catEditId, setCatEditId] = useState<string | null>(null);
  const [isAddingCat, setIsAddingCat] = useState(false);

  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isIssueMonthOpen, setIsIssueMonthOpen] = useState(false);
  const [isIssueYearOpen, setIsIssueYearOpen] = useState(false);
  const [isExpiryMonthOpen, setIsExpiryMonthOpen] = useState(false);
  const [isExpiryYearOpen, setIsExpiryYearOpen] = useState(false);

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    fetchItems();
    fetchCategories();
    const handleClickOutside = (event: MouseEvent) => {
      // Jika klik terjadi DI LUAR elemen yang diref (filterRef), maka tutup dropdown
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("cert_categories")
      .select("id, name, icon, description")
      .order("order", { ascending: true });
    if (data) setDbCategories(data);
  };

  const fetchItems = async () => {
    const { data } = await supabase
      .from("certifications")
      .select("*")
      // ✅ FIX 1: Tambah secondary sort by id agar urutan konsisten
      // saat dua item punya nilai order yang sama
      .order("order", { ascending: true })
      .order("created_at", { ascending: true });

    if (data) {
      // Sort berdasarkan issue_year DESC, lalu issue_month DESC
      // sehingga sertifikat terbaru muncul di atas
      const sorted = [...data].sort((a, b) => {
        const va = toSortValue(a.issue_year, a.issue_month);
        const vb = toSortValue(b.issue_year, b.issue_month);
        return vb - va; // DESC: terbaru di atas
      });
      setItems(sorted);
    }
  };

  const handleSaveCategory = async () => {
    if (!catForm.name.trim()) return alert("Nama kategori wajib diisi!");
    setIsAddingCat(true);
    try {
      const name_id = await translateToIndonesian(catForm.name);
      const description_id = await translateToIndonesian(catForm.description);

      if (catEditId) {
        // Mode edit: UPDATE
        await supabase
          .from("cert_categories")
          .update({
            name: catForm.name,
            name_id,
            icon: catForm.icon,
            description: catForm.description,
            description_id,
          })
          .eq("id", catEditId);
      } else {
        // Mode tambah: INSERT
        const maxOrder =
          dbCategories.length > 0
            ? Math.max(...dbCategories.map((_, i) => i)) + 1
            : 1;
        await supabase.from("cert_categories").insert({
          name: catForm.name,
          name_id,
          icon: catForm.icon,
          description: catForm.description,
          description_id,
          order: maxOrder,
        });
      }

      setCatForm(EMPTY_CAT);
      setCatEditId(null);
      setIsIconDropdownOpen(false);
      fetchCategories();
    } finally {
      setIsAddingCat(false);
    }
  };

  const handleEditCategory = (cat: {
    id: string;
    name: string;
    icon: string;
    description: string;
  }) => {
    setCatEditId(cat.id);
    setCatForm({
      name: cat.name,
      icon: cat.icon,
      description: cat.description || "",
    }); // ← ambil description dari DB
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteCategory = async (id: string) => {
    if (
      confirm(
        "Hapus kategori ini? Semua sertifikat di dalamnya akan ikut terhapus!",
      )
    ) {
      await supabase.from("cert_categories").delete().eq("id", id);
      fetchCategories();
      fetchItems();
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.category_id) {
      alert("Judul dan kategori wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const title_id = form.title_id.trim()
        ? form.title_id
        : await translateToIndonesian(form.title);

      const dataToSave = { ...form, title_id };

      if (editId) {
        await supabase
          .from("certifications")
          .update(dataToSave)
          .eq("id", editId);
      } else {
        const maxOrder =
          items.length > 0 ? Math.max(...items.map((i) => i.order)) + 1 : 1;
        await supabase
          .from("certifications")
          .insert({ ...dataToSave, order: maxOrder });
      }

      resetForm();
      fetchItems();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setImageResetKey((prev) => prev + 1);
  };

  const handleEdit = (item: CertificationItem) => {
    setForm(item);
    setEditId(item.id!);
    setImageResetKey((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus sertifikat ini secara permanen?")) {
      await supabase.from("certifications").delete().eq("id", id);
      fetchItems();
    }
  };

  // ── Drag & Drop ──
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceList = filteredItems;
    const oldIndex = sourceList.findIndex((i) => i.id === active.id);
    const newIndex = sourceList.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(sourceList, oldIndex, newIndex);

    setPendingOrder(reordered);

    // Update tampilan lokal dengan urutan baru
    setItems((prev) => {
      const otherItems = prev.filter(
        (i) => !reordered.some((r) => r.id === i.id),
      );
      return [...otherItems, ...reordered].sort((a, b) => {
        const aIdx = reordered.findIndex((r) => r.id === a.id);
        const bIdx = reordered.findIndex((r) => r.id === b.id);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        return 0;
      });
    });
  };

  const handleConfirmOrder = async () => {
    await Promise.all(
      pendingOrder.map((item, index) =>
        supabase
          .from("certifications")
          .update({ order: index + 1 })
          .eq("id", item.id!),
      ),
    );
    setPendingOrder([]);
    setShowConfirm(false);
    setIsReordering(false);
    setDragSuccess(true);
    await fetchItems();
    setTimeout(() => setDragSuccess(false), 3000);
  };

  const handleDiscardOrder = () => {
    fetchItems();
    setPendingOrder([]);
    setIsReordering(false);
  };

  const filteredItems =
    filterCategory === "all"
      ? items
      : items.filter((i) => i.category_id === filterCategory);

  const iconEmoji: Record<string, string> = {
    Trophy: "🏆",
    Medal: "🎖️",
    Users: "👥",
    FileBadge: "📋",
    Award: "🏅",
    Star: "⭐",
    Zap: "⚡",
  };

  const categoryOptions = dbCategories.map((cat) => ({
    value: cat.id,
    label: `${iconEmoji[cat.icon] || "📄"} ${cat.name}`,
  }));

  // Bulan untuk dropdown
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  // Tahun dari 2015 sampai tahun sekarang + 5
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2014 + 5 }, (_, i) =>
    String(2015 + i),
  );

  return (
    <div className="space-y-10">
      {/* ── Kelola Kategori ── */}
      <AdminCard title="Manage Categories" icon={Award}>
        <p className="text-slate-400 text-sm mt-[-15px] mb-10">
          Add or delete a certificate category. Deleting a category will remove
          all certificates within it.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              {catEditId ? "Edit Category Name (EN)" : "New Category Name (EN)"}
            </label>
            <AdminInput
              placeholder="Certificate of Appreciation..."
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
            />
          </div>
          <div className="relative">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Icon
            </label>
            <button
              type="button"
              onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-left flex items-center justify-between hover:border-blue-500/50 transition-all"
            >
              <span
                className={catForm.icon ? "text-slate-200" : "text-slate-500"}
              >
                {catForm.icon || "Select Icon"}
              </span>

              <ChevronDown
                size={18}
                className={`text-slate-400 transition-transform duration-300 ${isIconDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {isIconDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-20 mt-2 w-full bg-[#050a18] border border-blue-500/50 rounded-2xl py-2 shadow-2xl overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-0.5">
                    {[
                      "🏆 Trophy",
                      "🎖️ Medal",
                      "🏅 Award",
                      "📋 FileBadge",
                      "👥 Users",
                      "⭐ Star",
                      "⚡ Zap",
                    ].map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => {
                          setCatForm({ ...catForm, icon: icon });
                          setIsIconDropdownOpen(false);
                        }}
                        className={`w-full text-left px-5 py-2.5 transition-all flex items-center gap-3 ${
                          catForm.icon === icon
                            ? "bg-blue-500/20 text-blue-400"
                            : "text-slate-300 hover:bg-white/5"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="col-span-full">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Description (EN)
            </label>
            <AdminInput
              placeholder="Awards and recognitions for..."
              value={catForm.description}
              onChange={(e) =>
                setCatForm({ ...catForm, description: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          <AdminBtn onClick={handleSaveCategory} disabled={isAddingCat}>
            {isAddingCat ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : catEditId ? (
              <Check size={16} />
            ) : (
              <Plus size={16} />
            )}
            {catEditId ? "Save Changes" : "Add Category"}
          </AdminBtn>
          {catEditId && (
            <AdminBtn
              variant="secondary"
              onClick={() => {
                setCatEditId(null);
                setCatForm(EMPTY_CAT);
              }}
            >
              <X size={16} /> Cancel
            </AdminBtn>
          )}
        </div>

        {/* List kategori */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {dbCategories.map((cat, i) => (
            <div
              key={cat.id}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                catEditId === cat.id
                  ? "bg-blue-500/10 border-blue-500/30"
                  : "bg-white/5 border-white/5 hover:border-white/15"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{iconEmoji[cat.icon] || "📄"}</span>
                <div>
                  <p className="text-white text-sm font-bold leading-tight">
                    {cat.name}
                  </p>
                  <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mt-0.5">
                    {items.filter((i) => i.category_id === cat.id).length}{" "}
                    certificates
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleEditCategory(cat)}
                  className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                  title="Edit category"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-2 rounded-xl bg-red-500/5 text-red-900 hover:text-red-400 hover:bg-red-500/15 transition-all"
                  title="Delete category"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>
      {/* Modern Category Dropdown */}
      <AdminCard title="Add / Edit Certificate" icon={Plus}>
        <div className="space-y-6">
          <div className="relative">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Certificate Category
            </label>
            <button
              type="button"
              onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-left flex items-center justify-between hover:border-blue-500/50 transition-all"
            >
              <span
                className={
                  form.category_id ? "text-slate-200" : "text-slate-500"
                }
              >
                {categoryOptions.find((opt) => opt.value === form.category_id)
                  ?.label || "Select Category"}
              </span>

              <ChevronDown
                size={18}
                className={`text-slate-400 transition-transform duration-300 ${isCatDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {isCatDropdownOpen && (
                <motion.div
                  initial={{ opacity: 1, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 mt-2 w-full bg-[#050a18] border border-blue-500/50 rounded-2xl py-2"
                >
                  {categoryOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setForm({ ...form, category_id: opt.value });
                        setIsCatDropdownOpen(false);
                      }}
                      className="w-full text-left px-5 py-2 text-slate-300 hover:bg-blue-500/10 transition-all"
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Baris 2: Judul EN & ID ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div>
              <div className="min-h-[32px] flex items-end mb-2 px-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                  Certificate Title (EN)
                </label>
              </div>
              <AdminInput
                placeholder="Google AI Professional Certificate..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <div className="min-h-[32px] flex items-end mb-2 px-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 leading-tight">
                  Certificate Title (ID){" "}
                  <span className="text-slate-500 normal-case tracking-normal font-medium text-[9px]">
                    — Leave blank for auto-translate
                  </span>
                </label>
              </div>
              <AdminInput
                placeholder="Sertifikat Profesional Google AI..."
                value={form.title_id}
                onChange={(e) => setForm({ ...form, title_id: e.target.value })}
              />
            </div>
          </div>

          {/* ── Baris 3: Issuing Organization (full width) ── */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Issuing Organization
            </label>
            <AdminInput
              placeholder="Google, Dicoding, Coursera, DQLab..."
              value={form.issuer}
              onChange={(e) => setForm({ ...form, issuer: e.target.value })}
            />
          </div>

          {/* ── Baris 4: Issue Date & Expiration Date ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {/* ISSUE DATE */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
                Issue Date
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Month Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsIssueMonthOpen(!isIssueMonthOpen)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-left flex items-center justify-between hover:border-blue-500/50 transition-all"
                  >
                    <span
                      className={
                        form.issue_month ? "text-slate-200" : "text-slate-500"
                      }
                    >
                      {form.issue_month || "Month"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform ${isIssueMonthOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {isIssueMonthOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-20 mt-2 w-full bg-[#050a18] border border-blue-500/50 rounded-2xl py-2 max-h-60 overflow-y-auto"
                      >
                        {months.map((m) => (
                          <button
                            key={m}
                            onClick={() => {
                              setForm({ ...form, issue_month: m });
                              setIsIssueMonthOpen(false);
                            }}
                            className="w-full text-left px-5 py-2 text-slate-300 hover:bg-blue-500/10 transition-all"
                          >
                            {m}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Year Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsIssueYearOpen(!isIssueYearOpen)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-left flex items-center justify-between hover:border-blue-500/50 transition-all"
                  >
                    <span
                      className={
                        form.issue_year ? "text-slate-200" : "text-slate-500"
                      }
                    >
                      {form.issue_year || "Year"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform ${isIssueYearOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {isIssueYearOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-20 mt-2 w-full bg-[#050a18] border border-blue-500/50 rounded-2xl py-2 max-h-60 overflow-y-auto shadow-2xl"
                      >
                        {years.map((y) => (
                          <button
                            key={y}
                            onClick={() => {
                              setForm({ ...form, issue_year: y });
                              setIsIssueYearOpen(false);
                            }}
                            className="w-full text-left px-5 py-2 text-slate-300 hover:bg-blue-500/10 transition-all"
                          >
                            {y}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* EXPIRATION DATE */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
                Expiration Date{" "}
                <span className="text-slate-500 normal-case tracking-normal font-medium text-[9px]">
                  {" "}
                  — Leave blank if none
                </span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Expiry Month */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsExpiryMonthOpen(!isExpiryMonthOpen)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-left flex items-center justify-between hover:border-blue-500/50 transition-all"
                  >
                    <span
                      className={
                        form.expiry_month ? "text-slate-200" : "text-slate-500"
                      }
                    >
                      {form.expiry_month || "Month"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform ${isExpiryMonthOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {isExpiryMonthOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-20 mt-2 w-full bg-[#050a18] border border-blue-500/50 rounded-2xl py-2 max-h-60 overflow-y-auto"
                      >
                        <button
                          onClick={() => {
                            setForm({ ...form, expiry_month: "" });
                            setIsExpiryMonthOpen(false);
                          }}
                          className="w-full text-left px-5 py-2 text-slate-500 hover:bg-white/5 italic"
                        >
                          None
                        </button>
                        {months.map((m) => (
                          <button
                            key={m}
                            onClick={() => {
                              setForm({ ...form, expiry_month: m });
                              setIsExpiryMonthOpen(false);
                            }}
                            className="w-full text-left px-5 py-2 text-slate-300 hover:bg-blue-500/10 transition-all"
                          >
                            {m}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Expiry Year */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsExpiryYearOpen(!isExpiryYearOpen)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-left flex items-center justify-between hover:border-blue-500/50 transition-all"
                  >
                    <span
                      className={
                        form.expiry_year ? "text-slate-200" : "text-slate-500"
                      }
                    >
                      {form.expiry_year || "Year"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform ${isExpiryYearOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {isExpiryYearOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-20 mt-2 w-full bg-[#050a18] border border-blue-500/50 rounded-2xl py-2 max-h-60 overflow-y-auto"
                      >
                        <button
                          onClick={() => {
                            setForm({ ...form, expiry_year: "" });
                            setIsExpiryYearOpen(false);
                          }}
                          className="w-full text-left px-5 py-2 text-slate-500 hover:bg-white/5 italic"
                        >
                          None
                        </button>
                        {years.map((y) => (
                          <button
                            key={y}
                            onClick={() => {
                              setForm({ ...form, expiry_year: y });
                              setIsExpiryYearOpen(false);
                            }}
                            className="w-full text-left px-5 py-2 text-slate-300 hover:bg-blue-500/10 transition-all"
                          >
                            {y}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* ── Baris 5: Credential ID & Credential URL ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
                Credential ID
              </label>
              <AdminInput
                placeholder="ABCD-1234-EFGH-5678"
                value={form.credential_id}
                onChange={(e) =>
                  setForm({ ...form, credential_id: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
                Credential URL
              </label>
              <AdminInput
                placeholder="https://www.credly.com/badges/..."
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
              />
            </div>
          </div>

          {/* ── Baris 6: Upload Gambar ── */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Certificate Image
            </label>
            <ImageUpload
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              label="Upload Certificate Image"
              resetKey={imageResetKey}
            />
          </div>
        </div>

        {/* Tombol Simpan & Batal */}
        <div className="flex gap-4 mt-6">
          <AdminBtn onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : editId ? (
              <Check size={18} />
            ) : (
              <Plus size={18} />
            )}
            {editId ? "Save Changes" : "Add Certificate"}
          </AdminBtn>
          {editId && (
            <AdminBtn variant="secondary" onClick={resetForm}>
              <X size={18} /> Cancel
            </AdminBtn>
          )}
        </div>
      </AdminCard>

      {/* ── Filter & Reorder Controls ── */}
      <div className="relative z-40 flex items-center justify-between bg-slate-900/40 p-4 rounded-3xl border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">
            Certificates ({filteredItems.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* DROPDOWN FILTER */}
          <div className="relative z-50" ref={filterRef}>
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className={`p-2.5 rounded-xl border transition-all ${
                filterCategory !== "all"
                  ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              <ListFilter size={20} />
              {filterCategory !== "all" && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#050a18]"></span>
              )}
            </button>

            <AnimatePresence>
              {isFilterDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 z-20 mt-2 w-64 bg-[#050a18] border border-blue-500/50 rounded-2xl py-2 shadow-2xl overflow-hidden"
                >
                  {/* Opsi All Categories */}
                  <button
                    onClick={() => {
                      setFilterCategory("all");
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3 transition-all flex items-center justify-between ${
                      filterCategory === "all"
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider">All Categories</span>
                    {filterCategory === "all" && <Check size={14} />}
                  </button>

                  <div className="h-[1px] bg-white/5 my-1" /> {/* Garis pemisah halus */}

                  {/* List Kategori dari DB */}
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {dbCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setFilterCategory(cat.id);
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-5 py-3 transition-all flex items-center gap-3 ${
                          filterCategory === cat.id
                            ? "bg-blue-500/20 text-blue-400 font-bold"
                            : "text-slate-300 hover:bg-white/10" 
                        }`}
                      >
                        <span className="text-lg">{iconEmoji[cat.icon] || "📄"}</span>
                        <span className="text-sm truncate pr-2">{cat.name}</span>
                        
                        {filterCategory === cat.id && (
                          <div className="ml-auto">
                            <Check size={14} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* TOMBOL REORDER */}
          {isReordering ? (
            <div className="flex gap-2">
              <AdminBtn onClick={() => setShowConfirm(true)} size="normal">
                <Check size={16} /> Save
              </AdminBtn>
              <AdminBtn
                variant="secondary"
                onClick={() => {
                  fetchItems();
                  setIsReordering(false);
                }}
                size="normal"
              >
                <X size={16} />
              </AdminBtn>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsReordering(true)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
            >
              <GripVertical size={20} />
            </button>
          )}
        </div>
      </div>

      {/* ── Daftar Sertifikat ── */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
          <Award className="mx-auto text-slate-700 mb-4" size={48} />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
            No certificates in this category yet.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={isReordering ? handleDragEnd : () => {}}
        >
          <SortableContext
            items={filteredItems.map((i) => i.id!)}
            strategy={rectSortingStrategy}
          >
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const catIndex = dbCategories.findIndex(
                  (c) => c.id === item.category_id,
                );
                const colorPalette = [
                  "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
                  "text-blue-400 bg-blue-500/10 border-blue-500/20",
                  "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                  "text-purple-400 bg-purple-500/10 border-purple-500/20",
                  "text-pink-400 bg-pink-500/10 border-pink-500/20",
                  "text-orange-400 bg-orange-500/10 border-orange-500/20",
                ];
                return (
                  <SortableCertCard
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isDraggable={isReordering}
                    categoryName={
                      dbCategories.find((c) => c.id === item.category_id)?.name
                    }
                    categoryColor={colorPalette[catIndex % colorPalette.length]}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* ── Popup Konfirmasi ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-[999] flex items-end justify-center pb-12 px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl max-w-md w-full">
            <h3 className="text-white font-black text-lg uppercase tracking-tight mb-2">
              Save New Order?
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              The certificate order will be updated and immediately reflected on
              the portfolio page.
            </p>
            <div className="flex gap-3">
              <AdminBtn onClick={handleConfirmOrder}>
                <Check size={16} /> Yes, Save
              </AdminBtn>
              <AdminBtn
                variant="secondary"
                onClick={() => setShowConfirm(false)}
              >
                <X size={16} /> Cancel
              </AdminBtn>
            </div>
          </div>
        </div>
      )}

      {/* ── Notifikasi Sukses ── */}
      {dragSuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] bg-green-500/20 border border-green-500/40 text-green-400 px-8 py-4 rounded-2xl font-bold text-sm backdrop-blur-xl shadow-2xl flex items-center gap-3">
          <Check size={18} /> Order saved successfully!
        </div>
      )}
    </div>
  );
}

// ─── Experience Manager ───────────────────────────────
function SortableExperienceCard({ item, onEdit, onDelete, isDraggable = false }: {
  item: Experience,
  onEdit: (item: Experience) => void,
  onDelete: (id: string) => void
  isDraggable?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id! })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-8 bg-slate-900/40 border rounded-[2.5rem] relative group overflow-hidden transition-all duration-200 ${isDragging ? "border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.4)]" : "border-white/5"}`}
    >
      {isDraggable && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-4 left-4 p-2 rounded-xl bg-white/5 cursor-grab active:cursor-grabbing text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
          title="Drag to reorder"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="4" r="1.5" />
            <circle cx="11" cy="4" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="11" cy="12" r="1.5" />
          </svg>
        </div>
      )}

      <div className="absolute top-0 right-0 p-8 flex gap-2">
        <AdminBtn variant="secondary" onClick={() => onEdit(item)}>
          <Edit2 size={14} />
        </AdminBtn>
        <AdminBtn variant="danger" onClick={() => onDelete(item.id!)}>
          <Trash2 size={14} />
        </AdminBtn>
      </div>

      <div className="flex items-center gap-4 mb-4 pl-8">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${item.type === "work" ? "bg-blue-500/10 border-blue-500/20 text-blue-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"}`}
        >
          {item.type === "work" ? (
            <Briefcase size={24} />
          ) : (
            <Building2 size={24} />
          )}
        </div>
        <div>
          <h3 className="text-xl font-black text-white tracking-tighter uppercase leading-none mb-1">
            {item.role}
          </h3>
          <p className="text-slate-400 text-sm font-bold tracking-tight uppercase">
            {item.company}
          </p>
        </div>
      </div>

      <div className="space-y-2 pl-8">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-widest ${item.type === "work" ? "bg-blue-600/20 text-blue-400" : "bg-emerald-600/20 text-emerald-400"}`}
          >
            {item.type === "work" ? "Professional" : "Organizational"}
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-500">
            {item.start_date} — {item.end_date}
          </span>
        </div>
        {Array.isArray(item.details) && item.details.length > 0 && (
          <ul className="space-y-1 mt-2">
            {item.details.slice(0, 2).map((point: string, i: number) => (
              <li
                key={i}
                className="text-slate-400 text-xs flex items-start gap-2"
              >
                <span className="text-blue-500 mt-0.5">•</span>
                <span className="line-clamp-1">{point}</span>
              </li>
            ))}
            {item.details.length > 2 && (
              <li className="text-slate-600 text-xs">
                +{item.details.length - 2} more...
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
function ExperienceManager() {
  const [isReordering, setIsReordering] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Experience[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dragSuccess, setDragSuccess] = useState(false);
  const [items, setItems] = useState<Experience[]>([])
  const [form, setForm] = useState<Experience>({company: '', role: '', type: 'work', start_date: '', end_date: '', location: '', logo_url: '', details: [], role_id: '', company_id: '', location_id: '', details_id: [] })
  const [editId, setEditId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
)

const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
  if (!over || active.id === over.id) return;
  const oldIndex = items.findIndex((i) => i.id === active.id);
  const newIndex = items.findIndex((i) => i.id === over.id);
  const newItems = arrayMove(items, oldIndex, newIndex);
  setPendingOrder(newItems);
  setItems(newItems);
};
const handleConfirmOrder = async () => {
  await Promise.all(
    pendingOrder.map((item, index) =>
      supabase
        .from("experience")
        .update({ order: index + 1 })
        .eq("id", item.id!),
    ),
  );
  setPendingOrder([]);
  setShowConfirm(false);
  setIsReordering(false);
  setDragSuccess(true);
  setTimeout(() => setDragSuccess(false), 3000);
};

const handleCancelOrder = () => setShowConfirm(false);

const handleDiscardOrder = () => {
  fetchItems();
  setPendingOrder([]);
  setIsReordering(false);
};

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    const { data } = await supabase
      .from("experience")
      .select("*")
      .order("order", { ascending: true });
    if (data) setItems(data)
  }

  const handleSave = async () => {
  setIsSubmitting(true)
  try {
    const [role_id, company_id, details_id] = await Promise.all([
      translateToIndonesian(form.role),
      translateToIndonesian(form.company),
      translateArrayToIndonesian(form.details),
    ])

    const dataToSave = { ...form, role_id, company_id, details_id }

    if (editId) {
      await supabase.from('experience').update(dataToSave).eq('id', editId)
    } else {
      await supabase.from('experience').insert(dataToSave)
    }
    setForm({
      company: '', role: '', type: 'work',
      start_date: '', end_date: '', location: '', logo_url: '', details: [],
      role_id: '', company_id: '', location_id: '', details_id: []
    })
    setEditId(null)
    fetchItems()
  } finally {
    setIsSubmitting(false)
  }
}

  const handleEdit = (item: Experience) => { setForm(item); setEditId(item.id!) }
  const handleDelete = async (id: string) => {
    if (confirm('Delete this experience entry?')) {
      await supabase.from('experience').delete().eq('id', id)
      fetchItems()
    }
  }

  return (
    <div className="space-y-10">
      <AdminCard title="Operational Timeline" icon={Briefcase}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div className="col-span-full md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Company / Organization
            </label>
            <AdminInput
              placeholder="Entity name..."
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>
          <div className="col-span-full md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Role / Position
            </label>
            <AdminInput
              placeholder="System Architect..."
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
          </div>
          <div className="col-span-full md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Type
            </label>
            <AdminSelect
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as "work" | "org" })
              }
            >
              <option value="work">💼 Professional Experience</option>
              <option value="org">🏫 Organizational Record</option>
            </AdminSelect>
          </div>
          <div className="col-span-full md:col-span-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
                  Start
                </label>
                <AdminInput
                  placeholder="Jan 2023"
                  value={form.start_date}
                  onChange={(e) =>
                    setForm({ ...form, start_date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
                  End
                </label>
                <AdminInput
                  placeholder="Present"
                  value={form.end_date}
                  onChange={(e) =>
                    setForm({ ...form, end_date: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <div className="col-span-full md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Location
            </label>
            <AdminInput
              placeholder="Bogor City, ID"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>

          <div className="col-span-full md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Logo
            </label>
            <ImageUpload
              value={form.logo_url}
              onChange={(url) => setForm({ ...form, logo_url: url })}
              label="Upload Logo"
            />
          </div>

          <div className="col-span-full">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Detail Points (satu baris = satu poin)
            </label>
            <textarea
              placeholder={
                "Managed tax calculations\nProcessed invoices\nFiled reports"
              }
              value={form.details.join("\n")}
              onChange={(e) =>
                setForm({
                  ...form,
                  details: e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter((s) => s !== ""),
                })
              }
              rows={6}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 resize-none"
            />
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <AdminBtn onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : null}
            {editId ? "Commit Changes" : "Initialize Timeline"}
          </AdminBtn>
          {editId && (
            <AdminBtn
              variant="secondary"
              onClick={() => {
                setEditId(null);
                setForm({
                  company: "",
                  role: "",
                  type: "work",
                  start_date: "",
                  end_date: "",
                  location: "",
                  logo_url: "",
                  details: [],
                  role_id: "",
                  company_id: "",
                  location_id: "",
                  details_id: [],
                });
              }}
            >
              Cancel
            </AdminBtn>
          )}
        </div>
      </AdminCard>

      <div className="flex items-center justify-between">
        <h3 className="text-white font-black uppercase tracking-widest text-sm">
          {items.length} Experiences
        </h3>
        <div className="flex gap-3">
          {isReordering ? (
            <>
              {pendingOrder.length > 0 && (
                <AdminBtn onClick={() => setShowConfirm(true)}>
                  <Check size={16} /> Simpan Urutan
                </AdminBtn>
              )}
              <AdminBtn variant="secondary" onClick={handleDiscardOrder}>
                <X size={16} /> Batal
              </AdminBtn>
            </>
          ) : (
            <AdminBtn variant="secondary" onClick={() => setIsReordering(true)}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <circle cx="5" cy="4" r="1.5" />
                <circle cx="11" cy="4" r="1.5" />
                <circle cx="5" cy="8" r="1.5" />
                <circle cx="11" cy="8" r="1.5" />
                <circle cx="5" cy="12" r="1.5" />
                <circle cx="11" cy="12" r="1.5" />
              </svg>
              Edit Urutan
            </AdminBtn>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={isReordering ? handleDragEnd : () => {}}
      >
        <SortableContext
          items={items.map((i) => i.id!)}
          strategy={rectSortingStrategy}
        >
          <div className="space-y-6">
            {items.map((item) => (
              <SortableExperienceCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDraggable={isReordering}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {/* Popup Konfirmasi */}
      {showConfirm && (
        <div className="fixed inset-0 z-[999] flex items-end justify-center pb-12 px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl max-w-md w-full">
            <h3 className="text-white font-black text-lg uppercase tracking-tight mb-2">
              Simpan Urutan Baru?
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Urutan experience akan diperbarui dan langsung terlihat di halaman
              portfolio.
            </p>
            <div className="flex gap-3">
              <AdminBtn onClick={handleConfirmOrder}>
                <Check size={16} /> Ya, Simpan
              </AdminBtn>
              <AdminBtn variant="secondary" onClick={handleCancelOrder}>
                <X size={16} /> Batal
              </AdminBtn>
            </div>
          </div>
        </div>
      )}

      {/* Notifikasi Sukses */}
      {dragSuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] bg-green-500/20 border border-green-500/40 text-green-400 px-8 py-4 rounded-2xl font-bold text-sm backdrop-blur-xl shadow-2xl flex items-center gap-3">
          <Check size={18} /> Urutan berhasil disimpan!
        </div>
      )}
    </div>
  );
}

// ─── Skills Manager ───────────────────────────────────
function SkillsManager() {
  const [items, setItems] = useState<Skill[]>([])
  const [form, setForm] = useState<Skill>({ name: '', category: '' })
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    const { data } = await supabase.from('skills').select('*').order('category')
    if (data) setItems(data)
  }

  const handleSave = async () => {
    if (editId) {
      await supabase.from('skills').update(form).eq('id', editId)
    } else {
      await supabase.from('skills').insert(form)
    }
    setForm({ name: '', category: '' })
    setEditId(null)
    fetchItems()
  }

  const handleEdit = (item: Skill) => { setForm(item); setEditId(item.id!) }
  const handleDelete = async (id: string) => {
    if (confirm('Delete this skill?')) {
      await supabase.from('skills').delete().eq('id', id)
      fetchItems()
    }
  }

  return (
    <div className="space-y-10">
      <AdminCard title="Technical Upgrade" icon={Zap}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div className="col-span-full md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">Skill Name</label>
            <AdminInput placeholder="React, Node.js, Cloud Integration..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="col-span-full md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">Category (Group)</label>
            <AdminInput placeholder="Frontend, Backend, Infrastructure..." value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          </div>
        </div>
        <AdminBtn onClick={handleSave}>{editId ? 'Verify System Patch' : 'Install Component'}</AdminBtn>
        {editId && <div className="mt-2"><AdminBtn variant="secondary" onClick={() => { setEditId(null); setForm({ name: '', category: '' }) }}>Cancel</AdminBtn></div>}
      </AdminCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-blue-500/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Tag size={18} className="text-blue-500" />
              </div>
              <div className="overflow-hidden">
                <h3 className="text-sm font-black text-white uppercase tracking-tight truncate">{item.name}</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">{item.category}</p>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(item)} className="text-slate-500 hover:text-white transition-colors"><Edit2 size={16} /></button>
              <button onClick={() => handleDelete(item.id!)} className="text-red-900 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
