import { render, screen, fireEvent } from '@testing-library/react';
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
        // Shown twice: once as the pie chart title, once as the new bar chart title
        expect(screen.getAllByText(/Wydatki według typu/i).length).toBe(2);
        expect(screen.getAllByText(/Food/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Transport/i).length).toBeGreaterThan(0);
    });

    it('uses the same color for a given type in both the pie chart and the bar chart', () => {
        const { container } = renderWithLanguage(<Dashboard transactions={mockTransactions} />);

        const pieSlice = Array.from(container.querySelectorAll('.pie-slice')).find(
            (el) => el.querySelector('title')?.textContent.includes('Food')
        );
        const barRect = Array.from(container.querySelectorAll('rect')).find(
            (el) => el.querySelector('title')?.textContent.includes('Food')
        );

        expect(pieSlice).toBeTruthy();
        expect(barRect).toBeTruthy();
        expect(pieSlice.getAttribute('fill')).toBe(barRect.getAttribute('fill'));
    });

    it('renders top expenses list', () => {
        renderWithLanguage(<Dashboard transactions={mockTransactions} />);
        expect(screen.getByText(/Największe wydatki/i)).toBeInTheDocument();
        expect(screen.getByText(/Lunch/i)).toBeInTheDocument();
    });

    describe('bar chart by type', () => {
        const multiProjectTransactions = [
            { id: 1, date: '01.01.24', name: 'Coffee', amount: 15, type: 'Food', project: 'Alpha' },
            { id: 2, date: '02.01.24', name: 'Snacks', amount: 25, type: 'Food', project: 'Beta' },
            { id: 3, date: '03.01.24', name: 'Bus', amount: 4, type: 'Transport', project: 'Alpha' },
        ];

        it('keeps grouping by type even in the "All Projects" view, where the pie chart switches to grouping by project', () => {
            renderWithLanguage(<Dashboard transactions={multiProjectTransactions} selectedProject="All" />);

            // Pie chart switches to grouping by project in the "All Projects" view
            expect(screen.getByText(/Wydatki według projektu/i)).toBeInTheDocument();
            expect(screen.getAllByText(/Alpha/i).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/Beta/i).length).toBeGreaterThan(0);

            // The new bar chart still breaks down by type, merging both projects' "Food" spend
            expect(screen.getByText(/Wydatki według typu/i)).toBeInTheDocument();
        });

        it('merges same-type spend across projects into a single bar', () => {
            const { container } = renderWithLanguage(
                <Dashboard transactions={multiProjectTransactions} selectedProject="All" />
            );

            // Food (Alpha) + Food (Beta) = one "Food" bar, plus one "Transport" bar = 2 bars total
            const barChartTitles = Array.from(container.querySelectorAll('rect title')).map(t => t.textContent);
            expect(barChartTitles.length).toBe(2);
            expect(barChartTitles.some(t => t.includes('Food') && t.includes('40'))).toBe(true);
        });

        it('opens the transaction list modal with all items for a type when a bar is clicked', () => {
            const { container } = renderWithLanguage(
                <Dashboard transactions={multiProjectTransactions} selectedProject="All" />
            );

            const barGroups = container.querySelectorAll('g');
            fireEvent.click(barGroups[0]);

            // The clicked bar's modal should list its underlying transactions
            const modal = container.querySelector('.modal-card');
            expect(modal).not.toBeNull();
            expect(modal.textContent).toContain('Coffee');
        });
    });
});
