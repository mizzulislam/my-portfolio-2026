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
      from: "Muhammad Izzul Islam <mizzulislam@gmail.com>",
      to: [to],
      subject: subject || "Balasan Pesan",
      html: `
      <div style="font-family: sans-serif; background-color: #f4f4f7; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background-color: #2563eb; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Tanggapan Portofolio</h1>
          </div>
          <div style="padding: 30px; color: #334155;">
            <p>Halo,</p>
            <p>Terima kasih telah menghubungi saya. Berikut adalah balasan untuk pesan Anda:</p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #2563eb; margin: 20px 0;">
              <p style="margin: 0; font-style: italic;">"${replyText}"</p>
            </div>
            <p>Salam hangat,</p>
            <p><strong>Muhammad Izzul Islam</strong></p>
          </div>
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            © 2026 Muhammad Izzul Islam. All Rights Reserved.
          </div>
        </div>
      </div>
    `,
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
