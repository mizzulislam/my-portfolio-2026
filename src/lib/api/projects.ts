import { supabase } from "../supabase";
import { Project } from "@/src/types";

export const projectsApi = {
  // Ambil semua proyek
  getAll: async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Project[];
  },

  // Tambah proyek baru
  create: async (project: Omit<Project, "id">) => {
    const { data, error } = await supabase
      .from("projects")
      .insert([project])
      .select();
    if (error) throw error;
    return data[0];
  },

  // Update proyek
  update: async (id: string, updates: Partial<Project>) => {
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  },

  // Hapus proyek
  delete: async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
  },

  updateOrder: async (pendingOrder: Project[]) => {
    const updates = pendingOrder.map((item, index) =>
      supabase
        .from("projects")
        .update({ order: index + 1 })
        .eq("id", item.id!)
    );
    await Promise.all(updates);
  },
};
