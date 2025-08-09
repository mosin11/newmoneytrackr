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
    out: ['Food & Dining', 'Transportation', 'Shopping', 'Bills & EMI', 'Healthcare', 'Investment', 'SIP', 'EMI Payment'],
    in: ['Salary', 'Freelance', 'Gift', 'Other Income']
  }

  const cashInKeywords = [
    "salary", "income", "deposit", "refund", "cashback", "freelance", "bonus", 
    "loan received", "rent income", "sales", "commission", "gift", "interest", "dividend", 
    "reimbursement", "allowance", "pension", "grants", "awards", "wages", "stipend", 
    "royalty", "advance", "settlement", "prize", "scholarship", "inheritance", "capital gain", 
    "business income", "consulting fees", "rental income", "side hustle", "part-time job", 
    "overtime", "tips", "tax refund", "insurance payout", "received", "got money", "payment received", 
    "transfer in", "credit", "earning", "profit", "return"
  ]

  const updateEMIPayment = async (description: string, amount: number) => {
    try {
      // Fetch user's EMIs to find matching one
      const response = await fetch(`/api/emi?email=${userEmail}`)
      if (response.ok) {
        const data = await response.json()
        const emis = data.emis || []
        
        // Find EMI that matches the description
        const matchingEMI = emis.find((emi: any) => {
          const desc = description.toLowerCase()
          const emiName = emi.name.toLowerCase()
          const emiCategory = emi.category.toLowerCase()
          
          // Check if description contains words from EMI name
          const nameWords = emiName.split(' ').filter(word => word.length > 2)
          const descWords = desc.split(' ').filter(word => word.length > 2)
          
          const hasNameMatch = nameWords.some(nameWord => 
            descWords.some(descWord => 
              nameWord.includes(descWord) || descWord.includes(nameWord)
            )
          )
          
          // Check if description contains category keyword
          const categoryKeyword = emiCategory.split(' ')[0]
          const hasCategoryMatch = categoryKeyword.length > 2 && desc.includes(categoryKeyword)
          
          return hasNameMatch || hasCategoryMatch
        })
        
        if (matchingEMI && matchingEMI.remainingMonths > 0) {
          // Calculate next due date
          const nextDue = new Date(matchingEMI.nextDueDate)
          nextDue.setMonth(nextDue.getMonth() + 1)
          
          // Update EMI remaining months and next due date
          const updatedEMI = {
            ...matchingEMI,
            remainingMonths: Math.max(0, matchingEMI.remainingMonths - 1),
            status: matchingEMI.remainingMonths <= 1 ? 'completed' : 'active',
            nextDueDate: matchingEMI.remainingMonths <= 1 ? matchingEMI.nextDueDate : nextDue.toISOString()
          }
          
          await fetch(`/api/emi/${matchingEMI._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedEMI)
          })
        }
      }
    } catch (error) {
      console.error('Error updating EMI:', error)
    }
  }

  const categorizeTransaction = (description: string): { type: 'in' | 'out', category: string } => {
    const desc = description.toLowerCase()
    const isIncome = cashInKeywords.some(keyword => desc.includes(keyword))
    
    if (isIncome) {
      if (desc.includes('salary') || desc.includes('wage')) return { type: 'in', category: 'Salary' }
      if (desc.includes('freelance') || desc.includes('project')) return { type: 'in', category: 'Freelance' }
      return { type: 'in', category: 'Other Income' }
    }
    
    if (desc.includes('emi') || desc.includes('loan payment') || desc.includes('installment')) return { type: 'out', category: 'EMI Payment' }
    if (desc.includes('investment') || desc.includes('sip') || desc.includes('mutual fund') || desc.includes('stock')) return { type: 'out', category: 'Investment' }
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
        
        // Check if this is an EMI payment and update EMI record
        if (formData.category === 'EMI Payment' && formData.type === 'out') {
          await updateEMIPayment(formData.description, parseFloat(formData.amount))
        }
        
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <Card className="w-full max-w-md sm:rounded-lg rounded-t-2xl rounded-b-none sm:rounded-b-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Quick Add Transaction</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Description */}
                <div>
                  <Input
                    placeholder="Description (e.g., 'Salary payment', 'Grocery shopping')"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="h-12 text-base"
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
                    className="h-12 text-lg"
                    inputMode="decimal"
                  />
                </div>

                {/* Category */}
                <div>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonCategories[formData.type].map(category => (
                        <SelectItem key={category} value={category} className="py-3">{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>



                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button type="submit" disabled={loading} className="flex-1 h-12 text-base">
                    {loading ? 'Adding...' : 'Add Transaction'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="h-12 text-base sm:w-auto">
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