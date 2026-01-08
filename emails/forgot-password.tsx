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

interface ForgotPasswordEmailProps {
  resetLink: string;
  logoUrl?: string;
  orgName?: string;
}

export const ForgotPasswordEmail = ({
  resetLink,
  logoUrl = "https://cdn.heisoo.com/smartsight/MWcIZjeOLK.svg",
  orgName = "Heiso",
}: ForgotPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your {orgName} password</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-[#f6f9fc] font-sans p-2">
          <Container className="mx-auto my-[40px] max-w-[500px] rounded border border-solid border-[#f0f0f0] bg-white p-[45px]">
            <Section className="mt-[32px] text-center">
              <Img
                src={logoUrl}
                width="40"
                height="40"
                alt={`${orgName} Logo`}
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Reset your <strong>{orgName}</strong> password
            </Heading>
            <Text className="text-[16px] leading-[26px] text-[#404040] text-center">
              We received a request to reset the password for your account.
              Click the button below to choose a new password.
            </Text>
            <Section className="my-[30px] text-center">
              <Button
                className="rounded bg-[#FBBF24] my-6 px-5 py-3 text-center text-[16px] font-semibold text-black no-underline"
                href={resetLink}
              >
                Reset Password
              </Button>
            </Section>

            <Text className="text-[14px] leading-[24px] text-black text-center">
              Or copy and paste this URL into your browser:
              <br />
              <Link href={resetLink} className="text-blue-600 no-underline">
                {resetLink}
              </Link>
            </Text>

            <Hr className="mx-0 my-[20px] w-full border border-solid border-[#e6ebf1]" />
            <Text className="text-[14px] leading-[24px] text-[#666666]">
              If you did not request this change, you can safely ignore this
              email. Your password will remain the same. This link will expire
              in 30 minutes due to security concerns.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

ForgotPasswordEmail.PreviewProps = {
  resetLink: "https://example.com/reset-password?token=xxxx",
  logoUrl: "https://cdn.heisoo.com/smartsight/MWcIZjeOLK.svg",
  orgName: "Heiso",
} as ForgotPasswordEmailProps;

export default ForgotPasswordEmail;
