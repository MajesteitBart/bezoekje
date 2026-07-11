import type { Metadata, Viewport } from "next"
import { Fraunces, Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { NavBar } from "@/components/nav-bar"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const fontSerif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  axes: ["SOFT", "WONK", "opsz"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://bezoekje.app"),
  title: "Bezoekje — plan even snel een bezoekje",
  description: "Eén link in de groepsapp. Kies een vrij moment, zet je naam erbij, klaar.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Bezoekje — plan even snel een bezoekje",
    description:
      "Maak een bezoekrooster en deel één link in je WhatsApp-groep. Iedereen ziet direct wie er wanneer komt.",
    url: "https://bezoekje.app",
    siteName: "Bezoekje",
    locale: "nl_NL",
    type: "website",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Android Chrome 108+ overlays the on-screen keyboard by default, so
  // bottom-anchored dialogs disappear behind it. This makes the keyboard
  // shrink the viewport instead, so dvh units and fixed bottom-0 elements
  // stay above the keys.
  interactiveWidget: "resizes-content",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="nl"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, fontSerif.variable, "font-sans", geist.variable)}
    >
      <body>
        <ThemeProvider>
          <div className="flex min-h-svh flex-col">
            <NavBar />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
