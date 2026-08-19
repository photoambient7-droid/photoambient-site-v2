// Vercel Serverless Function — Contact Form API via Resend

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, type, message, lang = 'en', _gotcha } = req.body || {};

    // 1. Armadilha Anti-Spam (Honeypot)
    if (_gotcha) {
      return res.status(200).json({ success: true, message: 'Spam detected silently' });
    }

    // 2. Validação dos Campos Obrigatórios
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required fields.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY environment variable is not defined.');
      return res.status(500).json({ error: 'Server misconfiguration: RESEND_API_KEY missing.' });
    }

    // Remetente padrão (usando domínio próprio ou fallback seguro do Resend)
    const senderEmail = process.env.RESEND_FROM_EMAIL || 'PhotoAmbient Contact <contact@photoambient.com>';
    const fallbackSender = 'PhotoAmbient Contact <onboarding@resend.dev>';
    const targetOwnerEmail = 'photoambient.7@gmail.com';

    // Conteúdo formatado para a equipe PhotoAmbient
    const ownerHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0d0d; color: #f0f0f0; border-radius: 12px; padding: 30px; border: 1px solid #222;">
        <h2 style="color: #ffffff; font-size: 22px; border-bottom: 1px solid #333; padding-bottom: 12px; margin-top: 0;">📸 Novo Contato do Site — PhotoAmbient</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px 0; color: #888; width: 140px;"><strong>Nome:</strong></td>
            <td style="padding: 8px 0; color: #fff;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;"><strong>E-mail:</strong></td>
            <td style="padding: 8px 0; color: #fff;"><a href="mailto:${escapeHtml(email)}" style="color: #4da6ff; text-decoration: none;">${escapeHtml(email)}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;"><strong>Telefone:</strong></td>
            <td style="padding: 8px 0; color: #fff;">${escapeHtml(phone || 'Não informado')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;"><strong>Categoria:</strong></td>
            <td style="padding: 8px 0; color: #fff;">${escapeHtml(type || 'Geral')}</td>
          </tr>
        </table>
        <div style="margin-top: 24px; background: #161616; padding: 16px; border-radius: 8px; border-left: 3px solid #4da6ff;">
          <strong style="color: #888; display: block; margin-bottom: 8px;">Mensagem do Cliente:</strong>
          <p style="margin: 0; white-space: pre-wrap; line-height: 1.6; color: #eee;">${escapeHtml(message)}</p>
        </div>
        <footer style="margin-top: 24px; text-align: center; color: #555; font-size: 12px;">
          Enviado via formulário oficial photoambient.com · Philadelphia, PA
        </footer>
      </div>
    `;

    // Dispara o e-mail principal para a Photoambient
    let ownerRes = await sendResendEmail(resendApiKey, {
      from: senderEmail,
      to: [targetOwnerEmail],
      reply_to: email,
      subject: `Novo Contato: ${type || 'Geral'} — ${name}`,
      html: ownerHtmlContent
    });

    if (!ownerRes.ok && ownerRes.status === 403) {
      console.log('Tentando fallback para onboarding@resend.dev...');
      ownerRes = await sendResendEmail(resendApiKey, {
        from: fallbackSender,
        to: [targetOwnerEmail],
        reply_to: email,
        subject: `Novo Contato: ${type || 'Geral'} — ${name}`,
        html: ownerHtmlContent
      });
    }

    if (!ownerRes.ok) {
      const errData = await ownerRes.json().catch(() => ({}));
      console.error('Erro Resend:', errData);
      return res.status(500).json({ error: errData.message || 'Falha ao enviar e-mail via Resend.' });
    }

    // 3. Envia e-mail automático de confirmação para o cliente
    const confirmSubjects = {
      pt: 'Recebemos sua mensagem — PhotoAmbient',
      es: 'Hemos recibido tu mensaje — PhotoAmbient',
      en: 'We received your message — PhotoAmbient'
    };

    const confirmMessages = {
      pt: {
        title: 'Obrigado por entrar em contato!',
        text: `Olá ${escapeHtml(name)}, recebemos sua mensagem referente a <strong>${escapeHtml(type || 'Fotografia')}</strong> e retornaremos em breve.`
      },
      es: {
        title: '¡Gracias por contactarnos!',
        text: `Hola ${escapeHtml(name)}, hemos recibido tu mensaje sobre <strong>${escapeHtml(type || 'Fotografía')}</strong> y te responderemos muy pronto.`
      },
      en: {
        title: 'Thank you for reaching out!',
        text: `Hi ${escapeHtml(name)}, we have received your message regarding <strong>${escapeHtml(type || 'Photography')}</strong> and will get back to you shortly.`
      }
    };

    const clientLang = ['pt', 'es', 'en'].includes(lang) ? lang : 'en';
    const clientCopy = confirmMessages[clientLang];

    const clientHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0d0d; color: #f0f0f0; border-radius: 12px; padding: 30px; border: 1px solid #222;">
        <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">${clientCopy.title}</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #ccc;">${clientCopy.text}</p>
        <div style="margin-top: 20px; padding: 15px; background: #161616; border-radius: 8px; font-size: 14px; color: #888;">
          <p style="margin: 0;"><strong>PhotoAmbient</strong> — Photography · Films · Visual Stories</p>
          <p style="margin: 4px 0 0 0;">Philadelphia, PA · (646) 836-4708 · photoambient.7@gmail.com</p>
        </div>
      </div>
    `;

    sendResendEmail(resendApiKey, {
      from: senderEmail,
      to: [email],
      subject: confirmSubjects[clientLang],
      html: clientHtmlContent
    }).catch(err => console.error('Erro na confirmação ao cliente:', err));

    return res.status(200).json({ success: true, message: 'Message sent successfully!' });

  } catch (error) {
    console.error('Erro no servidor de e-mail:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

async function sendResendEmail(apiKey, payload) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
