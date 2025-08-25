"use client"

import { useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { parseEther, formatEther, erc20Abi } from "viem"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Flame, AlertCircle, CheckCircle, Loader2, ExternalLink } from "lucide-react"

// Common ERC20 tokens for demo (in production, this would come from a token list)
const SUPPORTED_TOKENS = [
  {
    address: "0xA0b86a33E6441b8435b662c8C0b0E8E6C5b8B8E8" as `0x${string}`,
    symbol: "DEMO",
    name: "Demo Token",
    decimals: 18,
  },
  {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" as `0x${string}`,
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
  },
  {
    address: "0xA0b86a33E6441b8435b662c8C0b0E8E6C5b8B8E8" as `0x${string}`,
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
  },
]

const BLACKHOLE_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`

interface TokenBurnFormProps {
  onBurnSuccess?: (txHash: string, amount: string, token: string) => void
}

export function TokenBurnForm({ onBurnSuccess }: TokenBurnFormProps) {
  const [selectedToken, setSelectedToken] = useState<string>("")
  const [burnAmount, setBurnAmount] = useState<string>("")
  const [step, setStep] = useState<"select" | "approve" | "burn" | "success">("select")

  const { address } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const selectedTokenData = SUPPORTED_TOKENS.find((t) => t.address === selectedToken)

  // Read token balance
  const { data: tokenBalance } = useReadContract({
    address: selectedToken as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!selectedToken && !!address },
  })

  // Read token allowance
  const { data: allowance } = useReadContract({
    address: selectedToken as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, BLACKHOLE_CONTRACT_ADDRESS] : undefined,
    query: { enabled: !!selectedToken && !!address },
  })

  const handleApprove = async () => {
    if (!selectedTokenData || !burnAmount) return

    try {
      setStep("approve")
      const amount = parseEther(burnAmount)

      writeContract({
        address: selectedToken as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [BLACKHOLE_CONTRACT_ADDRESS, amount],
      })
    } catch (err) {
      console.error("Approval failed:", err)
      setStep("select")
    }
  }

  const handleBurn = async () => {
    if (!selectedTokenData || !burnAmount) return

    try {
      setStep("burn")
      const amount = parseEther(burnAmount)

      // This would call the BlackholeWallet contract's burnTokens function
      // For demo purposes, we'll simulate the burn by transferring to dead address
      writeContract({
        address: selectedToken as `0x${string}`,
        abi: erc20Abi,
        functionName: "transfer",
        args: ["0x000000000000000000000000000000000000dEaD", amount],
      })
    } catch (err) {
      console.error("Burn failed:", err)
      setStep("approve")
    }
  }

  const resetForm = () => {
    setSelectedToken("")
    setBurnAmount("")
    setStep("select")
  }

  const isApprovalNeeded = allowance && burnAmount ? allowance < parseEther(burnAmount) : true

  const canBurn =
    selectedToken &&
    burnAmount &&
    Number.parseFloat(burnAmount) > 0 &&
    tokenBalance &&
    parseEther(burnAmount) <= tokenBalance

  // Handle transaction success
  if (isConfirmed && step === "burn") {
    setTimeout(() => {
      setStep("success")
      onBurnSuccess?.(hash!, burnAmount, selectedTokenData?.symbol || "")
    }, 1000)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Flame className="w-5 h-5 text-primary" />
          <span>Burn Tokens</span>
        </CardTitle>
        <CardDescription>Send tokens to the void and gain reputation points</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === "success" ? (
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Tokens Burned Successfully!</h3>
            <p className="text-muted-foreground mb-4">
              {burnAmount} {selectedTokenData?.symbol} has been sacrificed to the void
            </p>
            {hash && (
              <Button
                variant="outline"
                size="sm"
                className="mb-4 bg-transparent"
                onClick={() => window.open(`https://etherscan.io/tx/${hash}`, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Transaction
              </Button>
            )}
            <Button onClick={resetForm} className="bg-primary hover:bg-primary/90">
              Burn More Tokens
            </Button>
          </div>
        ) : (
          <>
            {/* Token Selection */}
            <div className="space-y-2">
              <Label htmlFor="token-select">Select Token</Label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a token to burn" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_TOKENS.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{token.symbol}</span>
                        <span className="text-muted-foreground">({token.name})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount Input */}
            {selectedToken && (
              <div className="space-y-2">
                <Label htmlFor="burn-amount">Amount to Burn</Label>
                <div className="relative">
                  <Input
                    id="burn-amount"
                    type="number"
                    placeholder="0.0"
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(e.target.value)}
                    className="pr-16"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {selectedTokenData?.symbol}
                  </div>
                </div>
                {tokenBalance && (
                  <p className="text-sm text-muted-foreground">
                    Balance: {formatEther(tokenBalance)} {selectedTokenData?.symbol}
                  </p>
                )}
              </div>
            )}

            {/* Transaction Progress */}
            {(isPending || isConfirming) && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{step === "approve" ? "Approving tokens..." : "Burning tokens..."}</span>
                </div>
                <Progress value={step === "approve" ? 33 : step === "burn" ? 66 : 100} />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert className="border-destructive/20 bg-destructive/5">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">Transaction failed: {error.message}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {!canBurn ? (
                <Button disabled className="w-full">
                  {!selectedToken ? "Select a token" : !burnAmount ? "Enter amount" : "Insufficient balance"}
                </Button>
              ) : isApprovalNeeded ? (
                <Button
                  onClick={handleApprove}
                  disabled={isPending || isConfirming}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isPending && step === "approve" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve {selectedTokenData?.symbol}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleBurn}
                  disabled={isPending || isConfirming}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isPending && step === "burn" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Burning...
                    </>
                  ) : (
                    <>
                      <Flame className="w-4 h-4 mr-2" />
                      Burn {burnAmount} {selectedTokenData?.symbol}
                    </>
                  )}
                </Button>
              )}

              {/* Reputation Preview */}
              {burnAmount && Number.parseFloat(burnAmount) > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estimated Reputation Gain:</span>
                    <span className="font-medium text-primary">
                      +{Math.floor(Number.parseFloat(burnAmount) * 100)} pts
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
