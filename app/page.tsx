"use client"

import { useAuth } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"
import { RulesAgreement } from "@/components/rules-agreement"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <LoginForm />
  }

  if (!user?.hasAgreedToRules) {
    return <RulesAgreement />
  }

  return <Dashboard />
}
