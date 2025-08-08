import Link from "next/link"
import Image from "next/image"
import { Wallet } from "lucide-react"

export default function Footer() {
  return (
    <footer className="sticky top-full border-t bg-white/50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Image 
              src="/logo.png" 
              alt="MoneyTrackr Logo" 
              width={24} 
              height={24} 
              className="h-5 w-5 sm:h-6 sm:w-6"
            />
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
            <span className="text-center">© {new Date().getFullYear()} MoneyTrackr</span>
          </div>
        </div>
      </div>
    </footer>
  )
}