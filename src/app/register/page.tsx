"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Lock, User } from 'lucide-react'

export default function RegisterPage() {
  const [step, setStep] = useState<'register' | 'otp'>('register')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('OTP sent to your email')
        setStep('otp')
      } else {
        console.error('Register error:', data)
        setError(data.error || data.details || 'Registration failed')
      }
    } catch (error) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp,
          userData: formData
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Registration successful! Redirecting to login...')
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else {
        console.error('OTP verification error:', data)
        setError(data.error || data.details || 'OTP verification failed')
      }
    } catch (error) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 min-h-full">
      <div className="w-full max-w-sm">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Create your account</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-center">
              {step === 'register' ? 'Sign Up' : 'Verify Email'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            {step === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="pl-10 h-9"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="pl-10 h-9"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Password (min 6 chars)"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="pl-10 h-9"
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full h-9" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-3">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-3">
                    Enter the 6-digit code sent to<br />
                    <span className="font-medium">{formData.email}</span>
                  </p>
                </div>
                
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-base tracking-widest h-9"
                  maxLength={6}
                  required
                />
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep('register')}
                    className="flex-1 h-9"
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 h-9" disabled={loading || otp.length !== 6}>
                    {loading ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
              </form>
            )}

            <div className="text-center pt-3 border-t">
              <p className="text-xs text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}