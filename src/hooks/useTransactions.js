import { useState, useCallback } from 'react';
import { saveTransactions, fetchTransactions, fetchPublicTransactions } from '../services/dbService';
import { validateAndMap } from '../services/dataRetrievalService';
import { buildTransactionPayload } from '../services/requestBuilder';

/**
 * Hook for managing transactions state and API integration
 */
export const useTransactions = (setNotification, t) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [showPullButton, setShowPullButton] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchTransactions();
            if (data) {
                const { validTransactions, errors: validationErrors } = validateAndMap(data);
                setTransactions(validTransactions);
                setErrors(validationErrors);
                setShowPullButton(false);
            } else {
                setShowPullButton(true);
            }
        } catch (error) {
            console.error("Failed to load data:", error);
            if (setNotification) setNotification({ message: 'Error loading data', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [setNotification]);

    const loadSharedData = useCallback(async (uid) => {
        setLoading(true);
        try {
            const data = await fetchPublicTransactions(uid);
            if (data) {
                const { validTransactions, errors: validationErrors } = validateAndMap(data);
                setTransactions(validTransactions);
                setErrors(validationErrors);
            }
        } catch (error) {
            console.error("Failed to load shared data:", error);
            if (setNotification) setNotification({ message: t('sharedLoadError'), type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [setNotification, t]);

    const saveTransaction = useCallback((transactionData, editingId) => {
        if (editingId) {
            setTransactions(prev => prev.map(t =>
                t.id === editingId ? { ...transactionData, id: editingId } : t
            ));
        } else {
            setTransactions(prev => [
                ...prev,
                { ...transactionData, id: crypto.randomUUID() }
            ]);
        }
        setShowPullButton(false);
    }, []);

    const deleteTransaction = useCallback((id) => {
        setTransactions(prev => {
            const newTransactions = prev.filter(t => t.id !== id);
            if (newTransactions.length === 0) {
                setShowPullButton(true);
            }
            return newTransactions;
        });
    }, []);

    const saveToCloud = useCallback(async (currentTransactions) => {
        try {
            const payload = buildTransactionPayload(currentTransactions || transactions);
            await saveTransactions(payload);
            if (setNotification) setNotification({ message: t('saveSuccess'), type: 'success' });
        } catch (error) {
            if (setNotification) setNotification({ message: error.message || t('saveError'), type: 'error' });
            throw error;
        }
    }, [transactions, setNotification, t]);

    const importJson = useCallback((jsonString, selectedProject) => {
        try {
            const data = JSON.parse(jsonString);
            const defaultProj = selectedProject === 'All' ? 'Budget' : selectedProject;
            const { validTransactions, errors: validationErrors } = validateAndMap(data, defaultProj);

            if (validTransactions.length > 0) {
                setTransactions(validTransactions);
                setErrors(validationErrors);
                setShowPullButton(false);
                if (setNotification) setNotification({
                    message: t('importSuccess', { count: validTransactions.length }),
                    type: 'success'
                });
            } else {
                if (setNotification) setNotification({ message: t('importNoValid'), type: 'error' });
                if (validationErrors.length > 0) setErrors(validationErrors);
            }
        } catch (error) {
            if (setNotification) setNotification({ message: t('importInvalidJson'), type: 'error' });
        }
    }, [setNotification, t]);

    const transferTransactions = useCallback(async (ids, targetProject) => {
        if (!ids || ids.length === 0 || !targetProject) return;

        // Sanitize target project name
        const sanitizedProject = targetProject.trim();
        if (!sanitizedProject) return;

        setTransactions(prev => {
            // Find valid IDs that actually exist in the current set
            const existingIds = new Set(prev.map(t => t.id));
            const validIds = ids.filter(id => existingIds.has(id));

            if (validIds.length === 0) return prev;

            const newTransactions = prev.map(t =>
                validIds.includes(t.id) ? { ...t, project: sanitizedProject } : t
            );
            // Save to cloud after local update
            saveToCloud(newTransactions);
            return newTransactions;
        });

        if (setNotification) {
            setNotification({
                message: t('transferSuccess', { count: ids.length, project: sanitizedProject }),
                type: 'success'
            });
        }
    }, [saveToCloud, setNotification, t]);

    return {
        transactions,
        setTransactions,
        loading,
        errors,
        setErrors,
        showPullButton,
        setShowPullButton,
        loadData,
        loadSharedData,
        saveTransaction,
        deleteTransaction,
        transferTransactions,
        saveToCloud,
        importJson
    };
};
