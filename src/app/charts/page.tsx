"use client"

import { useState, useEffect } from "react"
import { Loader2, TrendingUp, TrendingDown, Wallet, BarChart3, Calendar, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CashFlowPieChart } from "@/components/dashboard/CashFlowPieChart"
import { CategoryBarChart } from "@/components/dashboard/CategoryBarChart"
import { ProtectedRoute } from "@/components/ProtectedRoute"

interface User {
  id: string
  name: string
  email: string
  isVerified: boolean
}

interface Transaction {
  _id: string
  type: 'in' | 'out'
  amount: number
  category: string
  description: string
  date: string
}

interface Summary {
  totalIn: number
  totalOut: number
  balance: number
  incomeByCategory: { category: string; amount: number }[]
  expenseByCategory: { category: string; amount: number }[]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

function ChartsContent() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalIn: 0,
    totalOut: 0,
    balance: 0,
    incomeByCategory: [],
    expenseByCategory: [],
  })
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [availableCategories, setAvailableCategories] = useState<string[]>([])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const fetchData = async () => {
    if (!user?.email) return

    try {
      setLoading(true)
      const response = await fetch(`/api/transactions?email=${user.email}&filter=${timeFilter}`)
      const data = await response.json()
      
      if (response.ok) {
        const filteredTransactions = categoryFilter === 'all' 
          ? data.transactions 
          : data.transactions.filter((t: Transaction) => t.category === categoryFilter)
        
        setTransactions(filteredTransactions)
        calculateSummary(filteredTransactions)
        
        // Extract unique categories
        const categories = [...new Set(data.transactions.map((t: Transaction) => t.category))]
        setAvailableCategories(categories)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateSummary = (transactions: Transaction[]) => {
    const totalIn = transactions.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0)
    const totalOut = transactions.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0)
    
    const incomeByCategory = transactions
      .filter(t => t.type === 'in')
      .reduce((acc, t) => {
        const existing = acc.find(item => item.category === t.category)
        if (existing) {
          existing.amount += t.amount
        } else {
          acc.push({ category: t.category, amount: t.amount })
        }
        return acc
      }, [] as { category: string; amount: number }[])
    
    const expenseByCategory = transactions
      .filter(t => t.type === 'out')
      .reduce((acc, t) => {
        const existing = acc.find(item => item.category === t.category)
        if (existing) {
          existing.amount += t.amount
        } else {
          acc.push({ category: t.category, amount: t.amount })
        }
        return acc
      }, [] as { category: string; amount: number }[])
    
    setSummary({
      totalIn,
      totalOut,
      balance: totalIn - totalOut,
      incomeByCategory,
      expenseByCategory
    })
  }

  useEffect(() => {
    if (user?.email) {
      fetchData()
    }
  }, [user, timeFilter, categoryFilter])

  useEffect(() => {
    const handleTransactionAdded = () => {
      fetchData()
    }
    
    window.addEventListener('transactionAdded', handleTransactionAdded)
    return () => {
      window.removeEventListener('transactionAdded', handleTransactionAdded)
    }
  }, [user?.email, timeFilter, categoryFilter])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Financial Charts & Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            Visual analysis of your financial data
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Time Period
                </label>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="daily">Today</SelectItem>
                    <SelectItem value="weekly">This Week</SelectItem>
                    <SelectItem value="monthly">This Month</SelectItem>
                    <SelectItem value="lastMonth">Last Month</SelectItem>
                    <SelectItem value="yearly">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Filter className="inline h-4 w-4 mr-1" />
                  Category
                </label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {availableCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 w-full">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-green-600">
                    ₹{(summary.totalIn / 1000).toFixed(0)}K
                  </div>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {formatCurrency(summary.totalIn)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-red-600">
                    ₹{(summary.totalOut / 1000).toFixed(0)}K
                  </div>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {formatCurrency(summary.totalOut)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Balance</CardTitle>
                  <Wallet className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">
                    ₹{(summary.balance / 1000).toFixed(0)}K
                  </div>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {formatCurrency(summary.balance)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Count</CardTitle>
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-purple-600">
                    {transactions.length}
                  </div>
                  <p className="text-xs text-gray-500">
                    transactions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Financial Health Insights */}
            {summary.totalOut > 0 && (
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 w-full">
                <Card className={`border-l-4 ${
                  (summary.totalOut / summary.totalIn) > 0.8 ? 'border-red-500' : 
                  (summary.totalOut / summary.totalIn) > 0.6 ? 'border-yellow-500' : 'border-green-500'
                }`}>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Expense Ratio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {((summary.totalOut / summary.totalIn) * 100).toFixed(0)}%
                    </div>
                    <p className="text-xs text-gray-500">
                      {(summary.totalOut / summary.totalIn) > 0.8 ? '⚠️ High spending' : 
                       (summary.totalOut / summary.totalIn) > 0.6 ? '⚡ Moderate spending' : '✅ Good savings'}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{Math.round(summary.totalOut / 30)}
                    </div>
                    <p className="text-xs text-gray-500">
                      spending per day
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">
                      {summary.expenseByCategory.length > 0 ? 
                        summary.expenseByCategory.reduce((max, cat) => cat.amount > max.amount ? cat : max).category
                        : 'N/A'
                      }
                    </div>
                    <p className="text-xs text-gray-500">
                      highest expense
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Spending Comparison with Benchmarks */}
            {summary.expenseByCategory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    📊 Spending vs Recommended Budget
                  </CardTitle>
                  <p className="text-sm text-gray-600">Compare your spending with financial experts' recommendations</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {summary.expenseByCategory.map(category => {
                      const percentage = (category.amount / summary.totalOut) * 100
                      const recommended = {
                        'Food & Dining': 15,
                        'Transportation': 15,
                        'Healthcare': 5,
                        'Shopping': 10,
                        'Bills & EMI': 25,
                        'Personal Care': 5,
                        'Investment': 20,
                        'Other Expense': 5
                      }[category.category] || 10
                      
                      const status = percentage > recommended * 1.5 ? 'over' : 
                                   percentage > recommended ? 'high' : 'good'
                      
                      return (
                        <div key={category.category} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{category.category}</span>
                            <div className="text-right">
                              <span className={`text-sm font-bold ${
                                status === 'over' ? 'text-red-600' : 
                                status === 'high' ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {percentage.toFixed(1)}%
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                (Rec: {recommended}%)
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1 h-2">
                            <div 
                              className={`h-full rounded ${
                                status === 'over' ? 'bg-red-500' : 
                                status === 'high' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                            <div 
                              className="h-full bg-gray-200 border-l-2 border-gray-400"
                              style={{ 
                                width: `${Math.max(0, 100 - percentage)}%`,
                                marginLeft: `${Math.max(0, recommended - percentage)}%`
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(category.amount)} • 
                            {status === 'over' ? '⚠️ Consider reducing' : 
                             status === 'high' ? '⚡ Above recommended' : '✅ Within budget'}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Charts */}
            <div className="space-y-4 sm:space-y-6">
              {/* Income vs Expense Trend */}
              {(summary.incomeByCategory.length > 0 || summary.expenseByCategory.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      💰 Income vs Expenses Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                      {summary.incomeByCategory.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-3 text-green-600">Income Sources</h4>
                          <CashFlowPieChart data={summary.incomeByCategory} type="in" />
                        </div>
                      )}
                      {summary.expenseByCategory.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-3 text-red-600">Expense Categories</h4>
                          <CashFlowPieChart data={summary.expenseByCategory} type="out" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Category Comparison */}
              {summary.expenseByCategory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      📈 Category-wise Spending Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoryBarChart data={summary.expenseByCategory} type="out" />
                  </CardContent>
                </Card>
              )}
              
              {summary.incomeByCategory.length === 0 && summary.expenseByCategory.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-gray-500">No data available for the selected filters</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChartsPage() {
  return (
    <ProtectedRoute>
      <ChartsContent />
    </ProtectedRoute>
  )
}