import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, lastName, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.status(500).json({
      error: "Server configuration error. Contact form is currently disabled.",
      details: "Missing SMTP credentials in environment variables.",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const syncTimeStr = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

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
            body { margin: 0; padding: 0; background-color: #020617; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
            a { color: #3b82f6; text-decoration: none; }
          </style>
        </head>
        <body>
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #e6e7f0; padding: 40px 10px;">
            <tr>
              <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; background-color: #0f172a; border-radius: 28px; overflow: hidden; border: 0px solid #1e293b; box-shadow: 0 20px 50px rgba(0,0,0,0.3);">
                  
                  <tr>
                    <td align="center" style="padding: 50px 40px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #0ea5e9 100%);">
                      <img src="https://izzuls-portfolio.vercel.app/portfolio-logo.png" alt="Portfolio Logo" width="180" style="display: block; margin-bottom: 24px; filter: drop-shadow(0 8px 12px rgba(0,0,0,0.2));">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.04em; line-height: 1.1;">New Message Request</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0; font-size: 15px; font-weight: 500;">Someone Just Messaged You</p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 40px 30px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                        <tr>
                          <td width="48%" style="padding: 24px; background-color: rgba(30, 41, 59, 0.5); border-radius: 20px; border: 1px solid rgba(59, 130, 246, 0.1);">
                            <div style="font-size: 11px; font-weight: 700; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Sender Name</div>
                            <div style="font-size: 16px; font-weight: 600; color: #f1f5f9;">${name} ${lastName}</div>
                          </td>
                          <td width="4%"></td>
                          <td width="48%" style="padding: 24px; background-color: rgba(30, 41, 59, 0.5); border-radius: 20px; border: 1px solid rgba(59, 130, 246, 0.1);">
                            <div style="font-size: 11px; font-weight: 700; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Time Stamp</div>
                            <div style="font-size: 16px; font-weight: 600; color: #f1f5f9;">${syncTimeStr}</div>
                          </td>
                        </tr>
                      </table>

                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 35px;">
                        <tr>
                          <td style="padding: 24px; background-color: rgba(30, 41, 59, 0.5); border-radius: 20px; border: 1px solid rgba(59, 130, 246, 0.1);">
                            <div style="font-size: 11px; font-weight: 700; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Email Contact</div>
                            <div style="font-size: 16px; font-weight: 600; color: #3b82f6;">${email}</div>
                          </td>
                        </tr>
                      </table>

                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="padding: 0 10px 12px 10px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">Message Content</td>
                        </tr>
                        <tr>
                          <td style="padding: 35px; background: linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%); border-radius: 24px; border: 1px solid rgba(59, 130, 246, 0.15); color: #e2e8f0; font-size: 17px; line-height: 1.8;">
                            ${message.replace(/\n/g, "<br>")}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding: 40px; background-color: #0f172a; border-top: 1px solid rgba(59, 130, 246, 0.1);">
                      <p style="margin: 0; font-size: 13px; color: #64748b; font-weight: 500;">&copy; ${new Date().getFullYear()} Muhammad Izzul Islam. All Rights Reserved.</p>
                      <table border="0" cellpadding="0" cellspacing="0" width="80%" style="margin: 20px 0;">
                        <tr>
                          <td height="1" style="background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);"></td>
                        </tr>
                      </table>
                      <p style="margin: 0; font-size: 11px; color: #475569; letter-spacing: 0.02em;">This is an encrypted automated notification from Izzul's Portfolio CRM.</p>
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

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Email sent successfully!" });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      error: "Failed to send email",
      details: error.message,
    });
  }
}
