import { useState, useMemo, useEffect, useCallback } from 'react';

/**
 * Hook for managing project selection and unique project list
 */
export const useProjects = (transactions, t, setNotification) => {
    const [selectedProject, setSelectedProject] = useState('All');
    const [manualProjects, setManualProjects] = useState([]);
    const [isInputModalOpen, setIsInputModalOpen] = useState(false);

    const uniqueProjects = useMemo(() => {
        const projects = transactions.map(t => t.project).filter(Boolean);
        return ['All', ...new Set([...projects, ...manualProjects])].sort();
    }, [transactions, manualProjects]);

    const handleAddProject = () => {
        setIsInputModalOpen(true);
    };

    const confirmAddProject = useCallback((name) => {
        const trimmedName = name?.trim();
        if (trimmedName && !uniqueProjects.includes(trimmedName)) {
            setManualProjects(prev => [...prev, trimmedName]);
            setSelectedProject(trimmedName);
            if (setNotification) setNotification({ message: `${t('addProject')}: ${trimmedName}`, type: 'success' });
        } else if (trimmedName && uniqueProjects.includes(trimmedName)) {
            if (setNotification) setNotification({ message: t('duplicateProject') || "Project already exists", type: 'error' });
        }
        setIsInputModalOpen(false);
    }, [uniqueProjects, t, setNotification]);

    useEffect(() => {
        document.title = selectedProject === 'All' ? t('appTitle') : `${selectedProject} - ${t('appTitle')}`;
    }, [selectedProject, t]);

    return {
        selectedProject,
        setSelectedProject,
        manualProjects,
        uniqueProjects,
        isInputModalOpen,
        setIsInputModalOpen,
        handleAddProject,
        confirmAddProject
    };
};
