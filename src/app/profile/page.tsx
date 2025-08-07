"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Mail, Lock, Edit, Check, X } from "lucide-react"
import { ProtectedRoute } from "@/components/ProtectedRoute"

interface UserData {
  id: string
  name: string
  email: string
  isVerified: boolean
}

function ProfileContent() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Edit states
  const [editingField, setEditingField] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  
  // OTP verification
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const [otp, setOtp] = useState("")
  const [pendingUpdate, setPendingUpdate] = useState<{field: string, value: string} | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setFormData({
        name: parsedUser.name,
        email: parsedUser.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    }
  }, [])

  const handleEdit = (field: string) => {
    setEditingField(field)
    setError("")
    setSuccess("")
  }

  const handleCancel = () => {
    setEditingField(null)
    if (user) {
      setFormData({
        ...formData,
        name: user.name,
        email: user.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    }
  }

  const sendOTP = async (field: string, value: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/profile/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          field,
          value
        })
      })

      const data = await response.json()

      if (response.ok) {
        setPendingUpdate({ field, value })
        setShowOTPVerification(true)
        setSuccess("OTP sent to your email")
      } else {
        setError(data.error || 'Failed to send OTP')
      }
    } catch (error) {
      setError("Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (field: string) => {
    setError("")
    setSuccess("")

    if (field === "password") {
      if (formData.newPassword !== formData.confirmPassword) {
        setError("Passwords don't match")
        return
      }
      if (formData.newPassword.length < 6) {
        setError("Password must be at least 6 characters")
        return
      }
    }

    if (field === "name" && formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters")
      return
    }

    if (field === "email" && !formData.email.includes("@")) {
      setError("Please enter a valid email")
      return
    }

    const value = field === "password" ? formData.newPassword : formData[field as keyof typeof formData]
    await sendOTP(field, value)
  }

  const verifyOTPAndUpdate = async () => {
    if (!pendingUpdate || !user) return

    try {
      setLoading(true)
      
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          otp,
          field: pendingUpdate.field,
          value: pendingUpdate.value,
          currentPassword: pendingUpdate.field === 'password' ? formData.currentPassword : undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        setSuccess(data.message)
        setShowOTPVerification(false)
        setEditingField(null)
        setPendingUpdate(null)
        setOtp("")
        
        if (pendingUpdate.field === "password") {
          setFormData({
            ...formData,
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          })
        } else {
          setFormData({
            ...formData,
            name: data.user.name,
            email: data.user.email
          })
        }
      } else {
        setError(data.error || 'Failed to update profile')
      }
    } catch (error) {
      setError("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-2xl px-3 py-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
            Manage your account information
          </p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg sm:text-xl">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="space-y-4">
              {/* Name */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                    {editingField === "name" ? (
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="mt-1 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {editingField === "name" ? (
                    <>
                      <Button size="sm" onClick={() => handleSave("name")} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleEdit("name")}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    {editingField === "email" ? (
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="mt-1 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white break-all">{user.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {editingField === "email" ? (
                    <>
                      <Button size="sm" onClick={() => handleSave("email")} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleEdit("email")}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Password</p>
                    {editingField === "password" ? (
                      <div className="space-y-2 mt-1">
                        <Input
                          type="password"
                          placeholder="Current Password"
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                          className="text-gray-900 dark:text-white"
                        />
                        <Input
                          type="password"
                          placeholder="New Password"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                          className="text-gray-900 dark:text-white"
                        />
                        <Input
                          type="password"
                          placeholder="Confirm New Password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          className="text-gray-900 dark:text-white"
                        />
                      </div>
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white">••••••••••••</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {editingField === "password" ? (
                    <>
                      <Button size="sm" onClick={() => handleSave("password")} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleEdit("password")}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Account Status */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Account Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isVerified 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {user.isVerified ? 'Verified' : 'Pending'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">ID: {user.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OTP Verification Modal */}
        {showOTPVerification && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Verify OTP</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Enter the 6-digit code sent to your email to confirm the changes.
                </p>
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={verifyOTPAndUpdate} 
                    disabled={loading || otp.length !== 6}
                    className="flex-1"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Verify & Update
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowOTPVerification(false)
                      setPendingUpdate(null)
                      setOtp("")
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Check your email for the OTP code
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}