import { MemberStatus } from "@heiso/core/modules/permission/team/_components/member-list";
import { invite } from "@heiso/core/modules/permission/team/_server/team.service";
import { ActionButton } from "@heiso/core/components/primitives/action-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@heiso/core/components/ui/form";
import { Input } from "@heiso/core/components/ui/input";
import config from "@heiso/core/config";
import { SystemOauth } from "@heiso/core/modules/dev-center/system/settings/general/page";
import { oAuthLogin } from "@heiso/core/server/services/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { capitalize } from "lodash";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  getLoginMethod,
  getMemberStatus,
  getUserLoginMethod,
  isUserDeveloper,
} from "../_server/user.service";
import Header from "./header";
import { type LoginStep, LoginStepEnum } from "./loginForm";
import OAuthLoginButtons from "./oAuthLoginButtons";

interface AuthLoginProps {
  error: string;
  setError: (error: string) => void;
  setLoginMethod: (loginMethod: string | null) => void;
  setStep: (step: LoginStep) => void;
  setUserEmail: (email: string) => void;
  anyUser: boolean;
  orgName?: string;
  handleAuthMethod: (method: string, email: string) => void;
  systemOauth?: string;
}

const AuthLogin = ({
  error,
  setError,
  setLoginMethod,
  setStep,
  setUserEmail,
  anyUser,
  orgName,
  handleAuthMethod,
  systemOauth,
}: AuthLoginProps) => {
  const t = useTranslations("auth.login");

  const usedOrgName = orgName || config?.site?.organization;
  const [isLoading, startTransition] = useTransition();

  const emailSchema = z.object({
    email: z.email({ message: t("email.error") }),
  });

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  // 处理邮箱提交
  const handleEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    setUserEmail(values.email);
    // 僅當系統「完全沒有任何使用者」時，才寄送登入連結
    if (!anyUser) {
      try {
        await invite({ email: values.email, role: "owner" });
        setError("");
      } catch (e) {
        console.error("Failed to send login link email", e);
        setError(t("error.general"));
      } finally {
        setStep(LoginStepEnum.Invite);
      }
      return;
    } else {
      startTransition(async () => {
        try {
          const isDeveloper = await isUserDeveloper(values.email);
          const userAuth = await getUserLoginMethod(values.email);
          const loginMethod = await getLoginMethod(values.email); // 登入方式
          const memberStatus = await getMemberStatus(values.email); // 成員狀態

          if (isDeveloper) {
            const loginMethod = "both";
            setLoginMethod(loginMethod);
            handleAuthMethod(loginMethod, values.email);
            return;
          }

          if (userAuth) {
            return setError(
              t("error.userAuth", { oAuth: capitalize(systemOauth) || "" }),
            );
          }

          if (loginMethod === LoginStepEnum.SSO) {
            return setError(t("error.onlySSOAllowed"));
          }

          if (!loginMethod || !memberStatus) {
            return setError(t("error.userNotFound"));
          }

          if (memberStatus === MemberStatus.Invited) {
            return setError(t("error.invited"));
          }

          if (memberStatus === MemberStatus.Review) {
            return setError(t("error.review"));
          }

          if (memberStatus !== MemberStatus.Joined) {
            throw new Error("USER_NOT_ACTIVATED");
          }

          if (loginMethod !== "") {
            //  以下只有狀態是加入(啟用)狀態才可以處理
            setLoginMethod(loginMethod);
            handleAuthMethod(loginMethod, values.email);
          } else {
            // 如果用户不存在或没有设置登录方法，默认使用密码登录
            setLoginMethod(LoginStepEnum.Password);
            setStep(LoginStepEnum.Password);
          }
        } catch (err) {
          console.error("Error getting login method:", err);
          setError(t("error.general"));
        }
      });
    }
  };

  const createAuthButton = (value: string | undefined) => {
    switch (value) {
      case SystemOauth.google.value:
        return (
          <OAuthLoginButtons
            icon="material-icon-theme:google"
            alt="Google"
            onClick={() => oAuthLogin("google")}
          />
        );

      // case SystemOauth.github.value:
      //   return (
      //     <OAuthLoginButtons
      //       icon="akar-icons:github-fill"
      //       alt="GitHub"
      //       onClick={() => oAuthLogin('github')}
      //     />
      //   );

      case SystemOauth.microsoft.value:
        return (
          <OAuthLoginButtons
            icon="logos:microsoft-icon"
            alt="Microsoft"
            onClick={() => oAuthLogin("microsoft-entra-id")}
          />
        );

      case SystemOauth.none.value:
        return null;
      default:
        return null;
    }
  };

  return (
    <>
      <Header
        title={
          anyUser ? t("title") : t("titleInvite", { organization: usedOrgName })
        }
      />
      {createAuthButton(systemOauth) && (
        <div className="mt-6">
          <div className="my-6 space-y-2">{createAuthButton(systemOauth)}</div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-foreground/40">Or</span>
            </div>
          </div>
        </div>
      )}
      <Form {...emailForm}>
        <form
          className="mt-8 space-y-6"
          onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
        >
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
                      {error && (
                        <p className="w-full text-destructive text-sm">
                          {error}
                        </p>
                      )}
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
  );
};

export default AuthLogin;
