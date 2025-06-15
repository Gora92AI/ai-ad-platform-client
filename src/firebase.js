import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKvp0a_Q8lGYzJLhd0NHnVj9LdjzqO72k",
  authDomain: "aigrowthlane-add.firebaseapp.com",
  projectId: "aigrowthlane-add",
  storageBucket: "aigrowthlane-add.appspot.com",
  messagingSenderId: "680429211915",
  appId: "1:680429211915:web:4e3bc04bc3e8b3717a920e",
  measurementId: "G-LS7HFNJQSM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // <-- THIS export is required!