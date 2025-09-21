"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { ApprovalsList } from "@/components/approvals-list"
import { RulesDisplay } from "@/components/rules-display"
import { MessageCenter } from "@/components/message-center"
import { AdminPanel } from "@/components/admin-panel"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LogOut, Shield, User, MessageSquare, FileText, CheckCircle, Settings, Bell, X } from "lucide-react"
import { subscribeToMessages } from "@/lib/database"
import type { Message } from "@/lib/database"

export function Dashboard() {
  const { user, logout } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadAdminMessages, setUnreadAdminMessages] = useState(0)
  const [unreadUserMessages, setUnreadUserMessages] = useState(0)
  const [showNotification, setShowNotification] = useState(false)
  const [lastAdminMessageCount, setLastAdminMessageCount] = useState(0)
  const [lastUserMessageCount, setLastUserMessageCount] = useState(0)
  const [activeTab, setActiveTab] = useState("approvals")

  useEffect(() => {
    const savedAdminCount = localStorage.getItem("lastReadAdminMessages")
    const savedUserCount = localStorage.getItem("lastReadUserMessages")

    if (savedAdminCount) {
      setLastAdminMessageCount(Number.parseInt(savedAdminCount, 10))
    }
    if (savedUserCount) {
      setLastUserMessageCount(Number.parseInt(savedUserCount, 10))
    }
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeToMessages((newMessages) => {
      setMessages(newMessages)

      if (user?.isAdmin) {
        const userMessages = newMessages.filter((msg) => !msg.isFromAdmin)
        const newUserMessageCount = userMessages.length

        if (newUserMessageCount > lastUserMessageCount && lastUserMessageCount > 0) {
          setShowNotification(true)
          setTimeout(() => setShowNotification(false), 5000)
        }

        setUnreadUserMessages(Math.max(0, newUserMessageCount - lastUserMessageCount))
      } else {
        const adminMessages = newMessages.filter((msg) => msg.isFromAdmin)
        const newAdminMessageCount = adminMessages.length

        if (newAdminMessageCount > lastAdminMessageCount && lastAdminMessageCount > 0) {
          setShowNotification(true)
          setTimeout(() => setShowNotification(false), 5000)
        }

        setUnreadAdminMessages(Math.max(0, newAdminMessageCount - lastAdminMessageCount))
      }
    })
    return unsubscribe
  }, [user?.isAdmin, lastAdminMessageCount, lastUserMessageCount])

  useEffect(() => {
    if (activeTab === "messages") {
      setShowNotification(false)
      if (user?.isAdmin) {
        const currentUserMessages = messages.filter((msg) => !msg.isFromAdmin).length
        setUnreadUserMessages(0)
        setLastUserMessageCount(currentUserMessages)
        localStorage.setItem("lastReadUserMessages", currentUserMessages.toString())
      } else {
        const currentAdminMessages = messages.filter((msg) => msg.isFromAdmin).length
        setUnreadAdminMessages(0)
        setLastAdminMessageCount(currentAdminMessages)
        localStorage.setItem("lastReadAdminMessages", currentAdminMessages.toString())
      }
    }
    if (activeTab === "admin" && user?.isAdmin) {
      setShowNotification(false)
      const currentUserMessages = messages.filter((msg) => !msg.isFromAdmin).length
      setUnreadUserMessages(0)
      setLastUserMessageCount(currentUserMessages)
      localStorage.setItem("lastReadUserMessages", currentUserMessages.toString())
    }
  }, [activeTab, user?.isAdmin, messages])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 shadow-lg rounded-lg p-4 max-w-sm animate-in slide-in-from-right">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {user.isAdmin ? "رسالة جديدة من مستخدم" : "رسالة جديدة من الإدارة"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {user.isAdmin ? "لديك رسائل جديدة في قسم الإدارة" : "لديك رسائل جديدة في قسم الرسائل"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  user.isAdmin ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                }`}
              >
                {user.isAdmin ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">مرحباً، {user.username}</h1>
                <div className="flex items-center space-x-2">
                  {user.isAdmin ? (
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                      <Shield className="w-3 h-3 mr-1" />
                      مدير النظام
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <User className="w-3 h-3 mr-1" />
                      مستخدم
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:inline-flex bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
            <TabsTrigger
              value="approvals"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>الموافقات</span>
            </TabsTrigger>
            <TabsTrigger
              value="rules"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>القوانين</span>
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="flex items-center space-x-2 relative data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>الرسائل</span>
              {!user.isAdmin && unreadAdminMessages > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center bg-red-500 text-white rounded-full"
                >
                  {unreadAdminMessages}
                </Badge>
              )}
            </TabsTrigger>
            {user.isAdmin && (
              <TabsTrigger
                value="admin"
                className="flex items-center space-x-2 relative data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all"
              >
                <Settings className="w-4 h-4" />
                <span>الإدارة</span>
                {unreadUserMessages > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center bg-red-500 text-white rounded-full"
                  >
                    {unreadUserMessages}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="approvals">
            <ApprovalsList />
          </TabsContent>

          <TabsContent value="rules">
            <RulesDisplay />
          </TabsContent>

          <TabsContent value="messages">
            <MessageCenter />
          </TabsContent>

          {user.isAdmin && (
            <TabsContent value="admin">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
