"use client"

import { useEffect, useRef } from 'react'

interface CashFlowPieChartProps {
  data: { category: string; amount: number }[]
  type: 'in' | 'out' | 'overview'
}

const CATEGORY_COLORS = [
  '#22c55e', '#ef4444', '#45b7d1', '#96ceb4', '#ffeaa7', 
  '#dda0dd', '#98d8c8', '#6c5ce7', '#fd79a8', '#fdcb6e'
]

export function CashFlowPieChart({ data, type }: CashFlowPieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 60

    const total = data.reduce((sum, item) => sum + item.amount, 0)
    let currentAngle = -Math.PI / 2

    // Draw pie slices
    data.forEach((item, index) => {
      const sliceAngle = (item.amount / total) * 2 * Math.PI
      const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length]

      // Draw slice
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw labels
      const labelAngle = currentAngle + sliceAngle / 2
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7)
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7)
      const percentage = ((item.amount / total) * 100).toFixed(0)

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${percentage}%`, labelX, labelY)

      currentAngle += sliceAngle
    })
  }, [data])

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
    <div className="w-full">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={300} 
        className="w-full h-auto max-w-md mx-auto"
      />
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {data.map((item, index) => {
          const percentage = ((item.amount / data.reduce((sum, d) => sum + d.amount, 0)) * 100).toFixed(1)
          return (
            <div key={item.category} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-sm flex-shrink-0" 
                style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.category}</div>
                <div className="text-xs text-gray-600">
                  {formatCurrency(item.amount)} ({percentage}%)
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}