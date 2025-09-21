// This script initializes the database with default settings and sample rules
import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore, doc, setDoc, collection, addDoc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDNwsLw8TbKuJDEeDXtpG2s2CiLyUL7Kyc",
  authDomain: "house-rules-app.firebaseapp.com",
  projectId: "house-rules-app",
  storageBucket: "house-rules-app.firebasestorage.app",
  messagingSenderId: "953025284449",
  appId: "1:953025284449:web:61c70d65df5805f12bdd20",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)

async function initializeDatabase() {
  try {
    console.log("Initializing database...")

    // Initialize system settings
    await setDoc(doc(db, "settings", "system"), {
      maxUsers: 5,
      allowedUsers: ["Ahmed", "User1", "User2", "User3", "User4"],
    })
    console.log("✓ System settings initialized")

    // Add sample rules
    const sampleRules = [
      {
        content:
          "<strong>Respect and Professionalism</strong><br>All users must maintain a respectful and professional attitude when interacting with the system and other users.",
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        content:
          "<strong>Data Security</strong><br>Users are responsible for maintaining the confidentiality of their login credentials and must not share access with unauthorized individuals.",
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        content:
          "<strong>System Usage</strong><br><ul><li>Use the system only for its intended purpose</li><li>Report any technical issues to the administrator</li><li>Do not attempt to bypass security measures</li></ul>",
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    for (const rule of sampleRules) {
      await addDoc(collection(db, "rules"), rule)
    }
    console.log("✓ Sample rules added")

    console.log("Database initialization complete!")
  } catch (error) {
    console.error("Error initializing database:", error)
  }
}

// Run the initialization
initializeDatabase()
