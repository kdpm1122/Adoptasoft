const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'Adoptasoft <onboarding@resend.dev>';

async function sendPasswordResetEmail(to, resetLink) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Recupera tu contraseña — Adoptasoft',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #D9711A;">Adoptasoft 🐾</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>
          <a href="${resetLink}" style="display:inline-block; background:#D9711A; color:#fff; padding:12px 20px; border-radius:8px; text-decoration:none; font-weight:bold;">
            Crear nueva contraseña
          </a>
        </p>
        <p style="color:#8C7B6B; font-size:13px;">Este enlace expira en 1 hora. Si no solicitaste esto, ignora este correo.</p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail };
