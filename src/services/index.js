/**
 * 📦 Services Index
 *
 * Export centralisé de tous les services API
 */

// Import des services
import authService from './auth.service';
import missionService from './mission.service';
import candidateService from './candidate.service';
import applicationService from './application.service';

// Export nommés
export { default as api, getErrorMessage, isAuthenticated, getCurrentUser, clearAuth } from './api';
export { default as authService } from './auth.service';
export { default as missionService } from './mission.service';
export { default as candidateService } from './candidate.service';
export { default as applicationService } from './application.service';

// Export par défaut (objet avec tous les services)
export default {
  auth: authService,
  missions: missionService,
  candidates: candidateService,
  applications: applicationService
};
