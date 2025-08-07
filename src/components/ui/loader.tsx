"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { Loader2 } from "lucide-react"

interface LoaderContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined)

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  return (
    <LoaderContext.Provider value={{ isLoading, setLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-900 dark:text-gray-100 font-medium">Loading...</span>
          </div>
        </div>
      )}
    </LoaderContext.Provider>
  )
}

export function useLoader() {
  const context = useContext(LoaderContext)
  if (!context) {
    throw new Error('useLoader must be used within LoaderProvider')
  }
  return context
}