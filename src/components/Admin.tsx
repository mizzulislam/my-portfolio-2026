import { useEffect, useState } from 'react'
import React from 'react'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'motion/react'
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
  Tag
} from 'lucide-react'

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
  id?: string
  name: string
  email: string
  message: string
  is_read: boolean
  created_at: string
}

interface Certification {
  id?: string
  title: string
  issuer: string
  date: string
  credential_url: string
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
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value);
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
      className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden p-6 md:p-8 shadow-2xl relative group"
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

function AdminBtn({ children, variant = 'primary', ...props }: { children: React.ReactNode, variant?: 'primary' | 'secondary' | 'danger', onClick?: () => void, disabled?: boolean, type?: 'button' | 'submit' }) {
  const styles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]",
    secondary: "bg-slate-800/80 border border-white/10 text-slate-300 hover:bg-slate-700",
    danger: "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
  }
  return (
    <button 
      {...props} 
      className={`px-6 py-3 rounded-2xl font-bold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]}`}
    >
      {children}
    </button>
  )
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
    { key: 'certifications', label: 'Certs', icon: Award },
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
function MessagesManager() {
  const [items, setItems] = useState<Message[]>([])

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
    if (data) setItems(data)
  }

  const markRead = async (id: string) => {
    await supabase.from('messages').update({ is_read: true }).eq('id', id)
    fetchItems()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this message permanently?')) {
      await supabase.from('messages').delete().eq('id', id)
      fetchItems()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Inbound Transmission</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
          <MessageSquare className="mx-auto text-slate-700 mb-4" size={48} />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Silence in the comms channel.</p>
        </div>
      )}

      {items.map(item => (
        <motion.div 
          key={item.id}
          layout
          className={`p-6 md:p-8 rounded-[2rem] border transition-all duration-500 shadow-xl relative overflow-hidden ${
            item.is_read 
              ? 'bg-slate-900/40 border-white/5 opacity-80' 
              : 'bg-slate-900 border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]'
          }`}
        >
          {!item.is_read && <div className="absolute top-0 right-0 p-3"><div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)] animate-pulse" /></div>}
          
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight leading-none mb-1">{item.name}</h3>
              <p className="text-blue-500 text-xs font-mono font-bold tracking-tight">{item.email}</p>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <Calendar size={12} />
              {new Date(item.created_at).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-slate-200 text-sm leading-relaxed mb-6 font-medium italic">
            "{item.message}"
          </div>

          <div className="flex gap-3">
            {!item.is_read && <AdminBtn variant="primary" onClick={() => markRead(item.id!)}><Check size={14} /> Mark as Read</AdminBtn>}
            <AdminBtn variant="danger" onClick={() => handleDelete(item.id!)}><Trash2 size={14} /> Purge</AdminBtn>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Certifications Manager ───────────────────────────
function CertificationsManager() {
  const [items, setItems] = useState<Certification[]>([])
  const [form, setForm] = useState<Certification>({ title: '', issuer: '', date: '', credential_url: '' })
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    const { data } = await supabase.from('certifications').select('*').order('created_at', { ascending: false })
    if (data) setItems(data)
  }

  const handleSave = async () => {
    if (editId) {
      await supabase.from('certifications').update(form).eq('id', editId)
    } else {
      await supabase.from('certifications').insert(form)
    }
    setForm({ title: '', issuer: '', date: '', credential_url: '' })
    setEditId(null)
    fetchItems()
  }

  const handleEdit = (item: Certification) => { setForm(item); setEditId(item.id!) }
  const handleDelete = async (id: string) => {
    if (confirm('Delete this certification?')) {
      await supabase.from('certifications').delete().eq('id', id)
      fetchItems()
    }
  }

  return (
    <div className="space-y-10">
      <AdminCard title="Protocol Achievement" icon={Award}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div className="col-span-full">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">Certification Title</label>
            <AdminInput placeholder="AWS Certified..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="col-span-full md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">Issuing Authority</label>
            <AdminInput placeholder="Amazon Web Services..." value={form.issuer} onChange={e => setForm({ ...form, issuer: e.target.value })} />
          </div>
          <div className="col-span-full md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">Issuance Date</label>
            <AdminInput placeholder="Jan 2024" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="col-span-full">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">Credential URL</label>
            <AdminInput placeholder="https://..." value={form.credential_url} onChange={e => setForm({ ...form, credential_url: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <AdminBtn onClick={handleSave}>{editId ? 'Verify Update' : 'Authorize Entry'}</AdminBtn>
          {editId && (
            <AdminBtn variant="secondary" onClick={() => { setEditId(null); setForm({ title: '', issuer: '', date: '', credential_url: '' }) }}>
              Cancel
            </AdminBtn>
          )}
        </div>
      </AdminCard>

      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="p-6 md:px-8 bg-slate-900/40 border border-white/5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-500/20 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                <Award className="text-blue-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight uppercase leading-snug">{item.title}</h3>
                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">{item.issuer}</p>
                <p className="text-slate-500 text-xs font-mono mt-1">{item.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {item.credential_url && (
                <a href={item.credential_url} target="_blank" rel="noreferrer" className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:text-white transition-all">
                  <ExternalLink size={18} />
                </a>
              )}
              <AdminBtn variant="secondary" onClick={() => handleEdit(item)}><Edit2 size={14} /></AdminBtn>
              <AdminBtn variant="danger" onClick={() => handleDelete(item.id!)}><Trash2 size={14} /></AdminBtn>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
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
      className={`p-8 bg-slate-900/40 border rounded-[2.5rem] relative group overflow-hidden transition-all duration-200 ${isDragging ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.4)]' : 'border-white/5'}`}
    >
      {isDraggable && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-4 left-4 p-2 rounded-xl bg-white/5 cursor-grab active:cursor-grabbing text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
          title="Geser untuk mengubah urutan"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="4" r="1.5"/><circle cx="11" cy="4" r="1.5"/>
            <circle cx="5" cy="8" r="1.5"/><circle cx="11" cy="8" r="1.5"/>
            <circle cx="5" cy="12" r="1.5"/><circle cx="11" cy="12" r="1.5"/>
          </svg>
        </div>
      )}

      <div className="absolute top-0 right-0 p-8 flex gap-2">
        <AdminBtn variant="secondary" onClick={() => onEdit(item)}><Edit2 size={14} /></AdminBtn>
        <AdminBtn variant="danger" onClick={() => onDelete(item.id!)}><Trash2 size={14} /></AdminBtn>
      </div>

      <div className="flex items-center gap-4 mb-4 pl-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${item.type === 'work' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
          {item.type === 'work' ? <Briefcase size={24} /> : <Building2 size={24} />}
        </div>
        <div>
          <h3 className="text-xl font-black text-white tracking-tighter uppercase leading-none mb-1">{item.role}</h3>
          <p className="text-slate-400 text-sm font-bold tracking-tight uppercase">{item.company}</p>
        </div>
      </div>

      <div className="space-y-2 pl-8">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-widest ${item.type === 'work' ? 'bg-blue-600/20 text-blue-400' : 'bg-emerald-600/20 text-emerald-400'}`}>
            {item.type === 'work' ? 'Professional' : 'Organizational'}
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-500">{item.start_date} — {item.end_date}</span>
        </div>
        {Array.isArray(item.details) && item.details.length > 0 && (
          <ul className="space-y-1 mt-2">
            {item.details.slice(0, 2).map((point: string, i: number) => (
              <li key={i} className="text-slate-400 text-xs flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span className="line-clamp-1">{point}</span>
              </li>
            ))}
            {item.details.length > 2 && (
              <li className="text-slate-600 text-xs">+{item.details.length - 2} more...</li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
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
