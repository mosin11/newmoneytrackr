"use client"

import { useState, useEffect } from "react"
import { Plus, X, TrendingUp, TrendingDown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"

interface QuickAddTransactionProps {
  userEmail: string
}

export function QuickAddTransaction({ userEmail }: QuickAddTransactionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'out' as 'in' | 'out',
    amount: '',
    category: '',
    description: ''
  })
  const { showToast } = useToast()

  // Auto-categorize when description changes
  useEffect(() => {
    if (formData.description.length > 2) {
      const { type, category } = categorizeTransaction(formData.description)
      setFormData(prev => ({ ...prev, type, category }))
    }
  }, [formData.description])

  const commonCategories = {
    out: ['Food & Dining', 'Transportation', 'Shopping', 'Bills & EMI', 'Healthcare'],
    in: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other Income']
  }

  const cashInKeywords = [
    "salary", "income", "deposit", "refund", "cashback", "freelance", "bonus", "investment", 
    "loan received", "rent income", "sales", "commission", "gift", "interest", "dividend", 
    "reimbursement", "allowance", "pension", "grants", "awards", "wages", "stipend", 
    "royalty", "advance", "settlement", "prize", "scholarship", "inheritance", "capital gain", 
    "business income", "consulting fees", "rental income", "side hustle", "part-time job", 
    "overtime", "tips", "tax refund", "insurance payout", "received", "got money", "payment received", 
    "transfer in", "credit", "earning", "profit", "return"
  ]

  const categorizeTransaction = (description: string) => {
    const desc = description.toLowerCase()
    const isIncome = cashInKeywords.some(keyword => desc.includes(keyword))
    
    if (isIncome) {
      if (desc.includes('salary') || desc.includes('wage')) return { type: 'in', category: 'Salary' }
      if (desc.includes('freelance') || desc.includes('project')) return { type: 'in', category: 'Freelance' }
      if (desc.includes('investment') || desc.includes('dividend')) return { type: 'in', category: 'Investment' }
      return { type: 'in', category: 'Other Income' }
    }
    
    if (desc.includes('food') || desc.includes('restaurant') || desc.includes('grocery')) return { type: 'out', category: 'Food & Dining' }
    if (desc.includes('transport') || desc.includes('fuel') || desc.includes('taxi')) return { type: 'out', category: 'Transportation' }
    if (desc.includes('shopping') || desc.includes('clothes') || desc.includes('electronics')) return { type: 'out', category: 'Shopping' }
    if (desc.includes('rent') || desc.includes('electricity') || desc.includes('bill')) return { type: 'out', category: 'Bills & EMI' }
    if (desc.includes('doctor') || desc.includes('medicine') || desc.includes('hospital')) return { type: 'out', category: 'Healthcare' }
    
    return { type: 'out', category: '' }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.category || !formData.description) return

    setLoading(true)
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: userEmail,
          ...formData,
          amount: parseFloat(formData.amount),
          date: new Date().toISOString()
        })
      })

      if (response.ok) {
        showToast('success', 'Transaction added successfully')
        setFormData({ type: 'out', amount: '', category: '', description: '' })
        setIsOpen(false)
        window.dispatchEvent(new Event('transactionAdded'))
      } else {
        showToast('error', 'Failed to add transaction')
      }
    } catch (error) {
      showToast('error', 'Failed to add transaction')
    } finally {
      setLoading(false)
    }
  }

  if (!userEmail) return null

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Quick Add Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Quick Add Transaction</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Description */}
                <div>
                  <Input
                    placeholder="Description (e.g., 'Salary payment', 'Grocery shopping')"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                {/* Auto-detected Type Display */}
                {formData.description && (
                  <div className="text-xs text-muted-foreground p-2 bg-blue-50 dark:bg-blue-900/20 rounded flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Auto-detected as: <strong>{formData.type === 'in' ? 'Income' : 'Expense'}</strong>
                  </div>
                )}

                {/* Amount */}
                <div>
                  <Input
                    type="number"
                    placeholder="Amount (₹)"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="text-lg"
                  />
                </div>

                {/* Category */}
                <div>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonCategories[formData.type].map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>



                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Adding...' : 'Add Transaction'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}