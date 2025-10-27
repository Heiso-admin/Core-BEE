import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ForgotPasswordEmailProps {
  resetLink: string;
  username?: string;
}

export function ForgotPasswordEmail({
  resetLink,
  username = "",
}: ForgotPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password for Mini CMS</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={title}>Password Reset Request</Text>
          <Text style={paragraph}>
            {username ? `Hello ${username},` : "Hello,"}
          </Text>
          <Text style={paragraph}>
            We received a request to reset your password for your Mini CMS
            account. If you didn't make this request, you can safely ignore this
            email.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={resetLink}>
              Reset Password
            </Button>
          </Section>
          <Text style={paragraph}>
            This password reset link will expire in 1 hour for security reasons.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            If you're having trouble clicking the button, copy and paste this
            URL into your browser:
            <br />
            {resetLink}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  padding: "10px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  borderRadius: "5px",
  margin: "0 auto",
  padding: "45px",
  maxWidth: "600px",
};

const title = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#000",
  marginBottom: "24px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#404040",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#666666",
  fontSize: "14px",
  lineHeight: "24px",
};
