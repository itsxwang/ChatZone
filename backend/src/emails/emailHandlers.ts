import transporter from "../lib/nodemailer";
import { createWelcomeEmailTemplate } from "./emailTemplates";
import dotenv from "dotenv";

dotenv.config();

export async function sendWelcomeEmail(
  name: string,
  email: string,
  clientURL: string
) {
    
  await transporter.sendMail({
    from: `"ChatZone" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Welcome to ChatZone`,
    html: createWelcomeEmailTemplate(name, clientURL),
    replyTo: process.env.GMAIL_USER,
  });


}
