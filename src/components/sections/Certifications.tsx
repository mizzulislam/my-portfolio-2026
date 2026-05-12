import React, { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { SectionHeader, CertCategoryCarousel } from "../ui";
import { SectionProps } from "../../types";
import { supabase } from "../../lib/supabase";

interface CertificationsProps extends SectionProps {
  lang: "en" | "id";
}

export function Certifications({ isDark, t, lang }: CertificationsProps) {
  const [categoriesToShow, setCategoriesToShow] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [descriptionsMap, setDescriptionsMap] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        setLoading(true);

        // 1. Ambil Kategori dari Supabase
        const { data: cats, error: catError } = await supabase
          .from("cert_categories")
          .select("*")
          .order("order", { ascending: true });

        // 2. Ambil Semua Sertifikat dari Supabase
        const { data: certs, error: certError } = await supabase
          .from("certifications")
          .select("*")
          .order("order", { ascending: true });

        if (catError || certError)
          throw new Error("Gagal mengambil data dari Supabase");

        if (cats && cats.length > 0) {
          // 3. Gabungkan dan Kelompokkan Data
          const grouped = cats.map((cat: any) => ({
            id: cat.id,
            icon: cat.icon || "Award", // Icon dari DB
            // Logika Bahasa: Gunakan ID jika ada, jika tidak pakai EN (fallback)
            name: lang === "id" ? cat.name_id || cat.name : cat.name,
            description:
              lang === "id"
                ? cat.description_id || cat.description
                : cat.description,

            // Filter sertifikat yang masuk ke kategori ini
            items: certs
              ? certs
                  .filter((cert: any) => cert.category_id === cat.id)
                  .map((cert: any) => ({
                    id: cert.id,
                    title:
                      lang === "id" ? cert.title_id || cert.title : cert.title,
                    image: cert.image_url || "", // Thumbnail tampil di sini
                    link: cert.link || "#",
                    issuer: cert.issuer,
                    credentialId: cert.credential_id,
                    date: `${cert.issue_month} ${cert.issue_year}`,
                  }))
              : [],
          }));

          const descMap: Record<string, string> = {};
          cats.forEach((cat: any) => {
            descMap[cat.id] =
              lang === "id"
                ? cat.description_id || cat.description
                : cat.description;
          });
          setDescriptionsMap(descMap);
          setCategoriesToShow(grouped);
        } else {
          // Fallback jika database kosong, gunakan data statis dari file translation
          setCategoriesToShow(t.certsCategories || []);
        }
      } catch (error) {
        console.error("Error fetching certifications:", error);
        // Jika error, tampilkan data statis agar UI tidak rusak
        setCategoriesToShow(t.certsCategories || []);
      } finally {
        setLoading(false);
      }
    };

    fetchCerts();
  }, [lang, t.certsCategories]); // Refresh jika bahasa atau data translasi berubah

  return (
    <section
      id="certifications"
      className={`py-24 transition-colors duration-500 overflow-hidden ${
        isDark ? "bg-[#020617]" : "bg-slate-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Header Seksi */}
        <SectionHeader
          title={t.certHeader}
          subTitle={t.certSub}
          icon={Award}
          isDark={isDark}
        />

        {/* State Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-slate-500 font-medium animate-pulse">
              Loading certificates...
            </p>
          </div>
        ) : (
          /* Komponen Utama Carousel */
          <div className="mt-12">
            <CertCategoryCarousel
              categories={categoriesToShow}
              descriptions={
                (Object.keys(descriptionsMap).length > 0
                  ? descriptionsMap
                  : t.certDescriptions) as any
              }
              isDark={isDark}
              viewCertBtnText={t.viewCertBtn}
              seeMoreBtnText={t.seeMoreBtn}
              t={t}
            />
          </div>
        )}
      </div>
    </section>
  );
}
