import { useState, useEffect, useRef } from "react";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CertificationItem } from "@/src/types/certification";
import { translateToIndonesian } from "@/src/lib/translate";
import { toast } from "react-hot-toast";
import { certificationsApi } from "@/src/lib/api/certifications";
import { useCertifications } from "@/src/hooks/useCertifications";
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
} from "lucide-react";
import {
  AdminCard,
  AdminInput,
  AdminBtn,
  AdminTextArea,
  AdminSelect,
  ImageUpload,
} from "../AdminSharedUI";

// --- Helper Constants & Functions ---
const MONTH_ORDER: Record<string, number> = { 
    Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, 
    Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

function toSortValue(year: string, month: string): number {
  const y = parseInt(year) || 0;
  const m = MONTH_ORDER[month] || 0;
  return y * 100 + m; // contoh: Jun 2024 → 202406
}

// --- Komponen Kartu Sertifikat yang Bisa Disortir ---
function SortableCertCard({ item, onEdit, onDelete, isDraggable, categoryName, categoryColor,}: {
  item: CertificationItem;
  onEdit: (item: CertificationItem) => void;
  onDelete: (id: string) => void;
  isDraggable: boolean;
  categoryName?: string;
  categoryColor?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, } = useSortable({ id: item.id! });

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
  const issuedDate = [item.issue_month, item.issue_year].filter(Boolean).join(" ");
  const expiryDate = [item.expiry_month, item.expiry_year].filter(Boolean).join(" ");

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

// ─── Manager Utama ────────────────────────────────────────────
export default function CertificateManager() {
  const EMPTY_FORM: CertificationItem = {
    category_id: "", title: "", title_id: "", issuer: "",
    issue_month: "", issue_year: "", expiry_month: "",
    expiry_year: "", credential_id: "", image_url: "", link: "", order: 0,
  };

  const EMPTY_CAT = { name: "", icon: "", description: "" };

  const { items, setItems, categories, fetchAllData, isLoading } = useCertifications();
  const [form, setForm] = useState<CertificationItem>(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<CertificationItem[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dragSuccess, setDragSuccess] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string; icon: string; description: string }[]>([]);
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
    fetchCategories();
    const handleClickOutside = (event: MouseEvent) => {
      // Jika klik terjadi DI LUAR elemen yang diref (filterRef), maka tutup dropdown
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await certificationsApi.getCategories();
      if (data) setDbCategories(data);
    } catch (err) {
      toast.error("Gagal memuat kategori");
    }
  };

  const handleSaveCategory = async () => {
    if (!catForm.name.trim()) return alert("Nama kategori wajib diisi!");
    setIsAddingCat(true);
    try {
      const name_id = await translateToIndonesian(catForm.name);
      const description_id = await translateToIndonesian(catForm.description);
      const payload = {
        name: catForm.name,
        name_id,
        icon: catForm.icon,
        description: catForm.description,
        description_id,
      };

      if (catEditId) {
        await certificationsApi.updateCategory(catEditId, payload);
      } else {
        await certificationsApi.createCategory({
          ...payload,
          order: dbCategories.length + 1,
        });
      }

      setCatForm(EMPTY_CAT);
      setCatEditId(null);
      fetchAllData(); // Refresh semua data lewat hook
      toast.success("Kategori berhasil disimpan!");
    } catch (err) {
      toast.error("Gagal menyimpan kategori");
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
      try {
        await certificationsApi.deleteCategory(id);
        toast.success("Kategori berhasil dihapus");
        fetchAllData();
      } catch (err) {
        toast.error("Gagal menghapus kategori");
      }
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.category_id) {
      toast.error("Judul dan kategori wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const title_id = form.title_id.trim()
        ? form.title_id
        : await translateToIndonesian(form.title);

      const dataToSave = { ...form, title_id };

      if (editId) {
        await certificationsApi.update(editId, dataToSave);
        toast.success("Sertifikat berhasil diperbarui");
      } else {
        const maxOrder =
          items.length > 0 ? Math.max(...items.map((i) => i.order)) + 1 : 1;
        await certificationsApi.create({ ...dataToSave, order: maxOrder });
        toast.success("Sertifikat berhasil ditambahkan");
      }

      resetForm();
      fetchAllData();
    } catch (err) {
      toast.error("Gagal menyimpan sertifikat");
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
      try {
        await certificationsApi.deleteCertification(id);
        toast.success("Sertifikat berhasil dihapus");
        fetchAllData();
      } catch (err) {
        toast.error("Gagal menghapus sertifikat");
      }
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
    try {
      // Kita update satu per satu urutannya
      await Promise.all(
        pendingOrder.map((item, index) =>
          certificationsApi.updateOrder(item.id!, index + 1)
        ),
      );
      setPendingOrder([]);
      setShowConfirm(false);
      setIsReordering(false);
      setDragSuccess(true);
      fetchAllData();
      toast.success("Urutan berhasil disimpan");
      setTimeout(() => setDragSuccess(false), 3000);
    } catch (err) {
      toast.error("Gagal menyimpan urutan baru");
    }
  };

  const handleDiscardOrder = () => {
    fetchAllData();
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
                    <span className="text-xs font-bold uppercase tracking-wider">
                      All Categories
                    </span>
                    {filterCategory === "all" && <Check size={14} />}
                  </button>
                  <div className="h-[1px] bg-white/5 my-1" />{" "}
                  {/* Garis pemisah halus */}
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
                        <span className="text-lg">
                          {iconEmoji[cat.icon] || "📄"}
                        </span>
                        <span className="text-sm truncate pr-2">
                          {cat.name}
                        </span>

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
                  fetchAllData();
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
