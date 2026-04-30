import { useState, useEffect, useRef } from "react";
import React from "react";
import { supabase } from "../../lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { Message } from "../../types";
import { translateToIndonesian } from "../../lib/translate";
import { ReplyModal } from "../ReplyModal";
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
  MessageSquare,
  RefreshCw,
  MailOpen,
  Mail,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  AdminCard,
  AdminInput,
  AdminBtn,
  AdminTextArea,
  AdminSelect,
  ImageUpload,
} from "./AdminSharedUI";

export default function MessageManager() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">(
    "all",
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const MESSAGES_PER_PAGE = 10;

  const fetchMessages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setMessages(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Reset ke page 1 saat filter/search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const handleOpenMessage = async (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("id", msg.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)),
      );
    }
  };

  const handleDeleteOne = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Hapus pesan ini?")) {
      await supabase.from("messages").delete().eq("id", id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedIds.includes(id))
        setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Hapus ${selectedIds.length} pesan terpilih?`)) {
      await supabase.from("messages").delete().in("id", selectedIds);
      setMessages((prev) => prev.filter((m) => !selectedIds.includes(m.id!)));
      setSelectedIds([]);
    }
  };

  const handleMarkReadSelected = async () => {
    if (selectedIds.length === 0) return;
    await supabase
      .from("messages")
      .update({ is_read: true })
      .in("id", selectedIds);
    setMessages((prev) =>
      prev.map((m) =>
        selectedIds.includes(m.id!) ? { ...m, is_read: true } : m,
      ),
    );
    setSelectedIds([]);
  };

  const selectedMessages = messages.filter((m) => selectedIds.includes(m.id!));
  const selectedHasUnread = selectedMessages.some((m) => !m.is_read);

  const handleToggleMarkSelected = async () => {
    if (selectedIds.length === 0) return;
    const markAsRead = selectedHasUnread;
    await supabase
      .from("messages")
      .update({ is_read: markAsRead })
      .in("id", selectedIds);
    setMessages((prev) =>
      prev.map((m) =>
        selectedIds.includes(m.id!) ? { ...m, is_read: markAsRead } : m,
      ),
    );
    setSelectedIds([]);
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Filter + Search
  const filteredMessages = messages.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter =
      filterStatus === "all"
        ? true
        : filterStatus === "unread"
          ? !m.is_read
          : m.is_read;
    return matchSearch && matchFilter;
  });

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredMessages.length / MESSAGES_PER_PAGE),
  );
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * MESSAGES_PER_PAGE,
    currentPage * MESSAGES_PER_PAGE,
  );

  const allCurrentSelected =
    paginatedMessages.length > 0 &&
    paginatedMessages.every((m: Message) => selectedIds.includes(m.id!));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds((prev) => [
        ...new Set([...prev, ...paginatedMessages.map((m) => m.id!)]),
      ]);
    } else {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedMessages.some((m) => m.id === id)),
      );
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  // Fungsi Helper untuk memformat tanggal ala Gmail
  const formatGmailDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();

    // Cek apakah tanggal pesan sama dengan hari ini
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      // Jika hari ini, tampilkan jam (contoh: 14.38)
      return date
        .toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .replace(":", ".");
    } else {
      // Jika bukan hari ini, tampilkan bulan & tanggal (contoh: Apr 30)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // ── Detail View ──
  if (selectedMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <button
          onClick={() => setSelectedMessage(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-all group text-sm font-bold uppercase tracking-widest"
        >
          <X
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Inbox
        </button>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
          <div className="flex justify-between items-start border-b border-white/5 pb-6 mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-lg shrink-0">
                {selectedMessage.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  {selectedMessage.name}
                </h2>
                <p className="text-blue-400 text-sm font-medium">
                  {selectedMessage.email}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-slate-500 text-xs font-mono">
                {new Date(selectedMessage.created_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 text-slate-300 leading-relaxed min-h-[160px] whitespace-pre-wrap text-sm">
            {selectedMessage.message}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setIsReplyModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
            >
              <Send size={16} /> Reply
            </button>
            <button
              onClick={async () => {
                if (confirm("Delete this message?")) {
                  await supabase
                    .from("messages")
                    .delete()
                    .eq("id", selectedMessage.id!);
                  setMessages((prev) =>
                    prev.filter((m) => m.id !== selectedMessage.id),
                  );
                  setSelectedMessage(null);
                }
              }}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── List View ──
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            Inbox
          </h2>
          {unreadCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest">
              {unreadCount} unread
            </span>
          )}
        </div>
        <button
          onClick={fetchMessages}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-blue-400 transition-all"
          title="Refresh"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>
      {/* Toolbar */}
      <div className="relative z-40 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-900/40 border border-white/5 rounded-2xl px-4 py-3 backdrop-blur-md overflow-visible">
        {/* Left: Checkbox + bulk actions */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={allCurrentSelected}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold group-hover:text-slate-300 transition-colors">
              {selectedIds.length > 0
                ? `${selectedIds.length} selected`
                : "Select all"}
            </span>
          </label>

          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button
                  onClick={handleDeleteSelected}
                  title="Delete Selected"
                  className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={handleToggleMarkSelected}
                  title={selectedHasUnread ? "Mark as Read" : "Mark as Unread"}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-all"
                >
                  {selectedHasUnread ? <MailOpen size={16} /> : <Mail size={16} />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>{" "}
        {/* Right: Search + Filter + Pagination */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all w-44"
            />
          </div>

          {/* Filter dropdown */}
          {/* Kita gunakan overflow-visible dan z-index besar supaya dropdown muncul di atas card list */}
          <div className="relative z-[50] overflow-visible">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                filterStatus !== "all"
                  ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              <ListFilter size={14} />
              {filterStatus === "all"
                ? "All"
                : filterStatus === "unread"
                  ? "Unread"
                  : "Read"}
              <ChevronDown
                size={12}
                className={`transition-transform ${isFilterOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 6 }}
                  className="absolute right-0 mt-2 w-40 bg-slate-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-[99999]"
                >
                  {(["all", "unread", "read"] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setFilterStatus(opt);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between transition-all ${
                        filterStatus === opt
                          ? "text-blue-400 bg-blue-500/15 font-bold"
                          : "text-slate-300 hover:bg-white/5 font-medium"
                      }`}
                    >
                      <span className="capitalize">
                        {opt === "all"
                          ? "All Messages"
                          : opt === "unread"
                            ? "Unread Only"
                            : "Read Only"}
                      </span>
                      {filterStatus === opt && <Check size={12} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span className="text-[11px] text-slate-500 font-mono px-2 whitespace-nowrap">
            {filteredMessages.length === 0
              ? "0-0 of 0"
              : `${(currentPage - 1) * MESSAGES_PER_PAGE + 1}-${Math.min(currentPage * MESSAGES_PER_PAGE, filteredMessages.length)} of ${filteredMessages.length}`}
          </span>
          {totalPages > 1 && (
            <>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Previous"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Next"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </>
          )}
        </div>{" "}
      </div>{" "}
      {/* Message List */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-md divide-y divide-white/[0.04] z-0">
        {/* SESUDAH (Ganti mulai dari paginatedMessages.map) */}
        {paginatedMessages.map((msg, index) => (
          <motion.div
            key={msg.id}
            // ... props framer motion kamu lainnya
            onClick={() => handleOpenMessage(msg)}
            className={`group relative flex items-center gap-4 px-5 py-3 transition-all cursor-pointer border-b border-white/[0.02] ${
              msg.is_read ? "opacity-80" : "bg-blue-500/[0.03]"
            }`}
          >
            {/* 1. CHECKBOX (Muncul saat hover atau selected) */}
            <div
              onClick={(e) => toggleSelect(msg.id!, e)}
              className={`shrink-0 transition-opacity duration-200 ${
                selectedIds.includes(msg.id!)
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              }`}
            >
              <input
                type="checkbox"
                // Hubungkan status checked dengan state selectedIds
                checked={selectedIds.includes(msg.id!)}
                // Tambahkan onChange kosong agar tidak error di console (logika klik diatur oleh div pembungkus)
                onChange={() => {}}
                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
              />
            </div>

            {/* 2. NAMA PENGIRIM (Lebar tetap agar sejajar vertikal) */}
            <div
              className={`w-32 md:w-48 shrink-0 truncate text-sm ${!msg.is_read ? "font-black text-white" : "font-medium text-slate-400"}`}
            >
              {msg.name}
            </div>

            {/* 3. ISI PESAN (Snippet - Mengambil sisa ruang & memotong jika kepanjangan) */}
            <div className="flex-1 min-w-0 overflow-hidden text-sm whitespace-nowrap text-ellipsis text-slate-500">
              <span className={!msg.is_read ? "text-slate-200 font-bold" : ""}>
                {/* Subject (bisa ditambahkan jika ada kolomnya di DB) */}
                Pesan Baru —
              </span>
              <span className="ml-1 opacity-70">{msg.message}</span>
            </div>

            {/* 4. WAKTU (Ujung kanan, lebar tetap) */}
            <div className="w-14 shrink-0 text-right text-[11px] font-mono text-slate-500 uppercase tracking-tighter">
              {formatGmailDate(msg.created_at)}
            </div>
          </motion.div>
        ))}
      </div>
      {/* Pagination Bottom */}
      {isReplyModalOpen && selectedMessage && (
        <ReplyModal
          isOpen={true}
          onClose={() => setIsReplyModalOpen(false)}
          recipientEmail={selectedMessage.email}
          subject={`Re: Pesan dari ${selectedMessage.name}`}
          onSuccess={() => {
            setIsReplyModalOpen(false);
          }}
        />
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers(currentPage, totalPages).map((p, i) =>
              p === "..." ? (
                <span key={`dot-${i}`} className="px-2 text-slate-600 text-xs">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p as number)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === p
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "bg-white/5 border border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
};

function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | string)[] {
  const pages = Array.from(
    { length: totalPages },
    (_: unknown, i: number) => i + 1,
  );
  const filtered = pages.filter(
    (p: number) =>
      p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
  );
  const result: (number | string)[] = [];
  filtered.forEach((p: number, i: number) => {
    if (i > 0 && p - filtered[i - 1] > 1) result.push("...");
    result.push(p);
  });
  return result;
}