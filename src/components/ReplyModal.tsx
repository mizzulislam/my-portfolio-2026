import React, { useState } from "react";
import { Send, X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

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
    if (!replyText.trim()) return toast.error("Pesan tidak boleh kosong!");
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

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Email balasan berhasil dikirim!");
        setReplyText("");
        onSuccess();
        onClose();
      } else {
        toast.error(
          `Gagal: ${responseData.error || "Terjadi kesalahan pada server"}`,
        );
      }
    } catch (error) {
      console.error("Error saat mengirim:", error);
      toast.error("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-950 border border-white/10 w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex flex-col gap-2 p-5 border-b border-white/5 bg-slate-900/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-slate-400 uppercase text-[10px] tracking-[0.32em] font-bold mb-1">
                Balas Pesan
              </p>
              <h3 className="text-white text-xl font-black">
                {subject}
              </h3>
              <p className="text-slate-500 text-sm mt-2">
                Kepada: <span className="text-slate-200">{recipientEmail}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white rounded-full p-2 transition-all"
              aria-label="Tutup"
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Kirim balasan langsung dari panel admin menggunakan Resend.
          </p>
        </div>

        <div className="p-5 space-y-4 bg-slate-950/90">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-slate-300 text-sm leading-relaxed">
            <p className="font-semibold text-slate-100 mb-2">Pesan Anda</p>
            <textarea
              autoFocus
              rows={8}
              className="w-full min-h-[200px] resize-none rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition-all focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
              placeholder="Tulis balasan Anda di sini..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-slate-300 transition-all hover:bg-white/10"
            >
              Batal
            </button>
            <button
              disabled={isSending}
              onClick={handleSend}
              className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-all hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {isSending ? "Mengirim..." : "Kirim Balasan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
