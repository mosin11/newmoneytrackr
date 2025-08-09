"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Calendar, DollarSign, TrendingDown, AlertCircle, CheckCircle, Clock, IndianRupee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { ProtectedRoute } from "@/components/ProtectedRoute"

interface EMI {
  _id: string
  userEmail: string
  name: string
  totalAmount: number
  monthlyAmount: number
  startDate: string
  endDate: string
  remainingMonths: number
  totalMonths: number
  interestRate: number
  category: string
  status: 'active' | 'completed' | 'paused'
  nextDueDate: string
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
  isVerified: boolean
}

const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString('en-IN')}`
}

const getCurrencyIcon = () => {
  return <IndianRupee className="h-4 w-4 text-red-600" />
}

const calculateActualMonthsPaid = (emi: EMI) => {
  const startDate = new Date(emi.startDate)
  const currentDate = new Date()
  const monthsElapsed = Math.max(0, 
    (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
    (currentDate.getMonth() - startDate.getMonth()) - 1
  )
  return Math.min(Math.max(0, monthsElapsed), emi.totalMonths)
}

const calculateActualRemainingMonths = (emi: EMI) => {
  const monthsPaid = calculateActualMonthsPaid(emi)
  return Math.max(0, emi.totalMonths - monthsPaid)
}

const calculateEMIOutstanding = (emi: EMI) => {
  const actualMonthsPaid = calculateActualMonthsPaid(emi)
  
  const monthlyRate = emi.interestRate / (12 * 100)
  const totalMonths = emi.totalMonths
  const principal = emi.totalAmount
  
  if (monthlyRate === 0) {
    return Math.max(0, principal - (actualMonthsPaid * emi.monthlyAmount))
  }
  
  const remainingMonths = totalMonths - actualMonthsPaid
  const outstandingPrincipal = remainingMonths > 0 
    ? (emi.monthlyAmount * (Math.pow(1 + monthlyRate, remainingMonths) - 1)) / (monthlyRate * Math.pow(1 + monthlyRate, remainingMonths))
    : 0
  
  return Math.max(0, outstandingPrincipal)
}

function EMIContent() {
  const [user, setUser] = useState<User | null>(null)
  const [emis, setEmis] = useState<EMI[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEMI, setEditingEMI] = useState<EMI | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    totalAmount: '',
    disbursalAmount: '',
    monthlyAmount: '',
    startDate: '',
    totalMonths: '',
    interestRate: '',
    interestRateWithoutFees: '',
    processingFee: '',
    category: 'Home Loan'
  })
  const [isCalculating, setIsCalculating] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<'disbursal' | 'processing' | null>(null)
  const { showToast } = useToast()

  const categories = ['Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan', 'Credit Card', 'Other']

  // Calculate interest rate based on loan details
  const calculateInterestRate = (principal: number, emi: number, tenure: number, processingFee: number = 0) => {
    try {
      // Adjust principal for processing fee
      const adjustedPrincipal = principal - processingFee
      
      if (adjustedPrincipal <= 0 || emi <= 0 || tenure <= 0) {
        return '0'
      }
      
      // Use Newton-Raphson method for better accuracy
      let rate = 0.01 // Start with 1% monthly
      const tolerance = 0.000001
      const maxIterations = 100
      
      for (let i = 0; i < maxIterations; i++) {
        const power = Math.pow(1 + rate, tenure)
        const calculatedEMI = (adjustedPrincipal * rate * power) / (power - 1)
        
        if (Math.abs(calculatedEMI - emi) < tolerance) {
          return (rate * 12 * 100).toFixed(2) // Convert to annual percentage
        }
        
        // Newton-Raphson derivative calculation
        const derivative = (adjustedPrincipal * power * (tenure * rate + power - tenure - 1)) / Math.pow(power - 1, 2)
        
        if (Math.abs(derivative) < tolerance) break
        
        const newRate = rate - (calculatedEMI - emi) / derivative
        
        if (newRate <= 0 || newRate > 1) {
          // Fallback to binary search if Newton-Raphson fails
          rate = calculatedEMI > emi ? rate * 0.9 : rate * 1.1
        } else {
          rate = newRate
        }
      }
      
      return Math.max(0, rate * 12 * 100).toFixed(2) // Convert to annual percentage
    } catch (error) {
      console.error('Interest rate calculation error:', error)
      return '0'
    }
  }

  // Auto-calculate based on user input
  useEffect(() => {
    const calculateValues = () => {
      const totalAmount = parseFloat(formData.totalAmount)
      const disbursalAmount = parseFloat(formData.disbursalAmount)
      const processingFee = parseFloat(formData.processingFee)
      const emi = parseFloat(formData.monthlyAmount)
      const tenure = parseInt(formData.totalMonths)
      
      if (totalAmount > 0) {
        // Calculate missing value based on last updated field
        if (lastUpdated === 'disbursal' && disbursalAmount > 0) {
          const calculatedFee = totalAmount - disbursalAmount
          setFormData(prev => ({ ...prev, processingFee: calculatedFee.toString() }))
        } else if (lastUpdated === 'processing' && processingFee >= 0) {
          const calculatedDisbursal = totalAmount - processingFee
          setFormData(prev => ({ ...prev, disbursalAmount: calculatedDisbursal.toString() }))
        }
      }
      
      // Calculate interest rates
      const finalDisbursal = parseFloat(formData.disbursalAmount)
      if (totalAmount > 0 && emi > 0 && tenure > 0 && finalDisbursal > 0) {
        setIsCalculating(true)
        
        const rateWithoutFees = calculateInterestRate(finalDisbursal, emi, tenure, 0)
        const rateWithFees = calculateInterestRate(totalAmount, emi, tenure, 0)
        
        setFormData(prev => ({ 
          ...prev, 
          interestRate: rateWithFees,
          interestRateWithoutFees: rateWithoutFees
        }))
        setIsCalculating(false)
      } else {
        setFormData(prev => ({ 
          ...prev, 
          interestRate: '',
          interestRateWithoutFees: ''
        }))
        setIsCalculating(false)
      }
    }
    
    const timeoutId = setTimeout(calculateValues, 300)
    return () => clearTimeout(timeoutId)
  }, [formData.totalAmount, formData.disbursalAmount, formData.processingFee, formData.monthlyAmount, formData.totalMonths, lastUpdated])



  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    if (user?.email) {
      fetchEMIs()
    }
  }, [user])

  useEffect(() => {
    const handleTransactionAdded = () => {
      fetchEMIs() // Refresh EMIs when transaction is added
    }
    
    window.addEventListener('transactionAdded', handleTransactionAdded)
    return () => {
      window.removeEventListener('transactionAdded', handleTransactionAdded)
    }
  }, [])

  const fetchEMIs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/emi?email=${user?.email}`)
      const data = await response.json()
      
      if (response.ok) {
        setEmis(data.emis || [])
      } else {
        showToast('error', 'Failed to fetch EMIs')
      }
    } catch (error) {
      showToast('error', 'Failed to fetch EMIs')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.totalAmount || !formData.disbursalAmount || !formData.monthlyAmount || !formData.startDate || !formData.totalMonths) {
      showToast('error', 'Please fill all required fields')
      return
    }

    try {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + parseInt(formData.totalMonths))

      const emiData = {
        userEmail: user?.email,
        name: formData.name,
        totalAmount: parseFloat(formData.totalAmount),
        monthlyAmount: parseFloat(formData.monthlyAmount),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalMonths: parseInt(formData.totalMonths),
        remainingMonths: parseInt(formData.totalMonths),
        interestRate: parseFloat(formData.interestRate) || 0,
        processingFee: parseFloat(formData.processingFee) || 0,
        category: formData.category,
        status: 'active',
        nextDueDate: startDate.toISOString()
      }

      const url = editingEMI ? `/api/emi/${editingEMI._id}` : '/api/emi'
      const method = editingEMI ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emiData)
      })

      if (response.ok) {
        showToast('success', `EMI ${editingEMI ? 'updated' : 'added'} successfully`)
        setShowForm(false)
        setEditingEMI(null)
        setFormData({
          name: '',
          totalAmount: '',
          disbursalAmount: '',
          monthlyAmount: '',
          startDate: '',
          totalMonths: '',
          interestRate: '',
          interestRateWithoutFees: '',
          processingFee: '',
          category: 'Home Loan'
        })
        setIsCalculating(false)
        fetchEMIs()
      } else {
        showToast('error', `Failed to ${editingEMI ? 'update' : 'add'} EMI`)
      }
    } catch (error) {
      showToast('error', `Failed to ${editingEMI ? 'update' : 'add'} EMI`)
    }
  }

  const handleEdit = (emi: EMI) => {
    setEditingEMI(emi)
    const processingFee = (emi as any).processingFee || 0
    const disbursalAmount = emi.totalAmount - processingFee
    setFormData({
      name: emi.name,
      totalAmount: emi.totalAmount.toString(),
      disbursalAmount: disbursalAmount.toString(),
      monthlyAmount: emi.monthlyAmount.toString(),
      startDate: emi.startDate.split('T')[0],
      totalMonths: emi.totalMonths.toString(),
      interestRate: emi.interestRate.toString(),
      interestRateWithoutFees: '',
      processingFee: processingFee.toString(),
      category: emi.category
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this EMI?')) return

    try {
      const response = await fetch(`/api/emi/${id}`, { method: 'DELETE' })
      
      if (response.ok) {
        showToast('success', 'EMI deleted successfully')
        fetchEMIs()
      } else {
        showToast('error', 'Failed to delete EMI')
      }
    } catch (error) {
      showToast('error', 'Failed to delete EMI')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'paused': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const totalActiveEMIs = emis.filter(emi => emi.status === 'active').length
  const totalMonthlyPayment = emis.filter(emi => emi.status === 'active').reduce((sum, emi) => sum + emi.monthlyAmount, 0)
  const totalOutstanding = emis.filter(emi => emi.status === 'active').reduce((sum, emi) => {
    const startDate = new Date(emi.startDate)
    const currentDate = new Date()
    const monthsElapsed = Math.max(0, 
      (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
      (currentDate.getMonth() - startDate.getMonth())
    )
    const actualMonthsPaid = Math.min(monthsElapsed, emi.totalMonths)
    
    // Calculate outstanding using EMI formula
    const monthlyRate = emi.interestRate / (12 * 100)
    const totalMonths = emi.totalMonths
    const principal = emi.totalAmount
    
    if (monthlyRate === 0) {
      // Simple calculation if no interest
      return sum + Math.max(0, principal - (actualMonthsPaid * emi.monthlyAmount))
    }
    
    // Outstanding principal after n payments using EMI formula
    const remainingMonths = totalMonths - actualMonthsPaid
    const outstandingPrincipal = remainingMonths > 0 
      ? (emi.monthlyAmount * (Math.pow(1 + monthlyRate, remainingMonths) - 1)) / (monthlyRate * Math.pow(1 + monthlyRate, remainingMonths))
      : 0
    
    return sum + Math.max(0, outstandingPrincipal)
  }, 0)

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">EMI Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Track and manage all your EMIs in one place</p>
        </div>

        {/* Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">EMI Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingDown className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-600">Active EMIs</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{totalActiveEMIs}</div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {getCurrencyIcon()}
                  <span className="text-sm font-medium text-gray-600 ml-2">Monthly Payment</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(totalMonthlyPayment)}</div>
                <p className="text-xs text-muted-foreground">Total per month</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-gray-600">Outstanding</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalOutstanding)}</div>
                <p className="text-xs text-muted-foreground">Total remaining</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <IndianRupee className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-gray-600">Total Loan</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(emis.filter(emi => emi.status === 'active').reduce((sum, emi) => sum + emi.totalAmount, 0))}</div>
                <p className="text-xs text-muted-foreground">Total loan amount</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-600">Total Paid</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(emis.filter(emi => emi.status === 'active').reduce((sum, emi) => sum + (calculateActualMonthsPaid(emi) * emi.monthlyAmount), 0))}</div>
                <p className="text-xs text-muted-foreground">Amount paid so far</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add EMI Button */}
        <div className="mb-6">
          <Button onClick={() => setShowForm(true)} className="w-auto px-6 py-2 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New EMI
          </Button>
        </div>

        {/* Add/Edit EMI Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">{editingEMI ? 'Edit EMI' : 'Add New EMI'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">EMI Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Home Loan - SBI"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Total Amount *</label>
                  <Input
                    type="text"
                    value={formData.totalAmount ? formatCurrency(parseFloat(formData.totalAmount) || 0) : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[₹,]/g, '')
                      setFormData({...formData, totalAmount: value})
                    }}
                    placeholder="₹10,00,000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Monthly EMI *</label>
                  <Input
                    type="text"
                    value={formData.monthlyAmount ? formatCurrency(parseFloat(formData.monthlyAmount) || 0) : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[₹,]/g, '')
                      setFormData({...formData, monthlyAmount: value})
                    }}
                    placeholder="₹15,000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Start Date *</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Disbursal Amount *</label>
                  <Input
                    type="text"
                    value={formData.disbursalAmount ? formatCurrency(parseFloat(formData.disbursalAmount) || 0) : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[₹,]/g, '')
                      setFormData({...formData, disbursalAmount: value})
                      setLastUpdated('disbursal')
                    }}
                    placeholder="₹9,75,000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Total Months *</label>
                  <Input
                    type="number"
                    value={formData.totalMonths}
                    onChange={(e) => setFormData({...formData, totalMonths: e.target.value})}
                    placeholder="240"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Processing Fee</label>
                  <Input
                    type="text"
                    value={formData.processingFee ? formatCurrency(parseFloat(formData.processingFee) || 0) : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[₹,]/g, '')
                      setFormData({...formData, processingFee: value})
                      setLastUpdated('processing')
                    }}
                    placeholder="₹10,000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter either processing fee or disbursal amount - the other will be calculated
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Effective Interest Rate (% p.a.) - With Fees</label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={isCalculating ? 'Calculating...' : (formData.interestRate ? `${formData.interestRate}%` : '')}
                      readOnly
                      className={`font-semibold ${
                        isCalculating 
                          ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
                          : formData.interestRate 
                            ? 'bg-red-50 border-red-200 text-red-800' 
                            : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                      placeholder="Enter loan details to calculate"
                    />
                    {formData.interestRate && !isCalculating && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600">
                        ✓
                      </div>
                    )}
                    {isCalculating && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    {formData.interestRate ? 'Higher rate - you pay EMI on full amount but got less' : 'Higher rate due to fees'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nominal Interest Rate (% p.a.) - Without Fees</label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={isCalculating ? 'Calculating...' : (formData.interestRateWithoutFees ? `${formData.interestRateWithoutFees}%` : '')}
                      readOnly
                      className={`font-semibold ${
                        isCalculating 
                          ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
                          : formData.interestRateWithoutFees 
                            ? 'bg-green-50 border-green-200 text-green-800' 
                            : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                      placeholder="Enter loan details to calculate"
                    />
                    {formData.interestRateWithoutFees && !isCalculating && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600">
                        ✓
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {formData.interestRateWithoutFees ? 'Lower rate - based on amount you actually received' : 'Standard loan rate'}
                  </p>
                </div>

                <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3">
                  <Button type="submit" className="w-full sm:w-auto px-8 py-2">
                    {editingEMI ? 'Update EMI' : 'Add EMI'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full sm:w-auto px-8 py-2"
                    onClick={() => {
                      setShowForm(false)
                      setEditingEMI(null)
                      setFormData({
                        name: '',
                        totalAmount: '',
                        disbursalAmount: '',
                        monthlyAmount: '',
                        startDate: '',
                        totalMonths: '',
                        interestRate: '',
                        interestRateWithoutFees: '',
                        processingFee: '',
                        category: 'Home Loan'
                      })
                      setIsCalculating(false)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* EMI List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-8">Loading EMIs...</div>
          ) : emis.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No EMIs found</h3>
              <p className="text-gray-600">Add your first EMI to start tracking</p>
            </div>
          ) : (
            emis.map((emi) => (
              <Card key={emi._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg truncate">{emi.name}</CardTitle>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{emi.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(emi)} className="h-8 w-8 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(emi._id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <Badge className={`${getStatusColor(emi.status)} flex items-center gap-1 text-xs shrink-0`}>
                        {getStatusIcon(emi.status)}
                        {emi.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600">Outstanding</p>
                      <p className="text-sm sm:text-base font-bold text-orange-600">{formatCurrency(calculateEMIOutstanding(emi))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Monthly EMI</p>
                      <p className="text-sm sm:text-base font-bold text-red-600">{formatCurrency(emi.monthlyAmount)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600">Remaining Months</p>
                      <p className="text-sm font-semibold text-orange-600">{calculateActualRemainingMonths(emi)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Months</p>
                      <p className="text-sm font-semibold text-blue-600">{emi.totalMonths}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600">Total Amount</p>
                      <p className="text-sm font-semibold">{formatCurrency(emi.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Amount Paid</p>
                      <p className="text-sm font-semibold text-green-600">{formatCurrency(calculateActualMonthsPaid(emi) * emi.monthlyAmount)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600">Interest Rate</p>
                      <p className="text-sm font-semibold">{emi.interestRate.toFixed(2)}% p.a.</p>
                    </div>
                    <div></div>
                  </div>

                  {(emi as any).processingFee > 0 && (
                    <div>
                      <p className="text-xs text-gray-600">Processing Fee</p>
                      <p className="text-sm font-semibold">{formatCurrency((emi as any).processingFee)}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(calculateActualMonthsPaid(emi) / emi.totalMonths) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {calculateActualMonthsPaid(emi)} of {emi.totalMonths} months completed
                    </p>
                  </div>


                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function EMIPage() {
  return (
    <ProtectedRoute>
      <EMIContent />
    </ProtectedRoute>
  )
}