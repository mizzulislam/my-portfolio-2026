import { useState, useEffect } from "react";
import { Experience } from "@/src/types";
import { experienceApi } from "@/src/lib/api/experience";
import { toast } from "react-hot-toast";

export function useExperience() {
  const [items, setItems] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await experienceApi.getAll();
      setItems(data);
    } catch (err) {
      toast.error("Gagal memuat data pengalaman");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return { items, setItems, isLoading, fetchItems };
}
