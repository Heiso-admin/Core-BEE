import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface TwoFactorEmailProps {
  code: string;
  username?: string;
  expiresInMinutes?: number;
}

export default function TwoFactorEmail({
  code,
  username = "",
  expiresInMinutes = 10,
}: TwoFactorEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Login Verification Code</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto py-8 px-4">
            <Section className="bg-white rounded-lg shadow-lg p-8 max-w-lg mx-auto">
              <Heading className="text-2xl font-bold text-gray-900 text-center mb-6">
                Login Verification Code
              </Heading>

              {username && (
                <Text className="text-gray-700 mb-4">Hello {username},</Text>
              )}

              <Text className="text-gray-700 mb-6">
                You are attempting to log in to your account. Please use the
                following verification code to complete the login:
              </Text>

              <Section className="bg-gray-100 rounded-lg p-6 text-center mb-6">
                <Text className="font-mono text-3xl font-bold tracking-widest text-gray-900">
                  {code}
                </Text>
              </Section>

              <Text className="text-gray-700 mb-2">
                This verification code will expire in {expiresInMinutes}{" "}
                minutes.
              </Text>

              <Hr className="border-gray-200 my-6" />

              <Text className="text-sm text-gray-600">Security Tips:</Text>
              <Text className="text-sm text-gray-600 mb-2">
                • Do not share this verification code with others
              </Text>
              <Text className="text-sm text-gray-600 mb-2">
                • Our staff will never ask for your verification code
              </Text>
              <Text className="text-sm text-gray-600 mb-6">
                • If you did not initiate this action, please change your
                password immediately
              </Text>

              <Text className="text-xs text-gray-500 text-center">
                This is an automated message, please do not reply
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
