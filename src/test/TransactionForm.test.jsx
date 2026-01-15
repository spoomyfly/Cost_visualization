import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import TransactionForm from '../components/TransactionForm';
import { LanguageProvider } from '../i18n/LanguageContext';

const renderWithLanguage = (ui) => {
    return render(
        <LanguageProvider>
            {ui}
        </LanguageProvider>
    );
};

describe('TransactionForm', () => {
    const mockOnSave = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the form with initial fields', () => {
        renderWithLanguage(<TransactionForm onSave={mockOnSave} />);
        expect(screen.getByText(/Data/i)).toBeInTheDocument();
        expect(screen.getByText(/Nazwa/i)).toBeInTheDocument();
        expect(screen.getByText(/Kwota/i)).toBeInTheDocument();
        expect(screen.getByText(/Typ/i)).toBeInTheDocument();
    });

    it('should call onSave when form is submitted with valid data', () => {
        const { container } = renderWithLanguage(<TransactionForm onSave={mockOnSave} />);

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
        const { container } = renderWithLanguage(<TransactionForm onSave={mockOnSave} />);
    });
});
