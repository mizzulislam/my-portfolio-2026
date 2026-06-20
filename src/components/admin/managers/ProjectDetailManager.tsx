import { useState, useEffect, useRef } from "react";
import React from "react";
import { 
  ArrowLeft, Check, Trash2, Image as ImageIcon,
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link2, Quote, Code, Eye, FileText
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Project } from "@/src/types/project";
import { projectsApi } from "@/src/lib/api/projects";
import {
  AdminCard,
  AdminBtn,
  ImageUpload,
} from "../AdminSharedUI";

interface ProjectDetailManagerProps {
  projectId: string;
  onBack: () => void;
}

const TEMPLATES = {
  standard: `<h2>Latar Belakang Proyek</h2>
<p>Tulis penjelasan mengenai latar belakang proyek di sini. Mengapa proyek ini dibuat? Masalah apa yang ingin diselesaikan?</p>

<h2>Tantangan Teknologis</h2>
<p>Tulis tantangan teknologis utama di sini. Apa kendala performa, integrasi, atau batasan sistem yang dihadapi?</p>

<h2>Solusi Aplikasi</h2>
<p>Tulis solusi yang dirancang dan diimplementasikan. Bagaimana arsitektur atau fitur khusus mengatasi masalah tersebut?</p>

<h2>Dampak &amp; Hasil Akhir</h2>
<p>Tulis dampak positif dan hasil akhir proyek di sini. Contoh: peningkatan efisiensi, responsivitas, atau kepuasan pengguna.</p>`,

  minimalist: `<h2>Ringkasan Eksekutif</h2>
<p>Ringkasan eksekutif singkat yang merangkum keseluruhan proyek secara praktis dan ringkas.</p>

<h2>Sorotan Fitur Utama</h2>
<ul>
  <li><strong>Fitur Unggulan 1:</strong> Deskripsi singkat mengenai fungsionalitas dan keunggulannya.</li>
  <li><strong>Fitur Unggulan 2:</strong> Deskripsi singkat mengenai fungsionalitas dan keunggulannya.</li>
  <li><strong>Fitur Unggulan 3:</strong> Deskripsi singkat mengenai fungsionalitas dan keunggulannya.</li>
</ul>

<h2>Testimoni / Feedback</h2>
<blockquote>"Proyek ini memberikan nilai luar biasa bagi operasional kami, menyederhanakan alur kerja yang sebelumnya rumit."</blockquote>`,

  technical: `<h2>Arsitektur Sistem</h2>
<p>Penjelasan mendalam mengenai arsitektur sistem, pilihan kerangka kerja, integrasi API, dan alur data.</p>

<h2>Struktur Skema Database &amp; API</h2>
<p>Rincian tabel database utama, relasi data, atau titik akhir API kritis yang digunakan dalam aplikasi.</p>
<blockquote>Gunakan layout tabel atau skema untuk menggambarkan relasi data.</blockquote>

<h2>Proses Deployment</h2>
<p>Langkah-langkah deployment, manajemen environment, CI/CD, dan hosting server yang diterapkan.</p>

<h2>Refleksi Masa Depan</h2>
<p>Rencana pengembangan selanjutnya, optimalisasi yang belum selesai, atau pelajaran berharga yang dipetik dari proyek ini.</p>`
};

export default function ProjectDetailManager({ projectId, onBack }: ProjectDetailManagerProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [detailedContent, setDetailedContent] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSourceView, setIsSourceView] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

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

  // Synchronize editor innerHTML with state initially or on toggling view mode
  useEffect(() => {
    if (editorRef.current && !isSourceView) {
      // Avoid setting innerHTML if it's already matching to prevent resetting cursor
      if (editorRef.current.innerHTML !== detailedContent) {
        editorRef.current.innerHTML = detailedContent;
      }
    }
  }, [isSourceView, isLoading]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await projectsApi.update(projectId, {
        detailed_content: detailedContent,
        detailed_content_id: detailedContent, // Set both to keep same layout tags safely without translating HTML
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

  // Editor command executer
  const executeCommand = (command: string, value: string = "") => {
    if (isSourceView) return;
    
    // Restore focus if lost
    if (editorRef.current) {
      editorRef.current.focus();
    }
    
    document.execCommand(command, false, value);
    
    // Sync state
    if (editorRef.current) {
      setDetailedContent(editorRef.current.innerHTML);
    }
  };

  const handleLinkInsertion = () => {
    const url = prompt("Masukkan URL Tautan:", "https://");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  const handleApplyTemplate = (type: keyof typeof TEMPLATES) => {
    const confirm = window.confirm(
      "Apakah Anda yakin ingin menggunakan template ini? Konten studi kasus yang sedang Anda tulis akan diganti sepenuhnya."
    );
    if (confirm) {
      const html = TEMPLATES[type];
      setDetailedContent(html);
      if (editorRef.current && !isSourceView) {
        editorRef.current.innerHTML = html;
      }
    }
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AdminBtn variant="secondary" onClick={onBack}>
            <ArrowLeft size={16} /> Kembali ke Proyek
          </AdminBtn>
          <h3 className="text-white font-black uppercase tracking-widest text-sm">
            Edit Detail: {project?.title}
          </h3>
        </div>
        <div className="flex gap-4">
          <AdminBtn onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Check size={18} />
            )}
            Simpan Detail
          </AdminBtn>
        </div>
      </div>

      {/* Split Screen Editor & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Side: Rich Text Editor */}
        <AdminCard title="Editor Studi Kasus" icon={ImageIcon}>
          <div className="space-y-6">
            
            {/* Template Selector Button Group */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-3 block px-1">
                Pilih Layout Template
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-white/5">
                <button
                  type="button"
                  onClick={() => handleApplyTemplate("standard")}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-[10px] uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <FileText size={12} /> Standar
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate("minimalist")}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-[10px] uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <FileText size={12} /> Minimalis
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate("technical")}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-[10px] uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Code size={12} /> Teknis
                </button>
              </div>
            </div>

            {/* WYSIWYG Word/Canva Toolbar */}
            <div className="bg-slate-950/80 rounded-2xl border border-white/5 p-2 flex flex-wrap gap-1.5 items-center">
              
              {/* Text formatting group */}
              <div className="flex items-center gap-1 border-r border-white/5 pr-2.5">
                <button
                  type="button"
                  onClick={() => executeCommand("bold")}
                  disabled={isSourceView}
                  className="p-2 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-slate-400 hover:text-white transition-all"
                  title="Teks Tebal (Bold)"
                >
                  <Bold size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand("italic")}
                  disabled={isSourceView}
                  className="p-2 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-slate-400 hover:text-white transition-all"
                  title="Teks Miring (Italic)"
                >
                  <Italic size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand("underline")}
                  disabled={isSourceView}
                  className="p-2 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-slate-400 hover:text-white transition-all"
                  title="Garis Bawah (Underline)"
                >
                  <Underline size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand("strikeThrough")}
                  disabled={isSourceView}
                  className="p-2 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-slate-400 hover:text-white transition-all"
                  title="Coret Teks (Strikethrough)"
                >
                  <Strikethrough size={15} />
                </button>
              </div>

              {/* Headings formatting group */}
              <div className="flex items-center gap-1 border-r border-white/5 pr-2.5">
                <button
                  type="button"
                  onClick={() => executeCommand("formatBlock", "<h1>")}
                  disabled={isSourceView}
                  className="px-2 py-1.5 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-xs font-black text-slate-400 hover:text-white transition-all"
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand("formatBlock", "<h2>")}
                  disabled={isSourceView}
                  className="px-2 py-1.5 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-xs font-black text-slate-400 hover:text-white transition-all"
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand("formatBlock", "<h3>")}
                  disabled={isSourceView}
                  className="px-2 py-1.5 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-xs font-black text-slate-400 hover:text-white transition-all"
                  title="Heading 3"
                >
                  H3
                </button>
              </div>

              {/* Align group */}
              <div className="flex items-center gap-1 border-r border-white/5 pr-2.5">
                <button
                  type="button"
                  onClick={() => executeCommand("justifyLeft")}
                  disabled={isSourceView}
                  className="p-2 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-slate-400 hover:text-white transition-all"
                  title="Rata Kiri"
                >
                  <AlignLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand("justifyCenter")}
                  disabled={isSourceView}
                  className="p-2 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-slate-400 hover:text-white transition-all"
                  title="Rata Tengah"
                >
                  <AlignCenter size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand("justifyRight")}
                  disabled={isSourceView}
                  className="p-2 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-slate-400 hover:text-white transition-all"
                  title="Rata Kanan"
                >
                  <AlignRight size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand("justifyFull")}
                  disabled={isSourceView}
                  className="p-2 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-slate-400 hover:text-white transition-all"
                  title="Rata Kiri Kanan (Justify)"
                >
                  <AlignJustify size={15} />
                </button>
              </div>

              {/* Lists and others */}
              <div className="flex items-center gap-1 border-r border-white/5 pr-2.5">
                <button
                  type="button"
                  onClick={() => executeCommand("insertUnorderedList")}
                  disabled={isSourceView}
                  className="p-2 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-slate-400 hover:text-white transition-all"
                  title="Bullet List"
                >
                  <List size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand("insertOrderedList")}
                  disabled={isSourceView}
                  className="p-2 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-slate-400 hover:text-white transition-all"
                  title="Numbered List"
                >
                  <ListOrdered size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand("formatBlock", "<blockquote>")}
                  disabled={isSourceView}
                  className="p-2 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-slate-400 hover:text-white transition-all"
                  title="Blockquote"
                >
                  <Quote size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleLinkInsertion}
                  disabled={isSourceView}
                  className="p-2 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-slate-400 hover:text-white transition-all"
                  title="Sisipkan Link"
                >
                  <Link2 size={15} />
                </button>
              </div>

              {/* Toggling Source Code (HTML View) */}
              <button
                type="button"
                onClick={() => setIsSourceView(!isSourceView)}
                className={`p-2 rounded-lg transition-all ml-auto ${
                  isSourceView 
                    ? "bg-blue-600 text-white" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                title={isSourceView ? "Kembali ke Tampilan Visual" : "Lihat Source Code HTML"}
              >
                <Code size={15} />
              </button>

            </div>

            {/* Editable Canvas Area */}
            <div className="relative">
              {isSourceView ? (
                <textarea
                  value={detailedContent}
                  onChange={(e) => setDetailedContent(e.target.value)}
                  rows={20}
                  className="w-full min-h-[400px] p-6 rounded-2xl border border-white/10 bg-slate-950 font-mono text-xs text-emerald-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
                  placeholder="Masukkan HTML di sini..."
                />
              ) : (
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={(e) => setDetailedContent(e.currentTarget.innerHTML)}
                  className="w-full min-h-[400px] max-h-[600px] overflow-y-auto p-8 rounded-2xl border border-white/10 bg-[#0B0E14] text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 case-study-content"
                />
              )}
            </div>
          </div>

          {/* Gallery image upload */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4 block px-1">
              Galeri Foto Proyek ({galleryImages.length} Foto)
            </label>
            
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {galleryImages.map((url, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group bg-slate-950">
                    <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-2 bg-red-600/90 hover:bg-red-700 text-white rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="max-w-md">
              <ImageUpload
                value=""
                onChange={handleAddImage}
                label="Tambahkan Foto ke Galeri"
              />
            </div>
          </div>
        </AdminCard>

        {/* Right Side: Live Preview Panel */}
        <AdminCard title="Live Preview (Real-Time)" icon={Eye}>
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <Eye size={12} className="text-blue-500" /> Hasil render studi kasus di halaman portfolio
            </div>

            {/* Preview Area container styled exactly as in the client page */}
            <div className="p-8 rounded-2xl border border-white/5 bg-[#0B0E14]/40 min-h-[460px] overflow-y-auto max-h-[600px] custom-scrollbar">
              {detailedContent ? (
                <div 
                  className="case-study-content text-slate-300"
                  dangerouslySetInnerHTML={{ __html: detailedContent }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-40 text-center">
                  <FileText size={40} className="mb-4 text-slate-600" />
                  <p className="text-xs">Belum ada konten untuk ditampilkan.</p>
                </div>
              )}

              {/* Show uploaded gallery in preview */}
              {galleryImages.length > 0 && (
                <div className="mt-12 pt-8 border-t border-white/5">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-4">
                    Galeri Foto Proyek
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {galleryImages.map((img, idx) => (
                      <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-white/5">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
