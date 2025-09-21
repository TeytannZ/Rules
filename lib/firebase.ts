// Firebase configuration and initialization
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDNwsLw8TbKuJDEeDXtpG2s2CiLyUL7Kyc",
  authDomain: "house-rules-app.firebaseapp.com",
  projectId: "house-rules-app",
  storageBucket: "house-rules-app.firebasestorage.app",
  messagingSenderId: "953025284449",
  appId: "1:953025284449:web:61c70d65df5805f12bdd20",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)
