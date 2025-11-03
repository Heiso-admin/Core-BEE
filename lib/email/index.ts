import { Resend } from "resend";
import config from "@/config";
import { settings } from "@/config";
import { ForgotPasswordEmail } from "@/emails/forgot-password";
import { InviteUserEmail } from "@/emails/invite-user";
import { getSiteSettings } from "@/server/services/system/setting";
import InviteOwnerEmail from "@/emails/invite-owner";

const { RESEND_API_KEY } = await settings();
const resend = new Resend(RESEND_API_KEY as string);

export async function sendEmail({
  from,
  to,
  subject,
  body,
}: {
  from: string;
  to: string[];
  subject: string;
  body: string | React.ReactNode;
}) {
  return await resend.emails.send({
    from,
    to,
    subject,
    html: typeof body === "string" ? body : undefined,
    react: typeof body !== "string" ? body : undefined,
  });
}

export async function sendInviteUserEmail({
  from,
  to,
  subject,
  orgName,
  inviteLink,
  owner = false
}: {
  from: string;
  to: string[];
  subject: string;
  orgName: string;
  inviteLink: string;
  owner?: boolean;
}) {
  const site = await getSiteSettings();
  const { BASE_HOST } = await settings();
  const siteLogo = (site as any)?.assets?.logo || "/images/logo.png";
  const derivedLogoUrl = (typeof siteLogo === "string" && siteLogo.startsWith("http")
    ? siteLogo
    : `${BASE_HOST}${siteLogo}`);
  const emailType ={
    logoUrl: derivedLogoUrl,
    orgName,
    inviteLink,
  }

  const email = owner? InviteOwnerEmail(emailType) : InviteUserEmail(emailType);
  return await sendEmail({ from, to, subject, body: email });
}

export async function sendForgotPasswordEmail({
  from,
  to,
  subject,
  name,
  resetLink,
}: {
  from: string;
  to: string[];
  subject: string;
  name?: string;
  resetLink: string;
}) {
  const site = await getSiteSettings();
  const { BASE_HOST } = await settings();
  const siteLogo = (site as any)?.assets?.logo || config?.site?.logo?.url || "/images/logo.png";
  const derivedLogoUrl = (typeof siteLogo === "string" && siteLogo.startsWith("http"))
    ? siteLogo
    : `${BASE_HOST}${siteLogo}`;

  const email = ForgotPasswordEmail({
    resetLink,
    orgName: name || (config?.site?.name as string) || "Heiso",
    logoUrl: derivedLogoUrl,
  });

  return await sendEmail({
    from,
    to,
    subject: subject || "Reset your password",
    body: email,
  });
}
