export const validateAndMap = (data) => {
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
        if (!item.type) itemErrors.push("Missing type");

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
                id: item.id || crypto.randomUUID(),
                amount: parseFloat(item.amount) // Ensure number
            });
        }
    });

    return { validTransactions, errors };
};
