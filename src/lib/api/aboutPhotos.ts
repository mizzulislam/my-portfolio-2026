import { supabase } from "../supabase";
import { AboutPhoto } from "@/src/types";

export const aboutPhotosApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from("about_photos")
      .select("*")
      .order("order", { ascending: true });
    if (error) throw error;
    return data as AboutPhoto[];
  },

  create: async (photo: Omit<AboutPhoto, "id">) => {
    const { data, error } = await supabase
      .from("about_photos")
      .insert([photo])
      .select();
    if (error) throw error;
    return data[0] as AboutPhoto;
  },

  update: async (id: string, updates: Partial<AboutPhoto>) => {
    const { data, error } = await supabase
      .from("about_photos")
      .update(updates)
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0] as AboutPhoto;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from("about_photos")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  updateOrder: async (id: string, order: number) => {
    const { error } = await supabase
      .from("about_photos")
      .update({ order })
      .eq("id", id);
    if (error) throw error;
  },
};
