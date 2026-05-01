import { useState, useEffect, useRef } from "react";
import React from "react";
import { supabase } from "../../../lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { Experience } from "../../../types";
import { translateToIndonesian } from "../../../lib/translate";
import { translateArrayToIndonesian } from "../../../lib/translate";
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
  Building2
} from "lucide-react";
import {
  AdminCard,
  AdminInput,
  AdminBtn,
  AdminTextArea,
  AdminSelect,
  ImageUpload,
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
  const [isReordering, setIsReordering] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Experience[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dragSuccess, setDragSuccess] = useState(false);
  const [items, setItems] = useState<Experience[]>([]);
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

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase
      .from("experience")
      .select("*")
      .order("order", { ascending: true });
    if (data) setItems(data);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const [role_id, company_id, details_id] = await Promise.all([
        translateToIndonesian(form.role),
        translateToIndonesian(form.company),
        translateArrayToIndonesian(form.details),
      ]);

      const dataToSave = { ...form, role_id, company_id, details_id };

      if (editId) {
        await supabase.from("experience").update(dataToSave).eq("id", editId);
      } else {
        await supabase.from("experience").insert(dataToSave);
      }
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
      setEditId(null);
      fetchItems();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: Experience) => {
    setForm(item);
    setEditId(item.id!);
  };
  const handleDelete = async (id: string) => {
    if (confirm("Delete this experience entry?")) {
      await supabase.from("experience").delete().eq("id", id);
      fetchItems();
    }
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
