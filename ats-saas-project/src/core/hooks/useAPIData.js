/**
 * 🔄 Hook useAPIData
 * Hook pour charger les données depuis l'API backend
 */

import { useState, useEffect } from 'react';
import api from '../services/api.service';

/**
 * Hook pour charger les missions depuis l'API
 */
export function useAPIMissions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.missions.getAll();
      setMissions(data);
    } catch (err) {
      console.error('Erreur chargement missions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createMission = async (missionData) => {
    try {
      const newMission = await api.missions.create(missionData);
      setMissions(prev => [...prev, newMission]);
      return newMission;
    } catch (err) {
      console.error('Erreur création mission:', err);
      throw err;
    }
  };

  const updateMission = async (id, missionData) => {
    try {
      const updated = await api.missions.update(id, missionData);
      setMissions(prev => prev.map(m => m.id === id ? updated : m));
      return updated;
    } catch (err) {
      console.error('Erreur mise à jour mission:', err);
      throw err;
    }
  };

  const deleteMission = async (id) => {
    try {
      await api.missions.delete(id);
      setMissions(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Erreur suppression mission:', err);
      throw err;
    }
  };

  return {
    missions,
    loading,
    error,
    reload: loadMissions,
    createMission,
    updateMission,
    deleteMission,
  };
}

/**
 * Hook pour charger les candidats depuis l'API
 */
export function useAPICandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.candidates.getAll();
      setCandidates(data);
    } catch (err) {
      console.error('Erreur chargement candidats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCandidate = async (candidateData) => {
    try {
      const newCandidate = await api.candidates.create(candidateData);
      setCandidates(prev => [...prev, newCandidate]);
      return newCandidate;
    } catch (err) {
      console.error('Erreur création candidat:', err);
      throw err;
    }
  };

  const updateCandidate = async (id, candidateData) => {
    try {
      const updated = await api.candidates.update(id, candidateData);
      setCandidates(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      console.error('Erreur mise à jour candidat:', err);
      throw err;
    }
  };

  const deleteCandidate = async (id) => {
    try {
      await api.candidates.delete(id);
      setCandidates(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Erreur suppression candidat:', err);
      throw err;
    }
  };

  return {
    candidates,
    loading,
    error,
    reload: loadCandidates,
    createCandidate,
    updateCandidate,
    deleteCandidate,
  };
}

/**
 * Hook pour charger les candidatures depuis l'API
 */
export function useAPIApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.applications.getAll();
      setApplications(data);
    } catch (err) {
      console.error('Erreur chargement candidatures:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async (applicationData) => {
    try {
      const newApplication = await api.applications.create(applicationData);
      setApplications(prev => [...prev, newApplication]);
      return newApplication;
    } catch (err) {
      console.error('Erreur création candidature:', err);
      throw err;
    }
  };

  const updateApplicationStatus = async (id, status) => {
    try {
      const updated = await api.applications.updateStatus(id, status);
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      return updated;
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
      throw err;
    }
  };

  const deleteApplication = async (id) => {
    try {
      await api.applications.delete(id);
      setApplications(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Erreur suppression candidature:', err);
      throw err;
    }
  };

  return {
    applications,
    loading,
    error,
    reload: loadApplications,
    createApplication,
    updateApplicationStatus,
    deleteApplication,
  };
}

/**
 * Hook pour charger les utilisateurs depuis l'API
 */
export function useAPIUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.users.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id, userData) => {
    try {
      const updated = await api.users.update(id, userData);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err) {
      console.error('Erreur mise à jour utilisateur:', err);
      throw err;
    }
  };

  const updateUserRole = async (id, role) => {
    try {
      const updated = await api.users.updateRole(id, role);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
      return updated;
    } catch (err) {
      console.error('Erreur mise à jour rôle:', err);
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.users.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error('Erreur suppression utilisateur:', err);
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    reload: loadUsers,
    updateUser,
    updateUserRole,
    deleteUser,
  };
}

export default {
  useAPIMissions,
  useAPICandidates,
  useAPIApplications,
  useAPIUsers,
};
