import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, ChevronDown, Check } from "lucide-react";

export function AdminCard({
  children,
  title,
  icon: Icon,
}: {
  children: React.ReactNode;
  title: string;
  icon?: React.ElementType;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative"
    >
      <div className="flex items-center gap-3 mb-8 relative z-10">
        {Icon && <Icon className="text-blue-500" size={24} />}
        <h2 className="text-xl md:text-2xl font-black text-white uppercase">
          {title}
        </h2>
      </div>
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export function AdminInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      {...props} 
      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 mb-4"
    />
  )
}

export interface DropdownOption {
  value: string;
  label: string;
}

export function AdminDropdown({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  size = "normal",
}: {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  size?: "normal" | "compact";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isCompact = size === "compact";

  return (
    <div ref={ref} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full h-full flex items-center justify-between gap-3 bg-slate-900/80 border ${
          open ? "border-blue-500/50 ring-4 ring-blue-500/10" : "border-white/10"
        } rounded-2xl text-slate-200 cursor-pointer transition-all duration-200 hover:border-white/20 ${
          isCompact ? "px-3 py-2 text-xs" : "px-5 py-3 text-sm"
        }`}
      >
        <span className={value ? "text-slate-200" : "text-slate-500"}>
          {selectedLabel}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown size={isCompact ? 14 : 16} className="text-slate-400" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-[200] left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
          >
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full flex items-center justify-between gap-3 ${
                    isCompact ? "px-3 py-2 text-xs" : "px-5 py-3 text-sm"
                  } font-medium transition-all duration-150 ${
                    opt.value === value
                      ? "bg-blue-600/20 text-blue-300"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {opt.label}
                  {opt.value === value && (
                    <Check size={12} className="text-blue-400 shrink-0" />
                  )}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/** @deprecated Use AdminDropdown instead */
export function AdminSelect({
  value,
  onChange,
  children,
  className,
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  // Parse options from children for backward compat
  const opts: DropdownOption[] = React.Children.toArray(children)
    .filter((c): c is React.ReactElement => React.isValidElement(c))
    .map((c) => ({ value: String(c.props.value ?? ""), label: String(c.props.children ?? "") }));
  return (
    <AdminDropdown
      value={String(value ?? "")}
      onChange={(v) => onChange?.({ target: { value: v } } as React.ChangeEvent<HTMLSelectElement>)}
      options={opts}
      className={className ? `mb-4 ${className}` : "mb-4"}
    />
  );
}

export function AdminTextArea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea 
      rows={4}
      {...props} 
      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 mb-4 resize-none"
    />
  )
}

export function AdminBtn({
  children,
  variant = "primary",
  size = "normal", // Tambahkan parameter size
  ...props
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost"; // Tambah 'ghost'
  size?: "normal" | "icon"; // Tambah tipe size
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  title?: string;
}) {
  const styles = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]",
    secondary:
      "bg-slate-800/80 border border-white/10 text-slate-300 hover:bg-slate-700",
    danger:
      "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20",
    ghost:
      "bg-white/5 border border-white/10 text-slate-400 hover:text-blue-400 hover:border-blue-500/30",
  };

  // Jika size='icon', padding dibuat sama sisi (square)
  const sizeStyles =
    size === "icon" ? "p-2.5 rounded-xl" : "px-6 py-3 rounded-2xl";

  return (
    <button
      {...props}
      className={`${sizeStyles} font-bold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

export function ImageUpload({
  value,
  onChange,
  label = "Upload Image",
  resetKey,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  resetKey?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value);
  useEffect(() => {
    setPreview(value);
  }, [resetKey, value]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi API Key
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (!apiKey) {
      alert("API Key ImgBB tidak ditemukan di .env!");
      return;
    }

    // Validasi Ukuran (Contoh: Maks 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar terlalu besar! Maksimal 2MB.");
      return;
    }

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
  };;

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

export function AdminConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative text-left"
      >
        <h3 className="text-white font-black text-sm uppercase tracking-wide flex items-center gap-3">
          <AlertTriangle className="text-yellow-500 shrink-0" size={16} />
          {title}
        </h3>
        <p className="text-slate-400 text-xs mt-4 leading-relaxed font-bold">
          {message}
        </p>
        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-white/5 bg-slate-950 text-slate-400 hover:text-slate-200 text-[10px] font-black uppercase tracking-wider transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-[0_10px_20px_rgba(37,99,235,0.25)]"
          >
            Setuju
          </button>
        </div>
      </motion.div>
    </div>
  );
}