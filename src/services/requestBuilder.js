export const normalizeType = (type) => {
    if (!type) return '';
    // Remove special signs (keep only letters and numbers) and uppercase
    // Using regex to match only alphanumeric characters from any language
    // \p{L} matches any unicode letter, \p{N} matches any unicode number
    return type
        .replace(/[^\w\s]/gi, '') // Remove special characters except alphanumeric and spaces
        .replace(/\s+/g, '')      // Remove all spaces
        .toUpperCase();
};

export const buildTransactionPayload = (transactions) => {
    return transactions.map(({ id, ...t }) => ({
        ...t,
        type: normalizeType(t.type)
    }));
};
