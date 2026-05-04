import React from "react";
import { motion } from "motion/react";
import { ChevronLeft, Mail, Calendar, Send, Trash2 } from "lucide-react";
import { Message } from "@/src/types/message";

// Kita definisikan apa saja yang dibutuhkan komponen ini dari luar
interface MessageDetailProps {
  selectedMessage: Message;
  onBack: () => void; // Fungsi untuk kembali
  onDelete: (id: string) => Promise<void>; // Fungsi untuk menghapus
  onReply: () => void; // Fungsi untuk memicu modal balas (Ini kuncinya!)
}

export default function MessageDetail({
  selectedMessage,
  onBack,
  onDelete,
  onReply,
}: MessageDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Tombol Kembali - Menggunakan onBack dari Props */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group text-[11px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-full border border-white/10 w-fit"
      >
        <ChevronLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Kembali ke Kotak Masuk
      </button>

      <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Dekorasi Visual */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Header Pesan */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-8 mb-8 gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Avatar Inisial */}
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-white font-black text-2xl shadow-inner">
              {selectedMessage.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight mb-1">
                {selectedMessage.name}
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-blue-400" />
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  {selectedMessage.email}
                </a>
              </div>
            </div>
          </div>

          {/* Waktu Pesan */}
          <div className="flex shrink-0 items-center md:justify-end">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-xs font-mono">
              <Calendar size={14} />
              {new Date(selectedMessage.created_at).toLocaleString("id-ID", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        {/* Konten Pesan */}
        <div className="relative z-10">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-2">
            Isi Pesan
          </p>
          <div className="bg-black/20 p-8 rounded-[2rem] border border-white/5 text-slate-300 leading-relaxed min-h-[160px] whitespace-pre-wrap text-[15px] shadow-inner font-medium">
            {selectedMessage.message}
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="mt-8 flex flex-wrap gap-4 relative z-10">
          <button
            onClick={onReply} // Memicu modal yang ada di index.tsx
            className="flex items-center gap-2.5 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
          >
            <Send size={16} /> Balas Pesan
          </button>

          <button
            onClick={() => onDelete(selectedMessage.id!)} // Menggunakan fungsi hapus dari props
            className="flex items-center gap-2.5 px-8 py-4 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all"
          >
            <Trash2 size={16} /> Hapus
          </button>
        </div>
      </div>
    </motion.div>
  );
}
