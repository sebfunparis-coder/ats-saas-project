import { exportCandidates, exportMissions, exportClients, exportApplications, exportToJSON, exportToCSV } from '../utils/exporters';
import { useNotifications } from '../contexts/NotificationsContext';

/**
 * Hook pour gérer les exports avancés (CSV, JSON, Excel)
 * Simplifie l'utilisation des fonctions d'export avec notifications
 *
 * @example
 * const { exportCandidates, exportMissions, exportToExcel } = useExport();
 */
export function useExport() {
  const { success, error: showError } = useNotifications();

  /**
   * Exporter en Excel (CSV avec BOM UTF-8)
   */
  const exportToExcel = (data, columns, filename = 'export.csv') => {
    try {
      // Créer le CSV
      if (!data || data.length === 0) {
        throw new Error('Aucune donnée à exporter');
      }

      exportToCSV(data, columns, filename);
      success('Export Excel réussi', `${data.length} ligne(s) exportée(s)`);
    } catch (err) {
      console.error('Erreur lors de l\'export Excel:', err);
      showError('Erreur d\'export', err.message);
    }
  };

  /**
   * Exporter des candidats en CSV
   */
  const handleExportCandidates = (candidates, filename) => {
    try {
      exportCandidates(candidates, filename);
      success('Export réussi', `${candidates.length} candidat(s) exporté(s) avec succès`);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      showError('Erreur d\'export', 'Erreur lors de l\'export des candidats');
    }
  };

  /**
   * Exporter des missions en CSV
   */
  const handleExportMissions = (missions, filename) => {
    try {
      exportMissions(missions, filename);
      success('Export réussi', `${missions.length} mission(s) exportée(s) avec succès`);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      showError('Erreur d\'export', 'Erreur lors de l\'export des missions');
    }
  };

  /**
   * Exporter des clients en CSV
   */
  const handleExportClients = (clients, filename) => {
    try {
      exportClients(clients, filename);
      success('Export réussi', `${clients.length} client(s) exporté(s) avec succès`);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      showError('Erreur d\'export', 'Erreur lors de l\'export des clients');
    }
  };

  /**
   * Exporter des candidatures en CSV
   */
  const handleExportApplications = (applications, filename) => {
    try {
      exportApplications(applications, filename);
      success('Export réussi', `${applications.length} candidature(s) exportée(s) avec succès`);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      showError('Erreur d\'export', 'Erreur lors de l\'export des candidatures');
    }
  };

  /**
   * Exporter toutes les données en JSON (backup complet)
   */
  const handleExportAll = (data, filename = 'ats_backup.json') => {
    try {
      exportToJSON(data, filename);
      success('Backup complet exporté', 'Toutes les données ont été sauvegardées');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      showError('Erreur d\'export', 'Erreur lors de l\'export du backup');
    }
  };

  return {
    exportCandidates: handleExportCandidates,
    exportMissions: handleExportMissions,
    exportClients: handleExportClients,
    exportApplications: handleExportApplications,
    exportAll: handleExportAll,
    exportToExcel,
    exportToJSON: (data, filename) => {
      try {
        exportToJSON(data, filename);
        success('Export JSON réussi', 'Données exportées en JSON');
      } catch (error) {
        showError('Erreur d\'export', error.message);
      }
    },
  };
}
