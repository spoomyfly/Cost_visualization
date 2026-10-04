import { describe, it, expect } from 'vitest';
import { getColorForName, CHART_COLORS } from '../utils/chartColors';

describe('getColorForName', () => {
    it('returns a color from the shared palette', () => {
        expect(CHART_COLORS).toContain(getColorForName('Food'));
    });

    it('is deterministic: the same name always gets the same color', () => {
        expect(getColorForName('Food')).toBe(getColorForName('Food'));
        expect(getColorForName('Transport')).toBe(getColorForName('Transport'));
    });

    it('gives different names different colors most of the time', () => {
        const names = ['Food', 'Transport', 'Bills', 'Entertainment', 'Health'];
        const colors = new Set(names.map(getColorForName));
        // With only 6 palette colors and 5 distinct names, expect at least some spread
        expect(colors.size).toBeGreaterThan(1);
    });

    it('does not throw for an empty or missing name', () => {
        expect(() => getColorForName('')).not.toThrow();
        expect(() => getColorForName(undefined)).not.toThrow();
        expect(CHART_COLORS).toContain(getColorForName(undefined));
    });
});
