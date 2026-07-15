import { headers } from "next/headers";
import Link from "next/link";

import { GithubIcon } from "@/components/github-icon";
import { Logo } from "@/components/logo";
import { auth } from "@/lib/auth";
import { dbReady } from "@/lib/db";

export async function NavBar() {
  // headers() must come first: its dynamic-rendering bailout is what keeps
  // this out of prerendering — at build time the database does not exist yet.
  const requestHeaders = await headers();
  let session = null;
  try {
    await dbReady();
    session = await auth.api.getSession({ headers: requestHeaders });
  } catch {
    // The navbar must never take a page down; fall back to signed-out.
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#EFE6DA] bg-[#FBF6EF]/90 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          aria-label="Naar de startpagina"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-70"
        >
          <Logo className="size-7 text-[#E4593B]" />
          <span className="font-serif text-2xl font-semibold tracking-[-0.01em] text-[#221D18]">
            Bezoekje<span className="text-[#E4593B]">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/MajesteitBart/bezoekje"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Broncode op GitHub"
            className="text-[#4A443D] transition-colors hover:text-[#E4593B]"
          >
            <GithubIcon className="size-5" />
          </a>
          <Link
            href="/account"
            className="rounded-md border border-[#EFE6DA] bg-white px-3.5 py-1.5 text-sm font-medium text-[#4A443D] transition-colors hover:border-[#E4593B]/50 hover:text-[#E4593B]"
          >
            {session ? "Mijn account" : "Inloggen"}
          </Link>
        </div>
      </nav>
    </header>
  );
}
