import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAlx6nKoPwrMuI-VGsaIgUza4iCG5MDsCU",
  authDomain: "dasho-84421.firebaseapp.com",
  projectId: "dasho-84421",
  storageBucket: "dasho-84421.firebasestorage.app",
  messagingSenderId: "763118217493",
  appId: "1:763118217493:web:e94e3cd616ca04b8c5a11c",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


export { auth };