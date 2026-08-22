import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import SettingsPanel from '../components/SettingsPanel';
import { LanguageProvider } from '../i18n/LanguageContext';

const renderWithLanguage = (ui) => {
    return render(
        <LanguageProvider>
            {ui}
        </LanguageProvider>
    );
};

describe('SettingsPanel', () => {
    it('renders nothing when closed', () => {
        const { container } = renderWithLanguage(
            <SettingsPanel isOpen={false} settings={{ rememberLastEntry: false }} onToggle={vi.fn()} onClose={vi.fn()} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('shows "remember last entry" as the first option, unchecked by default', () => {
        renderWithLanguage(
            <SettingsPanel isOpen={true} settings={{ rememberLastEntry: false }} onToggle={vi.fn()} onClose={vi.fn()} />
        );

        expect(screen.getByText('Zapamiętaj poprzedni wpis')).toBeInTheDocument();
        expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('reflects an enabled setting as checked', () => {
        renderWithLanguage(
            <SettingsPanel isOpen={true} settings={{ rememberLastEntry: true }} onToggle={vi.fn()} onClose={vi.fn()} />
        );

        expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('calls onToggle with the setting key and new value on click', () => {
        const onToggle = vi.fn();
        renderWithLanguage(
            <SettingsPanel isOpen={true} settings={{ rememberLastEntry: false }} onToggle={onToggle} onClose={vi.fn()} />
        );

        fireEvent.click(screen.getByRole('checkbox'));

        expect(onToggle).toHaveBeenCalledWith('rememberLastEntry', true);
    });

    it('calls onClose when the close button is clicked', () => {
        const onClose = vi.fn();
        renderWithLanguage(
            <SettingsPanel isOpen={true} settings={{ rememberLastEntry: false }} onToggle={vi.fn()} onClose={onClose} />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Zamknij' }));

        expect(onClose).toHaveBeenCalled();
    });
});
