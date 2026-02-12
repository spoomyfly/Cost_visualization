/**
 * Utility functions for date handling in DD.MM.YY and YYYY-MM-DD formats
 */

/**
 * Formats a Date object or ISO string to DD.MM.YY
 */
export const formatToDisplayDate = (dateIn) => {
    if (!dateIn) return '';
    const date = new Date(dateIn);
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
};

/**
 * Formats a Date object or ISO string to YYYY-MM-DD
 */
export const formatToInputDate = (dateIn) => {
    if (!dateIn) return new Date().toISOString().split('T')[0];
    const date = new Date(dateIn);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};

/**
 * Parses a DD.MM.YY string into a Date object
 */
export const parseDisplayDate = (displayDate) => {
    if (!displayDate) return null;
    const parts = displayDate.split('.');
    if (parts.length !== 3) return null;

    const [day, month, year] = parts.map(Number);
    // Assuming 2000s for YY
    return new Date(2000 + year, month - 1, day);
};

/**
 * Parses a YYYY-MM-DD string into a Date object
 */
export const parseInputDate = (inputDate) => {
    if (!inputDate) return null;
    return new Date(inputDate);
};

/**
 * Converts DD.MM.YY to YYYY-MM-DD
 */
export const displayToInputDate = (displayDate) => {
    const date = parseDisplayDate(displayDate);
    return date ? date.toISOString().split('T')[0] : '';
};

/**
 * Converts YYYY-MM-DD to DD.MM.YY
 */
export const inputToDisplayDate = (inputDate) => {
    return formatToDisplayDate(inputDate);
};

/**
 * Checks if a transaction date (DD.MM.YY) is within an input range (YYYY-MM-DD)
 */
export const isDateInRange = (displayDate, startDateInput, endDateInput) => {
    if (!displayDate) return false;
    const tDate = parseDisplayDate(displayDate);
    if (!tDate) return false;
    const tTime = tDate.getTime();

    if (startDateInput) {
        const start = new Date(startDateInput).getTime();
        if (tTime < start) return false;
    }

    if (endDateInput) {
        const end = new Date(endDateInput).getTime();
        if (tTime > end) return false;
    }

    return true;
};
