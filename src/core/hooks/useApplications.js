/**
 * 🎯 useApplications Hook
 *
 * Hook personnalisé pour gérer les candidatures et le pipeline
 */

import { useCallback } from 'react';
import { useData } from '@/core/contexts';
import { useUI } from '@/core/contexts';
import { applicationService } from '@/services';
import { getErrorMessage } from '@/services/api';

export const useApplications = () => {
  const dataContext = useData();
  const {
    applications,
    setApplications,
    upsertApplication,
    removeApplication,
    getApplicationById,
    setLoading
  } = dataContext;
  const updateStatusInContext = dataContext.updateApplicationStatus;

  const { showSuccess, showError } = useUI();

  /**
   * Fetch all applications
   */
  const fetchApplications = useCallback(async (params = {}) => {
    setLoading('applications', true);
    try {
      const result = await applicationService.getAll(params);
      if (result.success) {
        setApplications(result.data);
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors du chargement des candidatures');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    } finally {
      setLoading('applications', false);
    }
  }, [setApplications, setLoading, showError]);

  /**
   * Fetch pipeline data (grouped by status)
   */
  const fetchPipeline = useCallback(async (params = {}) => {
    setLoading('applications', true);
    try {
      const result = await applicationService.getPipeline(params);
      if (result.success) {
        // Flatten pipeline data back into applications array
        const allApps = Object.values(result.data.pipeline).flat();
        setApplications(allApps);
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors du chargement du pipeline');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    } finally {
      setLoading('applications', false);
    }
  }, [setApplications, setLoading, showError]);

  /**
   * Fetch application by ID
   */
  const fetchApplicationById = useCallback(async (id) => {
    try {
      const result = await applicationService.getById(id);
      if (result.success) {
        upsertApplication(result.data);
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors du chargement de la candidature');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [upsertApplication, showError]);

  /**
   * Create new application
   */
  const createApplication = useCallback(async (data) => {
    try {
      const result = await applicationService.create(data);
      if (result.success) {
        upsertApplication(result.data);
        showSuccess('Candidature créée avec succès');
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors de la création de la candidature');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [upsertApplication, showSuccess, showError]);

  /**
   * Update application
   */
  const updateApplication = useCallback(async (id, data) => {
    try {
      const result = await applicationService.update(id, data);
      if (result.success) {
        upsertApplication(result.data);
        showSuccess('Candidature mise à jour avec succès');
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors de la mise à jour de la candidature');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [upsertApplication, showSuccess, showError]);

  /**
   * Delete application
   */
  const deleteApplication = useCallback(async (id) => {
    try {
      const result = await applicationService.delete(id);
      if (result.success) {
        removeApplication(id);
        showSuccess('Candidature supprimée avec succès');
        return { success: true };
      }
      throw new Error(result.message || 'Erreur lors de la suppression de la candidature');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [removeApplication, showSuccess, showError]);

  /**
   * Update application status (Kanban drag & drop)
   */
  const updateApplicationStatus = useCallback(async (id, status) => {
    // Optimistic update
    updateStatusInContext(id, status);

    try {
      const result = await applicationService.updateStatus(id, status);
      if (result.success) {
        upsertApplication(result.data);
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors de la mise à jour du statut');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      // Refresh to revert optimistic update
      await fetchApplications();
      return { success: false, error: message };
    }
  }, [updateStatusInContext, upsertApplication, fetchApplications, showError]);

  /**
   * Reject application
   */
  const rejectApplication = useCallback(async (id, reason) => {
    try {
      const result = await applicationService.reject(id, reason);
      if (result.success) {
        upsertApplication(result.data);
        showSuccess('Candidature rejetée');
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors du rejet de la candidature');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [upsertApplication, showSuccess, showError]);

  /**
   * Hire candidate
   */
  const hireCandidate = useCallback(async (id) => {
    try {
      const result = await applicationService.hire(id);
      if (result.success) {
        upsertApplication(result.data);
        showSuccess('Candidat embauché ! 🎉');
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors de l\'embauche');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [upsertApplication, showSuccess, showError]);

  /**
   * Make offer
   */
  const makeOffer = useCallback(async (id) => {
    try {
      const result = await applicationService.makeOffer(id);
      if (result.success) {
        upsertApplication(result.data);
        showSuccess('Offre envoyée avec succès');
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors de l\'envoi de l\'offre');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [upsertApplication, showSuccess, showError]);

  /**
   * Add interview
   */
  const addInterview = useCallback(async (id, interviewData) => {
    try {
      const result = await applicationService.addInterview(id, interviewData);
      if (result.success) {
        upsertApplication(result.data);
        showSuccess('Entretien ajouté avec succès');
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors de l\'ajout de l\'entretien');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [upsertApplication, showSuccess, showError]);

  /**
   * Get application statistics
   */
  const getApplicationStats = useCallback(async () => {
    try {
      const result = await applicationService.getStats();
      if (result.success) {
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors du chargement des statistiques');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [showError]);

  return {
    // Data
    applications,
    getApplicationById,

    // Actions
    fetchApplications,
    fetchPipeline,
    fetchApplicationById,
    createApplication,
    updateApplication,
    deleteApplication,
    updateApplicationStatus,
    rejectApplication,
    hireCandidate,
    makeOffer,
    addInterview,
    getApplicationStats
  };
};
