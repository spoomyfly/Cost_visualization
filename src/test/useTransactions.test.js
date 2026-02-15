import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransactions } from '../hooks/useTransactions';
import * as dbService from '../services/dbService';
import * as requestBuilder from '../services/requestBuilder';

// Mock services
vi.mock('../services/dbService', () => ({
    saveTransactions: vi.fn(),
    fetchTransactions: vi.fn(),
    fetchPublicTransactions: vi.fn()
}));

vi.mock('../services/requestBuilder', () => ({
    buildTransactionPayload: vi.fn(data => data)
}));

describe('useTransactions hook', () => {
    const setNotification = vi.fn();
    const t = vi.fn((key, params) => key);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with empty transactions', () => {
        const { result } = renderHook(() => useTransactions(setNotification, t));
        expect(result.current.transactions).toEqual([]);
    });

    describe('transferTransactions', () => {
        it('should update the project for selected transactions', async () => {
            const initialTransactions = [
                { id: '1', name: 'T1', project: 'Proj1', amount: 10 },
                { id: '2', name: 'T2', project: 'Proj1', amount: 20 },
                { id: '3', name: 'T3', project: 'Proj2', amount: 30 }
            ];

            const { result } = renderHook(() => useTransactions(setNotification, t));

            // Set initial state
            act(() => {
                result.current.setTransactions(initialTransactions);
            });

            // Transfer T1 and T2 to Proj2
            await act(async () => {
                await result.current.transferTransactions(['1', '2'], 'Proj2');
            });

            expect(result.current.transactions).toHaveLength(3);
            expect(result.current.transactions.find(t => t.id === '1').project).toBe('Proj2');
            expect(result.current.transactions.find(t => t.id === '2').project).toBe('Proj2');
            expect(result.current.transactions.find(t => t.id === '3').project).toBe('Proj2');

            expect(dbService.saveTransactions).toHaveBeenCalled();
            expect(setNotification).toHaveBeenCalledWith(expect.objectContaining({
                type: 'success'
            }));
        });

        it('should sanitize the target project name', async () => {
            const initialTransactions = [{ id: '1', name: 'T1', project: 'Proj1', amount: 10 }];
            const { result } = renderHook(() => useTransactions(setNotification, t));

            act(() => {
                result.current.setTransactions(initialTransactions);
            });

            await act(async () => {
                await result.current.transferTransactions(['1'], '  NewProj  ');
            });

            expect(result.current.transactions[0].project).toBe('NewProj');
        });

        it('should do nothing if ids are empty', async () => {
            const initialTransactions = [{ id: '1', name: 'T1', project: 'Proj1', amount: 10 }];
            const { result } = renderHook(() => useTransactions(setNotification, t));

            act(() => {
                result.current.setTransactions(initialTransactions);
            });

            await act(async () => {
                await result.current.transferTransactions([], 'NewProj');
            });

            expect(result.current.transactions[0].project).toBe('Proj1');
            expect(dbService.saveTransactions).not.toHaveBeenCalled();
        });

        it('should only transfer existing transactions', async () => {
            const initialTransactions = [{ id: '1', name: 'T1', project: 'Proj1', amount: 10 }];
            const { result } = renderHook(() => useTransactions(setNotification, t));

            act(() => {
                result.current.setTransactions(initialTransactions);
            });

            await act(async () => {
                await result.current.transferTransactions(['1', 'non-existent'], 'NewProj');
            });

            expect(result.current.transactions[0].project).toBe('NewProj');
            // Notification count should reflect requested count (as per current implementation)
            expect(t).toHaveBeenCalledWith('transferSuccess', expect.objectContaining({ count: 2 }));
        });
    });
});
