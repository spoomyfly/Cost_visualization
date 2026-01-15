export const normalizeType = (type) => {
    if (!type) return '';
    // Remove special signs (keep only letters and numbers from any language) and uppercase
    // \p{L} matches any unicode letter, \p{N} matches any unicode number
    const normalized = type
        .replace(/[^\p{L}\p{N}\s]/gu, '') // Remove special characters except letters, numbers and spaces
        .replace(/\s+/g, '')             // Remove all spaces
        .toUpperCase();

    return normalized || 'OTHER'; // Fallback to 'OTHER' if normalization results in empty string
};

export const buildTransactionPayload = (transactions) => {
    return transactions.map(({ id, ...t }) => ({
        ...t,
        type: normalizeType(t.type)
    }));
};
