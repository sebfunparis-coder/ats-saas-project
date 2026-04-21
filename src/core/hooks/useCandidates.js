/**
 * 👥 useCandidates Hook
 *
 * Hook personnalisé pour gérer les candidats
 */

import { useCallback } from 'react';
import { useData } from '@/core/contexts';
import { useUI } from '@/core/contexts';
import { candidateService } from '@/services';
import { getErrorMessage } from '@/services/api';

export const useCandidates = () => {
  const {
    candidates,
    setCandidates,
    upsertCandidate,
    removeCandidate,
    getCandidateById,
    setLoading
  } = useData();

  const { showSuccess, showError } = useUI();

  /**
   * Fetch all candidates
   */
  const fetchCandidates = useCallback(async (params = {}) => {
    setLoading('candidates', true);
    try {
      const result = await candidateService.getAll(params);
      if (result.success) {
        setCandidates(result.data);
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors du chargement des candidats');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    } finally {
      setLoading('candidates', false);
    }
  }, [setCandidates, setLoading, showError]);

  /**
   * Fetch candidate by ID
   */
  const fetchCandidateById = useCallback(async (id) => {
    try {
      const result = await candidateService.getById(id);
      if (result.success) {
        upsertCandidate(result.data);
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors du chargement du candidat');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [upsertCandidate, showError]);

  /**
   * Create new candidate
   */
  const createCandidate = useCallback(async (data) => {
    try {
      console.log('🔵 [useCandidates] Création candidat avec data:', data);
      const result = await candidateService.create(data);
      console.log('🔵 [useCandidates] Résultat API:', result);

      if (result.success) {
        console.log('🔵 [useCandidates] Appel upsertCandidate avec:', result.data);
        upsertCandidate(result.data);
        showSuccess('Candidat créé avec succès');
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors de la création du candidat');
    } catch (error) {
      console.error('🔴 [useCandidates] Erreur création:', error);
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [upsertCandidate, showSuccess, showError]);

  /**
   * Update candidate
   */
  const updateCandidate = useCallback(async (id, data) => {
    try {
      const result = await candidateService.update(id, data);
      if (result.success) {
        upsertCandidate(result.data);
        showSuccess('Candidat mis à jour avec succès');
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors de la mise à jour du candidat');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [upsertCandidate, showSuccess, showError]);

  /**
   * Delete candidate
   */
  const deleteCandidate = useCallback(async (id) => {
    try {
      const result = await candidateService.delete(id);
      if (result.success) {
        removeCandidate(id);
        showSuccess('Candidat supprimé avec succès');
        return { success: true };
      }
      throw new Error(result.message || 'Erreur lors de la suppression du candidat');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [removeCandidate, showSuccess, showError]);

  /**
   * Update candidate status
   */
  const updateCandidateStatus = useCallback(async (id, status) => {
    try {
      const result = await candidateService.updateStatus(id, status);
      if (result.success) {
        upsertCandidate(result.data);
        showSuccess('Statut mis à jour avec succès');
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors de la mise à jour du statut');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [upsertCandidate, showSuccess, showError]);

  /**
   * Rate candidate
   */
  const rateCandidate = useCallback(async (id, rating) => {
    try {
      const result = await candidateService.rate(id, rating);
      if (result.success) {
        upsertCandidate(result.data);
        showSuccess('Note mise à jour avec succès');
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors de la notation');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [upsertCandidate, showSuccess, showError]);

  /**
   * Import candidates from CSV/JSON
   */
  const importCandidates = useCallback(async (candidatesData) => {
    try {
      const result = await candidateService.import(candidatesData);
      if (result.success) {
        // Refresh candidates list
        await fetchCandidates();
        showSuccess(`${result.data.imported} candidats importés avec succès`);
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors de l\'import');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [fetchCandidates, showSuccess, showError]);

  /**
   * Get candidate statistics
   */
  const getCandidateStats = useCallback(async () => {
    try {
      const result = await candidateService.getStats();
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
    candidates,
    getCandidateById,

    // Actions
    fetchCandidates,
    fetchCandidateById,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    updateCandidateStatus,
    rateCandidate,
    importCandidates,
    getCandidateStats
  };
};
