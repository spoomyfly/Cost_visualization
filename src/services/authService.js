import { auth } from './firebase';
import {
    signInAnonymously,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();
let anonymousLoginPromise = null;

export const loginAnonymously = async () => {
    if (!auth) return null;
    if (auth.currentUser) return auth.currentUser;

    if (anonymousLoginPromise) return anonymousLoginPromise;

    anonymousLoginPromise = (async () => {
        try {
            console.log("Starting anonymous login...");
            const userCredential = await signInAnonymously(auth);
            return userCredential.user;
        } catch (error) {
            console.error("Error signing in anonymously:", error);
            throw error;
        } finally {
            anonymousLoginPromise = null;
        }
    })();

    return anonymousLoginPromise;
};

export const loginWithGoogle = async () => {
    if (!auth) return null;
    try {
        const userCredential = await signInWithPopup(auth, googleProvider);
        return userCredential.user;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        throw error;
    }
};

export const logout = async () => {
    if (!auth) return;
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};

export const onAuthStateChange = (callback) => {
    if (!auth) return () => { };
    return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = () => {
    return auth ? auth.currentUser : null;
};
