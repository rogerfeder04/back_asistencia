import nodemailer from 'nodemailer';

// Crear una función para configurar el transporte de correos
const createTransport = () => {
  return nodemailer.createTransport({
    service: 'Gmail', // O el servicio que uses
    auth: {
      user: process.env.EMAIL_USER, // Configura estas variables en tu archivo .env
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Función para enviar correos electrónicos
export const sendEmail = async (to, subject, text, html = '') => {
  const transporter = createTransport();

  const mailOptions = {
    from: process.env.EMAIL_USER, // El correo que envía el mensaje
    to, // El destinatario
    subject, // El asunto del correo
    text, // El contenido en texto
    html, // (Opcional) contenido en HTML
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw error;
  }
};