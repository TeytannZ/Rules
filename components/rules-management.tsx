"use client"

import { useState, useEffect } from "react"
import { subscribeToRules, addRule, updateRule, deleteRule, initializeDefaultRules } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Save, Download, FileText, Sparkles, Star, Bold, List, Type } from "lucide-react"
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
    return content // Return original if no dashes found
  }

  return rules
    .map((rule, index) => {
      const trimmedRule = rule.trim()
      if (!trimmedRule) return ""

      // Process text formatting
      const formattedRule = trimmedRule
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
        .replace(
          /==(.*?)==/g,
          '<mark style="background-color: #fef08a; padding: 2px 4px; border-radius: 3px;">$1</mark>',
        ) // Highlight
        .replace(/•\s*(.*?)(?=\n|$)/g, '<div style="margin: 8px 0; padding-left: 16px;">• $1</div>') // Bullet points

      return `<div style="margin-bottom: 12px; padding: 16px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-left: 4px solid #3b82f6; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: flex-start; gap: 12px; direction: rtl;">
          <div style="flex-shrink: 0; width: 28px; height: 28px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">
            ${index + 1}
          </div>
          <div style="flex: 1; color: #374151; line-height: 1.6; text-align: right;">
            ${formattedRule}
          </div>
        </div>
      </div>`
    })
    .join("")
}

function formatDate(date: any): string {
  if (!date) return "تاريخ غير معروف"

  try {
    const dateObj = date.toDate ? date.toDate() : new Date(date)
    return dateObj.toLocaleDateString("en-GB") // Western numerals
  } catch {
    return "تاريخ غير معروف"
  }
}

export function RulesManagement() {
  const [rules, setRules] = useState<Rule[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  const [newRuleContent, setNewRuleContent] = useState("")
  const [newRuleTitle, setNewRuleTitle] = useState("")
  const [markAsUpdated, setMarkAsUpdated] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToRules(setRules)
    return unsubscribe
  }, [])

  const handleAddRule = async () => {
    if (!newRuleContent.trim()) return

    try {
      const nextOrder = rules.length > 0 ? Math.max(...rules.map((r) => r.order)) + 1 : 1
      const formattedContent = newRuleContent // Keep original formatting
      await addRule(formattedContent, nextOrder, newRuleTitle.trim() || undefined, markAsUpdated)
      setNewRuleContent("")
      setNewRuleTitle("")
      setMarkAsUpdated(false)
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding rule:", error)
    }
  }

  const handleUpdateRule = async (id: string, content: string, title?: string, markNew?: boolean) => {
    if (!content.trim()) return

    try {
      const formattedContent = content // Keep original formatting
      await updateRule(id, formattedContent, title?.trim() || undefined, markNew)
      setEditingRule(null)
    } catch (error) {
      console.error("Error updating rule:", error)
    }
  }

  const handleDeleteRule = async (id: string) => {
    try {
      await deleteRule(id)
    } catch (error) {
      console.error("Error deleting rule:", error)
    }
  }

  const handleInitializeRules = async () => {
    setIsInitializing(true)
    try {
      const success = await initializeDefaultRules()
      if (success) {
        console.log("[v0] Rules initialized successfully")
      }
    } catch (error) {
      console.error("[v0] Error initializing rules:", error)
    } finally {
      setIsInitializing(false)
    }
  }

  const insertFormatting = (tag: string, textarea: HTMLTextAreaElement) => {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    const beforeText = textarea.value.substring(0, start)
    const afterText = textarea.value.substring(end)

    let newText = ""
    let placeholderText = ""
    switch (tag) {
      case "bold":
        placeholderText = selectedText || ""
        newText = `${beforeText}**${placeholderText}**${afterText}`
        break
      case "mark":
        placeholderText = selectedText || ""
        newText = `${beforeText}==${placeholderText}==${afterText}`
        break
      case "bullet":
        placeholderText = selectedText || ""
        newText = `${beforeText}• ${placeholderText}${afterText}`
        break
      case "dash":
        placeholderText = selectedText || ""
        newText = `${beforeText}- ${placeholderText}${afterText}`
        break
      default:
        return
    }

    if (editingRule) {
      setEditingRule({ ...editingRule, content: newText })
    } else {
      setNewRuleContent(newText)
    }

    // Focus back to textarea
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + (tag === "bold" || tag === "mark" ? 2 : 2)
      textarea.setSelectionRange(newCursorPos, newCursorPos + (selectedText?.length || 0))
    }, 0)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 space-x-reverse text-xl text-gray-900" dir="rtl">
              <FileText className="w-6 h-6 text-blue-600" />
              <span>إدارة القوانين</span>
            </CardTitle>
            <div className="flex space-x-3">
              {rules.length === 0 && (
                <Button
                  onClick={handleInitializeRules}
                  disabled={isInitializing}
                  variant="outline"
                  className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isInitializing ? "جاري التهيئة..." : "تهيئة القوانين الافتراضية"}
                </Button>
              )}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة قانون جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">إضافة قانون جديد</DialogTitle>
                    <DialogDescription>
                      أنشئ قانوناً جديداً للمستخدمين. استخدم الأدوات أدناه لتنسيق النص.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="new-rule-title" className="text-sm font-medium">
                        عنوان القانون (اختياري)
                      </Label>
                      <Input
                        id="new-rule-title"
                        value={newRuleTitle}
                        onChange={(e) => setNewRuleTitle(e.target.value)}
                        placeholder={getDefaultRuleTitle(rules.length + 1)}
                        dir="rtl"
                        className="text-right mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="new-rule-content" className="text-sm font-medium">
                        محتوى القانون
                      </Label>

                      <div className="mt-2 p-3 bg-gray-50 border rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-700">أدوات التنسيق:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const textarea = document.getElementById("new-rule-content") as HTMLTextAreaElement
                              insertFormatting("bold", textarea)
                            }}
                            className="text-xs"
                          >
                            <Bold className="w-3 h-3 mr-1" />
                            عريض **نص**
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const textarea = document.getElementById("new-rule-content") as HTMLTextAreaElement
                              insertFormatting("mark", textarea)
                            }}
                            className="text-xs"
                          >
                            <Type className="w-3 h-3 mr-1" />
                            مميز ==نص==
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const textarea = document.getElementById("new-rule-content") as HTMLTextAreaElement
                              insertFormatting("bullet", textarea)
                            }}
                            className="text-xs"
                          >
                            <List className="w-3 h-3 mr-1" />
                            نقطة •
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const textarea = document.getElementById("new-rule-content") as HTMLTextAreaElement
                              insertFormatting("dash", textarea)
                            }}
                            className="text-xs"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            قاعدة جديدة -
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          استخدم "-" لفصل القواعد، "**نص**" للعريض، "==نص==" للتمييز، "•" للنقاط
                        </p>
                      </div>

                      <Textarea
                        id="new-rule-content"
                        value={newRuleContent}
                        onChange={(e) => setNewRuleContent(e.target.value)}
                        placeholder="أدخل محتوى القانون هنا:&#10;&#10;- القانون الأول مع **نص عريض** و ==نص مميز==&#10;- القانون الثاني&#10;  • نقطة فرعية&#10;  • نقطة أخرى"
                        className="min-h-40 text-right mt-2"
                        dir="rtl"
                      />
                    </div>

                    <div
                      className="flex items-center space-x-2 space-x-reverse p-4 bg-amber-50 border border-amber-200 rounded-lg"
                      dir="rtl"
                    >
                      <Switch id="mark-updated" checked={markAsUpdated} onCheckedChange={setMarkAsUpdated} />
                      <Label htmlFor="mark-updated" className="text-sm font-medium text-amber-800">
                        تمييز هذا القانون كمحدث حديثاً (سيظهر بشكل مختلف للمستخدمين)
                      </Label>
                    </div>

                    {newRuleContent && (
                      <div>
                        <Label className="text-sm font-medium">معاينة</Label>
                        <Card className="mt-2">
                          <CardContent className="p-6">
                            <h4 className="font-bold text-xl mb-4 text-right" dir="rtl">
                              {newRuleTitle || getDefaultRuleTitle(rules.length + 1)}
                            </h4>
                            <div
                              className="text-right"
                              dir="rtl"
                              dangerouslySetInnerHTML={{ __html: formatRuleContent(newRuleContent) }}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                  <DialogFooter className="flex space-x-3">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleAddRule}
                      disabled={!newRuleContent.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      إضافة القانون
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {rules.length === 0 ? (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد قوانين بعد</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              انقر على "تهيئة القوانين الافتراضية" لإنشاء مجموعة شاملة من قوانين السكن المشترك، أو استخدم "إضافة قانون
              جديد" لإنشاء قوانينك المخصصة.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {rules.map((rule, index) => (
            <Card
              key={rule.id}
              className={`border shadow-sm transition-all duration-200 hover:shadow-md ${
                rule.isNew ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300" : "bg-white border-gray-200"
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3 flex-1">
                    <div className={`p-2 rounded-lg ${rule.isNew ? "bg-amber-100" : "bg-blue-100"}`}>
                      {rule.isNew ? (
                        <Star className="w-5 h-5 text-amber-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <span dir="rtl" className="text-right font-bold text-lg text-gray-900">
                      {rule.title || getDefaultRuleTitle(index + 1)}
                    </span>
                    {rule.isNew && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300 mr-2">
                        <Sparkles className="w-3 h-3 mr-1" />
                        محدث حديثاً
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingRule({ ...rule, title: rule.title || "" })}
                          className="hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold">تعديل القانون {index + 1}</DialogTitle>
                          <DialogDescription>
                            قم بتعديل عنوان ومحتوى القانون. يمكنك تمييزه كمحدث حديثاً.
                          </DialogDescription>
                        </DialogHeader>
                        {editingRule && (
                          <div className="space-y-6">
                            <div>
                              <Label htmlFor="edit-rule-title" className="text-sm font-medium">
                                عنوان القانون (اختياري)
                              </Label>
                              <Input
                                id="edit-rule-title"
                                value={editingRule.title || ""}
                                onChange={(e) => setEditingRule({ ...editingRule, title: e.target.value })}
                                placeholder={getDefaultRuleTitle(index + 1)}
                                dir="rtl"
                                className="text-right mt-2"
                              />
                            </div>

                            <div>
                              <Label htmlFor="edit-rule-content" className="text-sm font-medium">
                                محتوى القانون
                              </Label>

                              <div className="mt-2 p-3 bg-gray-50 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-sm font-medium text-gray-700">أدوات التنسيق:</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const textarea = document.getElementById(
                                        "edit-rule-content",
                                      ) as HTMLTextAreaElement
                                      insertFormatting("bold", textarea)
                                    }}
                                    className="text-xs"
                                  >
                                    <Bold className="w-3 h-3 mr-1" />
                                    عريض **نص**
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const textarea = document.getElementById(
                                        "edit-rule-content",
                                      ) as HTMLTextAreaElement
                                      insertFormatting("mark", textarea)
                                    }}
                                    className="text-xs"
                                  >
                                    <Type className="w-3 h-3 mr-1" />
                                    مميز ==نص==
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const textarea = document.getElementById(
                                        "edit-rule-content",
                                      ) as HTMLTextAreaElement
                                      insertFormatting("bullet", textarea)
                                    }}
                                    className="text-xs"
                                  >
                                    <List className="w-3 h-3 mr-1" />
                                    نقطة •
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const textarea = document.getElementById(
                                        "edit-rule-content",
                                      ) as HTMLTextAreaElement
                                      insertFormatting("dash", textarea)
                                    }}
                                    className="text-xs"
                                  >
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    قاعدة جديدة -
                                  </Button>
                                </div>
                              </div>

                              <Textarea
                                id="edit-rule-content"
                                value={editingRule.content}
                                onChange={(e) => setEditingRule({ ...editingRule, content: e.target.value })}
                                className="min-h-40 text-right mt-2"
                                dir="rtl"
                              />
                            </div>

                            <div
                              className="flex items-center space-x-2 space-x-reverse p-4 bg-amber-50 border border-amber-200 rounded-lg"
                              dir="rtl"
                            >
                              <Switch
                                id="mark-updated-edit"
                                checked={markAsUpdated}
                                onCheckedChange={setMarkAsUpdated}
                              />
                              <Label htmlFor="mark-updated-edit" className="text-sm font-medium text-amber-800">
                                تمييز هذا القانون كمحدث حديثاً
                              </Label>
                            </div>

                            {editingRule.content && (
                              <div>
                                <Label className="text-sm font-medium">معاينة</Label>
                                <Card className="mt-2">
                                  <CardContent className="p-6">
                                    <h4 className="font-bold text-xl mb-4 text-right" dir="rtl">
                                      {editingRule.title || getDefaultRuleTitle(index + 1)}
                                    </h4>
                                    <div
                                      className="text-right"
                                      dir="rtl"
                                      dangerouslySetInnerHTML={{ __html: formatRuleContent(editingRule.content) }}
                                    />
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </div>
                        )}
                        <DialogFooter className="flex space-x-3">
                          <Button variant="outline" onClick={() => setEditingRule(null)}>
                            إلغاء
                          </Button>
                          <Button
                            onClick={() =>
                              editingRule &&
                              handleUpdateRule(editingRule.id, editingRule.content, editingRule.title, markAsUpdated)
                            }
                            disabled={!editingRule?.content.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            حفظ التغييرات
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 bg-transparent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف القانون</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف هذا القانون؟ لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteRule(rule.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div
                  className="text-right leading-relaxed"
                  dir="rtl"
                  dangerouslySetInnerHTML={{ __html: formatRuleContent(rule.content) }}
                />
                <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 text-right">
                  آخر تحديث: {formatDate(rule.updatedAt)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
