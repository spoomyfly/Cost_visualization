import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveTransactions, fetchTransactions } from '../services/dbService';
import { db, auth } from '../services/firebase';
import { ref, set, get } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';

// Mock firebase modules
vi.mock('../services/firebase', () => ({
    db: { type: 'database' },
    auth: { currentUser: null }
}));

vi.mock('firebase/database', () => ({
    ref: vi.fn(),
    set: vi.fn(),
    get: vi.fn()
}));

vi.mock('firebase/auth', () => ({
    signInAnonymously: vi.fn(),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
    GoogleAuthProvider: class { }
}));

describe('dbService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        auth.currentUser = null;
    });

    describe('saveTransactions', () => {
        it('should throw if user is not authenticated', async () => {
            const data = [{ id: '1', name: 'Test' }];
            await expect(saveTransactions(data)).rejects.toThrow("User not authenticated");
            expect(set).not.toHaveBeenCalled();
        });

        it('should use current user if already logged in', async () => {
            auth.currentUser = { uid: 'existing-uid' };
            set.mockResolvedValue({ success: true });

            const data = [{ id: '1', name: 'Test' }];
            await saveTransactions(data);

            expect(signInAnonymously).not.toHaveBeenCalled();
            expect(set).toHaveBeenCalled();
        });
    });

    describe('fetchTransactions', () => {
        it('should fetch data for the current user', async () => {
            auth.currentUser = { uid: 'test-uid' };
            get.mockResolvedValue({
                exists: () => true,
                val: () => [{ id: '1', name: 'Test' }]
            });

            const result = await fetchTransactions();

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Test');
        });

        it('should return null if no data exists', async () => {
            auth.currentUser = { uid: 'test-uid' };
            get.mockResolvedValue({
                exists: () => false
            });

            const result = await fetchTransactions();
            expect(result).toBeNull();
        });
    });
});
