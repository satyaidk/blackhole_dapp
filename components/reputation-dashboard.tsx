"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, TrendingUp, Award, Star, Flame, Target } from "lucide-react"

interface ReputationDashboardProps {
  userStats: {
    reputation: number
    totalBurned: number
    burnCount: number
    rank: string
  }
  recentBurns: Array<{
    txHash: string
    amount: string
    token: string
    timestamp: number
  }>
  isConnected: boolean
}

const ACHIEVEMENTS = [
  {
    id: "first_burn",
    name: "First Sacrifice",
    description: "Complete your first token burn",
    icon: Flame,
    threshold: 1,
    type: "burns",
  },
  {
    id: "serial_burner",
    name: "Serial Burner",
    description: "Complete 10 token burns",
    icon: Target,
    threshold: 10,
    type: "burns",
  },
  {
    id: "whale_burner",
    name: "Whale Burner",
    description: "Burn over 100 tokens total",
    icon: Trophy,
    threshold: 100,
    type: "amount",
  },
  {
    id: "reputation_master",
    name: "Reputation Master",
    description: "Reach 10,000 reputation points",
    icon: Star,
    threshold: 10000,
    type: "reputation",
  },
]

const RANK_TIERS = [
  { name: "Unranked", min: 0, max: 0, color: "text-muted-foreground" },
  { name: "Novice Burner", min: 1, max: 999, color: "text-green-500" },
  { name: "Veteran Burner", min: 1000, max: 4999, color: "text-blue-500" },
  { name: "Elite Burner", min: 5000, max: 19999, color: "text-purple-500" },
  { name: "Legendary Burner", min: 20000, max: 99999, color: "text-orange-500" },
  { name: "Void Master", min: 100000, max: Number.POSITIVE_INFINITY, color: "text-primary" },
]

const LEADERBOARD_DATA = [
  { address: "0x1234...5678", reputation: 45230, burns: 127, totalBurned: 892.5, rank: "Void Master" },
  { address: "0x9876...4321", reputation: 32100, burns: 89, totalBurned: 654.2, rank: "Legendary Burner" },
  { address: "0xabcd...efgh", reputation: 28750, burns: 76, totalBurned: 543.8, rank: "Legendary Burner" },
  { address: "0x5555...9999", reputation: 15420, burns: 45, totalBurned: 321.7, rank: "Elite Burner" },
  { address: "0x7777...1111", reputation: 12890, burns: 38, totalBurned: 287.3, rank: "Elite Burner" },
]

export function ReputationDashboard({ userStats, recentBurns, isConnected }: ReputationDashboardProps) {
  const currentTier =
    RANK_TIERS.find((tier) => userStats.reputation >= tier.min && userStats.reputation <= tier.max) || RANK_TIERS[0]

  const nextTier = RANK_TIERS.find((tier) => tier.min > userStats.reputation)
  const progressToNext = nextTier
    ? ((userStats.reputation - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100

  const unlockedAchievements = ACHIEVEMENTS.filter((achievement) => {
    switch (achievement.type) {
      case "burns":
        return userStats.burnCount >= achievement.threshold
      case "amount":
        return userStats.totalBurned >= achievement.threshold
      case "reputation":
        return userStats.reputation >= achievement.threshold
      default:
        return false
    }
  })

  const tokenBreakdown = recentBurns.reduce(
    (acc, burn) => {
      acc[burn.token] = (acc[burn.token] || 0) + Number.parseFloat(burn.amount)
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Enhanced User Reputation */}
      <Card className="border-border bg-card lg:col-span-2 xl:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-primary" />
            <span>Your Reputation</span>
          </CardTitle>
          <CardDescription>Your proof of sacrifice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-12 h-12 text-primary" />
            </div>
            <div className="text-4xl font-bold text-primary mb-2">{userStats.reputation.toLocaleString()}</div>
            <div className="text-muted-foreground mb-2">Reputation Points</div>
            <Badge variant="secondary" className={currentTier.color}>
              {currentTier.name}
            </Badge>
          </div>

          {/* Progress to Next Tier */}
          {nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to {nextTier.name}</span>
                <span className="text-primary">{Math.round(progressToNext)}%</span>
              </div>
              <Progress value={progressToNext} className="h-2" />
              <div className="text-xs text-muted-foreground text-center">
                {(nextTier.min - userStats.reputation).toLocaleString()} points to go
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{userStats.burnCount}</div>
              <div className="text-xs text-muted-foreground">Total Burns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{userStats.totalBurned.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Tokens Burned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Leaderboard */}
      <Card className="border-border bg-card lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Global Leaderboard</span>
          </CardTitle>
          <CardDescription>Top burners by reputation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {LEADERBOARD_DATA.map((user, index) => (
              <div key={user.address} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-4">
                  <Badge variant={index === 0 ? "default" : "secondary"} className="min-w-[2rem]">
                    #{index + 1}
                  </Badge>
                  <div>
                    <div className="font-medium">{user.address}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.burns} burns • {user.totalBurned} tokens
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{user.reputation.toLocaleString()}</div>
                  <Badge variant="outline" className="text-xs">
                    {user.rank}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-primary" />
            <span>Achievements</span>
          </CardTitle>
          <CardDescription>Unlock rewards through burning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ACHIEVEMENTS.map((achievement) => {
              const isUnlocked = unlockedAchievements.includes(achievement)
              const Icon = achievement.icon

              return (
                <div
                  key={achievement.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                    isUnlocked ? "bg-primary/10 border border-primary/20" : "bg-muted opacity-60"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isUnlocked ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                      {achievement.name}
                    </div>
                    <div className="text-sm text-muted-foreground">{achievement.description}</div>
                  </div>
                  {isUnlocked && (
                    <Badge variant="default" className="bg-primary">
                      Unlocked
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Token Breakdown */}
      {Object.keys(tokenBreakdown).length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Token Breakdown</CardTitle>
            <CardDescription>Burned tokens by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(tokenBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([token, amount]) => (
                  <div key={token} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{token.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <span className="font-medium">{token}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{amount.toFixed(4)}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((amount / userStats.totalBurned) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reputation Analytics */}
      <Card className="border-border bg-card lg:col-span-2">
        <CardHeader>
          <CardTitle>Reputation Analytics</CardTitle>
          <CardDescription>Your burning journey insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {userStats.burnCount > 0 ? Math.round(userStats.reputation / userStats.burnCount) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Avg Points/Burn</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {userStats.burnCount > 0 ? (userStats.totalBurned / userStats.burnCount).toFixed(2) : "0.00"}
              </div>
              <div className="text-sm text-muted-foreground">Avg Tokens/Burn</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {recentBurns.length > 0
                  ? Math.round((Date.now() - Math.min(...recentBurns.map((b) => b.timestamp))) / (1000 * 60 * 60 * 24))
                  : 0}
              </div>
              <div className="text-sm text-muted-foreground">Days Active</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{Object.keys(tokenBreakdown).length}</div>
              <div className="text-sm text-muted-foreground">Token Types</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
