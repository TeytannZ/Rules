import type { Rule } from "./types"

// localStorage keys
const RULES_KEY = "approval_system_rules"
const MESSAGES_KEY = "approval_system_messages"
const USERS_KEY = "approval_system_users"
const APPROVALS_KEY = "approval_system_approvals"
const SETTINGS_KEY = "approval_system_settings"

// Helper functions for localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

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

// Rule functions
export async function addRule(content: string, order: number, title?: string, isNew = false): Promise<void> {
  const rules = getFromStorage<Rule[]>(RULES_KEY, [])
  const rule: Rule = {
    id: Date.now().toString(),
    content,
    order,
    title,
    isNew: isNew,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  rules.push(rule)
  saveToStorage(RULES_KEY, rules)

  // Trigger storage event for real-time updates
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: RULES_KEY,
      newValue: JSON.stringify(rules),
      storageArea: localStorage,
    }),
  )

  console.log("Rule added with ID: ", rule.id)
}

export async function updateRule(id: string, content: string, title?: string, markAsNew?: boolean): Promise<void> {
  const rules = getFromStorage<Rule[]>(RULES_KEY, [])
  const ruleIndex = rules.findIndex((rule) => rule.id === id)

  if (ruleIndex !== -1) {
    rules[ruleIndex] = {
      ...rules[ruleIndex],
      content,
      title,
      updatedAt: new Date(),
      ...(markAsNew !== undefined && { isNew: markAsNew }),
    }
    saveToStorage(RULES_KEY, rules)

    // Trigger storage event for real-time updates
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: RULES_KEY,
        newValue: JSON.stringify(rules),
        storageArea: localStorage,
      }),
    )
  }
}

export async function getRules(): Promise<Rule[]> {
  return getFromStorage<Rule[]>(RULES_KEY, [])
}

export async function deleteRule(id: string): Promise<void> {
  const rules = getFromStorage<Rule[]>(RULES_KEY, [])
  const filteredRules = rules.filter((rule) => rule.id !== id)
  saveToStorage(RULES_KEY, filteredRules)

  // Trigger storage event for real-time updates
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: RULES_KEY,
      newValue: JSON.stringify(filteredRules),
      storageArea: localStorage,
    }),
  )
}

export function subscribeToRules(callback: (rules: Rule[]) => void): () => void {
  // Initial call
  getRules().then(callback)

  // Listen for storage changes
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === RULES_KEY) {
      getRules().then(callback)
    }
  }

  window.addEventListener("storage", handleStorageChange)

  // Return unsubscribe function
  return () => {
    window.removeEventListener("storage", handleStorageChange)
  }
}

export async function getUserData(username: string): Promise<UserData | null> {
  const users = getFromStorage<UserData[]>(USERS_KEY, [])
  return users.find((user) => user.username === username) || null
}

export async function updateUserData(username: string, data: Partial<UserData>): Promise<void> {
  const users = getFromStorage<UserData[]>(USERS_KEY, [])
  const userIndex = users.findIndex((user) => user.username === username)

  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...data }
  } else {
    users.push({ username, isAdmin: false, hasAgreedToRules: false, ...data } as UserData)
  }

  saveToStorage(USERS_KEY, users)

  // Trigger storage event for real-time updates
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: USERS_KEY,
      newValue: JSON.stringify(users),
      storageArea: localStorage,
    }),
  )
}

export async function agreeToRules(username: string): Promise<void> {
  await updateUserData(username, {
    hasAgreedToRules: true,
    rulesAgreedAt: new Date(),
  })
}

export async function getAllUsers(): Promise<UserData[]> {
  return getFromStorage<UserData[]>(USERS_KEY, [])
}

export async function sendMessage(from: string, content: string, isFromAdmin: boolean): Promise<void> {
  const messages = getFromStorage<Message[]>(MESSAGES_KEY, [])
  const message: Message = {
    id: Date.now().toString(),
    from,
    content,
    createdAt: new Date(),
    isFromAdmin,
  }

  messages.push(message)
  saveToStorage(MESSAGES_KEY, messages)
}

export async function getMessages(): Promise<Message[]> {
  return getFromStorage<Message[]>(MESSAGES_KEY, [])
}

export function subscribeToMessages(callback: (messages: Message[]) => void): () => void {
  // Initial call
  getMessages().then(callback)

  // Listen for storage changes
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === MESSAGES_KEY) {
      getMessages().then(callback)
    }
  }

  window.addEventListener("storage", handleStorageChange)

  // Return unsubscribe function
  return () => {
    window.removeEventListener("storage", handleStorageChange)
  }
}

export async function markMessageAsRead(id: string): Promise<void> {
  const messages = getFromStorage<Message[]>(MESSAGES_KEY, [])
  const messageIndex = messages.findIndex((msg) => msg.id === id)

  if (messageIndex !== -1) {
    messages[messageIndex] = { ...messages[messageIndex], isRead: true } as any
    saveToStorage(MESSAGES_KEY, messages)
  }
}

export async function deleteMessage(id: string): Promise<void> {
  const messages = getFromStorage<Message[]>(MESSAGES_KEY, [])
  const filteredMessages = messages.filter((msg) => msg.id !== id)
  saveToStorage(MESSAGES_KEY, filteredMessages)
}

export async function addApproval(username: string, isAdmin: boolean): Promise<void> {
  const approvals = getFromStorage<Approval[]>(APPROVALS_KEY, [])
  const approval: Approval = {
    id: Date.now().toString(),
    username,
    approvedAt: new Date(),
    isAdmin,
  }

  approvals.push(approval)
  saveToStorage(APPROVALS_KEY, approvals)

  // Trigger storage event for real-time updates
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: APPROVALS_KEY,
      newValue: JSON.stringify(approvals),
      storageArea: localStorage,
    }),
  )
}

export async function getApprovals(): Promise<Approval[]> {
  return getFromStorage<Approval[]>(APPROVALS_KEY, [])
}

export function subscribeToApprovals(callback: (approvals: Approval[]) => void): () => void {
  // Initial call
  getApprovals().then(callback)

  // Listen for storage changes
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === APPROVALS_KEY) {
      getApprovals().then(callback)
    }
  }

  window.addEventListener("storage", handleStorageChange)

  // Return unsubscribe function
  return () => {
    window.removeEventListener("storage", handleStorageChange)
  }
}

export async function getSystemSettings(): Promise<SystemSettings> {
  const defaultSettings: SystemSettings = {
    maxUsers: 5,
    allowedUsers: ["Ahmed", "User1", "User2", "User3", "User4"],
  }

  return getFromStorage<SystemSettings>(SETTINGS_KEY, defaultSettings)
}

export async function updateSystemSettings(settings: SystemSettings): Promise<void> {
  saveToStorage(SETTINGS_KEY, settings)
}

export function subscribeToSystemSettings(callback: (settings: SystemSettings) => void): () => void {
  // Initial call
  getSystemSettings().then(callback)

  // Listen for storage changes
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === SETTINGS_KEY) {
      getSystemSettings().then(callback)
    }
  }

  window.addEventListener("storage", handleStorageChange)

  // Return unsubscribe function
  return () => {
    window.removeEventListener("storage", handleStorageChange)
  }
}

export async function initializeDefaultRules(): Promise<boolean> {
  try {
    const existingRules = getFromStorage<Rule[]>(RULES_KEY, [])
    if (existingRules.length > 0) {
      console.log("Rules already exist, skipping initialization")
      return false
    }

    const defaultRules = [
      {
        title: "1. الضوضاء و أوقات الهدوء",
        content: `أوقات الهدوء: من 10 مساءً إلى 6 صباحًا → صمت تام.

ممنوع الصراخ أو أي صوت مرتفع في أي وقت.

لا دردشات جماعية أو ضحك بصوت مرتفع ليلًا.

يُستثنى من ذلك من لديه امتحانات، عمل، أو يحتاج للراحة.`,
        order: 1,
      },
      {
        title: "2. الضيوف",
        content: `يُسمح بالضيوف لكن بشروط:

يجب المغادرة قبل بداية أوقات الهدوء.

لا زيارات يومية متكررة.

من دعا الضيف يكون مسؤولًا عن أي إزعاج أو مشكلة يسببها.`,
        order: 2,
      },
      {
        title: "3. المطبخ",
        content: `الأدوات والأواني تُحفظ دائمًا تحت الحوض.

التوابل (ملح، إلخ) تبقى فوق ليستفيد منها الجميع (إن وافق صاحبها).

يجب تنظيف كل شيء فور الاستخدام.

إذا تُركت أدوات متّسخة → لأي شخص الحق في رميها في الشرفة.

لكل شخص كيس قمامة خاص به (إلا إذا اتفق اثنان على المشاركة).

كل شخص يرمي قمامته بنفسه.`,
        order: 3,
      },
      {
        title: "4. الثلاجة",
        content: `إذا لم تُصلح → المساحة الصغيرة تُقسم بالتساوي.

إذا ملأها شخص بأغراضه → للآخرين الحق في ترك طعامهم بالخارج.`,
        order: 4,
      },
      {
        title: "5. الحمام و المرحاض",
        content: `امسح الماء عن الأرض بعد الاستحمام أو الاستخدام.

يجب إبقاء النافذة مفتوحة دائمًا.

ممنوع ترك الصابون أو الشامبو بالداخل (المكان ضيق).

على الجميع استخدام معطّر أو منظّف بين فترة وأخرى لرائحة أفضل.

يجب أن يبقى كرسي المرحاض وخرطوم المياه نظيفين دائمًا.

**الأهم: ❌ ممنوع الاستمناء داخل الحمام.**`,
        order: 5,
      },
      {
        title: "6. التنظيف و المنتجات المشتركة",
        content: `كل شخص ينظف غرفته.

إذا خرجت رائحة كريهة للممر → يجب تنظيفها فورًا.

الأشياء التي تُشترى معًا = استعمالها متاح للجميع.

الاستخدام يكون عادلًا وحسب الحاجة فقط.

لا يُستهلك كل المنتج مرة واحدة.`,
        order: 6,
      },
      {
        title: "7. الخصوصية و الاحترام",
        content: `يجب الطرق قبل دخول أي غرفة.

ممنوع أخذ أو استعارة أي شيء دون إذن.

إذا حدثت مشكلة → تواصل مباشرة معي أو أرسل رسالة.`,
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
