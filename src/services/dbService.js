import { db, auth } from './firebase';
import { ref, set, get } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';

export const saveTransactions = async (data) => {
    if (!db || !auth) {
        throw new Error("Firebase is not configured. Please check your .env file.");
    }

    try {
        // Auto-login anonymously if not already logged in
        let user = auth.currentUser;
        if (!user) {
            console.log("Logging in anonymously...");
            const userCredential = await signInAnonymously(auth);
            user = userCredential.user;
            console.log("Logged in as:", user.uid);
        } else {
            console.log("Already logged in as:", user.uid);
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
    if (!db || !auth) {
        throw new Error("Firebase is not configured. Please check your .env file.");
    }

    try {
        let user = auth.currentUser;
        if (!user) {
            console.log("Logging in anonymously for fetch...");
            const userCredential = await signInAnonymously(auth);
            user = userCredential.user;
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
