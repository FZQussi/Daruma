// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';


const firebaseConfig = {

  apiKey: "AIzaSyCcwJeUJwDjVA-jRYryFjyPzp89XXt-yBU",

  authDomain: "daruma-c63e7.firebaseapp.com",

  projectId: "daruma-c63e7",

  storageBucket: "daruma-c63e7.firebasestorage.app",

  messagingSenderId: "678320708565",

  appId: "1:678320708565:web:4bd81abb3aa7781397bb5c",

  measurementId: "G-CX231SP4NW"

};


// Inicializar o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Inicializa Firestore
const storage = getStorage(app); // Onde 'app' é sua instância do Firebase

// Opcional: Inicializar o Analytics se necessário (só funciona em browsers)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, analytics, db };
