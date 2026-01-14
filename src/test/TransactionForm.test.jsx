/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import TransactionForm from '../components/TransactionForm';

// Mock services
vi.mock('../services/dbService', () => ({
    saveTransactions: vi.fn()
}));

describe('TransactionForm', () => {
    const mockOnSave = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the form with initial fields', () => {
        render(<TransactionForm onSave={mockOnSave} />);
        expect(screen.getByPlaceholderText(/e.g., Лампочка/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/0.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Add Transaction/i)).toBeInTheDocument();
    });

    it('should call onSave when form is submitted with valid data', () => {
        render(<TransactionForm onSave={mockOnSave} />);

        fireEvent.change(screen.getByPlaceholderText(/e.g., Лампочка/i), { target: { value: 'Coffee' } });
        fireEvent.change(screen.getByPlaceholderText(/0.00/i), { target: { value: '15' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g., Общее/i), { target: { value: 'Food' } });

        fireEvent.click(screen.getByText(/Add Transaction/i));

        expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Coffee',
            amount: 15,
            type: 'Food'
        }));
    });

    it('should not call onSave if fields are empty', () => {
        render(<TransactionForm onSave={mockOnSave} />);
        fireEvent.click(screen.getByText(/Add Transaction/i));
        expect(mockOnSave).not.toHaveBeenCalled();
    });
});
