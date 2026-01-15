import { describe, it, expect, vi } from 'vitest';
import { validateAndMap } from '../services/dataRetrievalService';

describe('dataRetrievalService', () => {
    describe('validateAndMap', () => {
        it('should return error if data is not an array', () => {
            const { validTransactions, errors } = validateAndMap({});
            expect(errors[0].message).toBe("Retrieved data is not an array.");
            expect(validTransactions).toHaveLength(0);
        });

        it('should validate required fields', () => {
            const data = [
                { name: 'Test' } // Missing date, amount
            ];
            const { validTransactions, errors } = validateAndMap(data);
            expect(errors).toHaveLength(1);
            expect(errors[0].messages).toContain("Missing date");
            expect(errors[0].messages).toContain("Missing amount");
        });

        it('should default empty type to OTHER', () => {
            const data = [
                { date: '2023-01-01', name: 'Test', amount: 10, type: '' }
            ];
            const { validTransactions, errors } = validateAndMap(data);
            expect(errors).toHaveLength(0);
            expect(validTransactions[0].type).toBe('OTHER');
        });

        it('should validate amount is a number', () => {
            const data = [
                { date: '2023-01-01', name: 'Test', amount: 'abc', type: 'Food' }
            ];
            const { validTransactions, errors } = validateAndMap(data);
            expect(errors).toHaveLength(1);
            expect(errors[0].messages).toContain("Amount is not a number");
        });

        it('should map valid transactions and generate ID if missing', () => {
            const data = [
                { date: '2023-01-01', name: 'Test', amount: '10.5', type: 'Food' }
            ];
            const { validTransactions, errors } = validateAndMap(data);
            expect(errors).toHaveLength(0);
            expect(validTransactions).toHaveLength(1);
            expect(validTransactions[0].amount).toBe(10.5);
            expect(validTransactions[0].id).toBeDefined();
        });

        it('should keep existing ID if provided', () => {
            const data = [
                { id: 'existing-id', date: '2023-01-01', name: 'Test', amount: 10, type: 'Food' }
            ];
            const { validTransactions } = validateAndMap(data);
            expect(validTransactions[0].id).toBe('existing-id');
        });
    });
});
