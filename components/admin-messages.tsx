"use client"

import { useState, useEffect } from "react"
import { subscribeToMessages, sendMessage } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Send, Shield, User, Megaphone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Message } from "@/lib/database"

export function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [broadcastMessage, setBroadcastMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = subscribeToMessages(setMessages)
    return unsubscribe
  }, [])

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) return

    setIsLoading(true)
    try {
      await sendMessage("Ahmed", broadcastMessage, true)
      setBroadcastMessage("")
      toast({
        title: "Broadcast sent",
        description: "Your message has been broadcast to all users.",
      })
    } catch (error) {
      console.error("Error sending broadcast:", error)
      toast({
        title: "Error",
        description: "Failed to send broadcast. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Broadcast Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Megaphone className="w-5 h-5" />
            <span>Broadcast to All Users</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="broadcast">Broadcast Message</Label>
            <Textarea
              id="broadcast"
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Send a message to all users..."
              className="min-h-24"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleBroadcast} disabled={!broadcastMessage.trim() || isLoading}>
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? "Broadcasting..." : "Broadcast Message"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* All Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>All Messages ({messages.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No messages yet.</p>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={message.id}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{message.from}</span>
                          {message.isFromAdmin ? (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <User className="w-3 h-3 mr-1" />
                              User
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {message.createdAt?.toDate?.()?.toLocaleString() || "Unknown time"}
                        </span>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                    {index < messages.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
