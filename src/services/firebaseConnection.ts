import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCYecU_0nZFA5w0XMXUHfrgyuVM8tuXR_8",
    authDomain: "tarefasplus-fd2b3.firebaseapp.com",
    projectId: "tarefasplus-fd2b3",
    storageBucket: "tarefasplus-fd2b3.firebasestorage.app",
    messagingSenderId: "274291123716",
    appId: "1:274291123716:web:0cb582af6b36864e4cb751"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp)

export {db}