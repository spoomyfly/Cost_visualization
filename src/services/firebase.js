import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import config from '../config';

const firebaseConfig = {
    apiKey: config.firebase.apiKey,
    authDomain: config.firebase.authDomain,
    projectId: config.firebase.projectId,
    storageBucket: config.firebase.storageBucket,
    messagingSenderId: config.firebase.messagingSenderId,
    appId: config.firebase.appId,
    databaseURL: config.firebase.databaseURL,
};

let app;
let db;

try {
    if (firebaseConfig.apiKey) {
        console.log("Initializing Firebase with config:", firebaseConfig);
        app = initializeApp(firebaseConfig);
        db = getDatabase(app);
        console.log("Firebase initialized, db:", db);
    } else {
        console.warn("Firebase config missing. Save to Cloud will be disabled.");
    }
} catch (error) {
    console.error("Error initializing Firebase:", error);
}

export { db };
