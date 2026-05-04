import { useState } from "react";
import React from "react";
import { Image, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { AdminCard, AdminInput, AdminBtn, ImageUpload } from "../AdminSharedUI";
import { useAboutPhotos } from "@/src/hooks/useAboutPhotos";
import { aboutPhotosApi } from "@/src/lib/api/aboutPhotos";
import type { AboutPhoto } from "@/src/types";

export default function AboutPhotoManager() {
  const { items, fetchItems } = useAboutPhotos();
  const [form, setForm] = useState<AboutPhoto>({
    image_url: "",
    alt: "",
    caption: "",
    order: 0,
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setForm({ image_url: "", alt: "", caption: "", order: 0 });
    setEditId(null);
  };

  const handleSave = async () => {
    if (!form.image_url.trim() || !form.alt.trim()) {
      toast.error("Foto dan teks alt wajib diisi");
      return;
    }
    setIsSubmitting(true);

    try {
      const nextOrder = items.length > 0 ? Math.max(...items.map((item) => item.order || 0)) + 1 : 1;
      const dataToSave = {
        image_url: form.image_url,
        alt: form.alt,
        caption: form.caption,
        order: editId ? form.order || nextOrder : nextOrder,
      };

      if (editId) {
        await aboutPhotosApi.update(editId, dataToSave);
        toast.success("Foto About berhasil diperbarui");
      } else {
        await aboutPhotosApi.create({ ...dataToSave, order: nextOrder });
        toast.success("Foto About berhasil ditambahkan");
      }

      resetForm();
      fetchItems();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan foto About");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: AboutPhoto) => {
    setEditId(item.id ?? null);
    setForm({ ...item });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus foto ini dari About section?")) return;
    try {
      await aboutPhotosApi.delete(id);
      toast.success("Foto About berhasil dihapus");
      fetchItems();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus foto");
    }
  };

  return (
    <div className="space-y-10">
      <AdminCard title="About Photos" icon={Image}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Image URL
            </label>
            <ImageUpload
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              label="Upload About Photo"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
                Alt Text
              </label>
              <AdminInput
                placeholder="A photo of Izzul working or presenting"
                value={form.alt}
                onChange={(e) => setForm({ ...form, alt: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
                Caption (optional)
              </label>
              <AdminInput
                placeholder="Izzul presenting financial insights"
                value={form.caption}
                onChange={(e) => setForm({ ...form, caption: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <AdminBtn onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : editId ? (
              <Check size={16} />
            ) : (
              <Plus size={16} />
            )}
            {editId ? "Update Photo" : "Add Photo"}
          </AdminBtn>
          {editId && (
            <AdminBtn variant="secondary" onClick={resetForm}>
              <X size={16} /> Cancel
            </AdminBtn>
          )}
        </div>
      </AdminCard>

      <AdminCard title="Saved About Photos" icon={Image}>
        <div className="grid gap-4">
          {items.length === 0 ? (
            <p className="text-slate-400">Belum ada foto About. Tambahkan foto baru di atas.</p>
          ) : (
            items.map((item, index) => (
              <div key={item.id || `${item.image_url}-${index}`} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-3xl border border-white/10 bg-slate-950/50">
                <div className="w-full md:w-32 h-24 rounded-3xl overflow-hidden bg-slate-900 border border-white/10">
                  <img src={item.image_url} alt={item.alt} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-bold text-white">{item.alt}</p>
                  {item.caption && <p className="text-slate-400 text-sm">{item.caption}</p>}
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Order: {item.order}</p>
                </div>
                <div className="flex gap-2 self-stretch md:self-auto">
                  <AdminBtn variant="secondary" size="icon" onClick={() => handleEdit(item)}>
                    <Edit2 size={16} />
                  </AdminBtn>
                  <AdminBtn variant="danger" size="icon" onClick={() => item.id && handleDelete(item.id)}>
                    <Trash2 size={16} />
                  </AdminBtn>
                </div>
              </div>
            ))
          )}
        </div>
      </AdminCard>
    </div>
  );
}
