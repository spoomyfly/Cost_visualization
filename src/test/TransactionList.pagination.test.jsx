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

// The current page is shown as a plain number (a "Przejdź do strony" labeled
// button) until clicked, at which point it turns into the same-labeled input.
const expectPage = (current, total) => {
    expect(screen.getByTitle('Przejdź do strony')).toHaveTextContent(String(current));
    expect(screen.getByText(`/ ${total}`)).toBeInTheDocument();
};

const openPageInput = () => {
    fireEvent.click(screen.getByTitle('Przejdź do strony'));
    return screen.getByLabelText('Przejdź do strony');
};

describe('TransactionList pagination', () => {
    const noop = () => {};

    it('shows only the first page of items by default', () => {
        renderWithLanguage(
            <TransactionList transactions={makeTransactions(25)} onEdit={noop} onDelete={noop} onTransfer={noop} />
        );

        expectPage(1, 3);
        expect(screen.getAllByRole('listitem')).toHaveLength(10);
    });

    it('navigates to the next and previous page', () => {
        renderWithLanguage(
            <TransactionList transactions={makeTransactions(25)} onEdit={noop} onDelete={noop} onTransfer={noop} />
        );

        const nextButton = screen.getByRole('button', { name: /Następna/i });
        fireEvent.click(nextButton);
        expectPage(2, 3);

        fireEvent.click(nextButton);
        expectPage(3, 3);
        // Last page only has 5 remaining items
        expect(screen.getAllByRole('listitem')).toHaveLength(5);
        expect(nextButton).toBeDisabled();

        const prevButton = screen.getByRole('button', { name: /Poprzednia/i });
        fireEvent.click(prevButton);
        expectPage(2, 3);
    });

    it('hides the first-page button on the first page and the last-page button on the last page', () => {
        renderWithLanguage(
            <TransactionList transactions={makeTransactions(25)} onEdit={noop} onDelete={noop} onTransfer={noop} />
        );

        expect(screen.getByRole('button', { name: /Poprzednia/i })).toBeDisabled();
        expect(screen.queryByTitle('Pierwsza strona')).not.toBeInTheDocument();
        expect(screen.getByTitle('Ostatnia strona')).toBeInTheDocument();

        fireEvent.click(screen.getByTitle('Ostatnia strona'));
        expectPage(3, 3);

        expect(screen.getByRole('button', { name: /Następna/i })).toBeDisabled();
        expect(screen.queryByTitle('Ostatnia strona')).not.toBeInTheDocument();
        expect(screen.getByTitle('Pierwsza strona')).toBeInTheDocument();
    });

    it('jumps to the first and last page', () => {
        renderWithLanguage(
            <TransactionList transactions={makeTransactions(25)} onEdit={noop} onDelete={noop} onTransfer={noop} />
        );

        fireEvent.click(screen.getByTitle('Ostatnia strona'));
        expectPage(3, 3);

        fireEvent.click(screen.getByTitle('Pierwsza strona'));
        expectPage(1, 3);
    });

    it('lets you pick any page by clicking the current page number', () => {
        renderWithLanguage(
            <TransactionList transactions={makeTransactions(25)} onEdit={noop} onDelete={noop} onTransfer={noop} />
        );

        const pageInput = openPageInput();
        expect(pageInput).toHaveValue(1);

        fireEvent.change(pageInput, { target: { value: '2' } });
        fireEvent.blur(pageInput);

        expectPage(2, 3);
        expect(screen.getByText('Transaction 11')).toBeInTheDocument();
    });

    it('commits the page input on Enter', () => {
        renderWithLanguage(
            <TransactionList transactions={makeTransactions(25)} onEdit={noop} onDelete={noop} onTransfer={noop} />
        );

        const pageInput = openPageInput();
        fireEvent.change(pageInput, { target: { value: '3' } });
        fireEvent.keyDown(pageInput, { key: 'Enter' });

        expectPage(3, 3);
    });

    it('cancels editing on Escape without changing the page', () => {
        renderWithLanguage(
            <TransactionList transactions={makeTransactions(25)} onEdit={noop} onDelete={noop} onTransfer={noop} />
        );

        const pageInput = openPageInput();
        fireEvent.change(pageInput, { target: { value: '3' } });
        fireEvent.keyDown(pageInput, { key: 'Escape' });

        expectPage(1, 3);
    });

    it('clamps an out-of-range page number typed into the page input', () => {
        renderWithLanguage(
            <TransactionList transactions={makeTransactions(25)} onEdit={noop} onDelete={noop} onTransfer={noop} />
        );

        const pageInput = openPageInput();
        fireEvent.change(pageInput, { target: { value: '99' } });
        fireEvent.blur(pageInput);

        expectPage(3, 3);
    });

    it('changes page size and resets to the first page', () => {
        renderWithLanguage(
            <TransactionList transactions={makeTransactions(25)} onEdit={noop} onDelete={noop} onTransfer={noop} />
        );

        fireEvent.click(screen.getByRole('button', { name: /Następna/i }));
        expectPage(2, 3);

        const pageSizeSelect = screen.getByDisplayValue('10');
        fireEvent.change(pageSizeSelect, { target: { value: '25' } });

        expectPage(1, 1);
        expect(screen.getAllByRole('listitem')).toHaveLength(25);
    });

    it('resets to the first page when a filter is applied', () => {
        renderWithLanguage(
            <TransactionList transactions={makeTransactions(25)} onEdit={noop} onDelete={noop} onTransfer={noop} />
        );

        fireEvent.click(screen.getByRole('button', { name: /Następna/i }));
        expectPage(2, 3);

        const searchInput = screen.getByPlaceholderText('Szukaj...');
        // "Transaction 5" only matches a single item among ids 1-25 (no "50"-"59")
        fireEvent.change(searchInput, { target: { value: 'Transaction 5' } });

        expectPage(1, 1);
    });

    it('does not render pagination controls when there are no transactions', () => {
        renderWithLanguage(
            <TransactionList transactions={[]} onEdit={noop} onDelete={noop} onTransfer={noop} />
        );

        expect(screen.queryByTitle('Przejdź do strony')).not.toBeInTheDocument();
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
