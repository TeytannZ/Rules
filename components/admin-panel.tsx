"use client"
import { useState, useEffect } from "react"
import { RulesManagement } from "@/components/rules-management"
import { UserManagement } from "@/components/user-management"
import { AdminMessages } from "@/components/admin-messages"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText, Users, MessageSquare, Settings, Bell, X } from "lucide-react"
import { subscribeToMessages } from "@/lib/database"
import type { Message } from "@/lib/database"

export function AdminPanel() {
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotification, setShowNotification] = useState(false)
  const [lastMessageCount, setLastMessageCount] = useState(0)
  const [activeTab, setActiveTab] = useState("rules")

  useEffect(() => {
    const unsubscribe = subscribeToMessages((newMessages) => {
      // Count unread messages (messages from users, not admin broadcasts)
      const userMessages = newMessages.filter((msg) => !msg.isFromAdmin)
      const newUnreadCount = userMessages.length

      if (newUnreadCount > lastMessageCount && lastMessageCount > 0) {
        setShowNotification(true)
        // Auto-hide notification after 5 seconds
        setTimeout(() => setShowNotification(false), 5000)
      }

      setMessages(newMessages)
      setUnreadCount(newUnreadCount)
      setLastMessageCount(newUnreadCount)
    })
    return unsubscribe
  }, [lastMessageCount])

  useEffect(() => {
    if (activeTab === "messages" && unreadCount > 0) {
      // Delay to allow user to see the messages
      setTimeout(() => {
        setShowNotification(false)
      }, 1000)
    }
  }, [activeTab, unreadCount])

  return (
    <div className="space-y-6">
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-xl border border-blue-700 animate-in slide-in-from-right">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse" dir="rtl">
              <Bell className="w-5 h-5" />
              <span className="font-medium">رسالة جديدة من المستخدمين!</span>
            </div>
            <button onClick={() => setShowNotification(false)} className="ml-2 hover:bg-blue-600 rounded p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm mt-1" dir="rtl">
            لديك رسائل جديدة في قسم الرسائل
          </p>
        </div>
      )}

      <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2 space-x-reverse text-xl" dir="rtl">
            <Settings className="w-6 h-6" />
            <span>لوحة تحكم المدير</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <TabsTrigger
                value="rules"
                className="flex items-center space-x-2 space-x-reverse data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 rounded-md transition-all"
                dir="rtl"
              >
                <FileText className="w-4 h-4" />
                <span>القواعد</span>
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="flex items-center space-x-2 space-x-reverse data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 rounded-md transition-all"
                dir="rtl"
              >
                <Users className="w-4 h-4" />
                <span>المستخدمون</span>
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="flex items-center space-x-2 space-x-reverse relative data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 rounded-md transition-all"
                dir="rtl"
              >
                <MessageSquare className="w-4 h-4" />
                <span>الرسائل</span>
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center animate-pulse bg-red-500 hover:bg-red-600"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rules" className="mt-6">
              <RulesManagement />
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <UserManagement />
            </TabsContent>

            <TabsContent value="messages" className="mt-6">
              <AdminMessages />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
