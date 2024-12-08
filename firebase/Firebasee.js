import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Importez Firebase Storage
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: "AIzaSyAzaEJRGMgVbvJSYE9zvUmy089Nu3WpVF4",
    authDomain: "projetwebsw.firebaseapp.com",
    databaseURL: "https://projetwebsw-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "projetwebsw",
    storageBucket: "projetwebsw.appspot.com", // Nécessaire pour Firebase Storage
    messagingSenderId: "420779306085",
    appId: "1:420779306085:android:d6c9e039b2a00169396a8c"
};

// Initialisez Firebase uniquement s'il n'y a pas d'instance existante
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialisez Realtime Database
const database = getDatabase(app);

// Initialisez ou récupérez Auth avec persistance AsyncStorage
const auth = getApps().length === 1
    ? initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      })
    : getAuth(app);

// Initialisez Firebase Storage
const storage = getStorage(app); // Ajout de Firebase Storage

// Exportez les instances pour les utiliser ailleurs dans l'application
export { auth, database, storage };
