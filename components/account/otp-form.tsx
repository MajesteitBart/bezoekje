"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

import {
  requestOtpAction,
  verifyOtpAction,
  type OtpFormState,
} from "@/app/account-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: OtpFormState = { ok: false, step: "email" };

export function OtpSignIn({
  publicToken,
  adminToken,
  onDone,
}: {
  publicToken?: string;
  adminToken?: string;
  onDone?: (email: string) => void;
}) {
  const router = useRouter();
  const [reqState, reqAction, reqPending] = useActionState(
    requestOtpAction,
    initial
  );
  const [verState, verAction, verPending] = useActionState(
    verifyOtpAction,
    initial
  );
  const done = verState.ok && verState.step === "klaar";
  const notified = useRef(false);

  useEffect(() => {
    if (done && !notified.current) {
      notified.current = true;
      router.refresh();
      onDone?.(verState.email ?? "");
    }
  }, [done, router, onDone, verState.email]);

  if (done)
    return (
      <p className="text-sm font-medium">
        Gelukt! Je bent ingelogd{verState.email ? ` als ${verState.email}` : ""}
        . ✅
      </p>
    );

  if (reqState.ok && reqState.step === "otp" && reqState.email) {
    return (
      <form action={verAction} className="flex flex-col gap-3">
        <input type="hidden" name="email" value={reqState.email} />
        {publicToken ? (
          <input type="hidden" name="publicToken" value={publicToken} />
        ) : null}
        {adminToken ? (
          <input type="hidden" name="adminToken" value={adminToken} />
        ) : null}
        <div className="flex flex-col gap-2">
          <Label htmlFor="otp-code">
            Vul de code in die naar {reqState.email} is gestuurd
          </Label>
          <Input
            id="otp-code"
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            required
            placeholder="123456"
          />
        </div>
        {verState.error ? (
          <p className="text-sm text-destructive">{verState.error}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={verPending}>
            {verPending ? "Even geduld…" : "Bevestig code"}
          </Button>
          <Button
            type="submit"
            variant="ghost"
            formAction={reqAction}
            formNoValidate
            disabled={reqPending}
          >
            Stuur nieuwe code
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form action={reqAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="otp-email">E-mailadres</Label>
        <Input
          id="otp-email"
          name="email"
          type="email"
          required
          defaultValue={reqState.email}
          placeholder="jij@voorbeeld.nl"
          autoComplete="email"
        />
      </div>
      {reqState.error ? (
        <p className="text-sm text-destructive">{reqState.error}</p>
      ) : null}
      <Button type="submit" disabled={reqPending}>
        {reqPending ? "Versturen…" : "Stuur inlogcode"}
      </Button>
    </form>
  );
}
