import { collection, doc, setDoc, getDocs, query, orderBy, deleteDoc, writeBatch } from "firebase/firestore"
import { db } from "./firebase"

export interface Rule {
  id: string
  title: string
  content: string
  order: number
  createdAt: Date
  updatedAt: Date
}

// Default house rules from the provided text
const DEFAULT_RULES: Omit<Rule, "id" | "createdAt" | "updatedAt">[] = [
  {
    title: "الضوضاء و أوقات الهدوء",
    content: `أوقات الهدوء: من 10 مساءً إلى 6 صباحًا → صمت تام.

ممنوع الصراخ أو أي صوت مرتفع في أي وقت.

لا زيارات جماعية أو ضحك بصوت مرتفع ليلًا.

يُستثنى من ذلك من لديه امتحانات، عمل، أو يحتاج للراحة.`,
    order: 1,
  },
  {
    title: "الضيوف",
    content: `يُسمح بالضيوف لكن بشروط:

يجب المغادرة قبل بداية أوقات الهدوء.

لا زيارات يومية متكررة.

من دعا الضيف يكون مسؤولًا عن أي إزعاج أو مشكلة يسببها.`,
    order: 2,
  },
  {
    title: "المطبخ",
    content: `الأدوات والأواني تُحفظ دائمًا تحت الحوض.

التوابل (ملح، إلخ) تبقى فوق ليستفيد منها الجميع (إن وافق صاحبها).

يجب تنظيف كل شيء فور الاستخدام.

إذا تُركت أدوات متّسخة → لأي شخص الحق في رميها في الشرفة.

لكل شخص كيس قمامة خاص به (إلا إذا اتفق اثنان على المشاركة).

كل شخص يرمي قمامته بنفسه.`,
    order: 3,
  },
  {
    title: "الثلاجة",
    content: `إذا لم تُصلح → المساحة الصغيرة تُقسم بالتساوي.

إذا ملأها شخص بأغراضه → للآخرين الحق في ترك طعامهم بالخارج.`,
    order: 4,
  },
  {
    title: "الحمام و المرحاض",
    content: `امسح الماء عن الأرض بعد الاستحمام أو الاستخدام.

يجب إبقاء النافذة مفتوحة دائمًا.

ممنوع ترك الصابون أو الشامبو بالداخل (المكان ضيق).

على الجميع استخدام معطّر أو منظّف بين فترة وأخرى لرائحة أفضل.

يجب أن يبقى كرسي المرحاض وخرطوم المياه نظيفين دائمًا.

الأهم: ❌ ممنوع الاستمناء داخل الحمام.`,
    order: 5,
  },
  {
    title: "التنظيف و المنتجات المشتركة",
    content: `كل شخص ينظف غرفته.

إذا خرجت رائحة كريهة للممر → يجب تنظيفها فورًا.

الأشياء التي تُشترى معًا = استعمالها متاح للجميع.

الاستخدام يكون عادلًا وحسب الحاجة فقط.

لا يُستهلك كل المنتج مرة واحدة.`,
    order: 6,
  },
  {
    title: "الخصوصية و الاحترام",
    content: `يجب الطرق قبل دخول أي غرفة.

ممنوع أخذ أو استعارة أي شيء دون إذن.

إذا حدثت مشكلة → تواصل مباشرة معي أو أرسل رسالة.`,
    order: 7,
  },
]

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export async function initializeRules(): Promise<void> {
  try {
    console.log("[v0] Initializing rules...")

    // Check if rules already exist in Firestore
    const rulesSnapshot = await getDocs(collection(db, "rules"))

    if (rulesSnapshot.empty) {
      console.log("[v0] No existing rules found, creating default rules")
      const batch = writeBatch(db)

      DEFAULT_RULES.forEach((rule) => {
        const ruleId = generateId()
        const ruleRef = doc(db, "rules", ruleId)
        batch.set(ruleRef, {
          ...rule,
          id: ruleId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      })

      await batch.commit()
      console.log("[v0] Default rules created:", DEFAULT_RULES.length)
    } else {
      console.log("[v0] Found existing rules:", rulesSnapshot.size)
    }
  } catch (error) {
    console.error("Error initializing rules:", error)
    throw error
  }
}

export async function getRules(): Promise<Rule[]> {
  try {
    console.log("[v0] Getting rules...")

    const rulesSnapshot = await getDocs(query(collection(db, "rules"), orderBy("order", "asc")))

    if (rulesSnapshot.empty) {
      console.log("[v0] No rules found, initializing...")
      await initializeRules()
      // Retry getting rules after initialization
      const retrySnapshot = await getDocs(query(collection(db, "rules"), orderBy("order", "asc")))
      const rules = retrySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Rule
      })
      console.log("[v0] Retrieved rules after initialization:", rules.length)
      return rules
    }

    const rules = rulesSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Rule
    })

    console.log("[v0] Retrieved rules:", rules.length)
    return rules
  } catch (error) {
    console.error("Error getting rules:", error)
    return []
  }
}

export async function addRule(rule: Omit<Rule, "id" | "createdAt" | "updatedAt">): Promise<boolean> {
  try {
    const ruleId = generateId()
    const newRule = {
      ...rule,
      id: ruleId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await setDoc(doc(db, "rules", ruleId), newRule)
    return true
  } catch (error) {
    console.error("Error adding rule:", error)
    return false
  }
}

export async function updateRule(id: string, updates: Partial<Omit<Rule, "id" | "createdAt">>): Promise<boolean> {
  try {
    const ruleRef = doc(db, "rules", id)
    await setDoc(
      ruleRef,
      {
        ...updates,
        updatedAt: new Date(),
      },
      { merge: true },
    )
    return true
  } catch (error) {
    console.error("Error updating rule:", error)
    return false
  }
}

export async function deleteRule(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "rules", id))
    return true
  } catch (error) {
    console.error("Error deleting rule:", error)
    return false
  }
}
