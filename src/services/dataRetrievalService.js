export const validateAndMap = (data, defaultProject = 'Budget') => {
    const validTransactions = [];
    const errors = [];

    if (!Array.isArray(data)) {
        errors.push({ message: "Retrieved data is not an array." });
        return { validTransactions, errors };
    }

    data.forEach((item, index) => {
        const itemErrors = [];

        // Validate required fields
        if (!item.date) itemErrors.push("Missing date");
        if (!item.name) itemErrors.push("Missing name");
        if (item.amount === undefined || item.amount === null) itemErrors.push("Missing amount");
        // We allow empty type but ensure it's at least a string or default it
        const normalizedType = item.type || 'OTHER';

        // Validate data types (basic check)
        if (item.amount && isNaN(parseFloat(item.amount))) itemErrors.push("Amount is not a number");

        if (itemErrors.length > 0) {
            errors.push({
                index,
                item,
                messages: itemErrors
            });
        } else {
            // Map to application model (ensure ID exists)
            validTransactions.push({
                ...item,
                type: normalizedType,
                id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).substring(2, 15)),
                amount: parseFloat(item.amount), // Ensure number
                project: item.project || defaultProject
            });
        }
    });

    return { validTransactions, errors };
};
