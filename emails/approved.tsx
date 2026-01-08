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

interface ApprovedEmailProps {
  logoUrl: string;
  orgName?: string;
  loginUrl: string;
}

export default function ApprovedEmail({
  logoUrl = "https://cdn.heisoo.com/smartsight/MWcIZjeOLK.svg",
  orgName = "Heiso",
  loginUrl = "https://example.com/login",
}: ApprovedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Account Is Active</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-[#f6f9fc] font-sans p-2">
          <Container className="mx-auto my-[40px] max-w-[500px] rounded border border-solid border-[#f0f0f0] bg-white p-[45px]">
            <Section className="bg-white rounded-lg shadow-lg p-8 max-w-lg mx-auto">
              <Section className="mt-[32px]">
                <Img
                  src={logoUrl}
                  width="40"
                  height="40"
                  alt="Logo"
                  className="mx-auto my-0"
                />
              </Section>
              <Heading className="text-2xl text-gray-900 text-center mb-3">
                Your Account Is Active
              </Heading>
              <Text className="text-[16px] leading-[26px] text-[#404040] text-left">
                We are pleased to inform you that your application for the{" "}
                {orgName} has been successfully approved.
              </Text>
              <Text className="text-[16px] leading-[26px] text-[#404040] text-left">
                You now have access to the system.
              </Text>
              <Section className="my-[30px] text-center">
                <Button
                  className="rounded bg-[#FBBF24] my-6 px-5 py-3 text-center text-[16px] font-semibold text-black no-underline"
                  href={loginUrl}
                >
                  Start Your Work
                </Button>
              </Section>
              <Text className="text-[14px] leading-[24px] text-black text-center">
                Or copy and paste this URL into your browser:
                <br />
                <Link href={loginUrl} className="text-blue-600 no-underline">
                  {loginUrl}
                </Link>
              </Text>
              <Hr className="border-gray-200 my-6" />

              <Text className="text-xs text-gray-500 text-center">
                Click the button to sign in to the admin portal, explore your
                permissions, and begin collaboration.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
