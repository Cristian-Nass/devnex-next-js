import nodemailer from "nodemailer";
import { env } from "../config.js";

const transport = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendSiteCredentials(opts: {
  to: string;
  fqdn: string;
  adminUser: string;
  adminPassword: string;
}): Promise<void> {
  const loginUrl = `https://${opts.fqdn}/wp-admin`;
  const text = [
    `Your WordPress site is ready.`,
    ``,
    `Site URL: https://${opts.fqdn}`,
    `Admin URL: ${loginUrl}`,
    `Username: ${opts.adminUser}`,
    `Password: ${opts.adminPassword}`,
    ``,
    `Change your password after first login.`,
  ].join("\n");

  await transport.sendMail({
    from: env.SMTP_FROM,
    to: opts.to,
    subject: `WordPress ready: ${opts.fqdn}`,
    text,
  });
}
