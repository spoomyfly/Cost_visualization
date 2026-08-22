import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import TransactionList from '../components/TransactionList';
import { LanguageProvider } from '../i18n/LanguageContext';

const renderWithLanguage = (ui) => {
    return render(
        <LanguageProvider>
            {ui}
        </LanguageProvider>
    );
};

// Dates are assigned so the default sort (date, newest first) yields ids in
// ascending order: id "1" has the most recent date and lands first on page 1.
const makeTransactions = (count) =>
    Array.from({ length: count }, (_, i) => ({
        id: String(i + 1),
        date: `${String(count - i).padStart(2, '0')}.01.24`,
        name: `Transaction ${i + 1}`,
        amount: i + 1,
        type: 'General',
        project: 'Budget'
    }));

describe('TransactionList pagination', () => {
    const noop = () => {};

    it('shows only the first page of items by default', () => {
        renderWithLanguage(
            <TransactionList transactions={makeTransactions(25)} onEdit={noop} onDelete={noop} onTransfer={noop} />
        );

        expect(screen.getByText('Strona 1 / 3')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(10);
    });

    it('navigates to the next and previous page', () => {
        renderWithLanguage(
            <TransactionList transactions={makeTransactions(25)} onEdit={noop} onDelete={noop} onTransfer={noop} />
        );

        const nextButton = screen.getByRole('button', { name: /Następna/i });
        fireEvent.click(nextButton);
        expect(screen.getByText('Strona 2 / 3')).toBeInTheDocument();

        fireEvent.click(nextButton);
        expect(screen.getByText('Strona 3 / 3')).toBeInTheDocument();
        // Last page only has 5 remaining items
        expect(screen.getAllByRole('listitem')).toHaveLength(5);
        expect(nextButton).toBeDisabled();

        const prevButton = screen.getByRole('button', { name: /Poprzednia/i });
        fireEvent.click(prevButton);
        expect(screen.getByText('Strona 2 / 3')).toBeInTheDocument();
    });

    it('disables the previous button on the first page', () => {
        renderWithLanguage(
            <TransactionList transactions={makeTransactions(25)} onEdit={noop} onDelete={noop} onTransfer={noop} />
        );

        expect(screen.getByRole('button', { name: /Poprzednia/i })).toBeDisabled();
    });

    it('changes page size and resets to the first page', () => {
        renderWithLanguage(
            <TransactionList transactions={makeTransactions(25)} onEdit={noop} onDelete={noop} onTransfer={noop} />
        );

        fireEvent.click(screen.getByRole('button', { name: /Następna/i }));
        expect(screen.getByText('Strona 2 / 3')).toBeInTheDocument();

        const pageSizeSelect = screen.getByDisplayValue('10');
        fireEvent.change(pageSizeSelect, { target: { value: '25' } });

        expect(screen.getByText('Strona 1 / 1')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(25);
    });

    it('resets to the first page when a filter is applied', () => {
        renderWithLanguage(
            <TransactionList transactions={makeTransactions(25)} onEdit={noop} onDelete={noop} onTransfer={noop} />
        );

        fireEvent.click(screen.getByRole('button', { name: /Następna/i }));
        expect(screen.getByText('Strona 2 / 3')).toBeInTheDocument();

        const searchInput = screen.getByPlaceholderText('Szukaj...');
        // "Transaction 5" only matches a single item among ids 1-25 (no "50"-"59")
        fireEvent.change(searchInput, { target: { value: 'Transaction 5' } });

        expect(screen.getByText('Strona 1 / 1')).toBeInTheDocument();
    });

    it('does not render pagination controls when there are no transactions', () => {
        renderWithLanguage(
            <TransactionList transactions={[]} onEdit={noop} onDelete={noop} onTransfer={noop} />
        );

        expect(screen.queryByText(/Strona/)).not.toBeInTheDocument();
    });

    it('calls onTransfer with the selected ids from the current page only', () => {
        const onTransfer = vi.fn();
        renderWithLanguage(
            <TransactionList transactions={makeTransactions(25)} onEdit={noop} onDelete={noop} onTransfer={onTransfer} />
        );

        const checkboxes = screen.getAllByRole('checkbox');
        // First checkbox in the header is "select all"; the rest belong to rows on page 1
        fireEvent.click(checkboxes[1]);
        fireEvent.click(screen.getByRole('button', { name: /Przenieś zaznaczone/i }));

        expect(onTransfer).toHaveBeenCalledWith(['1']);
    });
});
