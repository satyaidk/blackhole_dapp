"use client"

import { useState } from "react"
import { useAccount, useBalance, useChainId } from "wagmi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Flame, Trophy, History, Shield, AlertCircle, CheckCircle } from "lucide-react"
import { WalletButton } from "@/components/wallet-button"
import { TokenBurnForm } from "@/components/token-burn-form"
import { ReputationDashboard } from "@/components/reputation-dashboard"
import { ProofVerification } from "@/components/proof-verification"

export function BlackholeWallet() {
  const [activeTab, setActiveTab] = useState("burn")
  const [recentBurns, setRecentBurns] = useState<
    Array<{
      txHash: string
      amount: string
      token: string
      timestamp: number
    }>
  >([])

  const { address, isConnected, isConnecting } = useAccount()
  const chainId = useChainId()
  const { data: balance } = useBalance({
    address: address,
  })

  // Mock data - will be replaced with real contract data
  const userStats = {
    reputation: recentBurns.reduce((acc, burn) => acc + Math.floor(Number.parseFloat(burn.amount) * 100), 0),
    totalBurned: recentBurns.reduce((acc, burn) => acc + Number.parseFloat(burn.amount), 0),
    burnCount: recentBurns.length,
    rank: recentBurns.length === 0 ? "Unranked" : recentBurns.length < 5 ? "Novice Burner" : "Veteran Burner",
  }

  const globalStats = {
    totalBurners: 42,
    totalTokensBurned: 1337,
    totalBurns: 256,
  }

  const handleBurnSuccess = (txHash: string, amount: string, token: string) => {
    setRecentBurns((prev) =>
      [
        {
          txHash,
          amount,
          token,
          timestamp: Date.now(),
        },
        ...prev,
      ].slice(0, 10),
    ) // Keep only last 10 burns
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Flame className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Blackhole Wallet</h1>
                <p className="text-sm text-muted-foreground">Proof of Burn = Reputation</p>
              </div>
            </div>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!isConnected && (
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              Connect your wallet to start burning tokens and building reputation
            </AlertDescription>
          </Alert>
        )}

        {isConnected && (
          <Alert className="mb-6 border-green-500/20 bg-green-500/5">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-foreground">
              Wallet connected: {address?.slice(0, 6)}...{address?.slice(-4)} | Balance: {balance?.formatted}{" "}
              {balance?.symbol} | Chain: {chainId}
            </AlertDescription>
          </Alert>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-card rounded-lg p-1">
          {[
            { id: "burn", label: "Burn Tokens", icon: Flame },
            { id: "reputation", label: "Reputation", icon: Trophy },
            { id: "history", label: "History", icon: History },
            { id: "proof", label: "Proof Verification", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "burn" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Burn Interface */}
            {isConnected ? (
              <TokenBurnForm onBurnSuccess={handleBurnSuccess} />
            ) : (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Flame className="w-5 h-5 text-primary" />
                    <span>Burn Tokens</span>
                  </CardTitle>
                  <CardDescription>Send tokens to the void and gain reputation points</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-8 border-2 border-dashed border-border rounded-lg">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Flame className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Ready to Sacrifice?</h3>
                    <p className="text-muted-foreground mb-4">
                      Connect your wallet to start burning tokens for reputation
                    </p>
                    <WalletButton />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Card */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Burn Statistics</CardTitle>
                <CardDescription>Global burning activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{globalStats.totalBurners}</div>
                    <div className="text-sm text-muted-foreground">Total Burners</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{globalStats.totalTokensBurned}</div>
                    <div className="text-sm text-muted-foreground">Tokens Burned</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{globalStats.totalBurns}</div>
                    <div className="text-sm text-muted-foreground">Total Burns</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">∞</div>
                    <div className="text-sm text-muted-foreground">Void Depth</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "reputation" && (
          <ReputationDashboard userStats={userStats} recentBurns={recentBurns} isConnected={isConnected} />
        )}

        {activeTab === "history" && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="w-5 h-5 text-primary" />
                <span>Burn History</span>
              </CardTitle>
              <CardDescription>All token sacrifices to the void</CardDescription>
            </CardHeader>
            <CardContent>
              {recentBurns.length > 0 ? (
                <div className="space-y-3">
                  {recentBurns.map((burn, index) => (
                    <div key={burn.txHash} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Flame className="w-4 h-4 text-primary" />
                        <div>
                          <div className="font-medium">
                            {burn.amount} {burn.token}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(burn.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-primary">
                          +{Math.floor(Number.parseFloat(burn.amount) * 100)} pts
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://etherscan.io/tx/${burn.txHash}`, "_blank")}
                        >
                          View Tx
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No burns recorded yet</p>
                  <p className="text-sm">
                    {isConnected
                      ? "Start burning tokens to see your history"
                      : "Connect your wallet and start burning to see history"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "proof" && <ProofVerification recentBurns={recentBurns} />}
      </div>
    </div>
  )
}
