"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { getRules, agreeToRules, updateUserData, addApproval } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, CheckCircle, Sparkles } from "lucide-react"
import type { Rule } from "@/lib/database"

function getDefaultRuleTitle(ruleNumber: number): string {
  const defaultTitles = [
    "1. الضوضاء و أوقات الهدوء",
    "2. الضيوف",
    "3. المطبخ",
    "4. الثلاجة",
    "5. الحمام و المرحاض",
    "6. التنظيف و المنتجات المشتركة",
    "7. الخصوصية و الاحترام",
  ]

  return defaultTitles[ruleNumber - 1] || `Rule ${ruleNumber}`
}

function formatRuleContent(content: string): string {
  if (!content) return content

  // Split by dashes to create separate rules
  const rules = content.split(/(?:^|\n)\s*-\s*/).filter((rule) => rule.trim())

  if (rules.length <= 1) {
    // Process single rule with formatting
    const formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold; color: #1f2937;">$1</strong>') // Bold
      .replace(
        /==(.*?)==/g,
        '<mark style="background-color: #fef08a; padding: 2px 4px; border-radius: 3px; color: #92400e;">$1</mark>',
      ) // Highlight
      .replace(/•\s*(.*?)(?=\n|$)/g, '<div style="margin: 8px 0; padding-left: 16px; color: #374151;">• $1</div>') // Bullet points

    return `<div style="padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-left: 4px solid #3b82f6; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin: 16px 0;">
      <div style="color: #374151; line-height: 1.7; text-align: right; font-size: 16px;">
        ${formattedContent}
      </div>
    </div>`
  }

  return rules
    .map((rule, index) => {
      const trimmedRule = rule.trim()
      if (!trimmedRule) return ""

      // Process text formatting
      const formattedRule = trimmedRule
        .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold; color: #1f2937;">$1</strong>') // Bold
        .replace(
          /==(.*?)==/g,
          '<mark style="background-color: #fef08a; padding: 2px 4px; border-radius: 3px; color: #92400e;">$1</mark>',
        ) // Highlight
        .replace(/•\s*(.*?)(?=\n|$)/g, '<div style="margin: 8px 0; padding-left: 16px; color: #374151;">• $1</div>') // Bullet points

      return `<div style="margin-bottom: 16px; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-left: 4px solid #3b82f6; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: flex-start; gap: 16px; direction: rtl;">
          <div style="flex-shrink: 0; width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
            ${index + 1}
          </div>
          <div style="flex: 1; color: #374151; line-height: 1.7; text-align: right; font-size: 16px;">
            ${formattedRule}
          </div>
        </div>
      </div>`
    })
    .join("")
}

export function RulesAgreement() {
  const [rules, setRules] = useState<Rule[]>([])
  const [hasRead, setHasRead] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { user, agreeToRules: updateAuthState } = useAuth()

  useEffect(() => {
    const loadRules = async () => {
      console.log("[v0] Loading rules for agreement page...")
      const rulesData = await getRules()
      console.log("[v0] Rules loaded for agreement:", rulesData)
      setRules(rulesData)
      setIsLoading(false)
    }

    loadRules()
  }, [])

  const handleAgree = async () => {
    if (!user) return

    try {
      // Update database
      await agreeToRules(user.username)
      await addApproval(user.username, user.isAdmin)
      await updateUserData(user.username, {
        username: user.username,
        hasAgreedToRules: true,
        isAdmin: user.isAdmin,
      })

      // Update auth state
      updateAuthState()
    } catch (error) {
      console.error("Error agreeing to rules:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border border-gray-200 bg-white">
          <CardHeader className="text-center pb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="mx-auto mb-6 w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold" dir="rtl">
              الشروط والأحكام
            </CardTitle>
            <CardDescription className="text-lg text-blue-100" dir="rtl">
              مرحباً {user?.username}! يرجى قراءة الموافقة على القواعد التالية للمتابعة.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <ScrollArea className="h-96 w-full border-2 border-gray-200 rounded-xl p-6 bg-white shadow-inner">
              <div className="space-y-6" dir="auto">
                {rules.length === 0 ? (
                  <p className="text-gray-500 text-center py-8" dir="rtl">
                    لم يتم تعيين أي قواعد بعد.
                  </p>
                ) : (
                  rules.map((rule, index) => (
                    <div key={rule.id} className="space-y-4">
                      <div
                        className={`rounded-xl p-4 shadow-sm ${
                          rule.isNew
                            ? "bg-gradient-to-r from-amber-500 to-orange-500"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600"
                        }`}
                      >
                        <h3
                          className="font-bold text-xl text-white text-right leading-relaxed flex items-center space-x-2 space-x-reverse"
                          dir="rtl"
                        >
                          {rule.isNew && <Sparkles className="w-5 h-5" />}
                          <span>{rule.title || getDefaultRuleTitle(index + 1)}</span>
                          {rule.isNew && (
                            <span className="bg-white/20 px-2 py-1 rounded-full text-sm font-medium">محدث حديثاً</span>
                          )}
                        </h3>
                      </div>
                      <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                        <div
                          className="prose prose-lg max-w-none text-gray-700 leading-relaxed text-right"
                          style={{
                            unicodeBidi: "plaintext",
                            fontFamily: "system-ui, -apple-system, sans-serif",
                          }}
                          dir="rtl"
                          dangerouslySetInnerHTML={{ __html: formatRuleContent(rule.content) }}
                        />
                      </div>
                      {index < rules.length - 1 && <hr className="my-6 border-gray-300" />}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div
              className="flex items-center space-x-3 space-x-reverse bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200"
              dir="rtl"
            >
              <Checkbox id="terms" checked={hasRead} onCheckedChange={setHasRead} className="w-5 h-5" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-right text-green-800"
                dir="rtl"
              >
                لقد قرأت ووافقت على الالتزام بهذه الشروط طوال فترة إقامتي في المنزل
              </label>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleAgree}
                disabled={!hasRead}
                size="lg"
                className="px-12 py-3 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg disabled:opacity-50"
                dir="rtl"
              >
                <CheckCircle className="w-5 h-5 ml-2" />
                أوافق على القواعد
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
