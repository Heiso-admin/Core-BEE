import { Resend } from "resend";
import config from "@/config";
import { settings } from "@/config";
import { ForgotPasswordEmail } from "@/emails/forgot-password";
import { InviteUserEmail } from "@/emails/invite-user";
import { getSiteSettings } from "@/server/services/system/setting";
import InviteOwnerEmail from "@/emails/invite-owner";
import ApprovedEmail from "@/emails/approved";

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
  owner = false,
  inviteToken,
}: {
  from: string;
  to: string[];
  owner?: boolean;
  inviteToken: string;
}) {
  const site: any = await getSiteSettings();
  const { BASE_HOST } = await settings();

  const siteLogo = site?.assets?.logo || "/images/logo.png";
  const derivedLogoUrl = (typeof siteLogo === "string" && siteLogo.startsWith("http")
    ? siteLogo
    : `${BASE_HOST}${siteLogo}`);
  const orgName = site?.branding?.organization || config?.site?.organization;
  const subject = `Verify Your Email Address for ${orgName}`
  const inviteLink = `${BASE_HOST}/dashboard/join?token=${inviteToken}`

  const emailType = {
    logoUrl: derivedLogoUrl,
    orgName,
    inviteLink,
  }

  const email = owner ? InviteOwnerEmail(emailType) : InviteUserEmail(emailType);
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
  const site: any = await getSiteSettings();
  const { BASE_HOST } = await settings();
  const siteLogo = site?.assets?.logo || "/images/logo.png";
  const derivedLogoUrl = (typeof siteLogo === "string" && siteLogo.startsWith("http")
    ? siteLogo
    : `${BASE_HOST}${siteLogo}`);
  const orgName = site?.branding?.organization || config?.site?.organization;

  const email = ForgotPasswordEmail({
    resetLink,
    orgName: orgName,
    logoUrl: derivedLogoUrl,
  });

  return await sendEmail({
    from,
    to,
    subject: subject || "Reset your password",
    body: email,
  });
}

export async function sendApprovedEmail({
  from,
  to,
}: {
  from: string;
  to: string[];
}) {
  const site: any = await getSiteSettings();
  const { BASE_HOST } = await settings();
  const siteLogo = site?.assets?.logo || "/images/logo.png";
  const derivedLogoUrl = (typeof siteLogo === "string" && siteLogo.startsWith("http")
    ? siteLogo
    : `${BASE_HOST}${siteLogo}`);
  const orgName = site?.branding?.organization || config?.site?.organization;

  const email = ApprovedEmail({
    loginUrl: `${BASE_HOST}/login`,
    orgName: orgName,
    logoUrl: derivedLogoUrl,
  });

  return await sendEmail({
    from,
    to,
    subject: `Congratulations! Your ${orgName} Account Has Been Approved`,
    body: email,
  });
}