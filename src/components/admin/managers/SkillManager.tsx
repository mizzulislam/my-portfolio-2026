import { useState, useEffect } from "react";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { translateToIndonesian } from "@/src/lib/translate";
import { toast } from "react-hot-toast";
import { skillsApi } from "@/src/lib/api/skills";
import { useSkills } from "@/src/hooks/useSkills";
import {
  Plus, Trash2, Edit2, Check, X, Zap, Tag, Brain, Users,
  MessageSquare, Search, Lightbulb, Clock, ShieldCheck,
} from "lucide-react";
import {
  AdminCard, AdminInput,
  AdminBtn, AdminTextArea, ImageUpload, AdminConfirmModal,
} from "../AdminSharedUI";
import type { SoftSkillDB, HardSkillDB, TechnicalSkillDB } from "@/src/types/skill";

// ─── Tab Type ─────────────────────────────────────────
type SkillTab = "soft" | "hard" | "technical";

// ─── Soft Skills Manager ──────────────────────────────
function SoftSkillsManager() {
  const { softSkills, setSoftSkills, fetchAllSkills } = useSkills();
  const [form, setForm] = useState({ name: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Nama skill wajib diisi!");
    setIsSubmitting(true);
    try {
      const name_id = await translateToIndonesian(form.name);
      if (editId) {
        await skillsApi.update("soft_skills", editId, { name: form.name, name_id });
        toast.success("Soft skill berhasil diperbarui");
      } else {
        const maxOrder =
          softSkills.length > 0
            ? Math.max(...softSkills.map((i) => i.order ?? 0)) + 1
            : 1;
        await skillsApi.create("soft_skills", { name: form.name, name_id, order: maxOrder });
        toast.success("Soft skill berhasil ditambahkan");
      }
      setForm({ name: "" });
      setEditId(null);
      fetchAllSkills();
    } catch (err) {
      toast.error("Gagal menyimpan soft skill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: SoftSkillDB) => {
    setForm({ name: item.name });
    setEditId(item.id!);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Soft Skill?",
      message: "Apakah Anda yakin ingin menghapus soft skill ini?",
      onConfirm: async () => {
        try {
          await skillsApi.delete("soft_skills", id);
          toast.success("Skill berhasil dihapus");
          fetchAllSkills();
        } catch (err) {
          toast.error("Gagal menghapus skill");
        }
        setConfirmModal(null);
      },
    });
  };

  const softIcons: Record<string, any> = {
    communicat: MessageSquare,
    komunikasi: MessageSquare,
    critical: Brain,
    "berpikir kritis": Brain,
    detail: Search,
    "berorientasi detail": Search,
    fast: Zap,
    "pembelajar cepat": Zap,
    problem: Lightbulb,
    "penyelesaian masalah": Lightbulb,
    team: Users,
    "kerja sama tim": Users,
    time: Clock,
    "manajemen waktu": Clock,
    ethic: ShieldCheck,
    "etika kerja": ShieldCheck,
  };

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    for (const [key, Icon] of Object.entries(softIcons)) {
      if (n.includes(key)) return Icon;
    }
    return Tag;
  };

  return (
    <div className="space-y-6">
      <AdminCard title="Add / Edit Soft Skill" icon={Brain}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div className="col-span-full">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Skill Name (EN)
            </label>
            <AdminInput
              placeholder="Communication, Critical Thinking..."
              value={form.name}
              onChange={(e) => setForm({ name: e.target.value })}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-2">
          <AdminBtn onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : editId ? (
              <Check size={16} />
            ) : (
              <Plus size={16} />
            )}
            {editId ? "Update Skill" : "Add Skill"}
          </AdminBtn>
          {editId && (
            <AdminBtn
              variant="secondary"
              onClick={() => {
                setEditId(null);
                setForm({ name: "" });
              }}
            >
              <X size={16} /> Cancel
            </AdminBtn>
          )}
        </div>
      </AdminCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {softSkills.map((item) => {
          const Icon = getIcon(item.name);
          return (
            <div
              key={item.id}
              className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-blue-500/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Icon size={16} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">{item.name}</p>
                  {item.name_id && (
                    <p className="text-[10px] text-slate-500">{item.name_id}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(item)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(item.id!)}
                  className="text-red-900 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <AdminConfirmModal
        isOpen={confirmModal?.isOpen || false}
        title={confirmModal?.title || ""}
        message={confirmModal?.message || ""}
        onConfirm={confirmModal?.onConfirm || (() => {})}
        onCancel={() => setConfirmModal(null)}
      />
    </div>
  );
}

// ─── Hard Skills Manager ──────────────────────────────
function HardSkillsManager() {
  const { hardSkills, setHardSkills, fetchAllSkills } = useSkills();
  const [form, setForm] = useState({ name: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Nama skill wajib diisi!");
    setIsSubmitting(true);
    try {
      const name_id = await translateToIndonesian(form.name);
      if (editId) {
        await skillsApi.update("hard_skills", editId, { name: form.name, name_id });
        toast.success("Hard skill berhasil diperbarui");
      } else {
        const maxOrder =
          hardSkills.length > 0
            ? Math.max(...hardSkills.map((i) => i.order ?? 0)) + 1
            : 1;
        await skillsApi.create("hard_skills", { name: form.name, name_id, order: maxOrder });
        toast.success("Hard skill berhasil ditambahkan");
      }
      setForm({ name: "" });
      setEditId(null);
      fetchAllSkills();
    } catch (err) {
      toast.error("Gagal menyimpan hard skill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: HardSkillDB) => {
    setForm({ name: item.name });
    setEditId(item.id!);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Hard Skill?",
      message: "Apakah Anda yakin ingin menghapus hard skill ini?",
      onConfirm: async () => {
        try {
          await skillsApi.delete("hard_skills", id);
          toast.success("Skill berhasil dihapus");
          fetchAllSkills();
        } catch (err) {
          toast.error("Gagal menghapus skill");
        }
        setConfirmModal(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <AdminCard title="Add / Edit Hard Skill" icon={Zap}>
        <div className="col-span-full">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
            Skill Name (EN)
          </label>
          <AdminInput
            placeholder="Tax Compliance, Financial Statement Analysis..."
            value={form.name}
            onChange={(e) => setForm({ name: e.target.value })}
          />
        </div>
        <div className="flex gap-3 mt-2">
          <AdminBtn onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : editId ? (
              <Check size={16} />
            ) : (
              <Plus size={16} />
            )}
            {editId ? "Update Skill" : "Add Skill"}
          </AdminBtn>
          {editId && (
            <AdminBtn
              variant="secondary"
              onClick={() => {
                setEditId(null);
                setForm({ name: "" });
              }}
            >
              <X size={16} /> Cancel
            </AdminBtn>
          )}
        </div>
      </AdminCard>

      <div className="flex flex-wrap gap-3">
        {hardSkills.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-2 px-4 py-2 bg-slate-900/40 border border-white/10 rounded-full hover:border-blue-500/30 transition-all"
          >
            <span className="text-sm font-bold text-slate-200">
              {item.name}
            </span>
            {item.name_id && (
              <span className="text-[10px] text-slate-500">
                / {item.name_id}
              </span>
            )}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
              <button
                onClick={() => handleEdit(item)}
                className="text-slate-500 hover:text-white"
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={() => handleDelete(item.id!)}
                className="text-red-900 hover:text-red-400"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <AdminConfirmModal
        isOpen={confirmModal?.isOpen || false}
        title={confirmModal?.title || ""}
        message={confirmModal?.message || ""}
        onConfirm={confirmModal?.onConfirm || (() => {})}
        onCancel={() => setConfirmModal(null)}
      />
    </div>
  );
}

// ─── Technical Skills Manager ─────────────────────────
function TechnicalSkillsManager() {
  const { technicalSkills, setTechnicalSkills, fetchAllSkills } = useSkills();
  const [form, setForm] = useState<TechnicalSkillDB>({
    name: "",
    category: "",
    logo_url: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageResetKey, setImageResetKey] = useState(0);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Nama tool wajib diisi!");
    setIsSubmitting(true);
    try {
      const dataToSave = {
        name: form.name,
        category: form.category,
        logo_url: form.logo_url,
      };
      if (editId) {
        await skillsApi.update("skills", editId, dataToSave);
        toast.success("Technical skill berhasil diperbarui");
      } else {
        const maxOrder =
          technicalSkills.length > 0
            ? Math.max(...technicalSkills.map((i) => i.order ?? 0)) + 1
            : 1;
        await skillsApi.create("skills", { ...dataToSave, order: maxOrder });
        toast.success("Technical skill berhasil ditambahkan");
      }
      setForm({ name: "", category: "", logo_url: "" });
      setEditId(null);
      setImageResetKey((k) => k + 1);
      fetchAllSkills();
    } catch (err) {
      toast.error("Gagal menyimpan technical skill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: TechnicalSkillDB) => {
    setForm({
      name: item.name,
      category: item.category ?? "",
      logo_url: item.logo_url ?? "",
    });
    setEditId(item.id!);
    setImageResetKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Technical Tool?",
      message: "Apakah Anda yakin ingin menghapus technical tool ini?",
      onConfirm: async () => {
        try {
          await skillsApi.delete("skills", id);
          toast.success("Tool berhasil dihapus");
          fetchAllSkills();
        } catch (err) {
          toast.error("Gagal menghapus tool");
        }
        setConfirmModal(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <AdminCard title="Add / Edit Technical Tool" icon={Zap}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Tool Name
            </label>
            <AdminInput
              placeholder="MS Excel, SPSS, Python..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Category (optional)
            </label>
            <AdminInput
              placeholder="Spreadsheet, Statistics, Programming..."
              value={form.category ?? ""}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <div className="col-span-full">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Logo
            </label>
            <ImageUpload
              value={form.logo_url ?? ""}
              onChange={(url) => setForm({ ...form, logo_url: url })}
              label="Upload Tool Logo"
              resetKey={imageResetKey}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-2">
          <AdminBtn onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : editId ? (
              <Check size={16} />
            ) : (
              <Plus size={16} />
            )}
            {editId ? "Update Tool" : "Add Tool"}
          </AdminBtn>
          {editId && (
            <AdminBtn
              variant="secondary"
              onClick={() => {
                setEditId(null);
                setForm({ name: "", category: "", logo_url: "" });
                setImageResetKey((k) => k + 1);
              }}
            >
              <X size={16} /> Cancel
            </AdminBtn>
          )}
        </div>
      </AdminCard>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {technicalSkills.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col items-center gap-3 group hover:border-blue-500/20 transition-all relative"
          >
            {/* Logo preview */}
            <div className="w-14 h-14 rounded-2xl bg-white border border-white/10 flex items-center justify-center overflow-hidden">
              {item.logo_url ? (
                <img
                  src={item.logo_url}
                  alt={item.name}
                  className="w-full h-full object-contain p-1.5"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Tag size={20} className="text-slate-500" />
              )}
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-white uppercase tracking-tight">
                {item.name}
              </p>
              {item.category && (
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">
                  {item.category}
                </p>
              )}
            </div>
            {/* Actions */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(item)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={() => handleDelete(item.id!)}
                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <AdminConfirmModal
        isOpen={confirmModal?.isOpen || false}
        title={confirmModal?.title || ""}
        message={confirmModal?.message || ""}
        onConfirm={confirmModal?.onConfirm || (() => {})}
        onCancel={() => setConfirmModal(null)}
      />
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────
export default function SkillManager() {
  const [activeTab, setActiveTab] = useState<SkillTab>("soft");

  const tabs: { key: SkillTab; label: string; icon: any }[] = [
    { key: "soft", label: "Soft Skills", icon: Brain },
    { key: "hard", label: "Hard Skills", icon: Zap },
    { key: "technical", label: "Technical Tools", icon: Tag },
  ];

  return (
    <div className="space-y-8">
      {/* Tab Header */}
      <div className="flex gap-2 bg-slate-900/40 border border-white/5 rounded-2xl p-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "soft" && <SoftSkillsManager />}
          {activeTab === "hard" && <HardSkillsManager />}
          {activeTab === "technical" && <TechnicalSkillsManager />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
