'use client';

import { useState, useId, useEffect, useMemo } from 'react';
import { ActionButton } from '@/components/primitives';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { signIn } from 'next-auth/react';
import { generateOTP, verifyOTP } from '../_server/otp.service';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import Header from './header';
import { LoginMethodEnum, LoginStepEnum, type LoginStep } from './loginForm';
import AuthRedirectHint from './authRedirectHint';
import { Button } from '@/components/ui/button';

interface OTPLoginFormProps {
  email?: string | null;
  setStep: (step: LoginStep) => void;
  loginMethod?: string | null;
  error: string;
  setError: (error: string) => void;
  handleLoginSuccess: () => void;
}

const codeBoxMaxWidth = 6
export default function OTPLoginForm({ email, setStep, loginMethod, error, setError, handleLoginSuccess }: OTPLoginFormProps) {
  const t = useTranslations('auth.otp');
  const [userEmail, setUserEmail] = useState(email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { update } = useSession();
  const baseSlotId = useId();
  const slotKeys = useMemo(
    () => Array.from({ length: codeBoxMaxWidth }, (_, i) => `${baseSlotId}-${i}`),
    [baseSlotId]
  );

  // 邮箱表单验证
  const emailFormSchema = z.object({
    email: z.string().email({ message: t('email.error') }),
  });

  // 验证码表单验证
  const otpFormSchema = z.object({
    code: z.string().length(6, { message: t('code.error') }),
  });


  const otpForm = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      code: '',
    },
  });

  // 发送验证码
  const handleSendOTP = async (values: z.infer<typeof emailFormSchema>) => {
    console.log('submit email', values.email)
    setError('');
    setIsLoading(true);

    try {
      const result = await generateOTP(values.email);

      if (result.success) {
        setUserEmail(values.email);
        console.log('success.codeSent', { email: values.email })
        startCountdown();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(t('error.general'));
    } finally {
      setIsLoading(false);
    }
  };

  // 验证 OTP 并登录
  const handleVerifyOTP = async (values: z.infer<typeof otpFormSchema>) => {
    setError('');
    setIsLoading(true);

    try {
      const result = await verifyOTP(userEmail, values.code);

      if (!result.success) {
        setError(t(`error.${result.message}`));
        return;
      }

      if (result.success && result.userId) {
        // 使用 NextAuth 的 signIn 进行登录
        const signInResult = await signIn('credentials', {
          email: userEmail,
          otpVerified: 'true',
          userId: result.userId,
          redirect: false,
        });

        if (signInResult?.ok) {
          await update();
          handleLoginSuccess();
        } else {
          setError(t('error.login'));
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(t('error.general'));
    } finally {
      setIsLoading(false);
    }
  };

  // 重新发送验证码
  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setError('');
    setIsLoading(true);

    try {
      const result = await generateOTP(userEmail);
      console.log('generateOTP', result);


      if (result.success) {
        console.log('success.codeResent')
        startCountdown();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(t('error.general'));
    } finally {
      setIsLoading(false);
    }
  };

  // 开始倒计时
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <>
      <Header
        title={t('title')}
        description={t('description', { email: email || 'email' })}
      />

      <Form {...otpForm}>
        <form
          className="mt-8 space-y-6 mb-8"
          onSubmit={otpForm.handleSubmit(handleVerifyOTP)}
        >
          <div className="space-y-4">
            <FormField
              control={otpForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputOTP
                      value={field.value}
                      onChange={(val) => {
                        otpForm.clearErrors('code');
                        field.onChange(val);
                      }}
                      maxLength={codeBoxMaxWidth}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      containerClassName="flex items-center justify-center gap-3"
                    >
                      {new Array(codeBoxMaxWidth).fill(0).map((_, i) => (
                        <InputOTPGroup key={slotKeys[i]}>
                          <InputOTPSlot
                            index={i}
                            className="text-xl w-12 h-15"
                          />
                        </InputOTPGroup>
                      ))}
                    </InputOTP>
                  </FormControl>
                  <FormMessage className="w-full text-center" />
                  {error && (
                    <p className="w-full text-sm text-destructive/80 text-center">
                      {error}
                    </p>
                  )}
                </FormItem>
              )}
            />
          </div>
          <div className="w-full flex justify-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={countdown > 0 || isLoading}
              className="text-sm"
            >
              {countdown > 0
                ? t('resend.countdown', { seconds: countdown })
                : t('resend.action')}
            </button>
          </div>

          <div className="mb-2">
            <ActionButton
              type="submit"
              className="group relative flex w-full justify-center"
              loading={isLoading}
            >
              {t('submit.verify')}
            </ActionButton>
          </div>
        </form>
        <AuthRedirectHint>
          {t.rich('backToLogin', {
            Link: (chunks) => (
              <Button
                variant="link"
                className="text-neutral font-normal p-0 underline"
                onClick={() => setStep(LoginStepEnum.Email)}
                type="button"
              >
                {chunks}
              </Button>
            ),
          })}
        </AuthRedirectHint>
      </Form>
    </>
  );
}
