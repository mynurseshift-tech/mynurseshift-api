import nodemailer from "nodemailer";
import { createTransport } from "nodemailer";

export interface EmailData {
  firstName: string;
  lastName: string;
  approverName?: string;
  resetToken?: string;
  notificationType?: string;
  notificationDetails?: any;
}

// Configuration du transporteur d'email
const transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Style CSS commun pour tous les emails
const commonStyles = `
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background-color: #4a90e2; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
  .content { padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; }
  .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  .button { 
    display: inline-block; 
    padding: 10px 20px; 
    background-color: #4a90e2; 
    color: white; 
    text-decoration: none; 
    border-radius: 5px; 
    margin: 20px 0; 
  }
  .notification { 
    background-color: #f8f9fa; 
    border-left: 4px solid #4a90e2; 
    padding: 15px; 
    margin: 10px 0; 
  }
`;

// Template pour l'email de création de compte
const accountCreatedTemplate = (data: EmailData) => `
<!DOCTYPE html>
<html>
<head><style>${commonStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bienvenue sur MyNurseShift</h1>
    </div>
    <div class="content">
      <p>Bonjour ${data.firstName} ${data.lastName},</p>
      <p>Nous sommes ravis de vous accueillir sur MyNurseShift !</p>
      <p>Votre compte a été créé avec succès et est actuellement en cours d'examen par notre équipe. 
         Ce processus nous permet de garantir la qualité et la sécurité de notre plateforme.</p>
      <p>Vous recevrez un email dès que votre compte sera validé.</p>
      <p>En attendant, n'hésitez pas à nous contacter si vous avez des questions.</p>
      <p>Cordialement,<br>L'équipe MyNurseShift</p>
    </div>
    <div class="footer">
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
`;

// Template pour l'email d'activation de compte
const accountActivatedTemplate = (data: EmailData) => `
<!DOCTYPE html>
<html>
<head><style>${commonStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>Compte Activé</h1>
    </div>
    <div class="content">
      <p>Félicitations ${data.firstName} ${data.lastName} !</p>
      <p>Votre compte MyNurseShift a été validé par ${data.approverName}.</p>
      <p>Vous pouvez maintenant vous connecter et accéder à tous nos services.</p>
      <a href="${process.env.FRONTEND_URL}/login" class="button">Se connecter</a>
      <p>Nous vous souhaitons une excellente expérience sur notre plateforme.</p>
      <p>Cordialement,<br>L'équipe MyNurseShift</p>
    </div>
    <div class="footer">
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
`;

// Template pour l'email de réinitialisation de mot de passe
const passwordResetTemplate = (data: EmailData) => `
<!DOCTYPE html>
<html>
<head><style>${commonStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>Réinitialisation de mot de passe</h1>
    </div>
    <div class="content">
      <p>Bonjour ${data.firstName} ${data.lastName},</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
      <a href="${process.env.FRONTEND_URL}/reset-password?token=${data.resetToken}" class="button">
        Réinitialiser mon mot de passe
      </a>
      <p><strong>Ce lien est valable pendant 1 heure.</strong></p>
      <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      <p>Cordialement,<br>L'équipe MyNurseShift</p>
    </div>
    <div class="footer">
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
`;

// Template pour les notifications
const notificationTemplate = (data: EmailData) => `
<!DOCTYPE html>
<html>
<head><style>${commonStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>Notification MyNurseShift</h1>
    </div>
    <div class="content">
      <p>Bonjour ${data.firstName} ${data.lastName},</p>
      <div class="notification">
        <h3>${data.notificationType}</h3>
        <p>${data.notificationDetails}</p>
      </div>
      <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Voir les détails</a>
      <p>Cordialement,<br>L'équipe MyNurseShift</p>
    </div>
    <div class="footer">
      <p>Pour gérer vos préférences de notifications, rendez-vous dans les paramètres de votre compte.</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
`;

// Template pour l'email de refus d'inscription
const accountRejectedTemplate = (data: EmailData) => `
<!DOCTYPE html>
<html>
<head><style>${commonStyles}</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>Demande d'inscription refusée</h1>
    </div>
    <div class="content">
      <p>Bonjour ${data.firstName} ${data.lastName},</p>
      <p>Nous regrettons de vous informer que votre demande d'inscription à MyNurseShift a été refusée par ${data.approverName}.</p>
      <p>Pour plus d'informations sur cette décision, nous vous invitons à :</p>
      <ul>
        <li>Contacter votre service directement</li>
        <li>Ou contacter notre support à l'adresse : <a href="mailto:support@mynurseshift.com">support@mynurseshift.com</a></li>
      </ul>
      <p>Si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à nous contacter.</p>
      <p>Cordialement,<br>L'équipe MyNurseShift</p>
    </div>
    <div class="footer">
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
`;

// Fonction d'envoi d'email générique avec gestion d'erreurs
const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"MyNurseShift" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email envoyé:", info.messageId);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
};

// Email de création de compte
export const sendAccountCreatedEmail = async (to: string, data: EmailData) => {
  return sendEmail(
    to,
    "Bienvenue sur MyNurseShift - Compte créé avec succès",
    accountCreatedTemplate(data)
  );
};

// Email d'activation du compte
export const sendAccountActivatedEmail = async (to: string, data: EmailData) => {
  return sendEmail(
    to,
    "Votre compte MyNurseShift est maintenant actif",
    accountActivatedTemplate(data)
  );
};

// Email de réinitialisation de mot de passe
export const sendPasswordResetEmail = async (to: string, data: EmailData) => {
  return sendEmail(
    to,
    "Réinitialisation de votre mot de passe MyNurseShift",
    passwordResetTemplate(data)
  );
};

// Email de notification
export const sendNotificationEmail = async (to: string, data: EmailData) => {
  return sendEmail(
    to,
    `MyNurseShift - ${data.notificationType}`,
    notificationTemplate(data)
  );
};

// Email de refus d'inscription
export const sendAccountRejectedEmail = async (to: string, data: EmailData): Promise<boolean> => {
  try {
    await sendEmail(
      to,
      "Demande d'inscription refusée - MyNurseShift",
      accountRejectedTemplate(data)
    );
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de refus:", error);
    return false;
  }
};
