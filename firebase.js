// Firebase core
var firebaseConfig = {
  apiKey: "AIzaSyAZM-X3el9Eug_FaNWQbixfB-rrHFt29_Q",
  authDomain: "shrestha-kirana-pasal.firebaseapp.com",
  projectId: "shrestha-kirana-pasal",
  storageBucket: "shrestha-kirana-pasal.appspot.com",
  messagingSenderId: "621450478702",
  appId: "1:621450478702:web:6c54b7b4674bd5085ad27f"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
