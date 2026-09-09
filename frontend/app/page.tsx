"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";

export default function Home() {
  const { login, authenticated, user } = usePrivy();
  const { wallets } = useWallets();

  if (!authenticated) {
    return <button onClick={login}>Log in</button>
  }

  return (
    <div>
      <p>Logged in as: {user?.id}</p>
      <p>Wallets:</p>
      <ul>
        {wallets.map((w) => (
          <li key={w.address}>{w.address} ({w.walletClientType})</li>
        ))}
      </ul>
    </div>
  );
}
