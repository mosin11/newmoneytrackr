"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { suggestCategory, getSmartSuggestions } from "@/lib/smart-categorization"

interface TransactionFormProps {
  onClose: () => void
  onSuccess: () => void
  userEmail: string
}

export function TransactionForm({ onClose, onSuccess, userEmail }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    type: 'out' as 'in' | 'out',
    amount: "",
    category: "",
    description: ""
  })
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  const { showToast } = useToast()

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
    
    // Check for income keywords first
    const isIncome = cashInKeywords.some(keyword => desc.includes(keyword))
    
    if (isIncome) {
      if (desc.includes('salary') || desc.includes('wage') || desc.includes('pay') || desc.includes('wages')) {
        return { type: 'in', category: 'Salary' }
      }
      if (desc.includes('freelance') || desc.includes('project') || desc.includes('client') || desc.includes('consulting')) {
        return { type: 'in', category: 'Freelance' }
      }
      if (desc.includes('investment') || desc.includes('dividend') || desc.includes('interest') || desc.includes('capital gain')) {
        return { type: 'in', category: 'Investment' }
      }
      if (desc.includes('business') || desc.includes('sales') || desc.includes('revenue')) {
        return { type: 'in', category: 'Business' }
      }
      return { type: 'in', category: 'Other Income' }
    }
    
    // Expense categorization
    if (desc.includes('food') || desc.includes('restaurant') || desc.includes('grocery') || desc.includes('meal') || desc.includes('dining') || desc.includes('cafe') || desc.includes('takeaway') || desc.includes('canteen') || desc.includes('cantin') || desc.includes('dosa') || desc.includes('dasa') || desc.includes('lunch') || desc.includes('breakfast') || desc.includes('dinner') || desc.includes('snack') || desc.includes('eat') || desc.includes('ate') || desc.includes('drink') || desc.includes('coffee') || desc.includes('tea') || desc.includes('juice') || desc.includes('pizza') || desc.includes('burger') || desc.includes('biryani') || desc.includes('swiggy') || desc.includes('zomato') || desc.includes('dominos') || desc.includes('kfc') || desc.includes('mcdonalds') || desc.includes('starbucks') || desc.includes('ccd') || desc.includes('chai') || desc.includes('samosa') || desc.includes('paratha') || desc.includes('roti') || desc.includes('rice') || desc.includes('dal') || desc.includes('sabzi') || desc.includes('sweet') || desc.includes('ice cream') || desc.includes('fruits') || desc.includes('vegetables') || desc.includes('milk') || desc.includes('bread') || desc.includes('biscuit') || desc.includes('chocolate')) {
      return { type: 'out', category: 'Food' }
    }
    if (desc.includes('transport') || desc.includes('fuel') || desc.includes('bus') || desc.includes('taxi') || desc.includes('uber') || desc.includes('petrol') || desc.includes('gas') || desc.includes('car') || desc.includes('ola') || desc.includes('auto') || desc.includes('rickshaw') || desc.includes('metro') || desc.includes('train') || desc.includes('flight') || desc.includes('bike') || desc.includes('scooter') || desc.includes('parking') || desc.includes('toll') || desc.includes('rapido') || desc.includes('cab') || desc.includes('travel') || desc.includes('trip') || desc.includes('journey') || desc.includes('diesel') || desc.includes('cng')) {
      return { type: 'out', category: 'Transport' }
    }
    if (desc.includes('rent') || desc.includes('mortgage') || desc.includes('housing') || desc.includes('apartment') || desc.includes('flat') || desc.includes('room') || desc.includes('pg') || desc.includes('hostel') || desc.includes('maintenance') || desc.includes('society') || desc.includes('deposit') || desc.includes('advance')) {
      return { type: 'out', category: 'Rent' }
    }
    if (desc.includes('electricity') || desc.includes('water bill') || desc.includes('internet') || desc.includes('mobile bill') || desc.includes('utilities') || desc.includes('phone bill') || desc.includes('wifi') || desc.includes('broadband') || desc.includes('airtel') || desc.includes('jio') || desc.includes('vi') || desc.includes('bsnl') || desc.includes('recharge') || desc.includes('postpaid') || desc.includes('prepaid') || desc.includes('data') || desc.includes('cylinder') || desc.includes('gas bill')) {
      return { type: 'out', category: 'Utilities' }
    }
    if (desc.includes('movie') || desc.includes('entertainment') || desc.includes('game') || desc.includes('concert') || desc.includes('theater') || desc.includes('cinema') || desc.includes('netflix') || desc.includes('amazon prime') || desc.includes('hotstar') || desc.includes('spotify') || desc.includes('youtube premium') || desc.includes('gaming') || desc.includes('pubg') || desc.includes('steam') || desc.includes('party') || desc.includes('club') || desc.includes('bar') || desc.includes('pub') || desc.includes('outing') || desc.includes('fun') || desc.includes('recreation')) {
      return { type: 'out', category: 'Entertainment' }
    }
    if (desc.includes('shopping') || desc.includes('clothes') || desc.includes('electronics') || desc.includes('gadgets') || desc.includes('appliances') || desc.includes('amazon') || desc.includes('flipkart') || desc.includes('myntra') || desc.includes('ajio') || desc.includes('meesho') || desc.includes('shirt') || desc.includes('jeans') || desc.includes('shoes') || desc.includes('mobile') || desc.includes('laptop') || desc.includes('headphones') || desc.includes('watch') || desc.includes('bag') || desc.includes('wallet') || desc.includes('sunglasses') || desc.includes('purchase') || desc.includes('buy') || desc.includes('bought') || desc.includes('order') || desc.includes('delivery')) {
      return { type: 'out', category: 'Shopping' }
    }
    if (desc.includes('doctor') || desc.includes('medicine') || desc.includes('hospital') || desc.includes('pharmacy') || desc.includes('medical') || desc.includes('health') || desc.includes('clinic') || desc.includes('checkup') || desc.includes('test') || desc.includes('lab') || desc.includes('dentist') || desc.includes('eye') || desc.includes('surgery') || desc.includes('treatment') || desc.includes('consultation') || desc.includes('apollo') || desc.includes('fortis') || desc.includes('max') || desc.includes('aiims') || desc.includes('tablet') || desc.includes('injection') || desc.includes('vaccine') || desc.includes('fever') || desc.includes('cold') || desc.includes('cough')) {
      return { type: 'out', category: 'Healthcare' }
    }
    if (desc.includes('education') || desc.includes('school') || desc.includes('course') || desc.includes('books') || desc.includes('tuition') || desc.includes('college') || desc.includes('university') || desc.includes('fees') || desc.includes('exam') || desc.includes('coaching') || desc.includes('class') || desc.includes('study') || desc.includes('learning') || desc.includes('training') || desc.includes('workshop') || desc.includes('seminar') || desc.includes('certification') || desc.includes('udemy') || desc.includes('coursera') || desc.includes('byju') || desc.includes('unacademy') || desc.includes('notebook') || desc.includes('pen') || desc.includes('pencil') || desc.includes('stationery')) {
      return { type: 'out', category: 'Education' }
    }
    if (desc.includes('insurance') || desc.includes('premium') || desc.includes('policy') || desc.includes('lic') || desc.includes('sbi life') || desc.includes('hdfc life') || desc.includes('icici prudential') || desc.includes('bajaj allianz') || desc.includes('health insurance') || desc.includes('car insurance') || desc.includes('bike insurance') || desc.includes('term insurance') || desc.includes('life insurance')) {
      return { type: 'out', category: 'Insurance' }
    }
    
    return { type: 'out', category: 'Other Expense' }
  }

  // Auto-categorize and determine type when description changes (with debounce)
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      if (formData.description.length > 2) {
        const smartSuggestions = getSmartSuggestions(formData.description)
        setSuggestions(smartSuggestions)
        setShowSuggestions(true)
        
        // Auto-determine type and category based on description
        const { type, category } = categorizeTransaction(formData.description)
        setFormData(prev => ({ ...prev, type, category }))
      } else {
        setShowSuggestions(false)
        setFormData(prev => ({ ...prev, type: 'out', category: '' }))
      }
    }, 300)

    setDebounceTimer(timer)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [formData.description])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.description) return
    
    // Auto-categorize if no category selected
    let finalCategory = formData.category
    let finalType = formData.type
    
    if (!finalCategory && formData.description) {
      const { type, category } = categorizeTransaction(formData.description)
      finalCategory = category
      finalType = type
    }
    
    setLoading(true)
    setShowSuggestions(false) // Close suggestions
    
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: userEmail,
          type: finalType,
          category: finalCategory,
          amount: parseFloat(formData.amount),
          description: formData.description,
          date: new Date().toISOString()
        })
      })

      if (response.ok) {
        showToast('success', 'Transaction added successfully')
        onSuccess()
        setFormData({
          type: 'out',
          amount: "",
          category: "",
          description: ""
        })
        window.dispatchEvent(new Event('transactionAdded'))
      } else {
        showToast('error', 'Failed to add transaction')
      }
    } catch (error) {
      console.error('Failed to add transaction:', error)
      showToast('error', 'Failed to add transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Add Transaction</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Auto-detected Type Display */}
            {formData.description && (
              <div className="text-xs sm:text-sm text-muted-foreground p-2 bg-blue-50 dark:bg-blue-900/20 rounded flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Auto-detected as: <strong>{formData.type === 'in' ? 'Income' : 'Expense'}</strong>
              </div>
            )}

            {/* Description with Smart Suggestions */}
            <div className="relative">
              <Input
                placeholder="Description (e.g., 'Salary payment', 'Grocery shopping')"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => formData.description.length > 2 && setShowSuggestions(true)}
                required
                className="text-sm sm:text-base h-9 sm:h-10"
              />
              
              {/* Smart Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-10 mt-1">
                  <div className="p-2 text-xs text-muted-foreground border-b flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Smart suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                      onClick={() => {
                        const { type } = categorizeTransaction(formData.description)
                        setFormData({...formData, category: suggestion, type})
                        setShowSuggestions(false)
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category */}
            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Category (auto-suggested)" />
              </SelectTrigger>
              <SelectContent>
                {formData.type === 'out' ? (
                  <>
                    <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Bills & EMI">Bills & EMI</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Personal Care">Personal Care</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Other Expense">Other Expense</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="Salary">Salary</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="Investment">Investment</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Other Income">Other Income</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>

            {/* Amount */}
            <Input
              type="number"
              placeholder="Amount (₹)"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
              className="text-sm sm:text-base h-9 sm:h-10"
            />

            {formData.category && (
              <div className="text-xs sm:text-sm text-muted-foreground p-2 bg-green-50 dark:bg-green-900/20 rounded flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Smart categorized as: <strong>{formData.category}</strong>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-9 sm:h-10 text-sm sm:text-base">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 h-9 sm:h-10 text-sm sm:text-base">
                {loading ? "Adding..." : "Add Transaction"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}