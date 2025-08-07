"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface CategoryBarChartProps {
  data: { category: string; amount: number }[]
  type: 'in' | 'out'
}

const CATEGORY_COLORS = {
  'Food & Dining': '#ff6b6b',
  'Transportation': '#4ecdc4',
  'Healthcare': '#45b7d1',
  'Shopping': '#96ceb4',
  'Personal Care': '#ffeaa7',
  'Bills & EMI': '#dda0dd',
  'Investment': '#98d8c8',
  'Income': '#6c5ce7',
  'Transfer': '#fd79a8',
  'Other Expense': '#fdcb6e'
}

export function CategoryBarChart({ data, type }: CategoryBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No data available</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(value)
  }

  const chartData = data.map(item => ({
    ...item,
    color: CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS] || '#74b9ff'
  }))

  return (
    <div className="w-full overflow-hidden">
      <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="category" 
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
        />
        <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Bar dataKey="amount">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
      </ResponsiveContainer>
    </div>
  )
}