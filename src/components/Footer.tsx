import Link from "next/link"
import { Wallet } from "lucide-react"

export default function Footer() {
  return (
    <footer className="sticky top-full border-t bg-white/50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-5 w-5 sm:h-6 sm:w-6 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <span className="text-sm sm:text-base font-semibold text-gradient-primary">MoneyTrackr</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4 sm:gap-6">
              <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                Terms
              </Link>
            </div>
            <span className="text-center">© 2024 MoneyTrackr</span>
          </div>
        </div>
      </div>
    </footer>
  )
}