"use client"

import { createConfig, WagmiProvider } from "wagmi"
import { mainnet, sepolia, polygon, arbitrum } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ConnectKitProvider, getDefaultConfig } from "connectkit"
import type { ReactNode } from "react"

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

// Configure wagmi with proper error handling
const config = createConfig(
  getDefaultConfig({
    // Your dApp details
    appName: "Blackhole Wallet",
    appDescription: "Proof of Burn = Reputation",
    appUrl: typeof window !== "undefined" ? window.location.origin : "https://blackhole-wallet.vercel.app",
    appIcon:
      typeof window !== "undefined"
        ? `${window.location.origin}/icon.png`
        : "https://blackhole-wallet.vercel.app/icon.png",

    ...(projectId && projectId !== "demo" ? { walletConnectProjectId: projectId } : {}),

    // Supported chains
    chains: [mainnet, sepolia, polygon, arbitrum],

    // Optional
    ssr: true,
  }),
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry WalletConnect connection errors
        if (error?.message?.includes("Connection interrupted")) {
          return false
        }
        return failureCount < 3
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="midnight"
          options={{
            hideBalance: false,
            hideTooltips: false,
            hideQuestionMarkCTA: true,
            hideNoWalletCTA: false,
            walletConnectCTA: projectId && projectId !== "demo" ? "both" : "link",
            // Disable WalletConnect if no valid project ID
            disableInjectedIfNoWallet: !projectId || projectId === "demo",
          }}
          customTheme={{
            "--ck-connectbutton-font-size": "16px",
            "--ck-connectbutton-border-radius": "8px",
            "--ck-connectbutton-color": "#ffffff",
            "--ck-connectbutton-background": "oklch(0.55 0.22 25)",
            "--ck-connectbutton-box-shadow": "0 0 0 0px transparent",
            "--ck-connectbutton-hover-background": "oklch(0.45 0.22 25)",
            "--ck-primary-button-border-radius": "8px",
            "--ck-modal-box-shadow": "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
            "--ck-overlay-background": "rgba(0, 0, 0, 0.8)",
            "--ck-body-background": "oklch(0.1 0 0)",
            "--ck-body-color": "#ffffff",
            "--ck-body-color-muted": "oklch(0.7 0 0)",
            "--ck-body-background-secondary": "oklch(0.15 0 0)",
            "--ck-body-background-tertiary": "oklch(0.2 0 0)",
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
