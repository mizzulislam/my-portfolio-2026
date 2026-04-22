import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending email
  app.post("/api/contact", async (req, res) => {
    const { name, lastName, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Cek credentials PERTAMA
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP credentials not provided.");
      return res.status(500).json({
        error:
          "Server configuration error. Contact form is currently disabled.",
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

      const mailOptions = {
        from: `"Portfolio Contact" <${process.env.SMTP_USER}>`, // ✅ pakai SMTP user
        replyTo: `"${name} ${lastName}" <${email}>`, // ✅ reply ke pengirim
        to: "mizzulislam.id@gmail.com",
        subject: `New Portfolio Message from ${name}`,
        text: `Name: ${name} ${lastName}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
        <h3>New Message from Portfolio</h3>
        <p><strong>Name:</strong> ${name} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Email sent successfully!" });
    } catch (error: any) {
      console.error("Error sending email:", error);
      res
        .status(500)
        .json({ error: "Failed to send email", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
