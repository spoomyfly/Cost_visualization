import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import ConfirmModal from '../components/ConfirmModal';
import { LanguageProvider } from '../i18n/LanguageContext';

const renderWithLanguage = (ui) => {
    return render(
        <LanguageProvider>
            {ui}
        </LanguageProvider>
    );
};

describe('ConfirmModal Component', () => {
    let onConfirm;
    let onCancel;

    beforeEach(() => {
        onConfirm = vi.fn();
        onCancel = vi.fn();
    });

    const getProps = (overrides = {}) => ({
        isOpen: true,
        title: 'Test Title',
        message: 'Test Message',
        onConfirm,
        onCancel,
        ...overrides,
    });

    it('renders correctly when open', () => {
        renderWithLanguage(<ConfirmModal {...getProps()} />);

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Message')).toBeInTheDocument();
        expect(screen.getByText('Potwierdź')).toBeInTheDocument();
        expect(screen.getByText('Anuluj')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        renderWithLanguage(<ConfirmModal {...getProps({ isOpen: false })} />);

        expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    });

    it('calls onConfirm when confirm button is clicked', () => {
        renderWithLanguage(<ConfirmModal {...getProps()} />);

        fireEvent.click(screen.getByText('Potwierdź'));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button is clicked', () => {
        renderWithLanguage(<ConfirmModal {...getProps()} />);

        fireEvent.click(screen.getByText('Anuluj'));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when backdrop is clicked', () => {
        const { container } = renderWithLanguage(<ConfirmModal {...getProps()} />);

        const backdrop = container.querySelector('.modal-backdrop');
        fireEvent.click(backdrop);
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onCancel when modal card is clicked', () => {
        const { container } = renderWithLanguage(<ConfirmModal {...getProps()} />);

        const card = container.querySelector('.modal-card');
        fireEvent.click(card);
        expect(onCancel).not.toHaveBeenCalled();
    });
});
