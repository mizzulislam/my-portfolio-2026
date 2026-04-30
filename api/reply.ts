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
    const { data, error } = await resend.emails.send({
      from: "Muhammad Izzul Islam <onboarding@resend.dev>",
      to: [to],
      subject: subject || "Balasan Pesan",
      html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; background-color: #020617; min-height: 100vh; padding: 32px 16px; color: #e2e8f0;">
        <div style="max-width: 650px; margin: 0 auto; background: linear-gradient(180deg, rgba(15,23,42,0.95), rgba(15,23,42,0.98)); border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; overflow: hidden; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);">
          <div style="background: radial-gradient(circle at top right, rgba(56,189,248,0.16), transparent 45%), linear-gradient(180deg, rgba(56,189,248,0.12), rgba(15,23,42,0.95)); padding: 36px 28px; text-align: center;">
            <p style="margin:0; font-size: 12px; letter-spacing: 0.18em; color: #38bdf8; text-transform: uppercase;">Web Porto Notification</p>
            <h1 style="margin: 16px 0 0; font-size: 30px; line-height: 1.1; font-weight: 900; color: #ffffff;">Pesan Balasan dari Portfolio</h1>
            <p style="margin: 12px auto 0; font-size: 14px; color: #cbd5e1; max-width: 520px;">Balasan Anda dikirim langsung dari panel admin menggunakan layanan Resend.</p>
          </div>

          <div style="padding: 32px 28px;">
            <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 28px;">
              <div style="flex: 1 1 220px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 18px; min-width: 160px;">
                <p style="margin:0 0 8px; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #94a3b8;">To</p>
                <p style="margin:0; font-size: 14px; color: #ffffff;">${to}</p>
              </div>
              <div style="flex: 1 1 220px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 18px; min-width: 160px;">
                <p style="margin:0 0 8px; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #94a3b8;">Subject</p>
                <p style="margin:0; font-size: 14px; color: #ffffff;">${subject || "Balasan Pesan"}</p>
              </div>
            </div>

            <div style="background: #111827; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 28px; color: #cbd5e1; line-height: 1.75;">
              <p style="margin: 0 0 14px; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #94a3b8;">Isi Balasan</p>
              <div style="font-size: 15px; white-space: pre-wrap;">${replyText}</div>
            </div>
          </div>

          <div style="padding: 0 28px 32px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">© 2026 Muhammad Izzul Islam • Sent via Web Porto Admin</p>
          </div>
        </div>
      </div>
    `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return res.status(403).json({
        success: false,
        error: error.message, // Ini akan mengirim pesan "You can only send testing emails..." ke frontend
      });
    }

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
