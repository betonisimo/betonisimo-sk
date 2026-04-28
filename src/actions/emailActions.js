"use server";

import { Resend } from 'resend';
import { google } from "googleapis";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(formData) {
  // 1. Извлекаем все поля из формы
  const data = {
    name: formData.get('name') || "Nezadané",
    phone: formData.get('phone') || "Nezadané",
    email: formData.get('email') || "Nezadané",
    dlzka: formData.get('dlzka') || "Nezadané",
    vyska: formData.get('vyska') || "Nezadané",
    prevedenie: formData.get('prevedenie') || "Nezadané",
    druhBetonu: formData.get('druhBetonu') || "Nezadané",
    farba: formData.get('farba') || "Nezadané",
    miesto: formData.get('miesto') || "Nezadané",
    message: formData.get('message') || "",
  };

  if (!data.name || !data.phone || !data.email) {
    return { success: false, error: "Všetky základné polia musia byť vyplnené." };
  }

  try {
    // 2. ИНТЕГРАЦИЯ С GOOGLE SHEETS
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });
      
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'A:K', 
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            new Date().toLocaleString('sk-SK'), 
            data.name, data.email, `'${data.phone}`, data.dlzka, 
            data.vyska, data.prevedenie, data.druhBetonu, 
            data.farba, data.miesto, data.message || "Bez správy"
          ]],
        },
      });
      console.log("Dáta úspešne zapísané do Google Sheets.");
    } catch (sheetError) {
      console.error("Google Sheets Error:", sheetError);
    }

    // 3. ОТПРАВКА EMAIL ЧЕРЕЗ RESEND
    const { error } = await resend.emails.send({
      from: 'Web Dopyt <onboarding@resend.dev>', 
      // ВАЖНО: Только на этот email, пока не подтвердишь домен!
      to: ['betonisimo.sk@gmail.com'], 
      subject: `Nová správa od: ${data.name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #d90416; text-transform: uppercase;">Nový dopyt z webu</h2>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p><strong>Meno:</strong> ${data.name}</p>
          <p><strong>Telefón:</strong> ${data.phone}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Lokalita:</strong> ${data.miesto}</p>

          <h3 style="color: #333; margin-top: 20px;">Špecifikácia oplotenia</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f9f9f9;"><td style="padding: 8px; border: 1px solid #eee;"><strong>Dĺžka:</strong></td><td style="padding: 8px; border: 1px solid #eee;">${data.dlzka}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #eee;"><strong>Výška:</strong></td><td style="padding: 8px; border: 1px solid #eee;">${data.vyska}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 8px; border: 1px solid #eee;"><strong>Prevedenie:</strong></td><td style="padding: 8px; border: 1px solid #eee;">${data.prevedenie}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #eee;"><strong>Druh betónu:</strong></td><td style="padding: 8px; border: 1px solid #eee;">${data.druhBetonu}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 8px; border: 1px solid #eee;"><strong>Farba:</strong></td><td style="padding: 8px; border: 1px solid #eee;">${data.farba}</td></tr>
          </table>

          <h3 style="color: #333; margin-top: 20px;">Správa:</h3>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
            ${data.message ? data.message.replace(/\n/g, '<br />') : "Žiadna dodatočná správa."}
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