import { useState, useEffect } from "react";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "motion/react";
import CertificateManager from "./admin/managers/CertificateManager";
import ExperienceManager from "./admin/managers/ExperienceManager";
import ProjectManager from "./admin/managers/ProjectManager";
import ProjectDetailManager from "./admin/managers/ProjectDetailManager";
import SkillManager from "./admin/managers/SkillManager";
import AboutPhotoManager from "./admin/managers/AboutPhotoManager";
import MessageManager from "./admin/managers/messagemanager";
import AdminLayout from "./admin/AdminLayout";
import { User as UserIcon } from "lucide-react";

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [activeMenu, setActiveMenu] = useState("projects");
  const [isLoading, setIsLoading] = useState(true);
  const { id: editDetailId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(
        ({
          data: { session },
        }: {
          data: { session: import("@supabase/supabase-js").Session | null };
        }) => {
          setUser(session?.user ?? null);
          setIsLoading(false);
        },
      );
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
          <UserIcon className="text-blue-500" size={40} />
        </div>
        <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">
          Access Denied
        </h1>
        <p className="text-slate-400 mb-8 max-w-sm">
          Please login with your administrator credentials to access the panel.
        </p>
        <a
          href="/login"
          className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
        >
          Return to Login
        </a>
      </div>
    );
  }

  return (
    <AdminLayout
      user={user}
      onLogout={handleLogout}
      activeMenu={editDetailId ? "project-detail" : activeMenu}
      setActiveMenu={(menu) => {
        if (editDetailId) {
          navigate("/admin");
        }
        setActiveMenu(menu);
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={editDetailId ? `detail-${editDetailId}` : activeMenu}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="max-w-5xl mx-auto pb-20"
        >
          {editDetailId ? (
            <ProjectDetailManager
              projectId={editDetailId}
              onBack={() => navigate("/admin")}
            />
          ) : (
            <>
              {activeMenu === "projects" && <ProjectManager />}
              {activeMenu === "messages" && <MessageManager />}
              {activeMenu === "certifications" && <CertificateManager />}
              {activeMenu === "experience" && <ExperienceManager />}
              {activeMenu === "skills" && <SkillManager />}
              {activeMenu === "about" && <AboutPhotoManager />}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </AdminLayout>
  );
}
