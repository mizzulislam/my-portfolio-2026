import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, ExternalLink, Globe, Github, Layers, CheckCircle2, 
  Sun, Moon, ChevronDown, ChevronUp 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { Project } from "../types/project";

interface ProjectDetailProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  lang: "en" | "id";
  setLang: (lang: "en" | "id") => void;
}

const detailTranslations = {
  en: {
    back: "Back to Home",
    projectInfo: "Project Specs",
    category: "Category",
    links: "Links",
    github: "GitHub Code",
    live: "Live Preview",
    gallery: "Project Gallery",
    noStudy: "No case study content has been written for this project yet.",
    loading: "Loading Case Study...",
    error: "Failed to load project details.",
    criticalOutputs: "Critical Outputs",
    technologies: "Technologies Used",
  },
  id: {
    back: "Kembali ke Beranda",
    projectInfo: "Spesifikasi Proyek",
    category: "Kategori",
    links: "Tautan",
    github: "Kode GitHub",
    live: "Demo Aplikasi",
    gallery: "Galeri Foto Proyek",
    noStudy: "Belum ada konten studi kasus yang ditulis untuk proyek ini.",
    loading: "Memuat Studi Kasus...",
    error: "Gagal memuat detail proyek.",
    criticalOutputs: "Output Kritis",
    technologies: "Teknologi Digunakan",
  }
};

// Divider Block Renderer
function DividerBlock({ block }: { block: any }) {
  const divStyle = block.data.style || "line";
  const divColor = block.data.color || "rgba(255,255,255,0.1)";
  return (
    <div className="py-4">
      {divStyle === "line" && <hr className="border-t" style={{ borderColor: divColor }} />}
      {divStyle === "dashed" && <hr className="border-t border-dashed" style={{ borderColor: divColor }} />}
      {divStyle === "double" && <div className="border-t border-b h-1" style={{ borderColor: divColor }} />}
      {divStyle === "dots" && <hr className="border-t border-dotted border-spacing-2" style={{ borderColor: divColor }} />}
    </div>
  );
}

// Media Block Renderer (Photo/Video Link)
function MediaBlock({ block, isDark }: { block: any; isDark: boolean }) {
  const isVid = block.data.mediaType === "video";
  return (
    <div className="space-y-4">
      {isVid ? (
        <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl">
          {block.data.url ? (
            <iframe 
              src={block.data.url.replace("watch?v=", "embed/")} 
              className="w-full h-full"
              title="Case study video"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 font-bold text-xs">Video URL Not Provided</div>
          )}
        </div>
      ) : (
        <div className={`rounded-3xl overflow-hidden border aspect-video bg-slate-950 flex items-center justify-center shadow-2xl ${
          isDark ? "border-white/10" : "border-slate-200"
        }`}>
          {block.data.url ? (
            <img src={block.data.url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="text-slate-500 font-bold text-xs">No Image Loaded</div>
          )}
        </div>
      )}
      {block.data.caption && <p className="text-center text-xs italic text-slate-500 font-medium">{block.data.caption}</p>}
    </div>
  );
}

// Custom Data Table Renderer
function TableBlock({ block, isDark }: { block: any; isDark: boolean }) {
  const padClass = block.data.cellPadding === "compact" ? "p-2" : block.data.cellPadding === "spacious" ? "p-6" : "p-4";
  return (
    <div className={`overflow-x-auto rounded-2xl border ${
      isDark ? "border-white/10 bg-slate-950/20" : "border-slate-200 bg-white shadow-md"
    }`}>
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className={`border-b font-bold ${
            isDark ? "bg-white/[0.03] border-white/10 text-blue-400" : "bg-slate-50 border-slate-200 text-blue-600"
          }`}>
            {block.data.headers.map((h: string, idx: number) => (
              <th 
                key={idx} 
                className={`${padClass} uppercase tracking-wider font-mono`}
                style={{ width: block.data.columnWidths?.[idx] || 'auto' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-slate-200"}`}>
          {block.data.rows.map((row: string[], rowIdx: number) => (
            <tr 
              key={rowIdx} 
              className={isDark ? "hover:bg-white/[0.01]" : "hover:bg-slate-50/50"}
              style={{ height: block.data.rowHeights?.[rowIdx] || block.data.rowHeight || 'auto' }}
            >
              {row.map((cell: string, cellIdx: number) => (
                <td key={cellIdx} className={`${padClass} font-bold ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 2/3 Column Grid Renderer
function GridBlock({ block, isDark }: { block: any; isDark: boolean }) {
  const cols = block.data.columns || 2;
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-6`}>
      {block.data.items.map((item: any, idx: number) => (
        <div 
          key={idx} 
          className={`p-6 rounded-2xl border ${
            isDark 
              ? "bg-[#0b1329]/40 border-white/5 hover:border-white/10 hover:bg-white/[0.04]" 
              : "bg-white border-slate-200 hover:border-slate-300 shadow-md"
          } transition-all`}
        >
          <h4 className={`font-black text-sm mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{item.title}</h4>
          <p 
            className={`text-xs leading-relaxed font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        </div>
      ))}
    </div>
  );
}

// Image Carousel Slider Renderer
function CarouselBlock({ block, isDark }: { block: any; isDark: boolean }) {
  const hasImgs = block.data.images && block.data.images.length > 0;
  if (!hasImgs) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {block.data.images.map((img: string, idx: number) => (
        <div 
          key={idx} 
          className={`aspect-video rounded-2xl overflow-hidden border shadow-lg hover:scale-[1.02] transition-transform ${
            isDark ? "border-white/5 bg-slate-950" : "border-slate-200 bg-white"
          }`}
        >
          <img src={img} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}

// Interactive Accordion (FAQ Style) Renderer
function AccordionBlock({ block, isDark }: { block: any; isDark: boolean }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {block.data.items.map((item: any, idx: number) => {
        const isOpen = activeIndex === idx;
        return (
          <div 
            key={idx} 
            className={`rounded-2xl border transition-all ${
              isDark 
                ? "bg-[#0b1329]/20 border-white/5 hover:bg-white/[0.02]" 
                : "bg-slate-50 border-slate-200 hover:bg-slate-100/50 shadow-sm"
            } overflow-hidden`}
          >
            <button
              onClick={() => setActiveIndex(isOpen ? null : idx)}
              className={`w-full flex items-center justify-between p-5 font-black text-xs uppercase tracking-wider text-left transition-colors ${
                isDark 
                  ? "text-slate-300 hover:text-white" 
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              <span>{item.title}</span>
              {isOpen ? (
                <ChevronUp size={14} className="text-blue-500" />
              ) : (
                <ChevronDown size={14} className="text-blue-500" />
              )}
            </button>
            {isOpen && (
              <div 
                className={`p-5 border-t text-xs leading-relaxed transition-all ${
                  isDark 
                    ? "border-white/5 text-slate-400 bg-black/10" 
                    : "border-slate-200 text-slate-600 bg-slate-100/30"
                }`}
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Split Banner (Media + Text Layout) Renderer
function SplitBannerBlock({ block, isDark }: { block: any; isDark: boolean }) {
  const leftLayout = block.data.layout === "left";
  const splitVid = block.data.mediaType === "video";
  return (
    <div className={`flex flex-col md:flex-row items-center gap-8 my-4 ${leftLayout ? "" : "md:flex-row-reverse"}`}>
      {/* Media block */}
      <div className={`w-full md:w-1/2 aspect-video rounded-3xl overflow-hidden border bg-slate-950 flex items-center justify-center shrink-0 shadow-2xl ${
        isDark ? "border-white/10" : "border-slate-200"
      }`}>
        {block.data.mediaUrl ? (
          splitVid ? (
            <iframe 
              src={block.data.mediaUrl.replace("watch?v=", "embed/")} 
              className="w-full h-full"
              title="Split banner media"
              allowFullScreen
            />
          ) : (
            <img src={block.data.mediaUrl} alt="" className="w-full h-full object-cover" />
          )
        ) : (
          <div className="text-slate-500 font-bold text-xs font-mono">No Media Configured</div>
        )}
      </div>
      {/* Text block */}
      <div className="w-full md:w-1/2 text-left space-y-4">
        <h3 className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{block.data.title}</h3>
        <p 
          className={`text-xs md:text-sm leading-relaxed font-medium ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}
          dangerouslySetInnerHTML={{ __html: block.data.content }}
        />
      </div>
    </div>
  );
}

// Root Block Router
function BlockRenderer({ block, isDark }: { block: any; isDark: boolean }) {
  switch (block.type) {
    case "text":
      return (
        <div 
          className="case-study-content"
          dangerouslySetInnerHTML={{ __html: block.data.html }}
        />
      );
    case "divider":
      return <DividerBlock block={block} />;
    case "media":
      return <MediaBlock block={block} isDark={isDark} />;
    case "table":
      return <TableBlock block={block} isDark={isDark} />;
    case "grid":
      return <GridBlock block={block} isDark={isDark} />;
    case "carousel":
      return <CarouselBlock block={block} isDark={isDark} />;
    case "accordion":
      return <AccordionBlock block={block} isDark={isDark} />;
    case "split-banner":
      return <SplitBannerBlock block={block} isDark={isDark} />;
    default:
      return null;
  }
}

export default function ProjectDetail({ isDark, setIsDark, lang, setLang }: ProjectDetailProps) {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const t = detailTranslations[lang];

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        if (!id) throw new Error("ID not provided");

        const { data, error: dbError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (dbError) throw dbError;
        if (!data) throw new Error("Project not found");

        setProject(data as Project);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error fetching project");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 ${isDark ? "bg-[#020617] text-slate-200" : "bg-slate-50 text-slate-900"}`}>
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="font-mono text-xs uppercase tracking-widest text-blue-500 animate-pulse">{t.loading}</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center transition-colors duration-500 ${isDark ? "bg-[#020617] text-slate-200" : "bg-slate-50 text-slate-900"}`}>
        <div className="max-w-md p-8 rounded-3xl border border-red-500/20 bg-red-500/5 backdrop-blur-md">
          <p className="text-red-500 font-bold mb-4">{t.error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
          >
            <ArrowLeft size={16} /> {t.back}
          </Link>
        </div>
      </div>
    );
  }

  const projectTitle = lang === "id" && project.title_id ? project.title_id : project.title;
  const projectCategory = lang === "id" && project.category_id ? project.category_id : project.category || "Project";
  const projectDesc = lang === "id" && project.desc_id ? project.desc_id : project.description;
  const detailedContent = lang === "id" && project.detailed_content_id ? project.detailed_content_id : project.detailed_content;
  const tags = lang === "id" && project.tags_id && project.tags_id.length > 0 ? project.tags_id : project.tags || [];

  // Parse blocks or render HTML directly
  const renderCaseStudyContent = () => {
    if (!detailedContent) {
      return (
        <div className="text-center py-10 opacity-60">
          <p className="text-sm font-medium">{t.noStudy}</p>
        </div>
      );
    }

    const trimmed = detailedContent.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsedBlocks = JSON.parse(trimmed);
        if (Array.isArray(parsedBlocks)) {
          return (
            <div className="space-y-12">
              {parsedBlocks.map((block: any) => (
                <BlockRenderer key={block.id} block={block} isDark={isDark} />
              ))}
            </div>
          );
        }
      } catch (err) {
        console.error("JSON block parsing failed, falling back to HTML renderer:", err);
      }
    } else if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        const parsedBlocks = parsed.blocks || [];
        if (Array.isArray(parsedBlocks)) {
          return (
            <div className="space-y-12">
              {parsedBlocks.map((block: any) => (
                <BlockRenderer key={block.id} block={block} isDark={isDark} />
              ))}
            </div>
          );
        }
      } catch (err) {
        console.error("JSON config parsing failed, falling back to HTML renderer:", err);
      }
    }

    // Default HTML renderer fallback (backward compatibility)
    return (
      <div
        className={`case-study-content ${isDark ? "text-slate-300" : "text-slate-700"}`}
        dangerouslySetInnerHTML={{ __html: detailedContent }}
      />
    );
  };

  // Determine layout settings
  let specsLayout = "right"; // default
  if (detailedContent) {
    const trimmed = detailedContent.trim();
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        specsLayout = parsed.specsLayout || "right";
      } catch (e) {
        console.error(e);
      }
    }
  }

  const renderSpecsCard = () => {
    return (
      <div className={`p-8 rounded-3xl border ${
        isDark ? "bg-[#0b1329]/40 border-white/5" : "bg-white border-slate-200 shadow-lg"
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <Layers className="text-blue-500" size={20} />
          <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? "text-white" : "text-slate-900"}`}>
            {t.projectInfo}
          </h3>
        </div>

        <div className="space-y-6">
          {/* Key output / deliverables */}
          {tags.length > 0 && (
            <div>
              <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {t.criticalOutputs}
              </h4>
              <ul className="space-y-2">
                {tags.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5" />
                    <span className={`text-xs font-bold leading-tight ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTAs */}
          <div className="pt-6 border-t border-white/5 space-y-3">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-300"
              >
                <Globe size={16} /> {t.live}
              </a>
            )}

            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all duration-300 ${
                  isDark
                    ? "bg-slate-950 hover:bg-slate-900 border-white/5 text-slate-300 hover:text-white"
                    : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-950"
                }`}
              >
                <Github size={16} /> {t.github}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 font-sans ${isDark ? "bg-[#020617] text-slate-200" : "bg-slate-50 text-slate-900"}`}>
      {/* Top Header Navigation */}
      <header className={`sticky top-0 z-40 w-full backdrop-blur-md border-b transition-all duration-500 ${
        isDark
          ? "bg-[#020617]/70 border-white/5"
          : "bg-white/90 border-slate-200/80 shadow-sm"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
              isDark
                ? "bg-slate-950/40 hover:bg-slate-900 border-white/5 text-slate-300 hover:text-white"
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950 shadow-sm"
            }`}
          >
            <ArrowLeft size={14} /> {t.back}
          </Link>

          {/* Quick controls */}
          <div className="flex items-center gap-3">
            {/* Lang switcher */}
            <button
              onClick={() => setLang(lang === "en" ? "id" : "en")}
              className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] font-black uppercase tracking-wider transition-all ${
                isDark
                  ? "bg-slate-950/40 border-white/5 text-blue-400 hover:text-blue-300"
                  : "bg-slate-50 border-slate-200/80 text-blue-600 hover:text-blue-500 shadow-sm"
              }`}
            >
              {lang}
            </button>
            {/* Dark mode switcher */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg border transition-all ${
                isDark
                  ? "bg-slate-950/40 border-white/5 text-yellow-500 hover:bg-slate-900"
                  : "bg-slate-50 border-slate-200/80 text-slate-700 hover:text-slate-800 hover:bg-slate-100 shadow-sm"
              }`}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="relative mb-12">
          {/* Cover image or decorative background */}
          <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl opacity-20">
            {project.image_url && (
              <img
                src={project.image_url}
                alt=""
                className="w-full h-full object-cover blur-xl"
              />
            )}
            <div className={`absolute inset-0 ${isDark ? "bg-[#020617]" : "bg-slate-50"}`} />
          </div>

          <div className={`relative z-10 p-8 md:p-14 rounded-3xl border backdrop-blur-sm ${
            isDark ? "bg-[#0b1329]/60 border-[#3b82f6]/20" : "bg-white/80 border-slate-200 shadow-xl"
          }`}>
            <span className="inline-block bg-blue-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-lg mb-6 shadow-md">
              {projectCategory}
            </span>

            <h1 className={`text-3xl md:text-5xl font-black tracking-tight leading-tight mb-6 ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              {projectTitle}
            </h1>

            {projectDesc && (
              <p className={`text-base md:text-lg leading-relaxed max-w-4xl font-medium ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}>
                {projectDesc}
              </p>
            )}
          </div>
        </div>

        {/* Main Content Layout Grid */}
        {specsLayout === "hidden" ? (
          <div className="w-full space-y-12">
            <div className={`p-8 md:p-12 rounded-3xl border ${
              isDark ? "bg-[#0b1329]/30 border-white/5" : "bg-white border-slate-200 shadow-lg"
            }`}>
              {renderCaseStudyContent()}
            </div>
            {project.gallery_images && project.gallery_images.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-600/50 rounded-full" />
                  <h2 className={`text-lg font-black uppercase tracking-[0.2em] ${isDark ? "text-white" : "text-slate-900"}`}>
                    {t.gallery}
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {project.gallery_images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative aspect-video rounded-2xl overflow-hidden border group bg-slate-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all ${
                        isDark ? "border-white/5" : "border-slate-200 shadow-sm"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Gallery view ${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : specsLayout === "left" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Left Spec Sidebar */}
            <aside className="space-y-8 lg:col-span-1 order-2 lg:order-1">
              {renderSpecsCard()}
            </aside>

            {/* Detailed content section */}
            <div className="lg:col-span-2 space-y-12 order-1 lg:order-2">
              <div className={`p-8 md:p-12 rounded-3xl border ${
                isDark ? "bg-[#0b1329]/30 border-white/5" : "bg-white border-slate-200 shadow-lg"
              }`}>
                {renderCaseStudyContent()}
              </div>

              {/* Project Gallery */}
              {project.gallery_images && project.gallery_images.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-blue-600/50 rounded-full" />
                    <h2 className={`text-lg font-black uppercase tracking-[0.2em] ${isDark ? "text-white" : "text-slate-900"}`}>
                      {t.gallery}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {project.gallery_images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`relative aspect-video rounded-2xl overflow-hidden border group bg-slate-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all ${
                          isDark ? "border-white/5" : "border-slate-200 shadow-sm"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Gallery view ${idx}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Detailed content section */}
            <div className="lg:col-span-2 space-y-12">
              <div className={`p-8 md:p-12 rounded-3xl border ${
                isDark ? "bg-[#0b1329]/30 border-white/5" : "bg-white border-slate-200 shadow-lg"
              }`}>
                {renderCaseStudyContent()}
              </div>

              {/* Project Gallery */}
              {project.gallery_images && project.gallery_images.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-blue-600/50 rounded-full" />
                    <h2 className={`text-lg font-black uppercase tracking-[0.2em] ${isDark ? "text-white" : "text-slate-900"}`}>
                      {t.gallery}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {project.gallery_images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`relative aspect-video rounded-2xl overflow-hidden border group bg-slate-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all ${
                          isDark ? "border-white/5" : "border-slate-200 shadow-sm"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Gallery view ${idx}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Spec Sidebar */}
            <aside className="space-y-8 lg:col-span-1">
              {renderSpecsCard()}
            </aside>
          </div>
        )}
      </main>

      {/* Lightbox / Zoom Dialog for images */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-5xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Enlarged view"
                className="w-full h-full max-h-[85vh] object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
