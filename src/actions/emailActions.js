"use server";

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(formData) {
  const name = formData.get('name');
  const phone = formData.get('phone');
  const email = formData.get('email');
  const message = formData.get('message');

  // Проверка на заполнение полей
  if (!name || !phone || !email || !message) {
    return { success: false, error: "Všetky polia musia byť vyplnené." };
  }

  try {
    const { data, error } = await resend.emails.send({
      // Пока домен не подтвержден, Resend разрешает отправлять только с этого адреса:
      from: 'Web Dopyt <onboarding@resend.dev>', 
      // Впиши сюда СВОЮ почту, на которую хочешь получать письма:
      to: ['betonisimo.sk@gmail.com'], 
      subject: `Nová správa od: ${name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">Nová dopyt z webovej stránky</h2>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p><strong>Meno:</strong> ${name}</p>
          <p><strong>Telefón:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Správa:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
            ${message.replace(/\n/g, '<br />')}
          </div>
          <p style="font-size: 12px; color: #999; margin-top: 20px;">Odoslané z formulára na beton-sk.sk</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error: "Chyba na strane poštového servera." };
    }

    return { success: true };
  } catch (error) {
    console.error("System Error:", error);
    return { success: false, error: "Systémová chyba pri odosielaní." };
  }
}