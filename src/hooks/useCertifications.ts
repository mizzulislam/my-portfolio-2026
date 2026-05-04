import { useState, useEffect } from "react";
import { certificationsApi } from "@/src/lib/api/certifications";
import { CertificationItem } from "@/src/types";
import { toast } from "react-hot-toast";

export function useCertifications() {
  const [items, setItems] = useState<CertificationItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi untuk mengambil semua data (Sertifikat & Kategori)
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Kita jalankan secara paralel agar lebih cepat seperti audit pajak kilat!
      const [certsData, catsData] = await Promise.all([
        certificationsApi.getAll(),
        certificationsApi.getCategories(),
      ]);

      setItems(certsData || []);
      setCategories(catsData || []);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data sertifikasi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    items,
    setItems,
    categories,
    setCategories,
    isLoading,
    fetchAllData,
  };
}
