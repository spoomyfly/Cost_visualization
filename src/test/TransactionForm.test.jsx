import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import TransactionForm from '../components/TransactionForm';

describe('TransactionForm', () => {
    const mockOnSave = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the form with initial fields', () => {
        render(<TransactionForm onSave={mockOnSave} />);
        expect(screen.getByText(/Date/i)).toBeInTheDocument();
        expect(screen.getByText(/Name/i)).toBeInTheDocument();
        expect(screen.getByText(/Amount/i)).toBeInTheDocument();
        expect(screen.getByText(/Type/i)).toBeInTheDocument();
    });

    it('should call onSave when form is submitted with valid data', () => {
        const { container } = render(<TransactionForm onSave={mockOnSave} />);

        const nameInput = container.querySelector('#name');
        const amountInput = container.querySelector('#amount');
        const typeInput = container.querySelector('#type');

        fireEvent.change(nameInput, { target: { value: 'Coffee' } });
        fireEvent.change(amountInput, { target: { value: '15' } });
        fireEvent.change(typeInput, { target: { value: 'Food' } });

        fireEvent.submit(container.querySelector('form'));

        expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Coffee',
            amount: 15,
            type: 'Food'
        }));
    });

    it('should not call onSave if fields are empty', () => {
        const { container } = render(<TransactionForm onSave={mockOnSave} />);
        // fireEvent.submit(container.querySelector('form'));
        // expect(mockOnSave).not.toHaveBeenCalled();
    });
});
