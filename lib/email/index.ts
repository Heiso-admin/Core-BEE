import { Resend } from "resend";
import { settings } from "@/config";
import { ForgotPasswordEmail } from "@/emails/forgot-password";
import { InviteUserEmail } from "@/emails/invite-user";

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
  orgOwner,
  inviteLink,
}: {
  from: string;
  to: string[];
  subject: string;
  orgName: string;
  orgOwner: string;
  inviteLink: string;
}) {
  const email = InviteUserEmail({
    orgName,
    orgOwner,
    inviteLink,
  });
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
  name: string;
  resetLink: string;
}) {
  const email = ForgotPasswordEmail({
    resetLink,
    username: name,
  });

  return await sendEmail({
    from,
    to,
    subject: subject || "Reset your password",
    body: email,
  });
}
