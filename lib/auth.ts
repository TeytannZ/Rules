import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getSystemSettings, getUserData } from "./database"

export interface User {
  username: string
  isAdmin: boolean
  hasAgreedToRules: boolean
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password?: string) => Promise<boolean>
  logout: () => void
  agreeToRules: () => void
}

// Valid usernames and admin password (obfuscated in production)
const ADMIN_PASSWORD = "clashof1" // This should be environment variable in production

const DEFAULT_ALLOWED_USERS = ["Ahmed", "User1", "User2", "User3", "User4"]

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (username: string, password?: string) => {
        try {
          console.log("[v0] Attempting login for:", username)

          let allowedUsers = DEFAULT_ALLOWED_USERS

          try {
            const settings = await getSystemSettings()
            allowedUsers = settings.allowedUsers
            console.log("[v0] Got allowed users from Firebase:", allowedUsers)
          } catch (error) {
            console.log("[v0] Firebase offline, using default allowed users:", allowedUsers)
          }

          if (!allowedUsers.includes(username)) {
            console.log("[v0] Username not in allowed users list")
            return false
          }

          const isAdmin = username === "Ahmed"

          // Admin requires password
          if (isAdmin && password !== ADMIN_PASSWORD) {
            console.log("[v0] Invalid admin password")
            return false
          }

          let hasAgreedToRules = false
          try {
            const userData = await getUserData(username)
            hasAgreedToRules = userData?.hasAgreedToRules || false
            console.log("[v0] User has agreed to rules:", hasAgreedToRules)
          } catch (error) {
            console.log("[v0] Could not check user agreement status, defaulting to false")
          }

          const user: User = {
            username,
            isAdmin,
            hasAgreedToRules,
          }

          console.log("[v0] Login successful for:", username)
          set({ user, isAuthenticated: true })
          return true
        } catch (error) {
          console.error("[v0] Login error:", error)
          return false
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      agreeToRules: () => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, hasAgreedToRules: true },
          })
        }
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)
