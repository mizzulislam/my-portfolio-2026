import { useState, useEffect, useRef } from "react";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Experience } from "@/src/types/experience";
import { translateToIndonesian } from "@/src/lib/translate";
import { translateArrayToIndonesian } from "@/src/lib/translate";
import { toast } from "react-hot-toast";
import { experienceApi } from "@/src/lib/api/experience";
import { useExperience } from "@/src/hooks/useExperience";
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
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
  Award,
  ListFilter,
  ChevronDown,
  Eye,
  GripVertical,
  Briefcase,
  Building2,
} from "lucide-react";
import {
  AdminCard,
  AdminInput,
  AdminBtn,
  AdminTextArea,
  AdminSelect,
  ImageUpload,
  AdminConfirmModal,
} from "../AdminSharedUI";

function SortableExperienceCard({
  item,
  onEdit,
  onDelete,
  isDraggable = false,
}: {
  item: Experience;
  onEdit: (item: Experience) => void;
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
  } = useSortable({ id: item.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease",
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 1,
  };

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
export default function ExperienceManager() {
  const { items, setItems, isLoading, fetchItems } = useExperience();
  const [isReordering, setIsReordering] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Experience[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [dragSuccess, setDragSuccess] = useState(false);
  const [form, setForm] = useState<Experience>({
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
    order: 0,
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setPendingOrder(newItems);
    setItems(newItems);
  };

  const handleConfirmOrder = async () => {
    try {
      await Promise.all(
        pendingOrder.map((item, index) =>
          experienceApi.updateOrder(item.id!, index + 1)
        ),
      );
      setPendingOrder([]);
      setConfirmModal(null);
      setIsReordering(false);
      setDragSuccess(true);
      setTimeout(() => setDragSuccess(false), 3000);
      toast.success("Urutan berhasil diperbarui! 🚀");
      fetchItems();
    } catch (err) {
      console.error(err);
      toast.error("Gagal memperbarui urutan");
    }
  };

  const handleDiscardOrder = () => {
    fetchItems();
    setPendingOrder([]);
    setIsReordering(false);
  };

  const resetForm = () => {
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
      order: 0,
    });
    setEditId(null);
  };

  const handleSave = async () => {
    if (!form.role || !form.company)
      return toast.error("Role dan Company wajib diisi");
    setIsSubmitting(true);
    try {
      const [role_id, company_id, details_id] = await Promise.all([
        translateToIndonesian(form.role),
        translateToIndonesian(form.company),
        translateArrayToIndonesian(form.details),
      ]);

      const dataToSave = { ...form, role_id, company_id, details_id };

      if (editId) {
        // Zul, pastikan di src/lib/api/experience.ts kamu sudah menambahkan fungsi update ya!
        await experienceApi.update(editId, dataToSave);
        toast.success("Perubahan berhasil disimpan! ✅");
      } else {
        const maxOrder =
          items.length > 0
            ? Math.max(...items.map((i) => i.order || 0)) + 1
            : 1;
        await experienceApi.create({ ...dataToSave, order: maxOrder });
        toast.success("Pengalaman baru ditambahkan");
      }
      resetForm();
      fetchItems();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: Experience) => {
    setForm(item);
    setEditId(item.id!);
  };
  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Pengalaman Kerja / Organisasi?",
      message: "Apakah Anda yakin ingin menghapus riwayat pengalaman ini secara permanen?",
      onConfirm: async () => {
        try {
          await experienceApi.delete(id);
          toast.success("Pengalaman berhasil dihapus");
          fetchItems();
        } catch (err) {
          toast.error("Gagal menghapus data");
        }
        setConfirmModal(null);
      },
    });
  };

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
                <AdminBtn
                  onClick={() =>
                    setConfirmModal({
                      isOpen: true,
                      title: "Simpan Urutan Baru?",
                      message: "Urutan pengalaman akan diperbarui dan langsung terlihat di halaman portfolio.",
                      onConfirm: handleConfirmOrder,
                    })
                  }
                >
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
      {/* Custom Confirmation Modal */}
      <AdminConfirmModal
        isOpen={confirmModal?.isOpen || false}
        title={confirmModal?.title || ""}
        message={confirmModal?.message || ""}
        onConfirm={confirmModal?.onConfirm || (() => {})}
        onCancel={() => setConfirmModal(null)}
      />

      {/* Notifikasi Sukses */}
      {dragSuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] bg-green-500/20 border border-green-500/40 text-green-400 px-8 py-4 rounded-2xl font-bold text-sm backdrop-blur-xl shadow-2xl flex items-center gap-3">
          <Check size={18} /> Urutan berhasil disimpan!
        </div>
      )}
    </div>
  );
}
