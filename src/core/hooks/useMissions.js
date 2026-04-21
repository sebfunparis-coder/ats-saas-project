/**
 * 💼 useMissions Hook
 *
 * Hook personnalisé pour gérer les missions
 */

import { useCallback } from 'react';
import { useData } from '@/core/contexts';
import { useUI } from '@/core/contexts';
import { missionService } from '@/services';
import { getErrorMessage } from '@/services/api';

export const useMissions = () => {
  const {
    missions,
    setMissions,
    upsertMission,
    removeMission,
    getMissionById,
    setLoading
  } = useData();

  const { showSuccess, showError } = useUI();

  /**
   * Fetch all missions
   */
  const fetchMissions = useCallback(async (params = {}) => {
    setLoading('missions', true);
    try {
      const result = await missionService.getAll(params);
      if (result.success) {
        setMissions(result.data);
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors du chargement des missions');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    } finally {
      setLoading('missions', false);
    }
  }, [setMissions, setLoading, showError]);

  /**
   * Fetch mission by ID
   */
  const fetchMissionById = useCallback(async (id) => {
    try {
      const result = await missionService.getById(id);
      if (result.success) {
        upsertMission(result.data);
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors du chargement de la mission');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [upsertMission, showError]);

  /**
   * Create new mission
   */
  const createMission = useCallback(async (data) => {
    try {
      const result = await missionService.create(data);
      if (result.success) {
        upsertMission(result.data);
        showSuccess('Mission créée avec succès');
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors de la création de la mission');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [upsertMission, showSuccess, showError]);

  /**
   * Update mission
   */
  const updateMission = useCallback(async (id, data) => {
    try {
      const result = await missionService.update(id, data);
      if (result.success) {
        upsertMission(result.data);
        showSuccess('Mission mise à jour avec succès');
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors de la mise à jour de la mission');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [upsertMission, showSuccess, showError]);

  /**
   * Delete mission
   */
  const deleteMission = useCallback(async (id) => {
    try {
      const result = await missionService.delete(id);
      if (result.success) {
        removeMission(id);
        showSuccess('Mission supprimée avec succès');
        return { success: true };
      }
      throw new Error(result.message || 'Erreur lors de la suppression de la mission');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [removeMission, showSuccess, showError]);

  /**
   * Publish mission
   */
  const publishMission = useCallback(async (id) => {
    try {
      const result = await missionService.publish(id);
      if (result.success) {
        upsertMission(result.data);
        showSuccess('Mission publiée avec succès');
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors de la publication de la mission');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [upsertMission, showSuccess, showError]);

  /**
   * Close mission
   */
  const closeMission = useCallback(async (id) => {
    try {
      const result = await missionService.close(id);
      if (result.success) {
        upsertMission(result.data);
        showSuccess('Mission fermée avec succès');
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors de la fermeture de la mission');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [upsertMission, showSuccess, showError]);

  /**
   * Pause mission
   */
  const pauseMission = useCallback(async (id) => {
    try {
      const result = await missionService.pause(id);
      if (result.success) {
        upsertMission(result.data);
        showSuccess('Mission mise en pause');
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors de la mise en pause de la mission');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [upsertMission, showSuccess, showError]);

  /**
   * Resume mission
   */
  const resumeMission = useCallback(async (id) => {
    try {
      const result = await missionService.resume(id);
      if (result.success) {
        upsertMission(result.data);
        showSuccess('Mission reprise');
        return { success: true, data: result.data };
      }
      throw new Error(result.message || 'Erreur lors de la reprise de la mission');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      return { success: false, error: message };
    }
  }, [upsertMission, showSuccess, showError]);

  /**
   * Get mission statistics
   */
  const getMissionStats = useCallback(async () => {
    try {
      const result = await missionService.getStats();
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
    missions,
    getMissionById,

    // Actions
    fetchMissions,
    fetchMissionById,
    createMission,
    updateMission,
    deleteMission,
    publishMission,
    closeMission,
    pauseMission,
    resumeMission,
    getMissionStats
  };
};
