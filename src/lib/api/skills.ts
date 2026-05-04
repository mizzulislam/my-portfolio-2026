import { supabase } from "../supabase";

export const skillsApi = {
  // Ambil Soft Skills
  getSoftSkills: async () => {
    const { data, error } = await supabase
      .from("soft_skills")
      .select("*")
      .order("order");
    if (error) throw error;
    return data;
  },

  // Ambil Hard Skills
  getHardSkills: async () => {
    const { data, error } = await supabase
      .from("hard_skills")
      .select("*")
      .order("order");
    if (error) throw error;
    return data;
  },

  // Ambil Technical/Tools
  getTechnicalSkills: async () => {
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("order");
    if (error) throw error;
    return data;
  },

  // Fungsi Tambah (Generic)
  create: async (table: "soft_skills" | "hard_skills" | "skills", item: any) => {
    const { data, error } = await supabase.from(table).insert([item]).select();
    if (error) throw error;
    return data[0];
  },

  // Fungsi Hapus (Generic)
  delete: async (table: "soft_skills" | "hard_skills" | "skills", id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
  },

  update: async (table: "skills" | "soft_skills" | "hard_skills", id: string, item: any) => {
    const { data, error } = await supabase.from(table).update(item).eq("id", id).select();
    if (error) throw error;
    return data[0];
  }
};