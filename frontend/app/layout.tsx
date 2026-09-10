"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { arcTestnet } from "@/lib/circuit/arcChain";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
          config={{
            defaultChain: arcTestnet,
            supportedChains: [arcTestnet],
            embeddedWallets: { createOnLogin: "all-users" }
          }}
        >
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}
