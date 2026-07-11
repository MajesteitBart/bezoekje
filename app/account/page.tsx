import { ChevronRightIcon, KeyRoundIcon, PlusIcon } from "lucide-react";
import { headers } from "next/headers";

import { signOutAction } from "@/app/account-actions";
import { AddRosterForm } from "@/components/account/add-roster-form";
import { OtpSignIn } from "@/components/account/otp-form";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getRostersForUser } from "@/lib/data";
import { dbReady } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  await dbReady();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8 p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <KeyRoundIcon className="size-10 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">Inloggen</h1>
          <p className="text-muted-foreground">
            Log in met je e-mailadres — je krijgt een code toegestuurd, geen
            wachtwoord nodig. Zo vind je de beheer-link van je rooster altijd
            terug.
          </p>
        </div>
        <OtpSignIn />
      </main>
    );
  }

  const myRosters = await getRostersForUser(session.user.id);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 p-6 pt-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">
          Mijn rooster{myRosters.length === 1 ? "" : "s"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Ingelogd als {session.user.email}
        </p>
      </div>

      {myRosters.length === 0 ? (
        <p className="text-muted-foreground">
          Er is nog geen rooster aan dit account gekoppeld. Open je rooster via
          de beheer-link en kies daar &quot;Account koppelen&quot;.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {myRosters.map((r) => (
            <a
              key={r.id}
              href={`/r/${r.publicToken}/admin/${r.adminToken}`}
              className="flex items-center justify-between rounded-lg border bg-card p-4 hover:border-primary"
            >
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-sm text-muted-foreground">Open het beheer</p>
              </div>
              <ChevronRightIcon className="size-4 text-muted-foreground" />
            </a>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button variant="outline" nativeButton={false} render={<a href="/" />}>
          <PlusIcon data-icon="inline-start" />
          Nieuw rooster maken
        </Button>
        <AddRosterForm />
      </div>

      <form action={signOutAction}>
        <Button variant="ghost" type="submit">
          Uitloggen
        </Button>
      </form>
    </main>
  );
}
