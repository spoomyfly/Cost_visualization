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
        if (name && !uniqueProjects.includes(name)) {
            setManualProjects(prev => [...prev, name]);
            setSelectedProject(name);
            if (setNotification) setNotification({ message: `${t('addProject')}: ${name}`, type: 'success' });
        } else if (uniqueProjects.includes(name)) {
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
