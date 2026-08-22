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
        expect(screen.getByText(/Projekt/i)).toBeInTheDocument();
    });

    it('should call onSave when form is submitted with valid data', () => {
        const { container } = renderWithLanguage(<TransactionForm onSave={mockOnSave} />);

        const nameInput = container.querySelector('#name');
        const amountInput = container.querySelector('#amount');
        const typeInput = container.querySelector('#type');
        const projectInput = container.querySelector('#project');

        fireEvent.change(nameInput, { target: { value: 'Coffee' } });
        fireEvent.change(amountInput, { target: { value: '15' } });
        fireEvent.change(typeInput, { target: { value: 'Food' } });
        fireEvent.change(projectInput, { target: { value: 'MyProject' } });

        fireEvent.submit(container.querySelector('form'));

        expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Coffee',
            amount: 15,
            type: 'Food',
            project: 'MyProject'
        }));
    });

    it('should not call onSave if fields are empty', () => {
        const { container } = renderWithLanguage(<TransactionForm onSave={mockOnSave} />);
    });
});

describe('TransactionForm "remember last entry" memory', () => {
    const mockOnSave = vi.fn();
    const MEMORY_KEY = 'lastTransactionMemory';
    const today = () => new Date().toISOString().split('T')[0];

    const fillAndSubmit = (container, { project, date }) => {
        fireEvent.change(container.querySelector('#project'), { target: { value: project } });
        fireEvent.change(container.querySelector('#date'), { target: { value: date } });
        fireEvent.change(container.querySelector('#name'), { target: { value: 'Hotel' } });
        fireEvent.change(container.querySelector('#amount'), { target: { value: '100' } });
        fireEvent.change(container.querySelector('#type'), { target: { value: 'Travel' } });
        fireEvent.submit(container.querySelector('form'));
    };

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('resets to the default project and today when the setting is disabled', () => {
        const { container } = renderWithLanguage(
            <TransactionForm onSave={mockOnSave} rememberLastEntry={false} defaultProject="Budget" />
        );

        fillAndSubmit(container, { project: 'Vacation', date: '2020-01-15' });

        expect(container.querySelector('#project').value).toBe('Budget');
        expect(container.querySelector('#date').value).toBe(today());
    });

    it('carries over the just-entered project and date when the setting is enabled', () => {
        const { container } = renderWithLanguage(
            <TransactionForm onSave={mockOnSave} rememberLastEntry={true} defaultProject="Budget" />
        );

        fillAndSubmit(container, { project: 'Vacation', date: '2020-01-15' });

        expect(container.querySelector('#project').value).toBe('Vacation');
        expect(container.querySelector('#date').value).toBe('2020-01-15');
        // name/amount/type always reset regardless of the memory setting
        expect(container.querySelector('#name').value).toBe('');
        expect(container.querySelector('#amount').value).toBe('');
        expect(container.querySelector('#type').value).toBe('');
    });

    it('prefills a freshly mounted form from remembered data within the 2 minute window', () => {
        localStorage.setItem(MEMORY_KEY, JSON.stringify({
            project: 'Vacation',
            date: '2020-01-15',
            timestamp: Date.now()
        }));

        const { container } = renderWithLanguage(
            <TransactionForm onSave={mockOnSave} rememberLastEntry={true} defaultProject="Budget" />
        );

        expect(container.querySelector('#project').value).toBe('Vacation');
        expect(container.querySelector('#date').value).toBe('2020-01-15');
    });

    it('ignores remembered data older than 2 minutes', () => {
        localStorage.setItem(MEMORY_KEY, JSON.stringify({
            project: 'Vacation',
            date: '2020-01-15',
            timestamp: Date.now() - 3 * 60 * 1000
        }));

        const { container } = renderWithLanguage(
            <TransactionForm onSave={mockOnSave} rememberLastEntry={true} defaultProject="Budget" />
        );

        expect(container.querySelector('#project').value).toBe('Budget');
        expect(container.querySelector('#date').value).toBe(today());
    });

    it('ignores remembered data when the setting is disabled', () => {
        localStorage.setItem(MEMORY_KEY, JSON.stringify({
            project: 'Vacation',
            date: '2020-01-15',
            timestamp: Date.now()
        }));

        const { container } = renderWithLanguage(
            <TransactionForm onSave={mockOnSave} rememberLastEntry={false} defaultProject="Budget" />
        );

        expect(container.querySelector('#project').value).toBe('Budget');
        expect(container.querySelector('#date').value).toBe(today());
    });

    it('does not write memory when editing an existing transaction', () => {
        const editingTransaction = { id: '1', date: '10.01.24', name: 'Old', amount: 5, type: 'Misc', project: 'Old Project' };
        const { container } = renderWithLanguage(
            <TransactionForm
                onSave={mockOnSave}
                editingTransaction={editingTransaction}
                onCancelEdit={() => {}}
                rememberLastEntry={true}
                defaultProject="Budget"
            />
        );

        fireEvent.submit(container.querySelector('form'));

        expect(localStorage.getItem(MEMORY_KEY)).toBeNull();
    });
});
