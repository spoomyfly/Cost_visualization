import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useSettings } from '../hooks/useSettings';

describe('useSettings', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('defaults rememberLastEntry to false', () => {
        const { result } = renderHook(() => useSettings());
        expect(result.current.settings.rememberLastEntry).toBe(false);
    });

    it('updates a setting and persists it to localStorage', () => {
        const { result } = renderHook(() => useSettings());

        act(() => {
            result.current.updateSetting('rememberLastEntry', true);
        });

        expect(result.current.settings.rememberLastEntry).toBe(true);
        expect(JSON.parse(localStorage.getItem('appSettings')).rememberLastEntry).toBe(true);
    });

    it('loads persisted settings on init', () => {
        localStorage.setItem('appSettings', JSON.stringify({ rememberLastEntry: true }));

        const { result } = renderHook(() => useSettings());

        expect(result.current.settings.rememberLastEntry).toBe(true);
    });

    it('falls back to defaults when localStorage holds invalid JSON', () => {
        localStorage.setItem('appSettings', 'not-json');

        const { result } = renderHook(() => useSettings());

        expect(result.current.settings.rememberLastEntry).toBe(false);
    });
});
