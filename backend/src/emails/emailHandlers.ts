import transporter from "../lib/nodemailer";
import { createWelcomeEmailTemplate } from "./emailTemplates";
import { ENV } from "../lib/env";
export async function sendWelcomeEmail(
  name: string,
  email: string,
  clientURL: string
) {
    
  await transporter.sendMail({
    from: `"ChatZone" <${ENV.GMAIL_USER}>`,
    to: email,
    subject: `Welcome to ChatZone`,
    html: createWelcomeEmailTemplate(name, clientURL),
    replyTo: ENV.GMAIL_USER,
  });


}