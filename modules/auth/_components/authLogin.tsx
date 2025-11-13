import { ActionButton } from '@/components/primitives/action-button';
import { useTransition } from 'react'
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { getLoginMethod, getMemberStatus } from '../_server/user.service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type LoginStep, LoginStepEnum } from './loginForm';
import { invite } from '@/app/dashboard/(dashboard)/(permission)/team/_server/team.service';
import Header from './header';
import config from "@/config";
import { MemberStatus } from '@/app/dashboard/(dashboard)/(permission)/team/_components/member-list';
import OAuthLoginButtons from './oAuthLoginButtons';
import { oAuthLogin } from '@/server/services/auth';

interface AuthLoginProps {
  error: string;
  setError: (error: string) => void;
  setLoginMethod: (loginMethod: string | null) => void;
  setStep: (step: LoginStep) => void;
  setUserEmail: (email: string) => void;
  anyUser: boolean;
  orgName?: string;
  handleAuthMethod: (method: string, email: string) => void;
}

const AuthLogin = ({ error, setError, setLoginMethod, setStep, setUserEmail, anyUser, orgName, handleAuthMethod }: AuthLoginProps) => {
  const t = useTranslations("auth.login");

  const usedOrgName = orgName || config?.site?.organization;
  const [isLoading, startTransition] = useTransition();

  const emailSchema = z.object({
    email: z.email({ message: t('email.error') }),
  });

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  // 处理邮箱提交
  const handleEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    setUserEmail(values.email);
    // 僅當系統「完全沒有任何使用者」時，才寄送登入連結
    if (!anyUser) {
      try {
        await invite({ email: values.email, role: 'owner' });
        setError("");
      } catch (e) {
        console.error("Failed to send login link email", e);
        setError(t('error.general'));
      } finally {
        setStep(LoginStepEnum.Invite);
      }
      return;
    } else {
      startTransition(async () => {
        try {
          const loginMethod = await getLoginMethod(values.email); // 登入方式
          const memberStatus = await getMemberStatus(values.email); // 成員狀態

          if (!loginMethod || !memberStatus) {
            setError(t('error.userNotFound'));
            return;
          }
          if (memberStatus === MemberStatus.Invited) {
            setError(t('error.invited'));
            return;
          }

          if (memberStatus === MemberStatus.Review) {
            setError(t('error.review'));
            return;
          }

          if (memberStatus !== MemberStatus.Joined) {
            throw new Error('USER_NOT_ACTIVATED');
          }

          if (loginMethod !== '') {
            //  以下只有狀態是加入(啟用)狀態才可以處理
            setLoginMethod(loginMethod);
            handleAuthMethod(loginMethod, values.email);
          } else {
            // 如果用户不存在或没有设置登录方法，默认使用密码登录
            setLoginMethod(LoginStepEnum.Password);
            setStep(LoginStepEnum.Password);
          }
        } catch (err) {
          console.error('Error getting login method:', err);
          setError(t('error.general'));
        }
      });
    }


  };

  return (
    <>
      <Header title={anyUser ? t("title") : t("titleInvite", { organization: usedOrgName })} />
      <div className="mt-6">
        {/* Microsoft Login */}
        <div className="my-6 space-y-2" >
          <OAuthLoginButtons
            href="/api/auth/signin/azure-ad?callbackUrl=/dashboard"
            icon='logos:microsoft-icon'
            alt="Microsoft"
          />
          <OAuthLoginButtons
            icon='akar-icons:github-fill'
            alt="GitHub"
            onClick={() => oAuthLogin("github")}
          />
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-foreground/40">Or</span>
          </div>
        </div>
      </div>
      <Form {...emailForm}>
        <form className="mt-8 space-y-6" onSubmit={emailForm.handleSubmit(handleEmailSubmit)}>
          <div className="space-y-4">
            <div className="flex flex-col space-y-1">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>{t("email.label")}</FormLabel>
                      <FormControl>
                        <Input
                          id="email-address"
                          type="email"
                          autoComplete="email"
                          placeholder={t("email.placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      {error && <p className="w-full text-destructive text-sm">{error}</p>}
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>
          <div>
            <ActionButton
              type="submit"
              className="w-full bg-primary hover:bg-primary/80"
              loading={isLoading}
            >
              {t("submit")}
            </ActionButton>
          </div>
        </form>
      </Form>
    </>
  )
}

export default AuthLogin
