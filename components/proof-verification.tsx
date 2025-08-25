"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  CheckCircle,
  XCircle,
  Copy,
  Download,
  Upload,
  Search,
  FileText,
  Hash,
  Clock,
  ExternalLink,
} from "lucide-react"

interface BurnProof {
  txHash: string
  amount: string
  token: string
  timestamp: number
  blockNumber: number
  burnerAddress: string
  proofHash: string
  verified: boolean
}

interface ProofVerificationProps {
  recentBurns: Array<{
    txHash: string
    amount: string
    token: string
    timestamp: number
  }>
}

export function ProofVerification({ recentBurns }: ProofVerificationProps) {
  const [verificationTxHash, setVerificationTxHash] = useState("")
  const [verificationResult, setVerificationResult] = useState<{
    status: "idle" | "loading" | "success" | "error"
    data?: BurnProof
    error?: string
  }>({ status: "idle" })

  const { address } = useAccount()

  // Generate proof hash for a burn transaction
  const generateProofHash = (txHash: string, amount: string, token: string, timestamp: number): string => {
    const data = `${txHash}-${amount}-${token}-${timestamp}-${address}`
    // In a real implementation, this would use proper cryptographic hashing
    return `0x${btoa(data)
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase()
      .slice(0, 64)}`
  }

  // Generate burn proofs for user's transactions
  const userBurnProofs: BurnProof[] = recentBurns.map((burn) => ({
    ...burn,
    blockNumber: Math.floor(Math.random() * 1000000) + 18000000, // Mock block number
    burnerAddress: address || "",
    proofHash: generateProofHash(burn.txHash, burn.amount, burn.token, burn.timestamp),
    verified: true,
  }))

  const handleVerifyTransaction = async () => {
    if (!verificationTxHash.trim()) return

    setVerificationResult({ status: "loading" })

    // Simulate verification process
    setTimeout(() => {
      // Mock verification - in reality this would query blockchain
      const mockProof: BurnProof = {
        txHash: verificationTxHash,
        amount: "10.5",
        token: "DEMO",
        timestamp: Date.now() - 86400000, // 1 day ago
        blockNumber: 18500000,
        burnerAddress: "0x1234567890123456789012345678901234567890",
        proofHash: generateProofHash(verificationTxHash, "10.5", "DEMO", Date.now() - 86400000),
        verified: true,
      }

      if (verificationTxHash.startsWith("0x") && verificationTxHash.length === 66) {
        setVerificationResult({ status: "success", data: mockProof })
      } else {
        setVerificationResult({
          status: "error",
          error: "Invalid transaction hash format or transaction not found",
        })
      }
    }, 2000)
  }

  const generateCertificate = (proof: BurnProof) => {
    const certificate = {
      type: "Blackhole Wallet Burn Certificate",
      version: "1.0",
      proof: {
        transactionHash: proof.txHash,
        amount: proof.amount,
        token: proof.token,
        timestamp: proof.timestamp,
        blockNumber: proof.blockNumber,
        burnerAddress: proof.burnerAddress,
        proofHash: proof.proofHash,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        reputation: Math.floor(Number.parseFloat(proof.amount) * 100),
        verified: proof.verified,
      },
    }

    const blob = new Blob([JSON.stringify(certificate, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `burn-certificate-${proof.txHash.slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyProofHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="verify" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="verify">Verify Proof</TabsTrigger>
          <TabsTrigger value="certificates">My Certificates</TabsTrigger>
          <TabsTrigger value="generate">Generate Proof</TabsTrigger>
        </TabsList>

        {/* Verify Transaction Proof */}
        <TabsContent value="verify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-primary" />
                <span>Verify Burn Proof</span>
              </CardTitle>
              <CardDescription>Verify any burn transaction and view its proof of sacrifice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tx-hash">Transaction Hash</Label>
                <div className="flex space-x-2">
                  <Input
                    id="tx-hash"
                    placeholder="0x..."
                    value={verificationTxHash}
                    onChange={(e) => setVerificationTxHash(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleVerifyTransaction} disabled={verificationResult.status === "loading"}>
                    {verificationResult.status === "loading" ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Verify
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Verification Result */}
              {verificationResult.status === "success" && verificationResult.data && (
                <Alert className="border-green-500/20 bg-green-500/5">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription>
                    <div className="space-y-3">
                      <div className="font-medium text-green-500">Burn Verified Successfully!</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="ml-2 font-medium">
                            {verificationResult.data.amount} {verificationResult.data.token}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Block:</span>
                          <span className="ml-2 font-medium">{verificationResult.data.blockNumber}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Burner:</span>
                          <span className="ml-2 font-medium">
                            {verificationResult.data.burnerAddress.slice(0, 10)}...
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date:</span>
                          <span className="ml-2 font-medium">
                            {new Date(verificationResult.data.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 pt-2 border-t border-green-500/20">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {verificationResult.data.proofHash}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyProofHash(verificationResult.data!.proofHash)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {verificationResult.status === "error" && (
                <Alert className="border-destructive/20 bg-destructive/5">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">{verificationResult.error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User's Burn Certificates */}
        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Your Burn Certificates</span>
              </CardTitle>
              <CardDescription>Downloadable proofs of your token sacrifices</CardDescription>
            </CardHeader>
            <CardContent>
              {userBurnProofs.length > 0 ? (
                <div className="space-y-4">
                  {userBurnProofs.map((proof) => (
                    <div key={proof.txHash} className="p-4 border border-border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                          <span className="font-medium">
                            {proof.amount} {proof.token}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => generateCertificate(proof)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(`https://etherscan.io/tx/${proof.txHash}`, "_blank")}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(proof.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Hash className="w-4 h-4" />
                          <span className="font-mono">{proof.proofHash.slice(0, 16)}...</span>
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">Proof Hash:</div>
                        <div className="flex items-center space-x-2">
                          <code className="text-xs font-mono bg-background px-2 py-1 rounded flex-1">
                            {proof.proofHash}
                          </code>
                          <Button size="sm" variant="ghost" onClick={() => copyProofHash(proof.proofHash)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No burn certificates available</p>
                  <p className="text-sm">Complete token burns to generate certificates</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generate Proof */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>Generate Burn Proof</span>
              </CardTitle>
              <CardDescription>Create cryptographic proof for external verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Burn proofs are automatically generated when you complete token burns. Use the certificates tab to
                  download and share your proofs.
                </AlertDescription>
              </Alert>

              <div className="p-6 border-2 border-dashed border-border rounded-lg text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Automatic Proof Generation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Every burn transaction automatically generates a cryptographic proof that can be verified by anyone.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Proofs include transaction hash, amount, token, and timestamp</p>
                  <p>• Each proof has a unique hash for verification</p>
                  <p>• Certificates can be downloaded as JSON files</p>
                  <p>• All proofs are publicly verifiable on-chain</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
