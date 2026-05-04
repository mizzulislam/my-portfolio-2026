import { useState, useEffect } from "react";
import { Project } from "@/src/types/project";
import { projectsApi } from "@/src/lib/api/projects";
import { toast } from "react-hot-toast";

export function useProjects() {
  const [items, setItems] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await projectsApi.getAll();
      setItems(data || []);
    } catch (err) {
      toast.error("Gagal memuat daftar proyek");
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
