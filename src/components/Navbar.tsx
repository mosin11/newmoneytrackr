"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Home, Bell, User, LogOut, BarChart3, Database, Wallet, Target, Menu, Settings } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { NotificationCenter } from "@/components/NotificationCenter"

interface User {
  id: string
  name: string
  email: string
  isVerified: boolean
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [migrating, setMigrating] = useState(false)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  const handleMigrate = async () => {
    setMigrating(true)
    try {
      const response = await fetch('/api/migrate', { method: 'POST' })
      const data = await response.json()
      
      if (response.ok) {
        showToast('success', `Migration completed: ${data.migrated} transactions migrated`)
      } else {
        showToast('error', 'Migration failed')
      }
    } catch (error) {
      showToast('error', 'Migration failed')
    } finally {
      setMigrating(false)
    }
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 shadow-md w-full">
      <div className="w-full max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between w-full">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="MoneyTrackr Logo" 
              width={80}
              height={48}
              className="h-12 w-20 rounded-lg object-contain"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white">MoneyTrackr</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 sm:gap-3">
            {!user && (
              <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-2 sm:px-3" asChild>
                <Link href="/">
                  <Home className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
              </Button>
            )}
            
            {user ? (
              <>
                <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-2 sm:px-3" asChild>
                  <Link href="/dashboard">
                    <Home className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                </Button>
                
                <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-2 sm:px-3" asChild>
                  <Link href="/charts">
                    <BarChart3 className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Analytics</span>
                  </Link>
                </Button>
                
                <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-2 sm:px-3" asChild>
                  <Link href="/budgets">
                    <Target className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Budgets</span>
                  </Link>
                </Button>
                
                <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-2 sm:px-3" asChild>
                  <Link href="/emi">
                    <Database className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">EMI</span>
                  </Link>
                </Button>
                
                <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-2 sm:px-3" asChild>
                  <Link href="/tools">
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Tools</span>
                  </Link>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-2 sm:px-3" 
                  onClick={handleMigrate}
                  disabled={migrating}
                >
                  <Database className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{migrating ? 'Migrating...' : 'Migrate'}</span>
                </Button>
                
                <ThemeToggle />
                
                <NotificationCenter userEmail={user.email} />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">{user.name.charAt(0)}</span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48" align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-2 sm:px-3" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3" asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <>
                <ThemeToggle />
                <NotificationCenter userEmail={user.email} />
              </>
            )}
            
            <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                {user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <Home className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/charts" className="flex items-center">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/budgets" className="flex items-center">
                        <Target className="mr-2 h-4 w-4" />
                        Budgets
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/emi" className="flex items-center">
                        <Database className="mr-2 h-4 w-4" />
                        EMI
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/tools" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Tools
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleMigrate} disabled={migrating}>
                      <Database className="mr-2 h-4 w-4" />
                      {migrating ? 'Migrating...' : 'Migrate'}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/" className="flex items-center">
                        <Home className="mr-2 h-4 w-4" />
                        Home
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/login" className="flex items-center">
                        Sign In
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register" className="flex items-center">
                        Sign Up
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </div>
    </header>
  )
}