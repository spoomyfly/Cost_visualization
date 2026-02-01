import { db } from './firebase';
import { ref, set, get } from 'firebase/database';
import { loginAnonymously, getCurrentUser } from './authService';

export const saveTransactions = async (data) => {
    if (!db) {
        throw new Error("Firebase is not configured. Please check your .env file.");
    }

    try {
        const user = getCurrentUser();
        if (!user) {
            throw new Error("User not authenticated. Please sign in.");
        }

        const uid = user.uid;
        console.log("Saving data to:", 'transactions/' + uid);
        await set(ref(db, 'transactions/' + uid), data);
        console.log("Save successful");

        return { success: true };
    } catch (error) {
        console.error("Error in saveTransactions:", error);
        throw error;
    }
};

export const fetchTransactions = async () => {
    if (!db) {
        throw new Error("Firebase is not configured. Please check your .env file.");
    }

    try {
        const user = getCurrentUser();
        if (!user) {
            // Instead of auto-login here, we return null so the UI can decide
            console.warn("fetchTransactions: No user logged in.");
            return null;
        }

        const uid = user.uid;
        return await fetchPublicTransactions(uid);
    } catch (error) {
        console.error("Error in fetchTransactions:", error);
        throw error;
    }
};

export const fetchPublicTransactions = async (uid) => {
    if (!db) {
        throw new Error("Firebase is not configured.");
    }

    try {
        console.log("Fetching public data from:", 'transactions/' + uid);
        const snapshot = await get(ref(db, 'transactions/' + uid));
        if (snapshot.exists()) {
            console.log("Data retrieved successfully");
            return snapshot.val();
        } else {
            console.log("No data available");
            return null;
        }
    } catch (error) {
        console.error("Error in fetchPublicTransactions:", error);
        throw error;
    }
};
