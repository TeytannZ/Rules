import { db } from "./firebaseConfig" // Assuming firebaseConfig is where db is defined
import { collection, addDoc, doc, updateDoc, getDocs } from "firebase/firestore"
import type { Rule } from "./types" // Assuming Rule is defined in types.ts

// ... existing code ...

export async function addRule(content: string, order: number, title?: string, isNew = false): Promise<void> {
  const rule: Omit<Rule, "id"> = {
    content,
    order,
    title,
    isNew: isNew, // Only mark as new if explicitly requested
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const docRef = await addDoc(collection(db, "rules"), rule)
  console.log("Rule added with ID: ", docRef.id)
}

export async function updateRule(id: string, content: string, title?: string, markAsNew?: boolean): Promise<void> {
  const ruleRef = doc(db, "rules", id)
  const updateData: Partial<Rule> = {
    content,
    title,
    updatedAt: new Date(),
  }

  if (markAsNew !== undefined) {
    updateData.isNew = markAsNew
  }

  await updateDoc(ruleRef, updateData)
}

// ... existing code ...

export async function initializeDefaultRules(): Promise<boolean> {
  try {
    const rulesSnapshot = await getDocs(collection(db, "rules"))
    if (!rulesSnapshot.empty) {
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
      await addRule(rule.content, rule.order, rule.title, false) // Don't mark as new
    }

    console.log("Default rules initialized successfully")
    return true
  } catch (error) {
    console.error("Error initializing default rules:", error)
    return false
  }
}

// ... existing code ...
