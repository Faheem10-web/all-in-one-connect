"use server";

import { z } from "zod";
import argon2 from "argon2";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/user";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

const RegisterSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function registerUser(prevState: unknown, formData: FormData) {
  const fields = Object.fromEntries(formData.entries());
  const validatedFields = RegisterSchema.safeParse(fields);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return {
        success: false,
        errors: { email: ["Email already registered"] },
      };
    }

    // Hash password with argon2id
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create user with default role BUSINESS_OWNER
    await User.create({
      email: email.toLowerCase(),
      passwordHash,
      role: "BUSINESS_OWNER",
      isVerified: false,
      verificationToken,
    });

    // Console log the verification link for developer convenience
    console.log(
      `[DEVELOPER MODE] Verification Link: http://localhost:3000/verify-email?token=${verificationToken}`,
    );

    return {
      success: true,
      message: "Registration successful! Check console for the verification link.",
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "An error occurred during registration. Please try again.",
    };
  }
}

export async function loginUser(prevState: unknown, formData: FormData) {
  const fields = Object.fromEntries(formData.entries());
  const validatedFields = LoginSchema.safeParse(fields);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    await connectToDatabase();

    // Verify email verification state before signing in
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user && !user.isVerified) {
      return {
        success: false,
        message: "Please verify your email address before logging in.",
      };
    }

    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });

    return {
      success: true,
      message: "Logged in successfully!",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            message: "Invalid email or password.",
          };
        default:
          return {
            success: false,
            message: "Authentication failed. Please try again.",
          };
      }
    }

    console.error("Login error:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function forgotPassword(prevState: unknown, formData: FormData) {
  const fields = Object.fromEntries(formData.entries());
  const validatedFields = ForgotPasswordSchema.safeParse(fields);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email } = validatedFields.data;

  try {
    await connectToDatabase();
    const user = await User.findOne({ email: email.toLowerCase() });

    // Standard protection against email enumeration
    if (!user) {
      return {
        success: true,
        message: "If that email is registered, we've sent a password reset link.",
      };
    }

    // Generate secure reset token valid for 1 hour
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour expiry
    await user.save();

    // Log the link in terminal for developers to test
    console.log(
      `[DEVELOPER MODE] Reset Password Link: http://localhost:3000/reset-password?token=${resetToken}`,
    );

    return {
      success: true,
      message: "If that email is registered, we've sent a password reset link.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return {
      success: false,
      message: "An error occurred. Please try again.",
    };
  }
}

export async function resetPassword(prevState: unknown, formData: FormData) {
  const fields = Object.fromEntries(formData.entries());
  const validatedFields = ResetPasswordSchema.safeParse(fields);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { token, password } = validatedFields.data;

  try {
    await connectToDatabase();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid or expired reset token.",
      };
    }

    // Hash new password
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    user.passwordHash = passwordHash;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return {
      success: true,
      message: "Password reset successfully! You can now log in.",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      message: "An error occurred. Please try again.",
    };
  }
}

export async function verifyEmail(token: string) {
  try {
    await connectToDatabase();
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return {
        success: false,
        message: "Invalid or expired verification token.",
      };
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    return {
      success: true,
      message: "Email verified successfully! You can now log in.",
    };
  } catch (error) {
    console.error("Email verification error:", error);
    return {
      success: false,
      message: "An error occurred during verification.",
    };
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}
