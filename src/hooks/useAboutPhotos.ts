import { useState, useEffect } from "react";
import { AboutPhoto } from "@/src/types";
import { aboutPhotosApi } from "@/src/lib/api/aboutPhotos";
import { toast } from "react-hot-toast";

export function useAboutPhotos() {
  const [items, setItems] = useState<AboutPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await aboutPhotosApi.getAll();
      setItems(data || []);
    } catch (err) {
      toast.error("Gagal memuat foto About");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return { items, setItems, isLoading, fetchItems };
}
