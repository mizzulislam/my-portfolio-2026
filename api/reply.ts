import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Tambahkan pengecekan metode (Sangat Penting)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metode tidak diizinkan" });
  }

  const { to, subject, replyText } = req.body;
  const timestamp = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date());
  const cleanSubject = subject
    ? `${subject} \u200B`
    : "Balasan Untuk Pesan Anda \u200B";

  try {
    // 2. Kirim Email
    const { data, error } = await resend.emails.send({
      from: "Muhammad Izzul Islam <admin@mizzulislam.site>",
      to: [to],
      subject: cleanSubject,
      headers: {
        "Message-ID": `<${Date.now()}@mizzulislam.site>`,
        "In-Reply-To": "",
        References: "",
      },
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              .container { font-family: sans-serif; background-color: #d1d5db; padding: 40px 20px; color: #ffffff; }
              .card { max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 24px; overflow: hidden; border: 1px solid #334155; }
              .header { background: linear-gradient(to bottom, #3b82f6, #1d4ed8); padding: 40px; text-align: center; }
              .logo { width: 120px; margin-bottom: 20px; }
              .content { padding: 40px; }
              .info-grid { display: table; width: 100%; margin-bottom: 30px; }
              .info-box { display: table-cell; background: #0f172a; border: 1px solid #334155; border-radius: 16px; padding: 15px; width: 48%; }
              .label { font-size: 10px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 5px; }
              .value { font-size: 14px; font-weight: bold; color: #f8fafc; }
              .message-body { background: #0f172a; border-radius: 16px; padding: 25px; border: 1px solid #334155; line-height: 1.6; color: #cbd5e1; }
              .footer { padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="card">
                <div class="header">
                  <img src="https://mizzulislam.site/portfolio-logo.png" alt="Logo" class="logo" />
                  <h1 style="margin:0; font-size: 28px;">New Message Reply</h1>
                  <p style="margin:10px 0 0; opacity: 0.8;">Muhammad Izzul Islam has responded to you</p>
                </div>
                <div class="content">
                  <div class="info-grid">
                    <div class="info-box">
                      <div class="label">Sender Name</div>
                      <div class="value">Muhammad Izzul Islam</div>
                    </div>
                    <div style="display: table-cell; width: 4%;"></div>
                    <div class="info-box">
                      <div class="label">Time Stamp</div>
                      <div class="value">${timestamp} WIB</div>
                    </div>
                  </div>
                  <div style="margin-top: 20px;">
                    <div class="label" style="margin-bottom: 10px;">Message Content</div>
                    <div class="message-body">${replyText}</div>
                  </div>
                </div>
                <div class="footer">
                  <p>© 2026 Muhammad Izzul Islam. All Rights Reserved.</p>
                  <p>This is an automated notification from Izzul's Portfolio.</p>
                  <p style="font-size: 10px; opacity: 0.5; margin-top: 10px;">
                    Trace ID: ${Math.random().toString(36).substring(2, 15).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </body>
        </html>
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
