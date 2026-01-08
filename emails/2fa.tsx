import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface TwoFactorEmailProps {
  logoUrl?: string;
  code: string;
  username?: string;
  expiresInMinutes?: number;
}

export default function TwoFactorEmail({
  logoUrl,
  code,
  username = "",
  expiresInMinutes = 10,
}: TwoFactorEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Login Verification Code</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-[#f6f9fc] font-sans p-2">
          <Container className="mx-auto my-[40px] max-w-[500px] rounded border border-solid border-[#f0f0f0] bg-white p-[45px]">
            <Section className="bg-white rounded-lg shadow-lg p-8 max-w-lg mx-auto">
              {logoUrl && (
                <Section className="mt-[32px]">
                  <Img
                    src={logoUrl}
                    width="40"
                    height="40"
                    alt="Logo"
                    className="mx-auto my-0"
                  />
                </Section>
              )}
              <Heading className="text-2xl text-gray-900 text-center mb-3">
                Your verification code is
              </Heading>
              <Section className="rounded-lg p-6 text-center mb-6">
                <Text className="font-mono text-3xl tracking-[10px] text-gray-900">
                  {code}
                </Text>
              </Section>

              <Hr className="border-gray-200 my-6" />

              <Text className="text-xs text-gray-500 text-center">
                This code will expire in {expiresInMinutes} minutes. If you
                didn’t request this, you can safely ignore this email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
