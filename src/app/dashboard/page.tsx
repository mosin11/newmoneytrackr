"use client"

import { useState, useEffect } from "react"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { TransactionList } from "@/components/dashboard/TransactionList"

import { TransactionSearch } from "@/components/dashboard/TransactionSearch"

import { FinancialHealthScore } from "@/components/dashboard/FinancialHealthScore"
import { CashFlowPieChart } from "@/components/dashboard/CashFlowPieChart"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useLoader } from "@/components/ui/loader"
import { useToast } from "@/components/ui/toast"
import { DebugInfo } from "@/components/DebugInfo"

interface User {
  id: string
  name: string
  email: string
  isVerified: boolean
}

interface Transaction {
  _id: string
  type: "in" | "out"
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
  expenseSubcategories: { category: string; amount: number; subcategories: { name: string; amount: number }[] }[]
  monthlyCashFlow: { month: string; income: number; expense: number }[]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount)
}

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalIn: 0,
    totalOut: 0,
    balance: 0,
    incomeByCategory: [],
    expenseByCategory: [],
    expenseSubcategories: [],
    monthlyCashFlow: [],
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showCharts, setShowCharts] = useState(false)
  const [searchFilters, setSearchFilters] = useState({
    search: '',
    type: 'all' as 'all' | 'in' | 'out',
    category: 'all',
    minAmount: '',
    maxAmount: '',
    dateRange: 'all'
  })
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [budgets, setBudgets] = useState<unknown[]>([])
  const [savingsGoals, setSavingsGoals] = useState<unknown[]>([])
  const [activeFilter, setActiveFilter] = useState<'all' | 'in' | 'out'>('all')
  const { setLoading: setGlobalLoading } = useLoader()
  const { showToast } = useToast()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const fetchTransactions = async () => {
    if (!user?.email) return

    try {
      setLoading(true)
      setGlobalLoading(true)
      const response = await fetch(`/api/transactions?email=${user.email}&filter=${filter}`)
      const data = await response.json()
      
      if (response.ok) {
        setTransactions(data.transactions)
        setFilteredTransactions(data.transactions)
        calculateSummary(data.transactions)
        
        // Extract unique categories
        const categories = [...new Set(data.transactions.map((t: Transaction) => t.category))]
        setAvailableCategories(categories)
        
        // Fetch budgets and savings goals for health score
        fetchBudgetsAndGoals()
      } else {
        showToast('error', 'Failed to fetch transactions')
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      showToast('error', 'Failed to fetch transactions')
    } finally {
      setLoading(false)
      setGlobalLoading(false)
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
      ...summary,
      totalIn,
      totalOut,
      balance: totalIn - totalOut,
      incomeByCategory,
      expenseByCategory
    })
  }

  useEffect(() => {
    if (user?.email) {
      fetchTransactions()
    }
  }, [user, filter])

  // Filter transactions based on search criteria
  useEffect(() => {
    let filtered = transactions

    // Text search
    if (searchFilters.search) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchFilters.search.toLowerCase()) ||
        t.category.toLowerCase().includes(searchFilters.search.toLowerCase())
      )
    }

    // Type filter
    if (searchFilters.type !== 'all') {
      filtered = filtered.filter(t => t.type === searchFilters.type)
    }

    // Category filter
    if (searchFilters.category !== 'all') {
      filtered = filtered.filter(t => t.category === searchFilters.category)
    }

    // Amount range filter
    if (searchFilters.minAmount) {
      filtered = filtered.filter(t => t.amount >= parseFloat(searchFilters.minAmount))
    }
    if (searchFilters.maxAmount) {
      filtered = filtered.filter(t => t.amount <= parseFloat(searchFilters.maxAmount))
    }

    // Date range filter
    if (searchFilters.dateRange !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date)
        
        switch (searchFilters.dateRange) {
          case 'today':
            return transactionDate >= today
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return transactionDate >= weekAgo
          case 'month':
            return transactionDate >= startOfMonth(now)
          case 'lastMonth':
            const lastMonth = subMonths(now, 1)
            return transactionDate >= startOfMonth(lastMonth) && transactionDate <= endOfMonth(lastMonth)
          case 'year':
            return transactionDate.getFullYear() === now.getFullYear()
          default:
            return true
        }
      })
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchFilters])

  const fetchBudgetsAndGoals = async () => {
    try {
      const [budgetRes, goalsRes] = await Promise.all([
        fetch(`/api/budgets?email=${user?.email}`),
        fetch(`/api/savings-goals?email=${user?.email}`)
      ])
      
      if (budgetRes.ok) {
        const budgetData = await budgetRes.json()
        setBudgets(budgetData.budgets || [])
      }
      
      if (goalsRes.ok) {
        const goalsData = await goalsRes.json()
        setSavingsGoals(goalsData.goals || [])
      }
    } catch (error) {
      console.error('Error fetching budgets and goals:', error)
    }
  }

  useEffect(() => {
    const handleTransactionAdded = () => {
      fetchTransactions()
    }
    
    window.addEventListener('transactionAdded', handleTransactionAdded)
    return () => {
      window.removeEventListener('transactionAdded', handleTransactionAdded)
    }
  }, [user?.email, filter])

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
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user.name}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
            Here&apos;s your financial overview
          </p>
        </div>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Search and Filters */}
          <TransactionSearch 
            filters={searchFilters}
            onFiltersChange={setSearchFilters}
            categories={availableCategories}
          />
          
          {/* Time Period Filter */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="daily">Today</SelectItem>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
              </SelectContent>
            </Select>
            
            {filteredTransactions.length !== transactions.length && (
              <div className="text-sm text-muted-foreground">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </div>
            )}
          </div>

          {/* Summary Cards - Mobile: Single Card, Desktop: Grid */}
          <div className="block sm:hidden">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div 
                  className={`flex flex-col xs:flex-row xs:items-center xs:justify-between p-3 rounded-lg gap-2 cursor-pointer transition-all hover:shadow-sm ${
                    activeFilter === 'in' ? 'bg-green-100 ring-2 ring-green-500' : 'bg-green-50 dark:bg-green-900/20'
                  }`}
                  onClick={() => setActiveFilter(activeFilter === 'in' ? 'all' : 'in')}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Income</span>
                  </div>
                  <div className="text-base xs:text-lg font-bold text-green-600 break-all">
                    {formatCurrency(summary.totalIn)}
                  </div>
                </div>
                <div 
                  className={`flex flex-col xs:flex-row xs:items-center xs:justify-between p-3 rounded-lg gap-2 cursor-pointer transition-all hover:shadow-sm ${
                    activeFilter === 'out' ? 'bg-red-100 ring-2 ring-red-500' : 'bg-red-50 dark:bg-red-900/20'
                  }`}
                  onClick={() => setActiveFilter(activeFilter === 'out' ? 'all' : 'out')}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <TrendingDown className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Expenses</span>
                  </div>
                  <div className="text-base xs:text-lg font-bold text-red-600 break-all">
                    {formatCurrency(summary.totalOut)}
                  </div>
                </div>
                <div 
                  className={`flex flex-col xs:flex-row xs:items-center xs:justify-between p-3 rounded-lg gap-2 cursor-pointer transition-all hover:shadow-sm ${
                    activeFilter === 'all' ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-blue-50 dark:bg-blue-900/20'
                  }`}
                  onClick={() => setActiveFilter('all')}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Wallet className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Balance</span>
                  </div>
                  <div className="text-base xs:text-lg font-bold text-blue-600 break-all">
                    {formatCurrency(summary.balance)}
                  </div>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <BarChart3 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Transactions</span>
                  </div>
                  <div className="text-base xs:text-lg font-bold text-purple-600">
                    {activeFilter === 'all' ? filteredTransactions.length : 
                     filteredTransactions.filter(t => t.type === activeFilter).length}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Desktop Grid Layout */}
          <div className="hidden sm:grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${activeFilter === 'in' ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
              onClick={() => setActiveFilter(activeFilter === 'in' ? 'all' : 'in')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalIn)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Click to filter income transactions
                </p>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${activeFilter === 'out' ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
              onClick={() => setActiveFilter(activeFilter === 'out' ? 'all' : 'out')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalOut)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Click to filter expense transactions
                </p>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${activeFilter === 'all' ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
                <Wallet className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(summary.balance)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Click to show all transactions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {activeFilter === 'all' ? filteredTransactions.length : 
                   filteredTransactions.filter(t => t.type === activeFilter).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeFilter === 'all' ? 'All' : activeFilter === 'in' ? 'Income' : 'Expense'} transactions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Toggle */}
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowCharts(!showCharts)} 
              className="flex items-center gap-2 w-full sm:w-auto"
              size="sm"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm">{showCharts ? 'Hide Charts' : 'Show Charts'}</span>
            </Button>
          </div>

          {/* Charts Toggle */}
          {showCharts && (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 w-full">
              <Card>
                <CardHeader>
                  <CardTitle>Income by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <CashFlowPieChart data={summary.incomeByCategory} type="in" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Expenses by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <CashFlowPieChart data={summary.expenseByCategory} type="out" />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Financial Health Score */}
          <FinancialHealthScore 
            transactions={filteredTransactions} 
            budgets={budgets} 
            savingsGoals={savingsGoals} 
          />
          


          {/* Recent Transactions */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <TransactionList 
                transactions={activeFilter === 'all' ? filteredTransactions : 
                            filteredTransactions.filter(t => t.type === activeFilter)} 
                onUpdate={fetchTransactions} 
              />
            </CardContent>
          </Card>
        </div>
        
        <DebugInfo 
          user={user}
          transactions={filteredTransactions}
          budgets={budgets}
          savingsGoals={savingsGoals}
        />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}