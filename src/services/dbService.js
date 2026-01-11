import { db } from './firebase';
import { ref, set } from 'firebase/database';

export const saveTransactions = async (data) => {
    if (!db) {
        throw new Error("Firebase is not configured. Please check your .env file.");
    }

    try {
        console.log("Fetching IP...");
        const res = await fetch('https://api.ipify.org?format=json');
        const ipData = await res.json();
        const ip = ipData.ip.replace(/\./g, '_'); // Sanitize IP for Firebase key
        console.log("IP fetched:", ip);

        console.log("Saving data to:", 'transactions/' + ip);
        await set(ref(db, 'transactions/' + ip), data);
        console.log("Save successful");

        return { success: true };
    } catch (error) {
        console.error("Error in saveTransactions:", error);
        throw error;
    }
};
