"use client";

import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Key,
  QrCode,
  Shield,
  Smartphone,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TwoFactorAuthentication() {
  const t = useTranslations("account.2fa");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleToggle2FA = () => {
    if (is2FAEnabled) {
      setIs2FAEnabled(false);
      setSuccess(t("disabled"));
    } else {
      setIs2FAEnabled(true);
      setSuccess(t("enabledSetup"));
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError("");
    setSuccess("");
    // Simulating API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (verificationCode === "123456") {
      // In a real app, this would be validated on the server
      setSuccess(t("setupSuccess"));
    } else {
      setError(t("invalidCode"));
    }
    setIsVerifying(false);
    setVerificationCode("");
  };

  const backupCodes = [
    "1234-5678",
    "2345-6789",
    "3456-7890",
    "4567-8901",
    "5678-9012",
    "6789-0123",
    "7890-1234",
    "8901-2345",
    "9012-3456",
    "0123-4567",
  ];

  return (
    <Card className="w-[400px] mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-6 w-6" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Switch
            id="2fa-toggle"
            checked={is2FAEnabled}
            onCheckedChange={handleToggle2FA}
          />
          <Label htmlFor="2fa-toggle">{t("enable")}</Label>
        </div>

        {is2FAEnabled && (
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="setup">{t("setup")}</TabsTrigger>
              <TabsTrigger value="backup">{t("backupCodes")}</TabsTrigger>
            </TabsList>
            <TabsContent value="setup">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <QrCode className="h-40 w-40" />
                </div>
                <p className="text-sm text-center">{t("scanQrCode")}</p>
                <div className="flex items-center justify-center space-x-2">
                  <Input
                    value="JBSWY3DPEHPK3PXP"
                    readOnly
                    className="w-48 text-center"
                  />
                  <Button variant="outline" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <form onSubmit={handleVerify}>
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">
                      {t("verificationCode")}
                    </Label>
                    <Input
                      id="verificationCode"
                      placeholder={t("enterCode")}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full mt-4"
                    type="submit"
                    disabled={isVerifying}
                  >
                    {isVerifying ? t("verifying") : t("verifyAndActivate")}
                  </Button>
                </form>
              </div>
            </TabsContent>
            <TabsContent value="backup">
              <div className="space-y-4">
                <p className="text-sm">{t("backupCodesDescription")}</p>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-muted p-2 rounded-base"
                    >
                      <code>{code}</code>
                      <Button variant="ghost" size="icon">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button className="w-full">
                  <Key className="mr-2 h-4 w-4" />
                  {t("generateNewBackupCodes")}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("error")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-4">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>{t("success")}</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          <Smartphone className="inline mr-2 h-4 w-4" />
          {t("authenticatorAppInstruction")}
        </p>
      </CardFooter>
    </Card>
  );
}
