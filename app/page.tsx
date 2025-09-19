"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { approveRules, getAllUsers } from "@/lib/auth"
import { getRules, addRule, deleteRule, type Rule } from "@/lib/rules"
import { sendMessage, getMessages, type Message } from "@/lib/messages"
import { useEffect } from "react"
import type { User } from "@/lib/auth"

function LoginForm() {
  const [name, setName] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      await login({
        name: name.trim(),
        isAdmin,
        hasApprovedRules: false,
        createdAt: new Date(),
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">مرحباً بك</CardTitle>
          <CardDescription>أدخل اسمك للمتابعة</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="اسمك"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-right"
              />
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                id="admin"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="admin" className="text-sm">
                مدير
              </label>
            </div>
            <Button type="submit" className="w-full">
              دخول
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function RulesApproval() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const { user, updateUser } = useAuth()

  useEffect(() => {
    const loadRules = async () => {
      try {
        const rulesData = await getRules()
        setRules(rulesData)
      } catch (error) {
        console.error("Error loading rules:", error)
      } finally {
        setLoading(false)
      }
    }
    loadRules()
  }, [])

  const handleApprove = async () => {
    if (!user) return

    try {
      await approveRules(user.name)
      updateUser({ hasApprovedRules: true })
    } catch (error) {
      console.error("Error approving rules:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">قواعد المنزل</CardTitle>
            <CardDescription>يرجى قراءة القواعد والموافقة عليها</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rules.map((rule, index) => (
              <div key={rule.id} className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    {index + 1}
                  </Badge>
                  <div className="flex-1 text-right">
                    <h3 className="font-semibold mb-2">{rule.title}</h3>
                    <p className="whitespace-pre-line text-sm text-muted-foreground">{rule.content}</p>
                  </div>
                </div>
              </div>
            ))}

            <Separator />

            <div className="text-center space-y-4">
              <img
                src="/images/approved.jpg"
                alt="Approved"
                className="w-24 h-24 mx-auto rounded-full object-cover"
                onError={(e) => {
                  console.error("Failed to load approval image")
                  e.currentTarget.style.display = "none"
                }}
              />
              <p className="text-sm text-muted-foreground">بالموافقة، أتعهد بالالتزام بجميع القواعد المذكورة أعلاه</p>
              <Button onClick={handleApprove} className="w-full">
                أوافق على القواعد
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Dashboard() {
  const { user, logout, resetAllData } = useAuth()
  const [rules, setRules] = useState<Rule[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [newRuleTitle, setNewRuleTitle] = useState("")
  const [newRuleContent, setNewRuleContent] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rulesData, messagesData, usersData] = await Promise.all([getRules(), getMessages(), getAllUsers()])
        setRules(rulesData)
        setMessages(messagesData)
        setUsers(usersData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRuleTitle.trim() || !newRuleContent.trim() || !user?.isAdmin) return

    try {
      const nextOrder = Math.max(...rules.map((r) => r.order), 0) + 1
      await addRule({
        title: newRuleTitle.trim(),
        content: newRuleContent.trim(),
        order: nextOrder,
      })
      const updatedRules = await getRules()
      setRules(updatedRules)
      setNewRuleTitle("")
      setNewRuleContent("")
    } catch (error) {
      console.error("Error adding rule:", error)
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    if (!user?.isAdmin) return

    try {
      await deleteRule(ruleId)
      const updatedRules = await getRules()
      setRules(updatedRules)
    } catch (error) {
      console.error("Error deleting rule:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    try {
      await sendMessage(user.name, newMessage.trim())
      const updatedMessages = await getMessages()
      setMessages(updatedMessages)
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">مرحباً، {user?.name}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={logout}>
              تسجيل خروج
            </Button>
            {user?.isAdmin && (
              <Button variant="destructive" onClick={resetAllData}>
                إعادة تعيين البيانات
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>القواعد الحالية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rules.map((rule, index) => (
                <div key={rule.id} className="p-3 border rounded">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <div className="flex-1 text-right">
                      <h4 className="font-semibold">{rule.title}</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{rule.content}</p>
                    </div>
                    {user?.isAdmin && (
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                        حذف
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {user?.isAdmin && (
                <form onSubmit={handleAddRule} className="space-y-2">
                  <Input
                    placeholder="عنوان القاعدة"
                    value={newRuleTitle}
                    onChange={(e) => setNewRuleTitle(e.target.value)}
                    className="text-right"
                  />
                  <textarea
                    placeholder="محتوى القاعدة"
                    value={newRuleContent}
                    onChange={(e) => setNewRuleContent(e.target.value)}
                    className="w-full p-2 border rounded text-right min-h-[100px]"
                  />
                  <Button type="submit" className="w-full">
                    إضافة قاعدة
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الرسائل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-2">
                {messages.map((message) => (
                  <div key={message.id} className="p-2 border rounded text-right">
                    <p className="font-semibold">{message.senderName}</p>
                    <p className="text-sm text-muted-foreground">{message.content}</p>
                    <p className="text-xs text-muted-foreground">{new Date(message.createdAt).toLocaleString("ar")}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="space-y-2">
                <Input
                  placeholder="اكتب رسالة"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="text-right"
                />
                <Button type="submit" className="w-full">
                  إرسال
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {user?.isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>المستخدمون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2">
                {users.map((u) => (
                  <div key={u.name} className="flex justify-between items-center p-2 border rounded">
                    <span>{u.name}</span>
                    <div className="flex gap-2">
                      {u.isAdmin && <Badge>مدير</Badge>}
                      {u.hasApprovedRules && <Badge variant="secondary">وافق</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function HomePage() {
  const { user } = useAuth()

  return (
    <>
      <ThemeToggle />
      {!user ? <LoginForm /> : !user.hasApprovedRules ? <RulesApproval /> : <Dashboard />}
    </>
  )
}
