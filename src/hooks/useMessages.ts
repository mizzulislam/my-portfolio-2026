import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Message } from "@/src/types";
import { toast } from "react-hot-toast";
import { messagesApi } from "@/src/lib/api/messages";

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const MESSAGES_PER_PAGE = 10;

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const data = await messagesApi.getAll();
      setMessages(data);
    } catch (error) {
      toast.error("Gagal memuat pesan");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const handleOpenMessage = async (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      await messagesApi.markAsRead(msg.id);
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)));
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

  const selectedMessages = messages.filter((m) => selectedIds.includes(m.id!));
  const selectedHasUnread = selectedMessages.some((m) => !m.is_read);

  const handleToggleMarkSelected = async () => {
    if (selectedIds.length === 0) return;
    const markAsRead = selectedHasUnread;
    await supabase.from("messages").update({ is_read: markAsRead }).in("id", selectedIds);
    setMessages((prev) =>
      prev.map((m) => (selectedIds.includes(m.id!) ? { ...m, is_read: markAsRead } : m))
    );
    setSelectedIds([]);
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

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

  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / MESSAGES_PER_PAGE));
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * MESSAGES_PER_PAGE,
    currentPage * MESSAGES_PER_PAGE
  );

  const allCurrentSelected =
    paginatedMessages.length > 0 &&
    paginatedMessages.every((m) => selectedIds.includes(m.id!));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds((prev) => [
        ...Array.from(new Set([...prev, ...paginatedMessages.map((m) => m.id!)])),
      ]);
    } else {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedMessages.some((m) => m.id === id))
      );
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const formatGmailDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date
        .toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .replace(":", ".");
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return {
    messages, setMessages,
    isLoading,
    selectedMessage, setSelectedMessage,
    selectedIds,
    searchQuery, setSearchQuery,
    filterStatus, setFilterStatus,
    currentPage, setCurrentPage,
    fetchMessages,
    handleOpenMessage,
    handleDeleteSelected,
    selectedHasUnread,
    handleToggleMarkSelected,
    toggleSelect,
    filteredMessages,
    totalPages,
    paginatedMessages,
    allCurrentSelected,
    handleSelectAll,
    unreadCount,
    formatGmailDate,
    MESSAGES_PER_PAGE
  };
}
