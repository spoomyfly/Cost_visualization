import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import Dashboard from '../components/Dashboard';
import { LanguageProvider } from '../i18n/LanguageContext';

const renderWithLanguage = (ui) => {
    return render(
        <LanguageProvider>
            {ui}
        </LanguageProvider>
    );
};

describe('Dashboard Component', () => {
    const mockTransactions = [
        { id: 1, date: '01.01.24', name: 'Coffee', amount: 15, type: 'Food' },
        { id: 2, date: '02.01.24', name: 'Lunch', amount: 35, type: 'Food' },
        { id: 3, date: '03.01.24', name: 'Bus', amount: 4, type: 'Transport' },
    ];

    it('renders empty state when no transactions', () => {
        renderWithLanguage(<Dashboard transactions={[]} />);
        expect(screen.getByText(/Brak danych/i)).toBeInTheDocument();
    });

    it('renders summary statistics correctly', () => {
        renderWithLanguage(<Dashboard transactions={mockTransactions} />);
        expect(screen.getByText(/Całkowite wydatki/i)).toBeInTheDocument();
        expect(screen.getByText('54 PLN')).toBeInTheDocument();
    });

    it('renders distribution by type', () => {
        renderWithLanguage(<Dashboard transactions={mockTransactions} />);
        expect(screen.getByText(/Wydatki według typu/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Food/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Transport/i).length).toBeGreaterThan(0);
    });

    it('renders top expenses list', () => {
        renderWithLanguage(<Dashboard transactions={mockTransactions} />);
        expect(screen.getByText(/Największe wydatki/i)).toBeInTheDocument();
        expect(screen.getByText(/Lunch/i)).toBeInTheDocument();
    });
});
