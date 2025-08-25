"use client"

import { ConnectKitButton } from "connectkit"
import { Button } from "@/components/ui/button"
import { Wallet, User, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

export function WalletButton() {
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    const handleError = (event: any) => {
      if (event.error?.message?.includes("Connection interrupted")) {
        setConnectionError("Connection failed. Please try again.")
        setTimeout(() => setConnectionError(null), 5000)
      }
    }

    window.addEventListener("unhandledrejection", handleError)
    return () => window.removeEventListener("unhandledrejection", handleError)
  }, [])

  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
        const handleConnect = () => {
          try {
            setConnectionError(null)
            show?.()
          } catch (error) {
            console.error("[v0] Wallet connection error:", error)
            setConnectionError("Failed to open wallet connection")
          }
        }

        return (
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={handleConnect}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Connecting...
                </>
              ) : isConnected ? (
                <>
                  <User className="w-4 h-4 mr-2" />
                  {ensName ?? `${address?.slice(0, 6)}...${address?.slice(-4)}`}
                  {chain && <span className="ml-2 text-xs opacity-70">{chain.name}</span>}
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </>
              )}
            </Button>
            {connectionError && (
              <div className="flex items-center gap-1 text-xs text-red-400">
                <AlertCircle className="w-3 h-3" />
                {connectionError}
              </div>
            )}
          </div>
        )
      }}
    </ConnectKitButton.Custom>
  )
}
