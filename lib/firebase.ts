import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDNwsLw8TbKuJDEeDXtpG2s2CiLyUL7Kyc",
  authDomain: "house-rules-app.firebaseapp.com",
  projectId: "house-rules-app",
  storageBucket: "house-rules-app.firebasestorage.app",
  messagingSenderId: "953025284449",
  appId: "1:953025284449:web:61c70d65df5805f12bdd20",
}

let app
let db

try {
  // Initialize Firebase only if it hasn't been initialized already
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
  db = getFirestore(app)

  console.log("[v0] Firebase initialized successfully")
} catch (error) {
  console.error("[v0] Firebase initialization error:", error)
  throw error
}

export { db }
