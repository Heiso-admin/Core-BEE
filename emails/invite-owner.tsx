import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface InviteOwnerEmailProps {
  logoUrl: string;
  orgName: string;
  inviteLink: string;
}

export const InviteOwnerEmail = ({
  logoUrl,
  orgName,
  inviteLink,
}: InviteOwnerEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>You have been invited to join {orgName} organization</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-[#f6f9fc] font-sans p-2">
          <Container className="mx-auto my-[40px] max-w-[500px] rounded border border-solid border-[#f0f0f0] bg-white p-[45px]">
            <Section className="mt-[32px]">
              <Img
                src={logoUrl}
                width="40"
                height="40"
                alt="Logo"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 mt-[30px] mb-0 p-0 text-center text-[24px] font-normal text-black">
              Welcome to <strong>{orgName}</strong> !
            </Heading>
            <Text className="mt-[8px] text-[14px] text-center font-bold text-black">
              You’re the first member and owner of this admin portal.
            </Text>
            <Text className="text-[14px] text-center text-black mt-[30px]">
              Once you set up your account, you’ll be able to invite other team
              members and start managing your workspace.
            </Text>
            <Section className="mt-[32px] mb-[32px] text-center">
              <Button
                className="rounded bg-[#FBBF24] px-5 py-3 text-center text-[16px] font-semibold text-black no-underline"
                href={inviteLink}
              >
                Join {orgName}
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black text-center">
              URL into your browser:
              <br />
              <Link href={inviteLink} className="text-blue-600 no-underline">
                {inviteLink}
              </Link>
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              If you were not expecting this invitation, you can ignore this
              email. If you're concerned about your account's security, please
              reply to this email to contact us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

InviteOwnerEmail.PreviewProps = {
  logoUrl: "https://cdn.heisoo.com/smartsight/MWcIZjeOLK.svg",
  orgName: "Heiso",
  inviteLink: "https://example.com/invite/xxx",
} as InviteOwnerEmailProps;

export default InviteOwnerEmail;
