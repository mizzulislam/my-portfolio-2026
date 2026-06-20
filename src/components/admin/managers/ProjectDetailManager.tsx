import { useState, useEffect } from "react";
import React from "react";
import { ArrowLeft, Check, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { Project } from "@/src/types/project";
import { projectsApi } from "@/src/lib/api/projects";
import { translateToIndonesian } from "@/src/lib/translate";
import {
  AdminCard,
  AdminBtn,
  AdminTextArea,
  ImageUpload,
} from "../AdminSharedUI";

interface ProjectDetailManagerProps {
  projectId: string;
  onBack: () => void;
}

export default function ProjectDetailManager({ projectId, onBack }: ProjectDetailManagerProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [detailedContent, setDetailedContent] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true);
        const data = await projectsApi.getAll();
        const found = data.find((p) => p.id === projectId);
        if (found) {
          setProject(found);
          setDetailedContent(found.detailed_content || "");
          setGalleryImages(found.gallery_images || []);
        } else {
          toast.error("Proyek tidak ditemukan");
          onBack();
        }
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat detail proyek");
      } finally {
        setIsLoading(false);
      }
    };
    if (projectId) {
      loadProject();
    }
  }, [projectId, onBack]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const detailed_content_id = await translateToIndonesian(detailedContent);
      await projectsApi.update(projectId, {
        detailed_content: detailedContent,
        detailed_content_id,
        gallery_images: galleryImages,
      });
      toast.success("Detail proyek / studi kasus berhasil disimpan! 📝");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan detail proyek");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddImage = (url: string) => {
    if (url) {
      setGalleryImages((prev) => [...prev, url]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <AdminBtn variant="secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Kembali ke Proyek
        </AdminBtn>
        <h3 className="text-white font-black uppercase tracking-widest text-sm">
          Edit Detail: {project?.title}
        </h3>
      </div>

      <AdminCard title="Detail & Studi Kasus Proyek" icon={ImageIcon}>
        <div className="space-y-8">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Studi Kasus (Markdown / Text)
            </label>
            <p className="text-xs text-slate-500 mb-2 px-2">
              Tulis konten studi kasus mendalam seperti Latar Belakang, Tantangan, Solusi, dan Hasil proyek.
            </p>
            <AdminTextArea
              placeholder="Contoh:&#10;### Latar Belakang&#10;Proyek ini dibuat untuk...&#10;&#10;### Tantangan&#10;Salah satu tantangan terbesar adalah...&#10;&#10;### Solusi&#10;Solusi yang diterapkan adalah...&#10;&#10;### Hasil&#10;Proyek ini berhasil meningkatkan..."
              value={detailedContent}
              onChange={(e) => setDetailedContent(e.target.value)}
              rows={15}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4 block px-2">
              Galeri Foto Proyek ({galleryImages.length} Foto)
            </label>
            
            {/* Grid of gallery images */}
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                {galleryImages.map((url, idx) => (
                  <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group bg-slate-950">
                    <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-2.5 bg-red-600/90 hover:bg-red-700 text-white rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add new image */}
            <div className="max-w-md">
              <ImageUpload
                value=""
                onChange={handleAddImage}
                label="Tambahkan Foto ke Galeri"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8 pt-6 border-t border-white/5">
          <AdminBtn onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Check size={18} />
            )}
            Simpan Detail
          </AdminBtn>
        </div>
      </AdminCard>
    </div>
  );
}
