import { describe, it, expect } from 'vitest';
import {
    formatToDisplayDate,
    parseDisplayDate,
    isDateInRange
} from '../utils/dateUtils';
import {
    filterTransactions,
    sortTransactions,
    calculateTotalSum,
    getUniqueValues
} from '../utils/transactionUtils';

describe('dateUtils', () => {
    it('formats Date to display string', () => {
        const date = new Date(2024, 0, 15); // Jan 15 2024
        expect(formatToDisplayDate(date)).toBe('15.01.24');
    });

    it('parses display string to Date', () => {
        const date = parseDisplayDate('15.01.24');
        expect(date.getFullYear()).toBe(2024);
        expect(date.getMonth()).toBe(0);
        expect(date.getDate()).toBe(15);
    });

    it('checks date in range correctly', () => {
        const tDate = '15.01.24';
        expect(isDateInRange(tDate, '2024-01-01', '2024-01-31')).toBe(true);
        expect(isDateInRange(tDate, '2024-01-20', '2024-01-31')).toBe(false);
        expect(isDateInRange(tDate, '2023-01-01', '2023-12-31')).toBe(false);
    });
});

describe('transactionUtils', () => {
    const mockTransactions = [
        { id: '1', date: '01.01.24', name: 'Apple', amount: 10, type: 'Food', project: 'Budget' },
        { id: '2', date: '15.01.24', name: 'Rent', amount: 1000, type: 'Housing', project: 'Work' },
        { id: '3', date: '20.01.24', name: 'Banana', amount: 5, type: 'Food', project: 'Budget' },
    ];

    it('filters by project', () => {
        const filtered = filterTransactions(mockTransactions, { project: 'Work' });
        expect(filtered).toHaveLength(1);
        expect(filtered[0].name).toBe('Rent');
    });

    it('filters by search query', () => {
        const filtered = filterTransactions(mockTransactions, { searchQuery: 'ana' });
        expect(filtered).toHaveLength(1);
        expect(filtered[0].name).toBe('Banana');
    });

    it('sorts by amount asc', () => {
        const sorted = sortTransactions(mockTransactions, { key: 'amount', direction: 'asc' });
        expect(sorted[0].amount).toBe(5);
        expect(sorted[2].amount).toBe(1000);
    });

    it('calculates total sum', () => {
        expect(calculateTotalSum(mockTransactions)).toBe(1015);
    });

    it('gets unique values', () => {
        const types = getUniqueValues(mockTransactions, 'type');
        expect(types).toEqual(['Food', 'Housing']);
    });
});
