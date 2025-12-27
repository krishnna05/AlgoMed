const admin = require("firebase-admin");
const path = require("path");
const serviceAccount = require("./serviceAccountKey.json");

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount), 
  });
  console.log("Firebase Admin Initialized with Service Account");
} catch (error) {
  if (!/already exists/.test(error.message)) {
    console.error("Firebase Admin Error:", error);
  }
}

module.exports = admin;