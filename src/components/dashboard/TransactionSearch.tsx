"use client"

import { useState } from "react"
import { Search, Filter, X, Calendar, DollarSign, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

interface SearchFilters {
  search: string
  type: 'all' | 'in' | 'out'
  category: string
  minAmount: string
  maxAmount: string
  dateRange: string
}

interface TransactionSearchProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  categories: string[]
}

export function TransactionSearch({ filters, onFiltersChange, categories }: TransactionSearchProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      type: 'all',
      category: 'all',
      minAmount: '',
      maxAmount: '',
      dateRange: 'all'
    })
    setShowAdvanced(false)
  }

  const hasActiveFilters = filters.search || filters.type !== 'all' || filters.category !== 'all' || 
                          filters.minAmount || filters.maxAmount || filters.dateRange !== 'all'

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Basic Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pt-4 border-t">
            {/* Transaction Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Type
              </label>
              <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="in">Income</SelectItem>
                  <SelectItem value="out">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Category
              </label>
              <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Range
              </label>
              <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount Range */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Amount Range
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min amount"
                  value={filters.minAmount}
                  onChange={(e) => updateFilter('minAmount', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max amount"
                  value={filters.maxAmount}
                  onChange={(e) => updateFilter('maxAmount', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.search && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                Search: "{filters.search}"
              </span>
            )}
            {filters.type !== 'all' && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                Type: {filters.type === 'in' ? 'Income' : 'Expense'}
              </span>
            )}
            {filters.category !== 'all' && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                Category: {filters.category}
              </span>
            )}
            {filters.dateRange !== 'all' && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                Date: {filters.dateRange}
              </span>
            )}
            {(filters.minAmount || filters.maxAmount) && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                Amount: ₹{filters.minAmount || '0'} - ₹{filters.maxAmount || '∞'}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}