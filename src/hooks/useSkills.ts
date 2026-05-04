import { useState, useEffect } from "react";
import { skillsApi } from "@/src/lib/api/skills";
import { toast } from "react-hot-toast";
import type { SoftSkillDB, HardSkillDB, TechnicalSkillDB } from "@/src/types";

export function useSkills() {
  const [softSkills, setSoftSkills] = useState<SoftSkillDB[]>([]);
  const [hardSkills, setHardSkills] = useState<HardSkillDB[]>([]);
  const [technicalSkills, setTechnicalSkills] = useState<TechnicalSkillDB[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllSkills = async () => {
    setIsLoading(true);
    try {
      const [soft, hard, tech] = await Promise.all([
        skillsApi.getSoftSkills(),
        skillsApi.getHardSkills(),
        skillsApi.getTechnicalSkills(),
      ]);
      setSoftSkills(soft || []);
      setHardSkills(hard || []);
      setTechnicalSkills(tech || []);
    } catch (err) {
      toast.error("Gagal memuat data keahlian");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSkills();
  }, []);

  return {
    softSkills,
    setSoftSkills,
    hardSkills,
    setHardSkills,
    technicalSkills,
    setTechnicalSkills,
    isLoading,
    fetchAllSkills,
  };
}
