import { supabase } from "../supabase";
import { Experience } from "@/src/types";

export const experienceApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from("experience")
      .select("*")
      .order("start_date", { ascending: false });
    if (error) throw error;
    return data as Experience[];
  },

  create: async (exp: Omit<Experience, "id">) => {
    const { error } = await supabase.from("experience").insert([exp]);
    if (error) throw error;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from("experience").delete().eq("id", id);
    if (error) throw error;
  },

  update: async (id: string, updates: Partial<Experience>) => {
    const { data, error } = await supabase
      .from("experience")
      .update(updates)
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  },

  updateOrder: async (id: string, order: number) => {
    const { error } = await supabase
      .from("experience")
      .update({ order })
      .eq("id", id);
    if (error) throw error;
  },
};

