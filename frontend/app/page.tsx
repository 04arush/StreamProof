"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";

function truncateHex(value: string, lead = 6, tail = 4): string {
  if (!value || value.length <= lead + tail + 2) return value;
  return `${value.slice(0, lead + 2)}…${value.slice(-tail)}`;
}

export default function Home() {
  const { login, logout, authenticated, user } = usePrivy();
  const { wallets } = useWallets();

  if (!authenticated) {
    return (
      <div>
        <h1 className="font-serif text-3xl text-foreground">Wallet</h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
          Log in to see which wallets are attached to your account, including
          the embedded wallet created for claiming payouts.
        </p>
        <button
          onClick={login}
          className="mt-6 border border-accent px-5 py-2.5 font-mono text-[13px] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Log in
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground">Wallet</h1>
      <p className="mt-2 font-mono text-[13px] text-muted">{user?.id}</p>

      <div className="mt-8 border-t border-border">
        {wallets.map((w) => (
          <div
            key={w.address}
            className="flex items-center justify-between border-b border-border py-4"
          >
            <span className="font-mono text-[14px] text-foreground">
              {truncateHex(w.address)}
            </span>
            <span className="font-mono text-[12px] text-muted">
              {w.walletClientType}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={logout}
        className="mt-8 font-mono text-[13px] text-muted transition-colors hover:text-foreground"
      >
        Log out
      </button>
    </div>
  );
}
