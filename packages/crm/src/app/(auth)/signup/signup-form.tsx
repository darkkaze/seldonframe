"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import posthog from "posthog-js";
import { sendMagicLinkAction } from "./actions";
import { googleSignInAction } from "../oauth-actions";
import { signupAction } from "@/lib/auth/actions";
import { DEMO_BLOCK_MESSAGE } from "@/lib/demo/constants";
import { useDemoToast } from "@/components/shared/demo-toast-provider";
import { HEAR_ABOUT_OPTIONS, normalizeHearAbout } from "@/lib/analytics/signup-attribution";

export function SignupForm({
  redirectTo,
  googleEnabled = false,
}: {
  redirectTo: string;
  googleEnabled?: boolean;
}) {
  const { showDemoToast } = useDemoToast();
  const [state, action, pending] = useActionState(sendMagicLinkAction, {});
  const [passwordState, passwordAction, passwordPending] = useActionState(signupAction, {});
  // 2026-08-23 — optional attribution question ("make the next wave
  // attributable"). Analytics-only: the answer is captured straight to
  // PostHog on the ANONYMOUS person ($set_once hear_about) the moment
  // it's chosen, so it applies to both the Google and magic-link paths
  // and never gates or delays signup. The anonymous person merges into
  // the new user via the identity bridge and the server-side alias in
  // events.createUser, so hear_about survives as a person property.
  const [hearAbout, setHearAbout] = useState("");
  // 2026-07-04 — redirectTo is computed server-side in page.tsx from the
  // ?url= / ?biz= / ?intent= query params (or /claim?token=... for claim
  // flows). The default path lands the visitor on /clients/new with url/biz
  // prefill. /signup/billing is reached only from upgrade gates (workspace
  // limit, custom-domain upsell) and is not part of the cold-flow path.
  const callbackUrl = redirectTo;

  useEffect(() => {
    if (state.error === DEMO_BLOCK_MESSAGE) {
      showDemoToast();
    }
  }, [showDemoToast, state.error]);

  // signupAction signs the new user in without redirecting; a full page load
  // picks up the fresh session cookie.
  useEffect(() => {
    if (passwordState.success) {
      window.location.assign(callbackUrl);
    }
  }, [passwordState.success, callbackUrl]);

  return (
    <div className="space-y-5 text-foreground">
      <div className="space-y-1">
        <label htmlFor="hear-about" className="text-label text-foreground">
          How did you hear about us?{" "}
          <span className="font-normal text-[hsl(var(--color-text-secondary))]">(optional)</span>
        </label>
        <select
          id="hear-about"
          value={hearAbout}
          onChange={(event) => {
            const value = event.target.value;
            setHearAbout(value);
            const channel = normalizeHearAbout(value);
            if (channel) {
              posthog.capture("signup_survey_answered", {
                channel,
                $set_once: { hear_about: channel },
              });
            }
          }}
          className="crm-input h-10 w-full px-3"
        >
          <option value="">Choose one…</option>
          {HEAR_ABOUT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {googleEnabled ? (
        <>
          <form action={googleSignInAction}>
            <input type="hidden" name="redirectTo" value={callbackUrl} />
            <button type="submit" className="crm-button-primary h-10 w-full px-4">
              Continue with Google
            </button>
          </form>
          <div className="flex items-center gap-3 text-xs text-[hsl(var(--color-text-secondary))]">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      ) : null}

      <form action={passwordAction} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="signup-name" className="text-label text-foreground">
            Your name
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="crm-input h-10 w-full px-3"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="signup-org" className="text-label text-foreground">
            Company name
          </label>
          <input
            id="signup-org"
            name="orgName"
            type="text"
            required
            autoComplete="organization"
            className="crm-input h-10 w-full px-3"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="signup-email" className="text-label text-foreground">
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            className="crm-input h-10 w-full px-3"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="signup-password" className="text-label text-foreground">
            Password (min. 8 characters)
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="crm-input h-10 w-full px-3"
          />
        </div>

        <button
          type="submit"
          disabled={passwordPending}
          className={googleEnabled ? "crm-button-secondary h-10 w-full px-4" : "crm-button-primary h-10 w-full px-4"}
        >
          {passwordPending ? "Creating account..." : "Create account"}
        </button>
        {passwordState.error ? <p role="alert" className="text-sm text-destructive">{passwordState.error}</p> : null}
      </form>

      <div className="flex items-center gap-3 text-xs text-[hsl(var(--color-text-secondary))]">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={action} className="space-y-3">
        <input type="hidden" name="redirectTo" value={callbackUrl} />
        <div className="space-y-1">
          <label htmlFor="email" className="text-label text-foreground">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            className="crm-input h-10 w-full px-3"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="crm-button-secondary h-10 w-full px-4"
        >
          {pending ? "Sending magic link..." : "Continue with email link"}
        </button>
      </form>

      {/* a11y-review: role="alert" makes SR users hear the error
          immediately on render (assertive live region). */}
      {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}

      {state.sent && state.email ? (
        /* a11y-review: role="status" announces the success card to SR
           users without interrupting (polite live region). */
        <div role="status" className="space-y-3 rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-foreground">
            Magic link sent ✨ Check your inbox for <span className="font-medium">{state.email}</span>. Click the link to sign in.
          </p>
          {state.inboxUrl ? (
            <a
              href={state.inboxUrl}
              target="_blank"
              rel="noreferrer"
              className="crm-button-secondary inline-flex h-10 w-full items-center justify-center px-4"
            >
              Open Email Inbox
            </a>
          ) : (
            <p className="text-xs text-muted-foreground">Check your inbox.</p>
          )}
        </div>
      ) : null}

      <p className="text-center text-label text-[hsl(var(--color-text-secondary))]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
