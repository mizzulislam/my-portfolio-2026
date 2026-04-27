import React, { useState } from "react";
import { Mail, MessageCircle, Send, Loader2, CheckCircle } from "lucide-react";
import { SectionHeader } from "../UIComponents";
import { SectionProps } from "../../types";

interface ContactProps extends SectionProps {
  lang: "en" | "id";
}

export function Contact({ isDark, t, lang }: ContactProps) {
  // 1. Gabungkan semua data input ke dalam satu state agar rapi
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [honeypot, setHoneypot] = useState(""); // Cukup pakai satu ini untuk jebakan bot
  const [errorMessage, setErrorMessage] = useState("");
  // State untuk melacak field mana yang sudah pernah disentuh user
  // Validasi hanya tampil setelah user menyentuh field tersebut
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    message: false,
  });
  // Fungsi validasi — mengembalikan pesan error per field
  const getFieldError = (field: string, value: string): string => {
    const msg = {
      name: {
        en: "Name is required.",
        id: "Nama tidak boleh kosong.",
      },
      emailRequired: {
        en: "Email is required.",
        id: "Email tidak boleh kosong.",
      },
      emailInvalid: {
        en: "Invalid email format.",
        id: "Format email tidak valid.",
      },
      message: {
        en: "Message must be at least 10 characters.",
        id: "Pesan minimal 10 karakter.",
      },
    };

    if (field === "name" && value.trim() === "") return msg.name[lang];
    if (field === "email") {
      if (value.trim() === "") return msg.emailRequired[lang];
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return msg.emailInvalid[lang];
    }
    if (field === "message" && value.length < 10) return msg.message[lang];
    return "";
  };
  // Dipanggil saat user keluar dari sebuah field (on-blur)
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // LANGKAH A: Cek Jebakan Bot
    if (honeypot !== "") {
      console.log("Bot Detected!");
      setStatus("success"); // Pura-pura sukses agar bot berhenti
      return;
    }

    // LANGKAH B: Validasi di Sisi User (Frontend)
    // Ini supaya user langsung dilarang kirim kalau pesan < 10 karakter
    setTouched({ name: true, email: true, message: true });

    const nameError = getFieldError("name", formData.name);
    const emailError = getFieldError("email", formData.email);
    const messageError = getFieldError("message", formData.message);

    if (nameError || emailError || messageError) {
      setStatus("error");
      setErrorMessage(nameError || emailError || messageError);
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        // Reset form setelah berhasil
        setFormData({ name: "", lastName: "", email: "", message: "" });
      } else {
        // LANGKAH C: Tangkap Pesan Error dari Zod (Backend)
        // Di sini API akan mengirim "Pesan minimal 10 karakter" jika lolos dari cek frontend
        setStatus("error");
        setErrorMessage(data.error || "Gagal mengirim pesan.");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage("Terjadi kesalahan koneksi ke server.");
    }
  };

  return (
    <section id="contact" className="py-20 px-6">
      <SectionHeader
        title={t.contactHeader}
        subTitle={t.contactSub}
        icon={Mail}
        isDark={isDark}
      />

      <div className="max-w-5xl mx-auto rounded-[40px] p-1 bg-gradient-to-br from-blue-600 to-indigo-900 shadow-2xl">
        <div
          className={`rounded-[39px] p-8 md:p-16 flex flex-col md:flex-row gap-12 ${isDark ? "bg-[#020617]" : "bg-white"}`}
        >
          {/* Info Kontak Kiri */}
          <div className="md:w-1/2">
            <h2
              className={`text-3xl font-bold mb-8 ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {t.contactDetailsTitle}
            </h2>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-5 text-left">
                {/* Bagian Email */}
                <div className="flex items-center gap-5 group">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isDark ? "bg-white/5 border border-white/5 group-hover:bg-blue-600/20" : "bg-slate-100 group-hover:bg-blue-50"}`}
                  >
                    <Mail size={20} className="text-blue-500" />
                  </div>
                  <span
                    className={`text-sm md:text-base font-bold tracking-tight ${isDark ? "text-slate-200" : "text-slate-800"}`}
                  >
                    mizzulislam.id@gmail.com
                  </span>
                </div>

                {/* Bagian WhatsApp */}
                <a
                  href="https://wa.me/6287802568095"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-5 group"
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isDark ? "bg-white/5 border border-white/5 group-hover:bg-green-600/20" : "bg-slate-100 group-hover:bg-green-50"}`}
                  >
                    <MessageCircle size={20} className="text-green-500" />
                  </div>
                  <span
                    className={`text-sm md:text-base font-bold tracking-tight ${isDark ? "text-slate-300" : "text-slate-800"}`}
                  >
                    +62 878-0256-8095
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Form Kanan */}
          <form className="md:w-1/2 space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t.formName}
                  required
                  className={`border rounded-2xl px-6 py-4 outline-none ${
                    touched.name && getFieldError("name", formData.name)
                      ? "border-rose-500"
                      : isDark
                        ? "border-white/10"
                        : "border-slate-200"
                  } ${isDark ? "bg-white/5 text-white" : "bg-slate-50"}`}
                />
                {touched.name && getFieldError("name", formData.name) && (
                  <span className="text-rose-500 text-xs px-2">
                    {getFieldError("name", formData.name)}
                  </span>
                )}
              </div>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={t.formLastName}
                className={`border rounded-2xl px-6 py-4 outline-none ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200"}`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t.formEmail}
                required
                className={`w-full border rounded-2xl px-6 py-4 outline-none ${
                  touched.email && getFieldError("email", formData.email)
                    ? "border-rose-500"
                    : isDark
                      ? "border-white/10"
                      : "border-slate-200"
                } ${isDark ? "bg-white/5 text-white" : "bg-slate-50"}`}
              />
              {touched.email && getFieldError("email", formData.email) && (
                <span className="text-rose-500 text-xs px-2">
                  {getFieldError("email", formData.email)}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={4}
                placeholder={t.formMsg}
                required
                className={`w-full border rounded-2xl px-6 py-4 outline-none resize-none ${
                  touched.message && getFieldError("message", formData.message)
                    ? "border-rose-500"
                    : isDark
                      ? "border-white/10"
                      : "border-slate-200"
                } ${isDark ? "bg-white/5 text-white" : "bg-slate-50"}`}
              />
              {touched.message &&
                getFieldError("message", formData.message) && (
                  <span className="text-rose-500 text-xs px-2">
                    {getFieldError("message", formData.message)}
                  </span>
                )}
            </div>

            {/* INPUT JEBAKAN BOT (PENTING: Harus di dalam form) */}
            <input
              type="text"
              name="subject_id"
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />

            <button
              disabled={status === "loading"}
              className="w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="animate-spin" /> Mengirim...
                </>
              ) : (
                <>
                  <Send size={18} /> {t.formBtn}
                </>
              )}
            </button>

            {/* NOTIFIKASI ERROR/SUKSES */}
            {status === "success" && (
              <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                Pesan terkirim!
              </div>
            )}
            {status === "error" && (
              <div className="p-4 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-bold">
                {errorMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
