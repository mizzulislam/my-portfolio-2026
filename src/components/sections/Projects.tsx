import React, { useEffect, useState } from "react";
import { Rocket } from "lucide-react";
import { SectionHeader, ProjectFolders } from "../UIComponents";
import { supabase } from "../../lib/supabase";
import { Translation, ProjectItem } from "../../types";

interface ProjectsProps {
  isDark: boolean;
  t: Translation; // ← diganti dari any ke Translation
  lang: "en" | "id";
}

export function Projects({ isDark, t, lang }: ProjectsProps) {
  const [projectsFromDB, setProjectsFromDB] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("order", { ascending: true });

      if (data && data.length > 0) {
        setProjectsFromDB(data);
      }
      setLoading(false);
    };

    fetchProjects();
  }, []);

  // Format data dari Supabase agar sesuai dengan format yang diharapkan ProjectFolders
  const formattedProjects = projectsFromDB.map((p: any) => ({
    id: p.id,
    title: lang === "id" && p.title_id ? p.title_id : p.title,
    category:
      lang === "id" && p.category_id ? p.category_id : p.category || "Project",
    desc: lang === "id" && p.desc_id ? p.desc_id : p.description || "",
    details:
      lang === "id" && p.tags_id && p.tags_id.length > 0
        ? p.tags_id.filter((t: string) => t.trim() !== "")
        : Array.isArray(p.tags)
          ? p.tags.filter((t: string) => t.trim() !== "")
          : [],
    image: p.image_url || "",
    link: p.live_url || p.github_url || "#",
  }));

  // Kalau ada data dari Supabase, pakai itu. Kalau kosong, pakai data statis dari constants
  const projectsToShow =
    formattedProjects.length > 0 ? formattedProjects : t.projectsData;

  return (
    <section
      id="projects"
      className={`pt-8 pb-24 transition-colors ${isDark ? "bg-[#020617]" : "bg-white"}`}
    >
      <div className="max-w-7xl mx-auto px-6 text-center">
        <SectionHeader
          title={t.projectsHeader}
          subTitle={t.projectsSub}
          icon={Rocket}
          isDark={isDark}
        />
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <ProjectFolders
            projects={projectsToShow}
            isDark={isDark}
            labels={{
              criticalOutputs: t.projectCriticalOutputs,
              projectCriticalOutputs: t.projectCriticalOutputs,
              launchArchive: t.launchArchive,
              viewProjectBtn: t.viewProjectBtn,
            }}
          />
        )}
      </div>
    </section>
  );
}
