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
      from: "Muhammad Izzul Islam <onboarding@resend.dev>",
      to: [to],
      subject: subject || "Balasan Pesan",
      html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020617; padding: 40px 20px; color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 24px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
          
          <!-- Header dengan Gradient Look -->
          <div style="background: linear-gradient(to bottom right, #2563eb, #4338ca); padding: 40px 20px; text-align: center;">
            <div style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #bfdbfe; margin-bottom: 8px;">2026 Portfolio</div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff;">New Message Reply</h1>
            <p style="color: #bfdbfe; font-size: 14px; margin-top: 8px;">Muhammad Izzul Islam has responded to you</p>
          </div>

          <div style="padding: 40px;">
            <!-- Card Informasi Pengirim -->
            <div style="background-color: #1e293b; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
              <table style="width: 100%;">
                <tr>
                  <td style="padding-bottom: 10px;">
                    <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Sender Name</span><br/>
                    <strong style="color: #ffffff;">Muhammad Izzul Islam</strong>
                  </td>
                  <td style="padding-bottom: 10px;">
                    <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Time Stamp</span><br/>
                    <strong style="color: #ffffff;">${new Date().toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}</strong>
                  </td>
                </tr>
                <tr>
                  <td colspan="2">
                    <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Email Contact</span><br/>
                    <a href="mailto:mizzulislam.id@gmail.com" style="color: #3b82f6; text-decoration: none;">mizzulislam.id@gmail.com</a>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Box Pesan -->
            <div style="margin-bottom: 10px;">
              <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Message Content</span>
            </div>
            <div style="background-color: #020617; border: 1px solid #1e293b; border-radius: 16px; padding: 24px; line-height: 1.6; color: #cbd5e1; font-style: italic;">
              "${replyText}"
            </div>

            <div style="margin-top: 40px; text-align: center; border-top: 1px solid #1e293b; pt: 30px;">
              <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
                © 2026 Muhammad Izzul Islam. All Rights Reserved.<br/>
                Sent from my Personal Portfolio CRM.
              </p>
            </div>
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
