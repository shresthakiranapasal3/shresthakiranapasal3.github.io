// ================================
// 🔥 FIREBASE CONFIG (GLOBAL)
// ================================
var firebaseConfig = {
  apiKey: "AIzaSyAZM-X3el9Eug_FaNWQbixfB-rrHFt29_Q",
  authDomain: "shrestha-kirana-pasal.firebaseapp.com",
  projectId: "shrestha-kirana-pasal",
  storageBucket: "shrestha-kirana-pasal.firebasestorage.app",
  messagingSenderId: "621450478702",
  appId: "1:621450478702:web:6c54b7b4674bd5085ad27f",
  measurementId: "G-53VG3XNFQ5"
};

// ================================
// 🚀 SAFE INITIALIZATION
// ================================
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// ================================
// 📦 FIRESTORE INSTANCE
// ================================
var db = firebase.firestore();
