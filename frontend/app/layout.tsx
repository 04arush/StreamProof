"use client";

import "./globals.css";
import { PrivyProvider } from "@privy-io/react-auth";
import { Newsreader, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { arcTestnet } from "@/lib/circuit/arcChain";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex-sans",
  weight: ["400", "500", "600"],
});

const NAV_ITEMS = [
  { href: "/", label: "Wallet" },
  { href: "/platform", label: "Post commitment" },
  { href: "/claim", label: "Claim payout" },
];

function Nav() {
  const pathname = usePathname();
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-2xl items-baseline justify-between px-6 py-5">
        <span className="font-serif text-lg italic text-foreground">
          StreamProof
        </span>
        <nav className="flex gap-5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-mono text-[13px] transition-colors ${
                  active ? "text-accent" : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${plexMono.variable} ${plexSans.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
          config={{
            defaultChain: arcTestnet,
            supportedChains: [arcTestnet],
            embeddedWallets: {
              ethereum: {
                createOnLogin: "all-users",
              },
            },
          }}
        >
          <Nav />
          <main className="mx-auto max-w-2xl px-6 py-12">{children}</main>
        </PrivyProvider>
      </body>
    </html>
  );
}
