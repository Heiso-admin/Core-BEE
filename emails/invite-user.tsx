import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface InviteUserEmailProps {
  orgName: string;
  orgOwner: string;
  inviteLink: string;
}

export const InviteUserEmail = ({
  orgName,
  orgOwner,
  inviteLink,
}: InviteUserEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>You have been invited to join {orgName} organization</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[32px]">
              <Img
                src="/logo.svg"
                width="40"
                height="40"
                alt="Logo"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              You have been invited to join <strong>{orgName}</strong>{" "}
              organization
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              {orgName} is an organization owned by {orgOwner}.
            </Text>
            <Section className="mt-[32px] mb-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={inviteLink}
              >
                Join Organization
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black">
              Or copy and paste this URL into your browser:{" "}
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

InviteUserEmail.PreviewProps = {
  orgName: "winrabbit",
  orgOwner: "winrabbit",
  inviteLink: "https://example.com/invite/xxx",
} as InviteUserEmailProps;

export default InviteUserEmail;
