import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Rule } from "./types"

export interface UserData {
  username: string
  hasAgreedToRules: boolean
  rulesAgreedAt?: Date
  isAdmin: boolean
}

export interface Message {
  id: string
  from: string
  content: string
  createdAt: Date
  isFromAdmin: boolean
  isRead?: boolean
}

export interface Approval {
  id: string
  username: string
  approvedAt: Date
  isAdmin: boolean
}

export interface SystemSettings {
  maxUsers: number
  allowedUsers: string[]
}

// Helper function to convert Firestore timestamp to Date
function convertTimestamp(timestamp: any): Date {
  if (timestamp?.toDate) {
    return timestamp.toDate()
  }
  if (timestamp instanceof Date) {
    return timestamp
  }
  if (typeof timestamp === "string") {
    return new Date(timestamp)
  }
  return new Date()
}

// Rule functions
export async function addRule(content: string, order: number, title?: string, isNew = false): Promise<void> {
  try {
    const rule = {
      content,
      order,
      title,
      isNew,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    await addDoc(collection(db, "rules"), rule)
    console.log("Rule added successfully")
  } catch (error) {
    console.error("Error adding rule:", error)
    throw error
  }
}

export async function updateRule(id: string, content: string, title?: string, markAsNew?: boolean): Promise<void> {
  try {
    const ruleRef = doc(db, "rules", id)
    const updateData: any = {
      content,
      title,
      updatedAt: Timestamp.now(),
    }

    if (markAsNew !== undefined) {
      updateData.isNew = markAsNew
    }

    await updateDoc(ruleRef, updateData)
    console.log("Rule updated successfully")
  } catch (error) {
    console.error("Error updating rule:", error)
    throw error
  }
}

export async function getRules(): Promise<Rule[]> {
  try {
    const q = query(collection(db, "rules"), orderBy("order", "asc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
      updatedAt: convertTimestamp(doc.data().updatedAt),
    })) as Rule[]
  } catch (error) {
    console.error("Error getting rules:", error)
    return []
  }
}

export async function deleteRule(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "rules", id))
    console.log("Rule deleted successfully")
  } catch (error) {
    console.error("Error deleting rule:", error)
    throw error
  }
}

export function subscribeToRules(callback: (rules: Rule[]) => void): () => void {
  const q = query(collection(db, "rules"), orderBy("order", "asc"))

  return onSnapshot(
    q,
    (querySnapshot) => {
      const rules = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt),
      })) as Rule[]

      callback(rules)
    },
    (error) => {
      console.error("Error in rules subscription:", error)
      callback([])
    },
  )
}

export async function getUserData(username: string): Promise<UserData | null> {
  try {
    const docRef = doc(db, "users", username)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        ...data,
        rulesAgreedAt: data.rulesAgreedAt ? convertTimestamp(data.rulesAgreedAt) : undefined,
      } as UserData
    }
    return null
  } catch (error) {
    console.error("Error getting user data:", error)
    return null
  }
}

export async function updateUserData(username: string, data: Partial<UserData>): Promise<void> {
  try {
    const userRef = doc(db, "users", username)
    const updateData = { ...data }

    // Convert Date objects to Timestamps
    if (updateData.rulesAgreedAt) {
      updateData.rulesAgreedAt = Timestamp.fromDate(updateData.rulesAgreedAt) as any
    }

    await setDoc(userRef, updateData, { merge: true })
    console.log("User data updated successfully")
  } catch (error) {
    console.error("Error updating user data:", error)
    throw error
  }
}

export async function agreeToRules(username: string): Promise<void> {
  await updateUserData(username, {
    hasAgreedToRules: true,
    rulesAgreedAt: new Date(),
  })
}

export async function getAllUsers(): Promise<UserData[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "users"))
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      rulesAgreedAt: doc.data().rulesAgreedAt ? convertTimestamp(doc.data().rulesAgreedAt) : undefined,
    })) as UserData[]
  } catch (error) {
    console.error("Error getting all users:", error)
    return []
  }
}

export async function sendMessage(from: string, content: string, isFromAdmin: boolean): Promise<void> {
  try {
    const message = {
      from,
      content,
      createdAt: Timestamp.now(),
      isFromAdmin,
      isRead: false,
    }

    await addDoc(collection(db, "messages"), message)
    console.log("Message sent successfully")
  } catch (error) {
    console.error("Error sending message:", error)
    throw error
  }
}

export async function getMessages(): Promise<Message[]> {
  try {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestamp(doc.data().createdAt),
    })) as Message[]
  } catch (error) {
    console.error("Error getting messages:", error)
    return []
  }
}

export function subscribeToMessages(callback: (messages: Message[]) => void): () => void {
  const q = query(collection(db, "messages"), orderBy("createdAt", "desc"))

  return onSnapshot(
    q,
    (querySnapshot) => {
      const messages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
      })) as Message[]

      callback(messages)
    },
    (error) => {
      console.error("Error in messages subscription:", error)
      callback([])
    },
  )
}

export async function markMessageAsRead(id: string): Promise<void> {
  try {
    const messageRef = doc(db, "messages", id)
    await updateDoc(messageRef, { isRead: true })
  } catch (error) {
    console.error("Error marking message as read:", error)
    throw error
  }
}

export async function deleteMessage(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "messages", id))
    console.log("Message deleted successfully")
  } catch (error) {
    console.error("Error deleting message:", error)
    throw error
  }
}

export async function addApproval(username: string, isAdmin: boolean): Promise<void> {
  try {
    const approval = {
      username,
      approvedAt: Timestamp.now(),
      isAdmin,
    }

    await addDoc(collection(db, "approvals"), approval)
    console.log("Approval added successfully")
  } catch (error) {
    console.error("Error adding approval:", error)
    throw error
  }
}

export async function getApprovals(): Promise<Approval[]> {
  try {
    const q = query(collection(db, "approvals"), orderBy("approvedAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      approvedAt: convertTimestamp(doc.data().approvedAt),
    })) as Approval[]
  } catch (error) {
    console.error("Error getting approvals:", error)
    return []
  }
}

export function subscribeToApprovals(callback: (approvals: Approval[]) => void): () => void {
  const q = query(collection(db, "approvals"), orderBy("approvedAt", "desc"))

  return onSnapshot(
    q,
    (querySnapshot) => {
      const approvals = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        approvedAt: convertTimestamp(doc.data().approvedAt),
      })) as Approval[]

      callback(approvals)
    },
    (error) => {
      console.error("Error in approvals subscription:", error)
      callback([])
    },
  )
}

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const docRef = doc(db, "settings", "system")
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data() as SystemSettings
    }

    // Return default settings if none exist
    const defaultSettings: SystemSettings = {
      maxUsers: 5,
      allowedUsers: ["Ahmed", "User1", "User2", "User3", "User4"],
    }

    // Save default settings to Firestore
    await setDoc(docRef, defaultSettings)
    return defaultSettings
  } catch (error) {
    console.error("Error getting system settings:", error)
    return {
      maxUsers: 5,
      allowedUsers: ["Ahmed", "User1", "User2", "User3", "User4"],
    }
  }
}

export async function updateSystemSettings(settings: SystemSettings): Promise<void> {
  try {
    const settingsRef = doc(db, "settings", "system")
    await setDoc(settingsRef, settings)
    console.log("System settings updated successfully")
  } catch (error) {
    console.error("Error updating system settings:", error)
    throw error
  }
}

export function subscribeToSystemSettings(callback: (settings: SystemSettings) => void): () => void {
  const docRef = doc(db, "settings", "system")

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as SystemSettings)
      } else {
        // Initialize with default settings
        const defaultSettings: SystemSettings = {
          maxUsers: 5,
          allowedUsers: ["Ahmed", "User1", "User2", "User3", "User4"],
        }
        setDoc(docRef, defaultSettings)
        callback(defaultSettings)
      }
    },
    (error) => {
      console.error("Error in settings subscription:", error)
      callback({
        maxUsers: 5,
        allowedUsers: ["Ahmed", "User1", "User2", "User3", "User4"],
      })
    },
  )
}

export async function initializeDefaultRules(): Promise<boolean> {
  try {
    const rules = await getRules()
    if (rules.length > 0) {
      console.log("Rules already exist, skipping initialization")
      return false
    }

    const defaultRules = [
      {
        title: "1. الضوضاء و أوقات الهدوء",
        content: `**أوقات الهدوء:** ==من 10 مساءً إلى 6 صباحًا== → صمت تام.

**ممنوع الصراخ** أو أي صوت مرتفع في أي وقت.

لا دردشات جماعية أو ضحك بصوت مرتفع ليلًا.

==يُستثنى من ذلك== من لديه امتحانات، عمل، أو يحتاج للراحة.`,
        order: 1,
      },
      {
        title: "2. الضيوف",
        content: `**يُسمح بالضيوف** لكن بشروط:

==يجب المغادرة== قبل بداية أوقات الهدوء.

**لا زيارات يومية متكررة.**

من دعا الضيف يكون ==مسؤولًا عن أي إزعاج== أو مشكلة يسببها.`,
        order: 2,
      },
      {
        title: "3. المطبخ",
        content: `**الأدوات والأواني** تُحفظ دائمًا تحت الحوض.

==التوابل== (ملح، إلخ) تبقى فوق ليستفيد منها الجميع (إن وافق صاحبها).

**يجب تنظيف كل شيء** فور الاستخدام.

إذا تُركت أدوات متّسخة → ==لأي شخص الحق في رميها في الشرفة==.

**لكل شخص كيس قمامة خاص به** (إلا إذا اتفق اثنان على المشاركة).

كل شخص يرمي قمامته بنفسه.`,
        order: 3,
      },
      {
        title: "4. الثلاجة",
        content: `إذا لم تُصلح → ==المساحة الصغيرة تُقسم بالتساوي==.

إذا ملأها شخص بأغراضه → **للآخرين الحق في ترك طعامهم بالخارج**.`,
        order: 4,
      },
      {
        title: "5. الحمام و المرحاض",
        content: `**امسح الماء** عن الأرض بعد الاستحمام أو الاستخدام.

==يجب إبقاء النافذة مفتوحة دائمًا==.

**ممنوع ترك الصابون** أو الشامبو بالداخل (المكان ضيق).

على الجميع استخدام ==معطّر أو منظّف== بين فترة وأخرى لرائحة أفضل.

يجب أن يبقى **كرسي المرحاض وخرطوم المياه** نظيفين دائمًا.

**الأهم: ❌ ممنوع الاستمناء داخل الحمام.**`,
        order: 5,
      },
      {
        title: "6. التنظيف و المنتجات المشتركة",
        content: `**كل شخص ينظف غرفته.**

إذا خرجت رائحة كريهة للممر → ==يجب تنظيفها فورًا==.

**الأشياء التي تُشترى معًا** = استعمالها متاح للجميع.

==الاستخدام يكون عادلًا== وحسب الحاجة فقط.

**لا يُستهلك كل المنتج مرة واحدة.**`,
        order: 6,
      },
      {
        title: "7. الخصوصية و الاحترام",
        content: `**يجب الطرق** قبل دخول أي غرفة.

==ممنوع أخذ أو استعارة== أي شيء دون إذن.

إذا حدثت مشكلة → **تواصل مباشرة معي** أو أرسل رسالة.`,
        order: 7,
      },
    ]

    for (const rule of defaultRules) {
      await addRule(rule.content, rule.order, rule.title, false)
    }

    console.log("Default rules initialized successfully")
    return true
  } catch (error) {
    console.error("Error initializing default rules:", error)
    return false
  }
}
