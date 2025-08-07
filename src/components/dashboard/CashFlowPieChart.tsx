"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface CashFlowPieChartProps {
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

export function CashFlowPieChart({ data, type }: CashFlowPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
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

  return (
    <div className="w-full overflow-hidden">
      <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="amount"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS] || '#74b9ff'} 
            />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Legend />
      </PieChart>
      </ResponsiveContainer>
    </div>
  )
}