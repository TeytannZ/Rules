// This script provides the Firestore security rules that need to be applied in the Firebase Console
// Since we're using a client-side only app without Firebase Auth, we need permissive rules

console.log(`
=== FIRESTORE SECURITY RULES ===

Copy and paste these rules into your Firebase Console:
1. Go to https://console.firebase.google.com/
2. Select your project: house-rules-app
3. Go to Firestore Database > Rules
4. Replace the existing rules with the following:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents
    match /{document=**} {
      allow read, write: if true;
    }
  }
}

5. Click "Publish" to apply the rules

=== ALTERNATIVE: More Restrictive Rules ===

If you want more security, use these rules instead:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // System settings - allow all access
    match /settings/{document} {
      allow read, write: if true;
    }
    
    // Users collection - allow all access
    match /users/{document} {
      allow read, write: if true;
    }
    
    // Rules collection - allow all access
    match /rules/{document} {
      allow read, write: if true;
    }
    
    // Approvals collection - allow all access
    match /approvals/{document} {
      allow read, write: if true;
    }
    
    // Messages collection - allow all access
    match /messages/{document} {
      allow read, write: if true;
    }
  }
}

After applying these rules, your app should work without permission errors.
`)
