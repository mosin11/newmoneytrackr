"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, Edit, Trash2, AlertTriangle, X } from "lucide-react"
import { EditTransactionModal } from "./EditTransactionModal"
import { useToast } from "@/components/ui/toast"

interface Transaction {
  _id: string
  type: "in" | "out"
  amount: number
  category: string
  description: string
  date: string
}

interface TransactionListProps {
  transactions: Transaction[]
  onUpdate?: () => void
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount)
}

export function TransactionList({ transactions, onUpdate }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Transaction | null>(null)
  const { showToast } = useToast()

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(transactions.map(t => t.category))]

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
  }

  const handleDelete = async (id: string) => {
    setLoading(id)
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        showToast('success', 'Transaction deleted successfully')
        onUpdate?.()
      } else {
        showToast('error', 'Failed to delete transaction')
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      showToast('error', 'Failed to delete transaction')
    } finally {
      setLoading(null)
      setDeleteConfirm(null)
    }
  }





  return (
    <>
    <div className="space-y-4 w-full">
      {/* Filters */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg w-full shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48 h-10 bg-white border-gray-300 text-gray-900">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="all" className="text-gray-900">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category} className="text-gray-900">{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transactions */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="text-6xl mb-4">💳</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {transactions.length === 0 ? "No transactions yet" : "No matches found"}
          </h3>
          <p className="text-gray-600">
            {transactions.length === 0 
              ? "Add your first transaction to get started!" 
              : "Try adjusting your search or filter criteria."}
          </p>
        </div>
      ) : (
      /* Desktop: 3 columns, Mobile: 1 column */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
          {filteredTransactions.map((transaction) => (
            <div key={transaction._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow w-full">
              <div className="flex flex-col space-y-3">
                {/* Header with type indicator and amount */}
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    transaction.type === 'in' 
                      ? 'bg-green-100' 
                      : 'bg-red-100'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.type === 'in' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>
                  <div className={`font-bold text-lg ${
                    transaction.type === 'in' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'in' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm break-words leading-tight">
                    {transaction.description}
                  </h4>
                </div>
                
                {/* Category and Date */}
                <div className="flex flex-col gap-2">
                  <Badge 
                    variant="outline" 
                    className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 w-fit"
                  >
                    {transaction.category}
                  </Badge>
                  <span className="text-xs text-gray-600 font-medium">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(transaction)}
                    className="flex-1 h-8 text-xs border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setDeleteConfirm(transaction)}
                    disabled={loading === transaction._id}
                    className="flex-1 h-8 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    {loading === transaction._id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Edit Modal */}
    {editingTransaction && (
      <EditTransactionModal
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSuccess={() => {
          setEditingTransaction(null)
          onUpdate?.()
        }}
      />
    )}

    {/* Delete Confirmation Modal */}
    {deleteConfirm && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Delete Transaction
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-900">{deleteConfirm.description}</p>
              <p className="text-sm text-gray-600">
                {formatCurrency(deleteConfirm.amount)} • {deleteConfirm.category}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDeleteConfirm(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDelete(deleteConfirm._id)}
                disabled={loading === deleteConfirm._id}
                className="flex-1"
              >
                {loading === deleteConfirm._id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )}
  
  </>
  );
}