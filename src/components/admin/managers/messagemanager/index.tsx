import React, { useState } from "react";
import { motion } from "motion/react";
import { RefreshCw, ChevronLeft } from "lucide-react";
import { useMessages } from "../../../../hooks/useMessages";
import MessageToolbar from "./MessageToolbar";
import MessageDetail from "./MessageDetail";
import { ReplyModal } from "../../../ReplyModal";
import toast from "react-hot-toast";
import { messagesApi } from "@/src/lib/api/messages";

export default function MessageManager() {
  const {
    messages, setMessages, isLoading, selectedMessage, setSelectedMessage, selectedIds,
    searchQuery, setSearchQuery, filterStatus, setFilterStatus, currentPage, setCurrentPage,
    fetchMessages, handleOpenMessage, handleDeleteSelected, selectedHasUnread,
    handleToggleMarkSelected, toggleSelect, filteredMessages, totalPages,
    paginatedMessages, allCurrentSelected, handleSelectAll, unreadCount,
    formatGmailDate, MESSAGES_PER_PAGE
  } = useMessages();
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* JIKA ADA PESAN TERPILIH, TAMPILKAN DETAIL */}
      {selectedMessage ? (
        <MessageDetail
          selectedMessage={selectedMessage}
          onBack={() => setSelectedMessage(null)}
          onDelete={async (id) => {
            if (confirm("Hapus pesan ini secara permanen?")) {
              try {
                // 1. Eksekusi hapus di API
                await messagesApi.delete(id);
                // 2. Jika berhasil, update state lokal
                setMessages((prev) => prev.filter((m) => m.id !== id));
                setSelectedMessage(null);
                toast.success("Pesan telah dihapus");
              } catch (err) {
                // 3. Jika gagal, err akan ditangkap di sini
                console.error(err);
                toast.error("Gagal menghapus pesan");
              }
            }
          }}
          onReply={() => setIsReplyModalOpen(true)}
        />
      ) : (
        /* JIKA TIDAK ADA PESAN TERPILIH, TAMPILKAN LIST (KODE INBOX KAMU) */
        <>
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
              <RefreshCw
                size={18}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
          </div>

          {/* Toolbar */}
          <MessageToolbar
            allCurrentSelected={allCurrentSelected}
            handleSelectAll={handleSelectAll}
            selectedIds={selectedIds}
            handleDeleteSelected={handleDeleteSelected}
            selectedHasUnread={selectedHasUnread}
            handleToggleMarkSelected={handleToggleMarkSelected}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            totalFiltered={filteredMessages.length}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            MESSAGES_PER_PAGE={MESSAGES_PER_PAGE}
          />

          {/* Message List */}
          <div className="bg-slate-900/40 border border-white/5 rounded-4xl overflow-hidden backdrop-blur-md divide-y divide-white/5 z-0">
            {paginatedMessages.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-medium text-sm">
                Tidak ada pesan yang ditemukan.
              </div>
            ) : (
              paginatedMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  onClick={() => handleOpenMessage(msg)}
                  className={`group relative flex items-center gap-4 px-5 py-3 transition-all cursor-pointer border-b border-white/5 ${msg.is_read ? "opacity-80" : "bg-blue-500/5 hover:bg-blue-500/10"}`}
                >
                  <div
                    onClick={(e) => toggleSelect(msg.id!, e)}
                    className={`shrink-0 transition-opacity duration-200 ${selectedIds.includes(msg.id!) ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(msg.id!)}
                      onChange={() => {}}
                      className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div
                    className={`w-28 md:w-48 shrink-0 truncate text-sm ${!msg.is_read ? "font-black text-white" : "font-medium text-slate-400"}`}
                  >
                    {msg.name}
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden text-sm whitespace-nowrap text-ellipsis text-slate-500 hidden sm:block">
                    <span
                      className={!msg.is_read ? "text-slate-200 font-bold" : ""}
                    >
                      Pesan Baru —{" "}
                    </span>
                    <span className="ml-1 opacity-70">{msg.message}</span>
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden text-sm whitespace-nowrap text-ellipsis text-slate-500 sm:hidden">
                    <span className="opacity-70">{msg.message}</span>
                  </div>
                  <div className="w-16 shrink-0 text-right text-[11px] font-mono text-slate-500 uppercase tracking-tighter">
                    {formatGmailDate(msg.created_at)}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2 pb-8">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-bold uppercase tracking-widest transition-all hidden sm:block"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={14} />
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers(currentPage, totalPages).map((p, i) =>
                  p === "..." ? (
                    <span
                      key={`dot-${i}`}
                      className="px-2 text-slate-600 text-xs"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === p ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white/5 border border-white/10 text-slate-400 hover:text-white"}`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
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
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-bold uppercase tracking-widest transition-all hidden sm:block"
              >
                Last
              </button>
            </div>
          )}
        </>
      )}
      {/* Modal Balas sebagai cadangan jika dipicu dari list */}
      {selectedMessage && isReplyModalOpen && (
        <ReplyModal
          isOpen={isReplyModalOpen}
          onClose={() => setIsReplyModalOpen(false)}
          recipientEmail={selectedMessage.email as string} // 'as string' memaksa TS percaya data ini ada
          subject={`Re: Portofolio - Balasan untuk ${selectedMessage.name}`}
          onSuccess={() => {
            setIsReplyModalOpen(false);
            toast.success(`Email berhasil dikirim ke ${selectedMessage.name}`);
          }}
        />
      )}
    </div>
  );
}

function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const filtered = pages.filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1);
  const result: (number | string)[] = [];
  filtered.forEach((p, i) => {
    if (i > 0 && p - filtered[i - 1] > 1) result.push("...");
    result.push(p);
  });
  return result;
}
