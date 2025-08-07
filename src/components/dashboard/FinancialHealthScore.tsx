"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Shield, Target, AlertTriangle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Transaction {
  type: 'in' | 'out'
  amount: number
  category: string
  date: string
}

interface FinancialHealthScoreProps {
  transactions: Transaction[]
  budgets: any[]
  savingsGoals: any[]
}

export function FinancialHealthScore({ transactions, budgets, savingsGoals }: FinancialHealthScoreProps) {
  const [healthScore, setHealthScore] = useState(0)
  const [insights, setInsights] = useState<string[]>([])

  useEffect(() => {
    calculateHealthScore()
  }, [transactions, budgets, savingsGoals])

  const calculateHealthScore = () => {
    let score = 0
    const newInsights: string[] = []

    // Income vs Expense Ratio (30 points)
    const totalIncome = transactions.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = transactions.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0)
    
    if (totalIncome > 0) {
      const expenseRatio = totalExpense / totalIncome
      if (expenseRatio < 0.5) {
        score += 30
        newInsights.push("🎉 Excellent spending control - you're saving over 50%!")
      } else if (expenseRatio < 0.7) {
        score += 20
        newInsights.push("👍 Good spending habits - saving 30-50% of income")
      } else if (expenseRatio < 0.9) {
        score += 10
        newInsights.push("⚠️ Consider reducing expenses - saving less than 30%")
      } else {
        newInsights.push("🚨 High spending alert - expenses exceed 90% of income")
      }
    }

    // Budget Adherence (25 points)
    if (budgets.length > 0) {
      const budgetsOnTrack = budgets.filter(b => b.status === 'good').length
      const budgetScore = (budgetsOnTrack / budgets.length) * 25
      score += budgetScore
      
      if (budgetScore > 20) {
        newInsights.push("💪 Great budget discipline - most budgets on track")
      } else if (budgetScore > 10) {
        newInsights.push("📊 Some budgets need attention")
      } else {
        newInsights.push("⚠️ Multiple budget overruns detected")
      }
    }

    // Savings Goals Progress (20 points)
    if (savingsGoals.length > 0) {
      const avgProgress = savingsGoals.reduce((sum, g) => sum + g.progress, 0) / savingsGoals.length
      const goalScore = (avgProgress / 100) * 20
      score += goalScore
      
      if (avgProgress > 75) {
        newInsights.push("🎯 Excellent progress on savings goals!")
      } else if (avgProgress > 50) {
        newInsights.push("📈 Good progress on savings goals")
      } else {
        newInsights.push("🎯 Focus needed on savings goals")
      }
    }

    // Transaction Consistency (15 points)
    const last30Days = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return transactionDate >= thirtyDaysAgo
    })

    if (last30Days.length > 0) {
      const dailyAvg = last30Days.length / 30
      if (dailyAvg > 0.5) {
        score += 15
        newInsights.push("📝 Good transaction tracking habits")
      } else {
        score += 5
        newInsights.push("📱 Try logging transactions more regularly")
      }
    }

    // Emergency Fund Check (10 points)
    const emergencyFund = savingsGoals.find(g => 
      g.title.toLowerCase().includes('emergency') || 
      g.title.toLowerCase().includes('fund')
    )
    
    if (emergencyFund) {
      if (emergencyFund.progress > 50) {
        score += 10
        newInsights.push("🛡️ Good emergency fund progress")
      } else {
        score += 5
        newInsights.push("🛡️ Build your emergency fund for financial security")
      }
    } else {
      newInsights.push("💡 Consider creating an emergency fund goal")
    }

    setHealthScore(Math.min(score, 100))
    setInsights(newInsights)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />
    if (score >= 60) return <Shield className="h-5 w-5 text-yellow-600" />
    return <AlertTriangle className="h-5 w-5 text-red-600" />
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Financial Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {getScoreIcon(healthScore)}
            <span className={`text-3xl font-bold ${getScoreColor(healthScore)}`}>
              {healthScore}
            </span>
            <span className="text-muted-foreground">/100</span>
          </div>
          <p className={`font-medium ${getScoreColor(healthScore)}`}>
            {getScoreLabel(healthScore)}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              healthScore >= 80 ? 'bg-green-500' :
              healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${healthScore}%` }}
          />
        </div>

        {/* Insights */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Key Insights:</h4>
          {insights.length > 0 ? (
            <div className="space-y-1">
              {insights.map((insight, index) => (
                <p key={index} className="text-xs text-muted-foreground">
                  {insight}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Add more transactions and set budgets to get personalized insights
            </p>
          )}
        </div>

        {/* Score Breakdown */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>Score based on:</p>
          <p>• Spending vs Income (30pts)</p>
          <p>• Budget Adherence (25pts)</p>
          <p>• Savings Progress (20pts)</p>
          <p>• Transaction Tracking (15pts)</p>
          <p>• Emergency Fund (10pts)</p>
        </div>
      </CardContent>
    </Card>
  )
}