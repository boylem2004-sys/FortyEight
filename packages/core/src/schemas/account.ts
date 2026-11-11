import { z } from "zod";

export const ACCOUNT_NAME_MAX = 80;

/** Digits in a phone number, ignoring spaces, dashes, dots, brackets, and a leading +. */
function phoneDigits(value: string): string {
  return value.replace(/[\s().-]/g, "").replace(/^\+/, "");
}

/**
 * The "save my answers" form: name and email, plus an optional phone number.
 * Signing up sends a sign-in link to the email. No password.
 */
export const accountSignupSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(ACCOUNT_NAME_MAX, "That name is too long"),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  /** Empty string when left blank. */
  phone: z
    .string()
    .trim()
    .max(30, "Enter a valid phone number")
    .refine((v) => v === "" || /^\d{7,15}$/.test(phoneDigits(v)), "Enter a valid phone number"),
});

export type AccountSignup = z.infer<typeof accountSignupSchema>;
