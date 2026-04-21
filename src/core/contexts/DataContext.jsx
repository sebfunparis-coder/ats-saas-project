/**
 * 📊 Data Context
 *
 * Gère toutes les données métier de l'application
 */

import { createContext, useContext, useState, useCallback } from 'react';

const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // ===== STATE =====
  const [missions, setMissions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [clients, setClients] = useState([]);
  const [team, setTeam] = useState([]);
  const [events, setEvents] = useState([]);

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    missions: false,
    candidates: false,
    applications: false,
    clients: false,
    team: false,
    events: false
  });

  // ===== MISSIONS =====

  /**
   * Add or update mission
   */
  const upsertMission = useCallback((mission) => {
    setMissions(prev => {
      const index = prev.findIndex(m => m.id === mission.id || m._id === mission._id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = mission;
        return updated;
      }
      return [...prev, mission];
    });
  }, []);

  /**
   * Remove mission
   */
  const removeMission = useCallback((missionId) => {
    setMissions(prev => prev.filter(m => m.id !== missionId && m._id !== missionId));
  }, []);

  /**
   * Get mission by ID
   */
  const getMissionById = useCallback((missionId) => {
    return missions.find(m => m.id === missionId || m._id === missionId);
  }, [missions]);

  // ===== CANDIDATES =====

  /**
   * Add or update candidate
   */
  const upsertCandidate = useCallback((candidate) => {
    console.log('🟢 [DataContext] upsertCandidate appelé avec:', candidate);
    console.log('🟢 [DataContext] ID du candidat:', candidate.id || candidate._id);

    setCandidates(prev => {
      console.log('🟢 [DataContext] Liste actuelle avant upsert:', prev.length, 'candidats');

      const index = prev.findIndex(c => c.id === candidate.id || c._id === candidate._id);
      console.log('🟢 [DataContext] Index trouvé:', index);

      if (index >= 0) {
        // Update existing
        const updated = [...prev];
        updated[index] = candidate;
        console.log('🟢 [DataContext] Candidat mis à jour à l\'index', index);
        return updated;
      }

      // Add new
      const newList = [...prev, candidate];
      console.log('🟢 [DataContext] Nouveau candidat ajouté. Liste après:', newList.length, 'candidats');
      return newList;
    });
  }, []);

  /**
   * Remove candidate
   */
  const removeCandidate = useCallback((candidateId) => {
    setCandidates(prev => prev.filter(c => c.id !== candidateId && c._id !== candidateId));
  }, []);

  /**
   * Get candidate by ID
   */
  const getCandidateById = useCallback((candidateId) => {
    return candidates.find(c => c.id === candidateId || c._id === candidateId);
  }, [candidates]);

  // ===== APPLICATIONS =====

  /**
   * Add or update application
   */
  const upsertApplication = useCallback((application) => {
    setApplications(prev => {
      const index = prev.findIndex(a => a.id === application.id || a._id === application._id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = application;
        return updated;
      }
      return [...prev, application];
    });
  }, []);

  /**
   * Remove application
   */
  const removeApplication = useCallback((applicationId) => {
    setApplications(prev => prev.filter(a => a.id !== applicationId && a._id !== applicationId));
  }, []);

  /**
   * Get application by ID
   */
  const getApplicationById = useCallback((applicationId) => {
    return applications.find(a => a.id === applicationId || a._id === applicationId);
  }, [applications]);

  /**
   * Update application status (for Kanban)
   */
  const updateApplicationStatus = useCallback((applicationId, newStatus) => {
    setApplications(prev => prev.map(app => {
      if (app.id === applicationId || app._id === applicationId) {
        return { ...app, status: newStatus };
      }
      return app;
    }));
  }, []);

  // ===== CLIENTS =====

  /**
   * Add or update client
   */
  const upsertClient = useCallback((client) => {
    setClients(prev => {
      const index = prev.findIndex(c => c.id === client.id || c._id === client._id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = client;
        return updated;
      }
      return [...prev, client];
    });
  }, []);

  /**
   * Remove client
   */
  const removeClient = useCallback((clientId) => {
    setClients(prev => prev.filter(c => c.id !== clientId && c._id !== clientId));
  }, []);

  /**
   * Get client by ID
   */
  const getClientById = useCallback((clientId) => {
    return clients.find(c => c.id === clientId || c._id === clientId);
  }, [clients]);

  // ===== TEAM =====

  /**
   * Add or update team member
   */
  const upsertTeamMember = useCallback((member) => {
    setTeam(prev => {
      const index = prev.findIndex(m => m.id === member.id || m._id === member._id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = member;
        return updated;
      }
      return [...prev, member];
    });
  }, []);

  /**
   * Remove team member
   */
  const removeTeamMember = useCallback((memberId) => {
    setTeam(prev => prev.filter(m => m.id !== memberId && m._id !== memberId));
  }, []);

  // ===== EVENTS =====

  /**
   * Add or update event
   */
  const upsertEvent = useCallback((event) => {
    setEvents(prev => {
      const index = prev.findIndex(e => e.id === event.id || e._id === event._id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = event;
        return updated;
      }
      return [...prev, event];
    });
  }, []);

  /**
   * Remove event
   */
  const removeEvent = useCallback((eventId) => {
    setEvents(prev => prev.filter(e => e.id !== eventId && e._id !== eventId));
  }, []);

  /**
   * Get event by ID
   */
  const getEventById = useCallback((eventId) => {
    return events.find(e => e.id === eventId || e._id === eventId);
  }, [events]);

  // ===== LOADING STATES =====

  /**
   * Set loading state for specific resource
   */
  const setLoading = useCallback((resource, isLoading) => {
    setLoadingStates(prev => ({ ...prev, [resource]: isLoading }));
  }, []);

  // ===== CLEAR ALL DATA =====

  /**
   * Clear all data (on logout)
   */
  const clearAllData = useCallback(() => {
    setMissions([]);
    setCandidates([]);
    setApplications([]);
    setClients([]);
    setTeam([]);
    setEvents([]);
    setLoadingStates({
      missions: false,
      candidates: false,
      applications: false,
      clients: false,
      team: false,
      events: false
    });
  }, []);

  const value = {
    // State
    missions,
    candidates,
    applications,
    clients,
    team,
    events,
    loadingStates,

    // Setters (bulk)
    setMissions,
    setCandidates,
    setApplications,
    setClients,
    setTeam,
    setEvents,

    // Missions
    upsertMission,
    removeMission,
    getMissionById,

    // Candidates
    upsertCandidate,
    removeCandidate,
    getCandidateById,

    // Applications
    upsertApplication,
    removeApplication,
    getApplicationById,
    updateApplicationStatus,

    // Clients
    upsertClient,
    removeClient,
    getClientById,

    // Team
    upsertTeamMember,
    removeTeamMember,

    // Events
    upsertEvent,
    removeEvent,
    getEventById,

    // Utilities
    setLoading,
    clearAllData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
