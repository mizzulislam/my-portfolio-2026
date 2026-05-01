import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, Check, ChevronDown, MailOpen, Mail, ChevronLeft, ListFilter } from "lucide-react";

interface MessageToolbarProps {
  allCurrentSelected: boolean;
  handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedIds: string[];
  handleDeleteSelected: () => void;
  selectedHasUnread: boolean;
  handleToggleMarkSelected: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterStatus: "all" | "unread" | "read";
  setFilterStatus: (val: "all" | "unread" | "read") => void;
  totalFiltered: number;
  currentPage: number;
  setCurrentPage: (val: number | ((p: number) => number)) => void;
  totalPages: number;
  MESSAGES_PER_PAGE: number;
}

export default function MessageToolbar({
  allCurrentSelected, handleSelectAll, selectedIds, handleDeleteSelected,
  selectedHasUnread, handleToggleMarkSelected, searchQuery, setSearchQuery,
  filterStatus, setFilterStatus, totalFiltered, currentPage, setCurrentPage,
  totalPages, MESSAGES_PER_PAGE
}: MessageToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
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
            {selectedIds.length > 0 ? `${selectedIds.length} selected` : "Select all"}
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
              <button onClick={handleDeleteSelected} title="Delete Selected" className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                <Trash2 size={16} />
              </button>
              <button onClick={handleToggleMarkSelected} title={selectedHasUnread ? "Mark as Read" : "Mark as Unread"} className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-all">
                {selectedHasUnread ? <MailOpen size={16} /> : <Mail size={16} />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Search + Filter + Pagination */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Search messages..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all w-44" />
        </div>

        <div className="relative z-50 overflow-visible">
          <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus !== "all" ? "bg-blue-500/20 border-blue-500/40 text-blue-400" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}>
            <ListFilter size={14} />
            {filterStatus === "all" ? "All" : filterStatus === "unread" ? "Unread" : "Read"}
            <ChevronDown size={12} className={`transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 6 }} className="absolute right-0 mt-2 w-40 bg-slate-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-[999]">
                {(["all", "unread", "read"] as const).map((opt) => (
                  <button key={opt} onClick={() => { setFilterStatus(opt); setIsFilterOpen(false); }} className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between transition-all ${filterStatus === opt ? "text-blue-400 bg-blue-500/15 font-bold" : "text-slate-300 hover:bg-white/5 font-medium"}`}>
                    <span className="capitalize">{opt === "all" ? "All Messages" : opt === "unread" ? "Unread Only" : "Read Only"}</span>
                    {filterStatus === opt && <Check size={12} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className="text-[11px] text-slate-500 font-mono px-2 whitespace-nowrap hidden sm:inline-block">
          {totalFiltered === 0 ? "0-0 of 0" : `${(currentPage - 1) * MESSAGES_PER_PAGE + 1}-${Math.min(currentPage * MESSAGES_PER_PAGE, totalFiltered)} of ${totalFiltered}`}
        </span>
        
        {totalPages > 1 && (
          <>
            <div className="w-px h-4 bg-white/10 mx-1 hidden sm:block" />
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Previous">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Next">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
