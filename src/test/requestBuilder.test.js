import { describe, it, expect } from 'vitest';
import { normalizeType, buildTransactionPayload } from '../services/requestBuilder';

describe('requestBuilder', () => {
    describe('normalizeType', () => {
        it('should normalize type by removing special characters and uppercasing', () => {
            expect(normalizeType('Food & Drinks')).toBe('FOODDRINKS');
            expect(normalizeType('Transport-123')).toBe('TRANSPORT123');
            expect(normalizeType('  Spaces  ')).toBe('SPACES');
        });

        it('should handle unicode characters', () => {
            expect(normalizeType('Jedzenie i Picie')).toBe('JEDZENIEIPICIE');
            expect(normalizeType('Kawiarnia ☕')).toBe('KAWIARNIA');
        });

        it('should return empty string for null or undefined', () => {
            expect(normalizeType(null)).toBe('');
            expect(normalizeType(undefined)).toBe('');
        });
    });

    describe('buildTransactionPayload', () => {
        it('should normalize types in transaction payload and remove id', () => {
            const transactions = [
                { id: '1', name: 'Lunch', amount: 20, type: 'Food & Drinks' },
                { id: '2', name: 'Bus', amount: 5, type: 'Transport' }
            ];
            const payload = buildTransactionPayload(transactions);
            expect(payload).toEqual([
                { name: 'Lunch', amount: 20, type: 'FOODDRINKS' },
                { name: 'Bus', amount: 5, type: 'TRANSPORT' }
            ]);
        });
    });
});
