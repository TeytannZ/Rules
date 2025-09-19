import { collection, doc, getDoc, setDoc, getDocs, query, orderBy, writeBatch } from "firebase/firestore"
import { db } from "./firebase"

export interface User {
  name: string
  isAdmin: boolean
  hasApprovedRules: boolean
  createdAt: Date
}

export const ADMIN_NAME = "Ahmed"
export const ADMIN_PASSWORD = "super123"
export const MAX_USERS = 5

export async function loginUser(
  name: string,
  password?: string,
  isAdminLogin?: boolean,
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    console.log("[v0] Attempting login for:", name, "as admin:", isAdminLogin)

    if (isAdminLogin) {
      if (name !== ADMIN_NAME) {
        return { success: false, error: "المدير فقط يمكنه تسجيل الدخول كمدير" }
      }
      if (password !== ADMIN_PASSWORD) {
        return { success: false, error: "كلمة مرور المدير غير صحيحة" }
      }
    }

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", name))

    if (userDoc.exists()) {
      const userData = userDoc.data()
      console.log("[v0] User found in Firestore:", userData.name)
      return {
        success: true,
        user: {
          ...userData,
          createdAt: userData.createdAt.toDate(),
        } as User,
      }
    }

    // Check user limit for new users
    const usersSnapshot = await getDocs(collection(db, "users"))
    if (usersSnapshot.size >= MAX_USERS) {
      return { success: false, error: "تم الوصول للحد الأقصى من المستخدمين (5 مستخدمين)" }
    }

    // Create new user in Firestore
    const newUser: User = {
      name,
      isAdmin: name === ADMIN_NAME && isAdminLogin,
      hasApprovedRules: false,
      createdAt: new Date(),
    }

    await setDoc(doc(db, "users", name), {
      ...newUser,
      createdAt: new Date(), // Firestore timestamp
    })

    console.log("[v0] New user created in Firestore:", newUser.name)
    return { success: true, user: newUser }
  } catch (error) {
    console.error("[v0] Login error:", error)
    return { success: false, error: "حدث خطأ أثناء تسجيل الدخول" }
  }
}

export async function approveRules(userName: string): Promise<boolean> {
  try {
    console.log("[v0] Approving rules for:", userName)

    const approval = {
      userName,
      approvedAt: new Date().toISOString(),
      timestamp: Date.now(),
    }

    // Store approval in Firestore
    await setDoc(doc(db, "approvals", userName), approval)

    // Update user's approval status
    const userRef = doc(db, "users", userName)
    await setDoc(userRef, { hasApprovedRules: true }, { merge: true })

    console.log("[v0] Approval stored in Firestore for:", userName)
    return true
  } catch (error) {
    console.error("[v0] Error approving rules:", error)
    return false
  }
}

export async function getAllApprovals(): Promise<Array<{ userName: string; approvedAt: string; timestamp: number }>> {
  try {
    const approvalsSnapshot = await getDocs(query(collection(db, "approvals"), orderBy("timestamp", "asc")))

    const approvals = approvalsSnapshot.docs.map(
      (doc) => doc.data() as { userName: string; approvedAt: string; timestamp: number },
    )
    return approvals
  } catch (error) {
    console.error("[v0] Error getting approvals:", error)
    return []
  }
}

export async function hasUserApproved(userName: string): Promise<boolean> {
  try {
    // Check approval document
    const approvalDoc = await getDoc(doc(db, "approvals", userName))
    if (approvalDoc.exists()) return true

    // Also check user document
    const userDoc = await getDoc(doc(db, "users", userName))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      return userData.hasApprovedRules || false
    }

    return false
  } catch (error) {
    console.error("[v0] Error checking approval:", error)
    return false
  }
}

export async function resetAllFirestoreData(): Promise<void> {
  try {
    const batch = writeBatch(db)

    // Get all documents to delete (except admin user)
    const [approvalsSnapshot, messagesSnapshot, usersSnapshot] = await Promise.all([
      getDocs(collection(db, "approvals")),
      getDocs(collection(db, "messages")),
      getDocs(collection(db, "users")),
    ])

    // Delete all approvals
    approvalsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    // Delete all messages
    messagesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    // Delete all users except admin
    usersSnapshot.docs.forEach((doc) => {
      if (doc.id !== ADMIN_NAME) {
        batch.delete(doc.ref)
      }
    })

    await batch.commit()
    console.log("[v0] All Firestore data reset successfully")
  } catch (error) {
    console.error("[v0] Error resetting Firestore data:", error)
    throw error
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"))
    const users = usersSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
      } as User
    })
    return users
  } catch (error) {
    console.error("[v0] Error getting users:", error)
    return []
  }
}
