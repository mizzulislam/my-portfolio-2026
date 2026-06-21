import { useState, useEffect, useRef } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Project } from "@/src/types/project";
import { translateToIndonesian } from "@/src/lib/translate";
import { translateArrayToIndonesian } from "@/src/lib/translate";
import { toast } from "react-hot-toast";
import { projectsApi } from "@/src/lib/api/projects";
import { useProjects } from "@/src/hooks/useProjects";
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
  FileText,
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

function SortableCard({
  item,
  onEdit,
  onDelete,
  onEditDetail,
  isDraggable = false,
}: {
  item: Project;
  onEdit: (item: Project) => void;
  onDelete: (id: string) => void;
  onEditDetail: (id: string) => void;
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
      className={`p-6 rounded-3xl border bg-slate-900/40 backdrop-blur-xl group transition-all duration-200 relative flex flex-col h-full ${
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
        className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 cursor-grab active:cursor-grabbing text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all z-20"
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

      <div className="aspect-video w-full rounded-2xl bg-slate-800 mb-6 overflow-hidden border border-white/5 shrink-0">
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

      <div className="flex-1 flex flex-col justify-between space-y-4">
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
        </div>

        <div className="pt-4 flex flex-wrap gap-2 border-t border-white/10 mt-auto">
          <AdminBtn variant="secondary" onClick={() => onEdit(item)}>
            <Edit2 size={14} /> Edit
          </AdminBtn>
          <AdminBtn variant="ghost" onClick={() => onEditDetail(item.id!)}>
            <FileText size={14} /> Detail
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
export default function ProjectManager() {
  const navigate = useNavigate();
  const [dragSuccess, setDragSuccess] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Project[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const { items, setItems, fetchItems } = useProjects();
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
    order: 0,
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState<string>("");
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

    // Simpan urutan baru sementara, belum ke Supabase
    setPendingOrder(newItems);
    setItems(newItems);
  };

  const handleConfirmOrder = async () => {
    try {
      await projectsApi.updateOrder(pendingOrder);

      setPendingOrder([]);
      setConfirmModal(null);
      setIsReordering(false);
      setDragSuccess(true);

      toast.success("Urutan proyek berhasil diperbarui! 📦");

      setTimeout(() => setDragSuccess(false), 3000);
      fetchItems();
    } catch (err) {
      console.error(err);
      toast.error("Gagal memperbarui urutan");
    }
  };

  const handleDiscardOrder = () => {
    setPendingOrder([]);
    setIsReordering(false);
  };

  const resetForm = () => {
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
      order: 0,
    });
    setTagsInput("");
    setEditId(null);
  };
  
  const handleSave = async () => {
    if (!form.title.trim()) return toast.error("Judul proyek wajib diisi!");
    setIsSubmitting(true);
    try {
      const parsedTags = tagsInput
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const [title_id, desc_id, category_id, tags_id] = await Promise.all([
        translateToIndonesian(form.title),
        translateToIndonesian(form.description),
        translateToIndonesian(form.category),
        translateArrayToIndonesian(parsedTags),
      ]);

      const dataToSave = { ...form, tags: parsedTags, title_id, desc_id, category_id, tags_id };

      let newProjectId = "";
      if (editId) {
        await projectsApi.update(editId, dataToSave);
        toast.success("Proyek berhasil diperbarui! ✅");
        resetForm();
        fetchItems();
      } else {
        // Logika order otomatis: ambil max order + 1
        const maxOrder =
          items.length > 0
            ? Math.max(...items.map((i) => i.order || 0)) + 1
            : 1;
        const newProject = await projectsApi.create({ ...dataToSave, order: maxOrder } as Omit<Project, 'id'>);
        newProjectId = newProject.id!;
        toast.success("Proyek baru berhasil diluncurkan! 🚀");
        resetForm();
        fetchItems();
        if (newProjectId) {
          navigate(`/admin/projects/edit-detail/${newProjectId}`);
        }
      }
    } catch (err) {
      toast.error("Gagal menyimpan proyek");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: Project) => {
    setForm(item);
    setTagsInput(item.tags ? item.tags.join("\n") : "");
    setEditId(item.id!);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Proyek secara Permanen?",
      message: "Proyek ini akan dihapus secara permanen dan tidak dapat dikembalikan.",
      onConfirm: async () => {
        try {
          await projectsApi.delete(id);
          toast.success("Proyek berhasil dihapus");
          fetchItems();
        } catch (err) {
          toast.error("Gagal menghapus proyek");
        }
        setConfirmModal(null);
      },
    });
  };

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

          {/* Baris 4: Critical Outputs */}
          <div className="col-span-full">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Critical Outputs
            </label>
            <AdminTextArea
              placeholder="Enter critical outputs (one per line)..."
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
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
                  order: 0,
                });
                setTagsInput("");
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
                <AdminBtn
                  onClick={() =>
                    setConfirmModal({
                      isOpen: true,
                      title: "Simpan Urutan Baru?",
                      message: "Urutan project akan diperbarui dan langsung terlihat di halaman portfolio.",
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <SortableCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onEditDetail={(id) => navigate(`/admin/projects/edit-detail/${id}`)}
                isDraggable={isReordering} // ← tambahkan prop ini
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
