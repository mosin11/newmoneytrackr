"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ExpenseSubcategoryChartProps {
  data: { category: string; amount: number; subcategories: { name: string; amount: number }[] }[]
}

export function ExpenseSubcategoryChart({ data }: ExpenseSubcategoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No expense data available
      </div>
    )
  }

  // Flatten subcategories for chart display
  const chartData = data.flatMap(category => 
    category.subcategories.map(sub => ({
      name: `${category.category} - ${sub.name}`,
      amount: sub.amount,
      category: category.category
    }))
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(value)
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Food': '#ef4444',
      'Transport': '#f97316',
      'Shopping': '#8b5cf6',
      'Bills': '#06b6d4',
      'Entertainment': '#84cc16',
      'Healthcare': '#ec4899'
    }
    return colors[category] || '#6b7280'
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
          fontSize={12}
        />
        <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Bar 
          dataKey="amount" 
          fill={(entry) => getCategoryColor(entry.category)}
          name="Amount"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}