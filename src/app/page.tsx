"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  BarChart3, 
  Sparkles, 
  ArrowRight, 
  CheckCircle,
  Star,
  Users,
  Zap,
  AlertCircle
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"


function LandingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      router.push('/dashboard')
    }
  }, [router])



  const features = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Smart Tracking",
      description: "Automatically categorize and track your income and expenses"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Visual Analytics",
      description: "Beautiful charts and insights to understand your spending patterns"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description: "Your financial data is encrypted and stored securely"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Quick and responsive interface for seamless tracking"
    }
  ]

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Freelancer",
      content: "MoneyTrackr helped me understand where my money goes. The visual charts are amazing!",
      rating: 5
    },
    {
      name: "Raj K.",
      role: "Student",
      content: "Simple, clean, and effective. Perfect for tracking my daily expenses.",
      rating: 5
    },
    {
      name: "Priya S.",
      role: "Entrepreneur",
      content: "The best expense tracker I've used. Highly recommended!",
      rating: 5
    }
  ]

  const getErrorMessage = (errorType: string) => {
    switch (errorType) {
      case 'auth_error':
        return 'Authentication error occurred. Please try signing in again.'
      case 'not_found':
        return 'The requested page was not found. Redirecting to home.'
      default:
        return 'An error occurred. Please try again.'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Error Alert */}
      {error && (
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              {getErrorMessage(error)}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-medium">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Track Every Rupee, Effortlessly</span>
            <span className="xs:hidden">Track Effortlessly</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            <span className="text-gradient-primary">Smart</span> Financial
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            <span className="text-gradient">Tracking</span>
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Take control of your finances with our intuitive expense tracker. 
            <span className="hidden sm:inline">Monitor your income, track expenses, and gain insights with beautiful visualizations.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg" asChild>
              <Link href="/login">
                <span className="sm:hidden">Start Now</span>
                <span className="hidden sm:inline">Start Tracking Now</span>
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16">
          <Card className="card-hover text-center p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1 sm:mb-2">10K+</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Active Users</p>
          </Card>
          
          <Card className="card-hover text-center p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1 sm:mb-2">₹50M+</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Tracked Transactions</p>
          </Card>
          
          <Card className="card-hover text-center p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1 sm:mb-2">4.9/5</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">User Rating</p>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            Why Choose <span className="text-gradient-primary">MoneyTrackr</span>?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Powerful features designed to make financial tracking simple and insightful
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="card-hover p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="text-white">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            What Our <span className="text-gradient-primary">Users Say</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 px-4">
            Join thousands of satisfied users who trust MoneyTrackr
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="card-hover p-4 sm:p-6">
              <div className="flex items-center gap-1 mb-3 sm:mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm sm:text-base">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base truncate">
                    {testimonial.name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <Card className="card-hover gradient-border p-6 sm:p-8 text-center">
          <CardContent className="space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Ready to <span className="text-gradient-primary">Start Tracking</span>?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Join thousands of users who are already taking control of their finances with MoneyTrackr
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg" asChild>
                <Link href="/login">
                  <span className="sm:hidden">Get Started</span>
                  <span className="hidden sm:inline">Get Started Free</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LandingPageContent />
    </Suspense>
  )
}
