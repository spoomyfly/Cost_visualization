/**
 * Shared color palette for chart categories (pie slices, bars, legend dots).
 */
export const CHART_COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

/**
 * Deterministically hashes a string to a non-negative integer.
 */
const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
};

/**
 * Returns a stable color for a given category name, so the same name (e.g. a
 * transaction Type or Project) always gets the same color across different
 * charts - regardless of each chart's own sort order or grouping.
 */
export const getColorForName = (name) => {
    return CHART_COLORS[hashString(name || '') % CHART_COLORS.length];
};
