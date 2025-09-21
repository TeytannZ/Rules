"use client"

import { useState, useEffect } from "react"
import { subscribeToApprovals } from "@/lib/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, User, CheckCircle, Crown, Star, Sparkles } from "lucide-react"
import type { Approval } from "@/lib/database"
import Image from "next/image"

export function ApprovalsList() {
  const [approvals, setApprovals] = useState<Approval[]>([])

  useEffect(() => {
    const unsubscribe = subscribeToApprovals(setApprovals)
    return unsubscribe
  }, [])

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-2xl">
            <CheckCircle className="w-6 h-6" />
            <span>جميع الموافقات ({approvals.length})</span>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardContent className="p-8">
          {approvals.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-slate-400" />
              </div>
              <p className="text-muted-foreground text-lg">لا توجد موافقات بعد</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {approvals.map((approval) => (
                <div
                  key={approval.id}
                  className={`relative p-8 rounded-2xl border-2 shadow-xl transition-all hover:shadow-2xl hover:scale-105 duration-300 ${
                    approval.isAdmin
                      ? "bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-amber-300 shadow-amber-200"
                      : "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-300 shadow-green-200"
                  }`}
                >
                  {approval.isAdmin && (
                    <>
                      <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute top-2 left-2 w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-md">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    </>
                  )}

                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                      <Image
                        src="../../public/approved.png"
                        alt="Approved"
                        width={140}
                        height={140}
                        className={`rounded-full border-4 shadow-2xl transition-all hover:scale-110 duration-300 ${
                          approval.isAdmin ? "border-amber-400 shadow-amber-300" : "border-green-400 shadow-green-300"
                        }`}
                      />
                      {approval.isAdmin && (
                        <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h3 className={`font-bold text-2xl ${approval.isAdmin ? "text-amber-800" : "text-slate-800"}`}>
                        {approval.username}
                      </h3>

                      {approval.isAdmin ? (
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-300 px-4 py-2 text-sm font-semibold shadow-sm"
                        >
                          <Crown className="w-4 h-4 mr-1" />
                          مدير النظام
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 border-green-300 px-4 py-2 shadow-sm"
                        >
                          <User className="w-4 h-4 mr-1" />
                          مستخدم
                        </Badge>
                      )}

                      <p className="text-sm text-slate-600 bg-white/60 px-3 py-1 rounded-full">
                        تمت الموافقة في{" "}
                        {approval.approvedAt
                          ? (() => {
                              try {
                                // Handle Firestore timestamp
                                if (approval.approvedAt.toDate && typeof approval.approvedAt.toDate === "function") {
                                  return approval.approvedAt.toDate().toLocaleDateString("ar-SA")
                                }
                                // Handle regular Date object
                                if (approval.approvedAt instanceof Date) {
                                  return approval.approvedAt.toLocaleDateString("ar-SA")
                                }
                                // Handle date string
                                if (typeof approval.approvedAt === "string") {
                                  return new Date(approval.approvedAt).toLocaleDateString("ar-SA")
                                }
                                // Handle timestamp number
                                if (typeof approval.approvedAt === "number") {
                                  return new Date(approval.approvedAt).toLocaleDateString("ar-SA")
                                }
                                return "تاريخ غير معروف"
                              } catch (error) {
                                console.error("Error formatting date:", error)
                                return "تاريخ غير معروف"
                              }
                            })()
                          : "تاريخ غير معروف"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
