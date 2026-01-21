"use server";

import { settings } from "@heiso/core/config/settings";
import TwoFactorEmail from "@heiso/core/emails/2fa";
import { db } from "@heiso/core/lib/db";
import { user2faCode, users } from "@heiso/core/lib/db/schema";
import { sendEmail } from "@heiso/core/lib/email";
import { and, eq, gt, lt } from "drizzle-orm";
import { getUser } from "./user.service";
import { getDynamicDb } from "@heiso/core/lib/db/dynamic";

export interface OTPGenerationResult {
  success: boolean;
  message: string;
  expiresAt?: Date;
}

export interface OTPVerificationResult {
  success: boolean;
  message: string;
  userId?: string;
}

/**
 * 生成6位数字验证码
 */
function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 为用户生成 OTP 验证码并发送邮件
 */
export async function generateOTP(email: string): Promise<OTPGenerationResult> {
  try {
    const user = await getUser(email);
    if (!user) {
      return {
        success: false,
        message: "userNotFound",
      };
    }

    const tx = await getDynamicDb();

    // 如果用户不是开发者，检查用户是否已加入组织
    if (!user?.developer) {
      // 查找用户
      const member = await tx.query.members.findFirst({
        columns: {
          id: true,
          email: true,
          status: true,
          userId: true,
        },
        with: {
          user: {
            columns: {
              id: true,
              email: true,
              name: true,
              active: true,
            },
          },
        },
        where: (t, { eq }) => eq(t.email, email),
      });

      if (!member || !member.user) {
        return {
          success: false,
          message: "userNotFound",
        };
      }

      // Joined 狀態等於帳號啟用
      if (member.status !== "joined") {
        return {
          success: false,
          message: "notActive",
        };
      }
    }

    // 清理该用户的过期验证码
    await cleanupExpiredOTPs(user.id);

    // 生成新的验证码
    const code = generateOTPCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟后过期

    // 保存到数据库
    await tx.insert(user2faCode).values({
      userId: user.id,
      code,
      used: false,
      expiresAt,
    });

    const assets = await tx.query.siteSettings.findFirst({
      where: (t, { eq }) => eq(t.name, "assets"),
    });

    const { logo } = (assets?.value || {}) as Record<string, string>;

    // 发送邮件
    const { NOTIFY_EMAIL } = await settings();
    await sendEmail({
      from: NOTIFY_EMAIL as string,
      to: [user.email],
      subject: "Your Login Verification Code",
      body: TwoFactorEmail({
        logoUrl: logo,
        code,
        username: user.name,
        expiresInMinutes: 10,
      }),
    });

    return {
      success: true,
      message: "OTP sent successfully",
      expiresAt,
    };
  } catch (error) {
    console.error("Failed to generating OTP:", error);
    return {
      success: false,
      message: "general",
    };
  }
}

/**
 * 验证 OTP 验证码
 */
export async function verifyOTP(
  email: string,
  code: string,
): Promise<OTPVerificationResult> {
  try {
    const tx = await getDynamicDb();
    // 查找用户
    const user = await tx.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return {
        success: false,
        message: "userNotFound",
      };
    }

    // 查找有效的验证码
    const otpRecord = await tx.query.user2faCode.findFirst({
      where: and(
        eq(user2faCode.userId, user.id),
        eq(user2faCode.code, code),
        eq(user2faCode.used, false),
        gt(user2faCode.expiresAt, new Date()),
      ),
    });

    if (!otpRecord) {
      return {
        success: false,
        message: "invalidCode",
      };
    }

    // 标记验证码为已使用
    await tx
      .update(user2faCode)
      .set({ used: true })
      .where(eq(user2faCode.id, otpRecord.id));

    // 更新用户最后登录时间
    await tx
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    return {
      success: true,
      message: "OTP verified successfully",
      userId: user.id,
    };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return {
      success: false,
      message: "Failed to verify OTP",
    };
  }
}

/**
 * 清理过期的 OTP 验证码
 */
export async function cleanupExpiredOTPs(userId?: string): Promise<void> {
  try {
    const tx = await getDynamicDb();
    const now = new Date();

    if (userId) {
      // 清理特定用户的过期验证码
      await tx
        .delete(user2faCode)
        .where(
          and(eq(user2faCode.userId, userId), lt(user2faCode.expiresAt, now)),
        );
    } else {
      // 清理所有过期验证码
      await tx.delete(user2faCode).where(lt(user2faCode.expiresAt, now));
    }
  } catch (error) {
    console.error("Error cleaning up expired OTPs:", error);
  }
}

/**
 * 检查用户是否有未使用的有效 OTP
 */
export async function hasValidOTP(email: string): Promise<boolean> {
  try {
    const tx = await getDynamicDb();
    const user = await tx.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return false;
    }

    const validOTP = await tx.query.user2faCode.findFirst({
      where: and(
        eq(user2faCode.userId, user.id),
        eq(user2faCode.used, false),
        gt(user2faCode.expiresAt, new Date()),
      ),
    });

    return !!validOTP;
  } catch (error) {
    console.error("Error checking valid OTP:", error);
    return false;
  }
}

/**
 * 获取用户的 OTP 状态信息
 */
export async function getOTPStatus(email: string) {
  try {
    const tx = await getDynamicDb();
    const user = await tx.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return null;
    }

    const validOTP = await tx.query.user2faCode.findFirst({
      where: and(
        eq(user2faCode.userId, user.id),
        eq(user2faCode.used, false),
        gt(user2faCode.expiresAt, new Date()),
      ),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });

    return {
      hasValidOTP: !!validOTP,
      expiresAt: validOTP?.expiresAt,
      twoFactorEnabled: user.twoFactorEnabled,
    };
  } catch (error) {
    console.error("Error getting OTP status:", error);
    return null;
  }
}

