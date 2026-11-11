"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { accountSignupSchema, type AccountSignup } from "@fortyeight/core";
import { MailCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FieldError } from "@/components/onboarding/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccountStore } from "@/lib/stores/account-store";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * "Save your answers" sheet, shown after someone shares a plan. Name and
 * email (phone optional) create an account by emailed link, no password.
 * A native <dialog>, so focus trapping and Escape come for free.
 */
export function SaveAnswersDialog({ open, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const setPendingEmail = useAccountStore((s) => s.setPendingEmail);
  const dismissNudge = useAccountStore((s) => s.dismissNudge);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string>();

  const { register, handleSubmit, formState } = useForm<AccountSignup>({
    resolver: zodResolver(accountSignupSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });
  const { errors, isSubmitting } = formState;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(undefined);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setFormError("Accounts aren't switched on yet. Your answers are still saved on this device.");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // Stored on the account. The database copies the name into the profile.
        data: { name: values.name, ...(values.phone ? { phone: values.phone } : {}) },
      },
    });
    if (error) {
      setFormError("We couldn't send the email. Check the address and try again.");
      return;
    }
    setPendingEmail(values.email);
    setSentTo(values.email);
  });

  function notNow() {
    dismissNudge();
    onClose();
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="save-answers-title"
      className="m-0 mt-auto w-full max-w-none rounded-t-card bg-card p-6 pb-8 text-card-foreground backdrop:bg-background/70 backdrop:backdrop-blur-sm open:animate-rise-in sm:m-auto sm:max-w-md sm:rounded-card sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id="save-answers-title" className="text-[28px] leading-tight font-semibold">
          {sentTo ? "Check your email" : "Skip the questions next time"}
        </h2>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="size-9 shrink-0"
          aria-label="Close"
          onClick={sentTo ? onClose : notNow}
        >
          <X aria-hidden />
        </Button>
      </div>

      {sentTo ? (
        <div className="mt-4 flex flex-col gap-6">
          <p className="flex gap-3 text-[17px] text-muted-foreground">
            <MailCheck aria-hidden className="mt-1 size-5 shrink-0 text-success" />
            <span>
              We sent a link to <span className="font-semibold text-foreground">{sentTo}</span>. Tap
              it to finish, and your answers will be waiting next weekend.
            </span>
          </p>
          <Button type="button" size="lg" onClick={onClose}>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-3 flex flex-col gap-5">
          <p className="text-[17px] text-muted-foreground">
            Save your location, likes, group size, and budget. Next weekend is one tap.
          </p>

          <div className="flex flex-col gap-2">
            <Label htmlFor="signup-name">Name</Label>
            <Input
              id="signup-name"
              autoComplete="name"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "signup-name-error" : undefined}
              {...register("name")}
            />
            <FieldError id="signup-name-error" message={errors.name?.message} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "signup-email-error" : undefined}
              {...register("email")}
            />
            <FieldError id="signup-email-error" message={errors.email?.message} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="signup-phone">Phone (optional)</Label>
            <Input
              id="signup-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? "signup-phone-error" : undefined}
              {...register("phone")}
            />
            <FieldError id="signup-phone-error" message={errors.phone?.message} />
          </div>

          <FieldError id="signup-form-error" message={formError} />

          <div className="flex flex-col gap-2">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Save my answers"}
            </Button>
            <Button type="button" variant="ghost" onClick={notNow}>
              Not now
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            No password. We email you a link to sign in.
          </p>
        </form>
      )}
    </dialog>
  );
}
