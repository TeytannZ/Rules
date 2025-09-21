"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, User } from "lucide-react"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (username === "Ahmed") {
      setShowPasswordField(true)
    } else {
      handleLogin()
    }
  }

  const handleLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      const success = await login(username, password)

      if (!success) {
        setError(username === "Ahmed" ? "كلمة مرور غير صحيحة" : "اسم مستخدم غير صحيح")
        setShowPasswordField(false)
        setPassword("")
      }
    } catch (error) {
      setError("خطأ في الاتصال. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border border-gray-200 bg-white">
        <CardHeader className="text-center pb-6">
          <div
            className={`mx-auto mb-4 w-16 h-16 rounded-lg flex items-center justify-center ${
              showPasswordField ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
            }`}
          >
            {showPasswordField ? <Shield className="w-8 h-8" /> : <User className="w-8 h-8" />}
          </div>

          <CardTitle className="text-2xl font-semibold text-gray-900 mb-2" dir="rtl">
            {showPasswordField ? "دخول المدير" : "مرحباً بك"}
          </CardTitle>
          <CardDescription className="text-gray-600" dir="rtl">
            {showPasswordField ? "أدخل كلمة مرور المدير للمتابعة" : "أدخل اسم المستخدم للوصول إلى النظام"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!showPasswordField ? (
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-right block text-sm font-medium text-gray-700" dir="rtl">
                  اسم المستخدم
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  required
                  disabled={isLoading}
                  className="text-right h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  dir="rtl"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "جاري الاتصال..." : "متابعة"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-right block text-sm font-medium text-gray-700" dir="rtl">
                  كلمة مرور المدير
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة مرور المدير"
                  required
                  autoFocus
                  disabled={isLoading}
                  className="text-right h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  dir="rtl"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordField(false)
                    setPassword("")
                    setUsername("")
                  }}
                  className="flex-1 h-10 border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  رجوع
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "جاري تسجيل الدخول..." : "دخول"}
                </Button>
              </div>
            </form>
          )}

          {error && (
            <Alert className="mt-4 border-red-200 bg-red-50" variant="destructive">
              <AlertDescription className="text-right text-red-800" dir="rtl">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
