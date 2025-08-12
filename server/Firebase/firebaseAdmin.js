const admin = require("firebase-admin");

// Use environment variable in production, fallback to local JSON in development
let serviceAccount;

try {
  serviceAccount = process.env.FIREBASE_ADMIN_CONFIG
    ? JSON.parse(process.env.FIREBASE_ADMIN_CONFIG)
    : require("./firebase-service-account.json");

  console.log(
    `✅ Firebase credentials loaded from: ${
      process.env.FIREBASE_ADMIN_CONFIG ? "ENV variable" : "Local JSON file"
    }`
  );
} catch (error) {
  console.error("❌ Firebase credentials are missing or invalid:", error);
  process.exit(1);
}

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "students-management-a611c.firebasestorage.app"
});

// Export storage bucket instance
const bucket = admin.storage().bucket();
module.exports = bucket;
