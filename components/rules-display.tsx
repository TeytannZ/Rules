"use client"

import { useState, useEffect } from "react"
import { subscribeToRules } from "@/lib/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle2, Star, Sparkles } from "lucide-react"
import type { Rule } from "@/lib/database"
import type { JSX } from "react"

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

function formatRuleContent(content: string): JSX.Element[] {
  if (!content) return []

  // Split by dashes to create separate rules
  const rules = content.split(/(?:^|\n)\s*-\s*/).filter((rule) => rule.trim())

  if (rules.length <= 1) {
    return [
      <div
        key="single-rule"
        className="bg-white border-l-4 border-l-blue-500 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-start space-x-3 space-x-reverse" dir="rtl">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-gray-700 leading-relaxed text-right">{formatTextContent(content)}</div>
        </div>
      </div>,
    ]
  }

  return rules
    .map((rule, index) => {
      const trimmedRule = rule.trim()
      if (!trimmedRule) return null

      return (
        <div
          key={index}
          className="bg-white border-l-4 border-l-blue-500 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-start space-x-3 space-x-reverse" dir="rtl">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              {index + 1}
            </div>
            <div className="flex-1 text-gray-700 leading-relaxed text-right">{formatTextContent(trimmedRule)}</div>
          </div>
        </div>
      )
    })
    .filter(Boolean)
}

function formatTextContent(text: string): JSX.Element {
  const lines = text.split("\n").filter((line) => line.trim())

  return (
    <div className="space-y-3">
      {lines.map((line, lineIndex) => {
        const trimmedLine = line.trim()

        // Handle bullet points
        if (trimmedLine.startsWith("•")) {
          const bulletText = trimmedLine.slice(1).trim()
          return (
            <div key={lineIndex} className="flex items-start space-x-2 space-x-reverse" dir="rtl">
              <span className="text-blue-500 font-bold text-lg leading-none mt-1">•</span>
              <span className="flex-1 leading-relaxed">{formatInlineText(bulletText)}</span>
            </div>
          )
        }

        // Regular text
        return (
          <div key={lineIndex} className="leading-relaxed">
            {formatInlineText(trimmedLine)}
          </div>
        )
      })}
    </div>
  )
}

function formatInlineText(text: string): JSX.Element {
  const parts = text.split(/(\*\*.*?\*\*|==.*?==)/)

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-bold text-gray-900">
              {part.slice(2, -2)}
            </strong>
          )
        } else if (part.startsWith("==") && part.endsWith("==")) {
          return (
            <mark
              key={index}
              className="bg-gradient-to-r from-yellow-200 to-amber-200 px-2 py-1 rounded-md border border-yellow-300 shadow-sm font-medium"
              style={{
                background: "linear-gradient(135deg, #fef08a 0%, #fbbf24 100%)",
                boxShadow: "0 1px 3px rgba(251, 191, 36, 0.2)",
              }}
            >
              {part.slice(2, -2)}
            </mark>
          )
        } else {
          return <span key={index}>{part}</span>
        }
      })}
    </>
  )
}

function formatDate(date: any): string {
  if (!date) return "تاريخ غير معروف"

  try {
    const dateObj = date.toDate ? date.toDate() : new Date(date)
    return dateObj.toLocaleDateString("en-GB").replace(/\//g, "/") // Western numerals
  } catch {
    return "تاريخ غير معروف"
  }
}

export function RulesDisplay() {
  const [rules, setRules] = useState<Rule[]>([])

  useEffect(() => {
    const unsubscribe = subscribeToRules((rulesData) => {
      setRules(rulesData)
    })
    return unsubscribe
  }, [])

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse text-xl text-gray-900" dir="rtl">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>القواعد الحالية</span>
          </CardTitle>
        </CardHeader>
      </Card>

      {rules.length === 0 ? (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="py-12">
            <p className="text-gray-500 text-center" dir="rtl">
              لم يتم تعيين أي قواعد بعد.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {rules.map((rule, index) => (
            <Card
              key={rule.id}
              className={`border shadow-sm transition-all duration-200 hover:shadow-lg ${
                rule.isNew
                  ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 shadow-amber-100"
                  : "bg-white border-gray-200"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4 text-right">
                  <div className="flex-1">
                    <h3
                      className="font-bold text-xl text-gray-900 mb-4 leading-relaxed text-right flex items-center space-x-2 space-x-reverse"
                      dir="rtl"
                    >
                      {rule.isNew && <Sparkles className="w-5 h-5 text-amber-500" />}
                      <span>{rule.title || getDefaultRuleTitle(index + 1)}</span>
                    </h3>
                  </div>
                  {rule.isNew && (
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-300 ml-4 shadow-sm"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      محدث مؤخراً
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">{formatRuleContent(rule.content)}</div>

                <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500 text-right flex items-center justify-between">
                  <span dir="rtl" className="flex items-center space-x-2 space-x-reverse">
                    <span>آخر تحديث:</span>
                    <span className="font-medium">{formatDate(rule.updatedAt)}</span>
                  </span>
                  <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                    القاعدة {index + 1}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
