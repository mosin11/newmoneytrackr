"use client"

import { useState } from "react"
import { Download, FileText, FileSpreadsheet, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast"

interface Transaction {
  _id: string
  type: 'in' | 'out'
  amount: number
  category: string
  description: string
  date: string
}

interface ExportManagerProps {
  transactions: Transaction[]
  userEmail: string
}

export function ExportManager({ transactions, userEmail }: ExportManagerProps) {
  const [exportFormat, setExportFormat] = useState('csv')
  const [dateRange, setDateRange] = useState('all')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const filterTransactionsByDate = (transactions: Transaction[]) => {
    if (dateRange === 'all') return transactions

    const now = new Date()
    const filtered = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      
      switch (dateRange) {
        case 'thisMonth':
          return transactionDate.getMonth() === now.getMonth() && 
                 transactionDate.getFullYear() === now.getFullYear()
        case 'lastMonth':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          return transactionDate.getMonth() === lastMonth.getMonth() && 
                 transactionDate.getFullYear() === lastMonth.getFullYear()
        case 'thisYear':
          return transactionDate.getFullYear() === now.getFullYear()
        case 'last3Months':
          const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          return transactionDate >= threeMonthsAgo
        default:
          return true
      }
    })
    
    return filtered
  }

  const exportToCSV = (data: Transaction[]) => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount']
    const csvContent = [
      headers.join(','),
      ...data.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.type === 'in' ? 'Income' : 'Expense',
        t.category,
        `"${t.description}"`,
        t.amount
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToJSON = (data: Transaction[]) => {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const generateReport = (data: Transaction[]) => {
    const totalIncome = data.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = data.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0)
    const balance = totalIncome - totalExpense
    
    const categoryBreakdown = data.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { income: 0, expense: 0, count: 0 }
      }
      if (t.type === 'in') {
        acc[t.category].income += t.amount
      } else {
        acc[t.category].expense += t.amount
      }
      acc[t.category].count++
      return acc
    }, {} as Record<string, { income: number; expense: number; count: number }>)

    const reportContent = `
FINANCIAL REPORT
Generated on: ${new Date().toLocaleDateString()}
Period: ${dateRange === 'all' ? 'All Time' : dateRange}
Total Transactions: ${data.length}

SUMMARY
Total Income: ₹${totalIncome.toLocaleString()}
Total Expenses: ₹${totalExpense.toLocaleString()}
Net Balance: ₹${balance.toLocaleString()}

CATEGORY BREAKDOWN
${Object.entries(categoryBreakdown)
  .map(([category, stats]) => 
    `${category}: Income ₹${stats.income.toLocaleString()}, Expense ₹${stats.expense.toLocaleString()}, Transactions: ${stats.count}`
  ).join('\n')}

TRANSACTION DETAILS
${data.map(t => 
  `${new Date(t.date).toLocaleDateString()} | ${t.type === 'in' ? 'Income' : 'Expense'} | ${t.category} | ${t.description} | ₹${t.amount.toLocaleString()}`
).join('\n')}
    `.trim()

    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financial_report_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    setLoading(true)
    try {
      const filteredData = filterTransactionsByDate(transactions)
      
      if (filteredData.length === 0) {
        showToast('warning', 'No transactions found for the selected period')
        return
      }

      switch (exportFormat) {
        case 'csv':
          exportToCSV(filteredData)
          break
        case 'json':
          exportToJSON(filteredData)
          break
        case 'report':
          generateReport(filteredData)
          break
      }
      
      showToast('success', `Exported ${filteredData.length} transactions successfully`)
    } catch (error) {
      showToast('error', 'Export failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4" />
              Format
            </label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Excel)</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="report">Text Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="last3Months">Last 3 Months</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {filterTransactionsByDate(transactions).length} transactions will be exported
          </div>
          <Button 
            onClick={handleExport} 
            disabled={loading || transactions.length === 0}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>Loading...</>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}