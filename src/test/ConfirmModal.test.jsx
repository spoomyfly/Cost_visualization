import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConfirmModal from '../components/ConfirmModal';

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
        render(<ConfirmModal {...getProps()} />);

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Message')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(<ConfirmModal {...getProps({ isOpen: false })} />);

        expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    });

    it('calls onConfirm when confirm button is clicked', () => {
        render(<ConfirmModal {...getProps()} />);

        fireEvent.click(screen.getByText('Delete'));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(<ConfirmModal {...getProps()} />);

        fireEvent.click(screen.getByText('Cancel'));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when backdrop is clicked', () => {
        const { container } = render(<ConfirmModal {...getProps()} />);

        const backdrop = container.querySelector('.modal-backdrop');
        fireEvent.click(backdrop);
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onCancel when modal card is clicked', () => {
        const { container } = render(<ConfirmModal {...getProps()} />);

        const card = container.querySelector('.modal-card');
        fireEvent.click(card);
        expect(onCancel).not.toHaveBeenCalled();
    });
});
