import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import BarChart from '../components/BarChart';
import { LanguageProvider } from '../i18n/LanguageContext';

const renderWithLanguage = (ui) => {
    return render(
        <LanguageProvider>
            {ui}
        </LanguageProvider>
    );
};

const sampleData = [
    { name: 'Food', value: 100, count: 3, items: [{ id: '1' }, { id: '2' }, { id: '3' }] },
    { name: 'Transport', value: 50, count: 1, items: [{ id: '4' }] },
    { name: 'Bills', value: 200, count: 2, items: [{ id: '5' }, { id: '6' }] }
];

describe('BarChart', () => {
    it('shows a placeholder when there is no data', () => {
        renderWithLanguage(<BarChart data={[]} />);
        expect(screen.getByText(/Brak danych/i)).toBeInTheDocument();
    });

    it('shows a placeholder when data is not provided', () => {
        renderWithLanguage(<BarChart />);
        expect(screen.getByText(/Brak danych/i)).toBeInTheDocument();
    });

    it('renders one bar per data item', () => {
        const { container } = renderWithLanguage(<BarChart data={sampleData} />);
        expect(container.querySelectorAll('rect').length).toBe(sampleData.length);
    });

    it('scales bar height proportionally to value', () => {
        const { container } = renderWithLanguage(<BarChart data={sampleData} />);
        const rects = Array.from(container.querySelectorAll('rect'));
        const heightByIndex = rects.map(r => parseFloat(r.getAttribute('height')));

        const billsIndex = sampleData.findIndex(d => d.name === 'Bills'); // value 200, tallest
        const transportIndex = sampleData.findIndex(d => d.name === 'Transport'); // value 50, shortest

        expect(heightByIndex[billsIndex]).toBeGreaterThan(heightByIndex[transportIndex]);
    });

    it('calls onBarClick with the item name and its transactions when a bar is clicked', () => {
        const onBarClick = vi.fn();
        const { container } = renderWithLanguage(<BarChart data={sampleData} onBarClick={onBarClick} />);

        const groups = container.querySelectorAll('g');
        fireEvent.click(groups[0]);

        expect(onBarClick).toHaveBeenCalledWith(sampleData[0].name, sampleData[0].items);
    });

    it('does not throw when a bar is clicked without an onBarClick handler', () => {
        const { container } = renderWithLanguage(<BarChart data={sampleData} />);
        const groups = container.querySelectorAll('g');

        expect(() => fireEvent.click(groups[0])).not.toThrow();
    });

    it('includes the amount and item count in the bar tooltip', () => {
        const { container } = renderWithLanguage(<BarChart data={sampleData} />);
        const titles = Array.from(container.querySelectorAll('rect title')).map(t => t.textContent);

        expect(titles.some(t => t.includes('Food') && t.includes('100'))).toBe(true);
    });
});
