import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAmxf72PomUu_4-D0TQtWF2IXidNPpl1Po",
  authDomain: "dev-nex.firebaseapp.com",
  projectId: "dev-nex",
  storageBucket: "dev-nex.firebasestorage.app",
  messagingSenderId: "931927779074",
  appId: "1:931927779074:web:5976e59c0071492c9b841b",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;

export const auth = getAuth(app);
