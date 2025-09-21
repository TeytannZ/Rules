"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { sendMessage, subscribeToMessages } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Send, User, Crown, Star, Shield, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Message } from "@/lib/database"

export function MessageCenter() {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = subscribeToMessages(setMessages)
    return unsubscribe
  }, [])

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return

    setIsLoading(true)
    try {
      await sendMessage(user.username, message, user.isAdmin)
      setMessage("")
      toast({
        title: "تم إرسال الرسالة",
        description: "تم إرسال رسالتك بنجاح.",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "خطأ",
        description: "فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const displayMessages = user?.isAdmin
    ? messages // Admin sees all messages
    : messages.filter((msg) => msg.isFromAdmin || msg.from === user?.username) // Users see admin messages and their own

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">الرسائل</h1>
              <p className="text-muted-foreground mt-1">
                {user?.isAdmin ? "جميع الرسائل من المستخدمين" : "رسائل الإدارة ورسائلك"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {displayMessages.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  <span className="text-xl">
                    {user?.isAdmin ? "جميع الرسائل" : "الرسائل"} ({displayMessages.length})
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {displayMessages.map((msg, index) => (
                    <div key={msg.id}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-full ${
                                msg.isFromAdmin ? "bg-gradient-to-r from-purple-500/20 to-purple-600/20" : "bg-muted/50"
                              }`}
                            >
                              {msg.isFromAdmin ? (
                                <Crown className="w-4 h-4 text-purple-600" />
                              ) : (
                                <User className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <span className="font-semibold text-card-foreground">{msg.from}</span>
                            {msg.isFromAdmin ? (
                              <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                                <Crown className="w-3 h-3 mr-1" />
                                مدير
                                <Star className="w-3 h-3 ml-1" />
                              </Badge>
                            ) : user?.isAdmin && msg.from === user.username ? (
                              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                                <Shield className="w-3 h-3 mr-1" />
                                أنت (مدير)
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-border/50">
                                <User className="w-3 h-3 mr-1" />
                                مستخدم
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(msg.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div
                          className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                            msg.isFromAdmin
                              ? "bg-gradient-to-br from-purple-50/80 to-purple-100/60 border-purple-200/60 shadow-lg backdrop-blur-sm"
                              : user?.isAdmin && msg.from === user.username
                                ? "bg-gradient-to-br from-blue-50/80 to-blue-100/60 border-blue-200/60 shadow-lg backdrop-blur-sm"
                                : "bg-muted/30 border-border/50"
                          }`}
                        >
                          <p
                            className={`whitespace-pre-wrap leading-relaxed ${
                              msg.isFromAdmin
                                ? "font-medium text-purple-900 text-base"
                                : user?.isAdmin && msg.from === user.username
                                  ? "font-medium text-blue-900 text-base"
                                  : "text-card-foreground"
                            }`}
                          >
                            {msg.content}
                          </p>
                          {msg.isFromAdmin && !user?.isAdmin && (
                            <div className="mt-4 flex items-center space-x-2 p-3 bg-purple-100/50 rounded-lg border border-purple-200/50">
                              <AlertTriangle className="w-4 h-4 text-purple-700" />
                              <span className="text-sm font-semibold text-purple-800">رسالة مهمة من الإدارة</span>
                              <Star className="w-4 h-4 text-purple-600" />
                            </div>
                          )}
                        </div>
                      </div>
                      {index < displayMessages.length - 1 && <Separator className="my-6 bg-border/50" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl">إرسال رسالة جديدة</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="message" className="text-sm font-medium">
                الرسالة
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  user?.isAdmin ? "أرسل رسالة لجميع المستخدمين..." : "أرسل رسالة للإدارة (شكاوى، اقتراحات، إلخ)..."
                }
                className="min-h-32 bg-input border-border resize-none"
                dir="rtl"
              />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-border/50">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-full ${user?.isAdmin ? "bg-primary/10" : "bg-muted/50"}`}>
                  {user?.isAdmin ? (
                    <Crown className="w-4 h-4 text-primary" />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  من: <span className="font-semibold text-card-foreground">{user?.username}</span>
                  {user?.isAdmin && <Badge className="mr-2 bg-primary/10 text-primary border-primary/20">مدير</Badge>}
                </p>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                className="bg-primary hover:bg-primary/90 shadow-lg"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? "جاري الإرسال..." : "إرسال الرسالة"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
