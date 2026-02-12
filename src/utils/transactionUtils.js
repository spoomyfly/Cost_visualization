import { parseDisplayDate, isDateInRange } from './dateUtils';

/**
 * Utility functions for transaction data manipulation
 */

/**
 * Filters transactions based on search query, date range, and project
 */
export const filterTransactions = (transactions, { searchQuery, startDate, endDate, project }) => {
    let result = transactions;

    // Project Filter
    if (project && project !== 'All') {
        result = result.filter(t => t.project === project);
    }

    // Date Filter
    if (startDate || endDate) {
        result = result.filter(t => isDateInRange(t.date, startDate, endDate));
    }

    // Search Filter
    if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        result = result.filter(t =>
            (t.name && t.name.toLowerCase().includes(lowerQuery)) ||
            (t.type && t.type.toLowerCase().includes(lowerQuery)) ||
            (t.project && t.project.toLowerCase().includes(lowerQuery))
        );
    }

    return result;
};

/**
 * Sorts transactions based on key and direction
 */
export const sortTransactions = (transactions, { key, direction }) => {
    const sortable = [...transactions];

    sortable.sort((a, b) => {
        if (key === 'amount') {
            const valA = parseFloat(a.amount) || 0;
            const valB = parseFloat(b.amount) || 0;
            return direction === 'asc' ? valA - valB : valB - valA;
        }

        if (key === 'date') {
            const valA = parseDisplayDate(a.date)?.getTime() || 0;
            const valB = parseDisplayDate(b.date)?.getTime() || 0;
            return direction === 'asc' ? valA - valB : valB - valA;
        }

        if (key === 'type' || key === 'name' || key === 'project') {
            const valA = (a[key] || '').toLowerCase();
            const valB = (b[key] || '').toLowerCase();
            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        }

        return 0;
    });

    return sortable;
};

/**
 * Calculates total sum of transactions
 */
export const calculateTotalSum = (transactions) => {
    return transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
};

/**
 * Extracts unique values for a specific field
 */
export const getUniqueValues = (transactions, field) => {
    const values = transactions.map(t => t[field]).filter(Boolean);
    return [...new Set(values)].sort();
};
