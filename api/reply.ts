import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Tambahkan pengecekan metode (Sangat Penting)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metode tidak diizinkan" });
  }

  const { to, subject, replyText } = req.body;

  try {
    // 2. Kirim Email
    const data = await resend.emails.send({
      from: "Portfolio Admin <onboarding@resend.dev>",
      to: [to],
      subject: subject || "Balasan Pesan",
      text: replyText,
    });

    // 3. WAJIB: Kirim jawaban sukses ke Frontend agar loading berhenti
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error("Error dari Resend:", error);
    // 4. WAJIB: Kirim jawaban gagal ke Frontend agar loading berhenti dan muncul error
    return res
      .status(500)
      .json({ error: error.message || "Gagal mengirim email" });
  }
}
