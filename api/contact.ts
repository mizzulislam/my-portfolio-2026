import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";
import { z } from "zod";

// 1. Definisikan Aturan Validasi (Schema)
const contactSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 huruf").max(50),
  lastName: z.string().max(50).optional().default(""),
  email: z.string().email("Format email salah"),
  message: z.string().min(10, "Pesan minimal 10 karakter").max(1000),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Hanya izinkan metode POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 2. Validasi data input menggunakan Zod
    const validatedData = contactSchema.parse(req.body);
    const { name, lastName, email, message } = validatedData;

    // 3. Cek Kredensial SMTP di Environment Variables
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({
        error:
          "Server configuration error. Contact form is currently disabled.",
      });
    }

    // 4. Konfigurasi Transport Mailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 5. Format Waktu Indonesia untuk Email
    const syncTimeStr = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // 6. Konfigurasi Konten Email (Template HTML Anda)
    const mailOptions = {
      from: `"Izzul's Portfolio" <${process.env.SMTP_USER}>`,
      replyTo: email,
      to: "mizzulislam.id@gmail.com",
      subject: `🚀 New Connection: Message from ${name} ${lastName}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 0; background-color: #020617; font-family: sans-serif; }
          </style>
        </head>
        <body>
          <table width="100%" style="background-color: #e6e7f0; padding: 20px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width: 600px; background-color: #0f172a; border-radius: 20px; overflow: hidden; color: #ffffff;">
                  <tr>
                    <td style="padding: 40px; background: linear-gradient(135deg, #1e3a8a, #3b82f6);">
                      <h1 style="margin: 0;">New Message</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px;">
                      <p><strong>From:</strong> ${name} ${lastName}</p>
                      <p><strong>Email:</strong> ${email}</p>
                      <p><strong>Time:</strong> ${syncTimeStr}</p>
                      <hr style="border: 0; border-top: 1px solid #1e293b; margin: 20px 0;">
                      <p style="white-space: pre-wrap;">${message}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    // 7. Kirim Email
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Email sent successfully!" });
  } catch (error: any) {
    // FIX: Tangani error validasi Zod
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: error.issues[0].message,
      });
    }

    // Tangani error teknis lainnya
    // PERBAIKAN: error.message dihapus dari response agar tidak
    // membocorkan detail teknis internal server ke pengguna
    console.error("Error:", error);
    return res.status(500).json({
      error: "Gagal mengirim pesan. Silakan coba lagi nanti.",
    });
  }
}
