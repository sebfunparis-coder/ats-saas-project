/**
 * 📥 Exporters Utilities
 *
 * Fonctions d'export de données (CSV, JSON, PDF)
 */

import { formatDate, formatCurrency, formatFullName } from './formatters';

/**
 * Download file in browser
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Convert array of objects to CSV
 * @param {array} data - Array of objects
 * @param {array} columns - Column definitions [{key, label}]
 * @returns {string} - CSV string
 */
export const arrayToCSV = (data, columns) => {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  // Headers
  const headers = columns.map(col => col.label).join(',');

  // Rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value = item[col.key];

      // Handle nested properties (e.g., 'candidate.firstName')
      if (col.key.includes('.')) {
        const keys = col.key.split('.');
        value = keys.reduce((obj, key) => obj?.[key], item);
      }

      // Format value
      if (value === null || value === undefined) {
        value = '';
      } else if (Array.isArray(value)) {
        value = value.join('; ');
      } else if (typeof value === 'object') {
        value = JSON.stringify(value);
      } else {
        value = String(value);
      }

      // Escape quotes and wrap in quotes if contains comma/newline
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }

      return value;
    }).join(',');
  });

  return [headers, ...rows].join('\n');
};

/**
 * Export missions to CSV
 * @param {array} missions - Array of missions
 * @param {string} filename - File name (optional)
 */
export const exportMissionsToCSV = (missions, filename = `missions_${Date.now()}.csv`) => {
  const columns = [
    { key: 'title', label: 'Titre' },
    { key: 'company', label: 'Entreprise' },
    { key: 'contract', label: 'Type de contrat' },
    { key: 'location', label: 'Localisation' },
    { key: 'remote', label: 'Remote' },
    { key: 'sector', label: 'Secteur' },
    { key: 'department', label: 'Département' },
    { key: 'minSalary', label: 'Salaire min' },
    { key: 'maxSalary', label: 'Salaire max' },
    { key: 'status', label: 'Statut' },
    { key: 'createdAt', label: 'Date de création' }
  ];

  const formattedData = missions.map(m => ({
    ...m,
    createdAt: formatDate(m.createdAt, 'short'),
    minSalary: m.minSalary || '',
    maxSalary: m.maxSalary || ''
  }));

  const csv = arrayToCSV(formattedData, columns);
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
};

/**
 * Export candidates to CSV
 * @param {array} candidates - Array of candidates
 * @param {string} filename - File name (optional)
 */
export const exportCandidatesToCSV = (candidates, filename = `candidats_${Date.now()}.csv`) => {
  const columns = [
    { key: 'firstName', label: 'Prénom' },
    { key: 'lastName', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Téléphone' },
    { key: 'position', label: 'Poste' },
    { key: 'experience', label: 'Expérience' },
    { key: 'sector', label: 'Secteur' },
    { key: 'location', label: 'Localisation' },
    { key: 'skills', label: 'Compétences' },
    { key: 'status', label: 'Statut' },
    { key: 'rating', label: 'Note' },
    { key: 'available', label: 'Disponible' },
    { key: 'createdAt', label: 'Date de création' }
  ];

  const formattedData = candidates.map(c => ({
    ...c,
    createdAt: formatDate(c.createdAt, 'short'),
    available: c.available ? 'Oui' : 'Non',
    rating: c.rating || ''
  }));

  const csv = arrayToCSV(formattedData, columns);
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
};

/**
 * Export applications to CSV
 * @param {array} applications - Array of applications
 * @param {string} filename - File name (optional)
 */
export const exportApplicationsToCSV = (applications, filename = `candidatures_${Date.now()}.csv`) => {
  const columns = [
    { key: 'candidate', label: 'Candidat' },
    { key: 'mission', label: 'Mission' },
    { key: 'status', label: 'Statut' },
    { key: 'appliedAt', label: 'Date de candidature' },
    { key: 'notes', label: 'Notes' }
  ];

  const formattedData = applications.map(app => ({
    candidate: formatFullName(app.candidate?.firstName, app.candidate?.lastName),
    mission: app.mission?.title || '',
    status: app.status,
    appliedAt: formatDate(app.appliedAt, 'short'),
    notes: app.notes || ''
  }));

  const csv = arrayToCSV(formattedData, columns);
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
};

/**
 * Export clients to CSV
 * @param {array} clients - Array of clients
 * @param {string} filename - File name (optional)
 */
export const exportClientsToCSV = (clients, filename = `clients_${Date.now()}.csv`) => {
  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Téléphone' },
    { key: 'company', label: 'Entreprise' },
    { key: 'sector', label: 'Secteur' },
    { key: 'website', label: 'Site web' },
    { key: 'status', label: 'Statut' },
    { key: 'createdAt', label: 'Date de création' }
  ];

  const formattedData = clients.map(c => ({
    ...c,
    createdAt: formatDate(c.createdAt, 'short')
  }));

  const csv = arrayToCSV(formattedData, columns);
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
};

/**
 * Export data to JSON
 * @param {any} data - Data to export
 * @param {string} filename - File name
 */
export const exportToJSON = (data, filename = `export_${Date.now()}.json`) => {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
};

/**
 * Parse CSV file to array of objects
 * @param {string} csvContent - CSV content
 * @returns {array} - Array of objects
 */
export const parseCSV = (csvContent) => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const obj = {};

    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });

    data.push(obj);
  }

  return data;
};

/**
 * Import candidates from CSV
 * @param {File} file - CSV file
 * @returns {Promise<array>} - Array of candidates
 */
export const importCandidatesFromCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const data = parseCSV(csv);

        const candidates = data.map(row => ({
          firstName: row['Prénom'] || row['firstName'] || '',
          lastName: row['Nom'] || row['lastName'] || '',
          email: row['Email'] || row['email'] || '',
          phone: row['Téléphone'] || row['phone'] || '',
          position: row['Poste'] || row['position'] || '',
          experience: row['Expérience'] || row['experience'] || '',
          sector: row['Secteur'] || row['sector'] || '',
          location: row['Localisation'] || row['location'] || '',
          skills: (row['Compétences'] || row['skills'] || '').split(';').map(s => s.trim()).filter(Boolean),
          status: row['Statut'] || row['status'] || 'new',
          available: row['Disponible'] === 'Oui' || row['available'] === 'true'
        }));

        resolve(candidates);
      } catch (error) {
        reject(new Error('Erreur lors de l\'import du CSV'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };

    reader.readAsText(file);
  });
};

/**
 * Export table data based on type
 * @param {string} type - Type of export ('missions', 'candidates', 'applications', 'clients')
 * @param {array} data - Data to export
 * @param {string} format - Export format ('csv', 'json')
 */
export const exportData = (type, data, format = 'csv') => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Aucune donnée à exporter');
  }

  const timestamp = new Date().toISOString().split('T')[0];

  if (format === 'json') {
    exportToJSON(data, `${type}_${timestamp}.json`);
    return;
  }

  switch (type) {
    case 'missions':
      exportMissionsToCSV(data, `missions_${timestamp}.csv`);
      break;
    case 'candidates':
      exportCandidatesToCSV(data, `candidats_${timestamp}.csv`);
      break;
    case 'applications':
      exportApplicationsToCSV(data, `candidatures_${timestamp}.csv`);
      break;
    case 'clients':
      exportClientsToCSV(data, `clients_${timestamp}.csv`);
      break;
    default:
      throw new Error(`Type d'export non supporté: ${type}`);
  }
};

/**
 * Generate PDF (placeholder - requires library like jsPDF)
 * @param {string} title - Document title
 * @param {array} data - Data to export
 */
export const exportToPDF = (title, data) => {
  console.warn('PDF export requires jsPDF library. Use CSV/JSON for now.');
  // TODO: Implement with jsPDF when needed
  throw new Error('Export PDF non implémenté. Utilisez CSV ou JSON.');
};
