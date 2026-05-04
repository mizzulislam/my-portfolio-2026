import { supabase } from "../supabase";
import { Message } from "@/src/types";

export const messagesApi = {
  // Ambil semua pesan
  getAll: async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Message[];
  },

  // Tandai pesan sudah dibaca
  markAsRead: async (id: string) => {
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("id", id);
    if (error) throw error;
  },

  // Hapus pesan
  delete: async (id: string) => {
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) throw error;
  },
};
