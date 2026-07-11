"use client";

import { Link2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

import {
  addRosterByLinkAction,
  type AddRosterState,
} from "@/app/account-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AddRosterState = { ok: false };

export function AddRosterForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(addRosterByLinkAction, initial);
  const refreshed = useRef<string | null>(null);

  useEffect(() => {
    if (state.ok && state.added && refreshed.current !== state.added) {
      refreshed.current = state.added;
      router.refresh();
    }
  }, [state, router]);

  if (!open)
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Link2Icon data-icon="inline-start" />
        Bestaand rooster toevoegen
      </Button>
    );

  return (
    <form
      action={action}
      className="flex flex-col gap-2 rounded-lg border bg-card p-4"
    >
      <Label htmlFor="add-link">Plak de beheer-link van het rooster</Label>
      <Input
        id="add-link"
        name="link"
        required
        placeholder="https://bezoekje.app/r/…/admin/…"
      />
      {state.ok && state.added ? (
        <p className="text-sm font-medium">
          &quot;{state.added}&quot; toegevoegd ✅
        </p>
      ) : null}
      {!state.ok && state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Even geduld…" : "Toevoegen"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Sluiten
        </Button>
      </div>
    </form>
  );
}
