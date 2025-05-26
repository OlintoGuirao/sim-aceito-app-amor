import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { to, name, qrCodeUrl } = req.body;

  if (!to || !name || !qrCodeUrl) {
    return res.status(400).json({ message: 'Dados incompletos' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject: 'Confirme sua presença no nosso casamento',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #5f161c; text-align: center;">Olá, ${name}!</h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Estamos muito felizes em convidá-lo(a) para celebrar nosso casamento!
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Para confirmar sua presença, por favor, clique no link abaixo ou escaneie o QR Code:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${qrCodeUrl}" 
               style="background-color: #5f161c; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Confirmar Presença
            </a>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Detalhes do Evento:
          </p>
          
          <ul style="font-size: 16px; line-height: 1.6; color: #333;">
            <li>📅 Data: 15 de Junho de 2024</li>
            <li>⏰ Horário: 19:00</li>
            <li>📍 Local: Salão Crystal</li>
          </ul>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Contamos com sua presença para tornar este momento ainda mais especial!
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Com carinho,<br>
            Olinto e Noiva
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email enviado com sucesso' });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    res.status(500).json({ message: 'Erro ao enviar email' });
  }
} 