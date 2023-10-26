"use client";
import "@rainbow-me/rainbowkit/styles.css";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig } from "wagmi";
import { useEffect, useState } from "react";
import getWagmiConfig from "./config";

const dAppInfo = {
  appName: "Flame Minter",
};

export function Providers({ children }: { children: React.ReactNode }) {
  const myWagmiConfig = getWagmiConfig(
    process.env.NEXT_PUBLIC_TESTNET as string,
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <WagmiConfig config={myWagmiConfig.config}>
      <RainbowKitProvider
        chains={myWagmiConfig.chains}
        appInfo={dAppInfo}
        theme={darkTheme({ accentColor: "#fdc50e" })}
        modalSize="compact"
      >
        {mounted && children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
