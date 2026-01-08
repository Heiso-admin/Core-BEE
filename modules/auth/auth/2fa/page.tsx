"use client";

import { Button } from "@heiso/core/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@heiso/core/components/ui/card";
import { Input } from "@heiso/core/components/ui/input";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export default function TwoFactorAuth() {
  const t = useTranslations("auth.2fa");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value !== "" && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && index > 0 && code[index] === "") {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const enteredCode = code.join("");
    console.log("Verifying code:", enteredCode);
    // Here you would typically send the code to your backend for verification
  };

  const handleResend = () => {
    console.log("Resending code");
    // Here you would typically call your API to resend the code
  };

  return (
    <Card className="w-[350px] mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          {code.map((digit, index) => (
            <Input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              ref={(el) => {
                if (el) {
                  inputRefs.current[index] = el;
                }
              }}
              className="w-12 h-12 text-center text-lg"
            />
          ))}
        </div>
        <Button className="w-full" onClick={handleVerify}>
          {t("submit")}
        </Button>
      </CardContent>
      <CardFooter>
        <Button variant="link" className="w-full" onClick={handleResend}>
          {t("resend")}
        </Button>
      </CardFooter>
    </Card>
  );
}
