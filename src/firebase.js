// Replace these values with your own from Firebase Console
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
        apiKey: "AIzaSyCyiEJw6UlCUMWeiPL1XwIZ0AMl-wCtTUw",
        authDomain: "moonlightcafe-91677.firebaseapp.com",
        projectId: "moonlightcafe-91677",
        appId: "1:474399538032:web:eb8692e49ed5ecdaa46db5",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };

/* const firebaseConfig = {
        apiKey: "AIzaSyCyiEJw6UlCUMWeiPL1XwIZ0AMl-wCtTUw",
        authDomain: "moonlightcafe-91677.firebaseapp.com",
        projectId: "moonlightcafe-91677",
        storageBucket: "moonlightcafe-91677.firebasestorage.app",
        messagingSenderId: "474399538032",
        appId: "1:474399538032:web:eb8692e49ed5ecdaa46db5",
        measurementId: "G-VBM4TEYFP2"
      }; */