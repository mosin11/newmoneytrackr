"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/toast"

interface Transaction {
  _id: string
  type: "in" | "out"
  amount: number
  category: string
  description: string
  date: string
}

interface EditTransactionModalProps {
  transaction: Transaction
  onClose: () => void
  onSuccess: () => void
}

export function EditTransactionModal({ transaction, onClose, onSuccess }: EditTransactionModalProps) {
  const [formData, setFormData] = useState({
    amount: transaction.amount.toString(),
    description: transaction.description
  })
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch(`/api/transactions/${transaction._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        showToast('success', 'Transaction updated successfully')
        onSuccess()
        onClose()
      } else {
        showToast('error', 'Failed to update transaction')
      }
    } catch (error) {
      console.error('Failed to update transaction:', error)
      showToast('error', 'Failed to update transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Edit Transaction</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Description
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                className="text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Amount
              </label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
                className="text-sm sm:text-base"
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Category:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{transaction.category}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span className={`font-medium ${transaction.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'in' ? 'Income' : 'Expense'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Transaction'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}