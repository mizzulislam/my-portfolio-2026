import { supabase } from "../supabase";
import { CertificationItem } from "@/src/types";

export const certificationsApi = {
  // Ambil semua sertifikat
  getAll: async () => {
    const { data, error } = await supabase
      .from("certifications")
      .select("*")
      .order("order", { ascending: true });
    if (error) throw error;
    return data as CertificationItem[];
  },

  // Ambil kategori sertifikat (untuk carousel)
  getCategories: async () => {
    const { data, error } = await supabase
      .from("cert_categories")
      .select("*")
      .order("id");
    if (error) throw error;
    return data;
  },

  // Tambah sertifikat baru
  create: async (cert: Omit<CertificationItem, "id">) => {
    const { data, error } = await supabase
      .from("certifications")
      .insert([cert])
      .select();
    if (error) throw error;
    return data[0];
  },

  // Update sertifikat
  update: async (id: string, updates: Partial<CertificationItem>) => {
    const { data, error } = await supabase
      .from("certifications")
      .update(updates)
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  },

  deleteCertification: async (id: string) => {
    const { error } = await supabase
      .from("certifications")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  // Update urutan sertifikat
  updateOrder: async (id: string, order: number) => {
    const { error } = await supabase
      .from("certifications")
      .update({ order })
      .eq("id", id);
    if (error) throw error;
  },
  // Tambahkan di certificationsApi
  createCategory: async (cat: any) => {
    const { data, error } = await supabase
      .from("cert_categories")
      .insert([cat])
      .select();
    if (error) throw error;
    return data[0];
  },
  updateCategory: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from("cert_categories")
      .update(updates)
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  },
  deleteCategory: async (id: string) => {
    const { error } = await supabase
      .from("cert_categories")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};
