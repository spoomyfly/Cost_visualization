export const normalizeType = (type) => {
    if (!type) return '';
    // Remove special signs (keep only letters and numbers) and uppercase
    // Using regex to match only alphanumeric characters from any language
    // \p{L} matches any unicode letter, \p{N} matches any unicode number
    return type
        .replace(/[^\p{L}\p{N}]/gu, '')
        .toUpperCase();
};

export const buildTransactionPayload = (transactions) => {
    return transactions.map(({ id, ...t }) => ({
        ...t,
        type: normalizeType(t.type)
    }));
};
