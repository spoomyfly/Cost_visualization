import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Dashboard from '../components/Dashboard';

const mockTransactions = [
    { id: '1', date: '01.01.26', name: 'Item 1', amount: 100, type: 'FOOD' },
    { id: '2', date: '02.01.26', name: 'Item 2', amount: 200, type: 'RENT' },
    { id: '3', date: '03.01.26', name: 'Item 3', amount: 50, type: 'FOOD' },
];

describe('Dashboard Component', () => {
    it('renders summary statistics correctly', () => {
        render(<Dashboard transactions={mockTransactions} />);

        expect(screen.getByText('350 PLN')).toBeInTheDocument(); // Total
        expect(screen.getByText('117 PLN')).toBeInTheDocument(); // Average (350/3)
        expect(screen.getByText('3')).toBeInTheDocument(); // Count
    });

    it('renders distribution by type', () => {
        render(<Dashboard transactions={mockTransactions} />);

        expect(screen.getByText('FOOD')).toBeInTheDocument();
        expect(screen.getByText('RENT')).toBeInTheDocument();
        // Use getAllByText for amounts that might appear multiple times
        const foodAmount = screen.getAllByText('150 PLN');
        expect(foodAmount.length).toBeGreaterThan(0);
    });

    it('renders top expenses list', () => {
        render(<Dashboard transactions={mockTransactions} />);

        expect(screen.getByText('1. Item 2')).toBeInTheDocument();
        expect(screen.getByText('2. Item 1')).toBeInTheDocument();
        expect(screen.getByText('3. Item 3')).toBeInTheDocument();
    });

    it('renders charts', () => {
        const { container } = render(<Dashboard transactions={mockTransactions} />);

        // Check for SVG elements
        const svgs = container.querySelectorAll('svg');
        expect(svgs.length).toBeGreaterThanOrEqual(2); // Pie chart and Cumulative chart
    });

    it('handles empty transactions gracefully', () => {
        render(<Dashboard transactions={[]} />);

        expect(screen.getByText('No Data Available')).toBeInTheDocument();
        expect(screen.getByText('Add some transactions to see your spending visualizations!')).toBeInTheDocument();
    });
});
