import React, { useState } from "react";
import { Send, X, Loader2 } from "lucide-react";

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  subject: string;
  onSuccess: () => void;
}

export const ReplyModal = ({
  isOpen,
  onClose,
  recipientEmail,
  subject,
  onSuccess,
}: ReplyModalProps) => {
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!replyText.trim()) return alert("Pesan tidak boleh kosong!"); // Pakai .trim() untuk cegah spasi saja
    setIsSending(true);

    try {
      const response = await fetch("/api/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipientEmail,
          subject: subject,
          replyText: replyText,
        }),
      });

      const result = await response.json(); // Ambil pesan dari server

      if (response.ok) {
        alert("Email balasan berhasil dikirim!");
        setReplyText("");
        onSuccess();
        onClose();
      } else {
        // Menampilkan pesan error spesifik dari server (misal: API Key habis)
        alert(`Gagal: ${result.error || "Terjadi kesalahan"}`);
      }
    } catch (error) {
      alert("Gagal mengirim email. Periksa koneksi internet Anda.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-white/5 bg-white/[0.02]">
          <h3 className="text-white font-bold text-sm">
            Balas ke: {recipientEmail}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <textarea
            autoFocus
            className="w-full h-40 bg-transparent text-slate-200 outline-none resize-none text-sm leading-relaxed"
            placeholder="Ketik balasan Anda di sini..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
        </div>
        <div className="p-4 bg-white/[0.02] flex justify-end">
          <button
            disabled={isSending}
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isSending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Kirim Balasan
          </button>
        </div>
      </div>
    </div>
  );
};
