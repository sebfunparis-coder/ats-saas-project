/**
 * Utilitaires d'export de données
 * Fonctions pour exporter en CSV, JSON, PDF
 */

/**
 * Exporte des données en CSV et déclenche le téléchargement
 * @param {Array} data - Données à exporter
 * @param {Array} columns - Colonnes à inclure { key, label }
 * @param {string} filename - Nom du fichier
 *
 * @example
 * exportToCSV(
 *   [{ name: 'Jean', email: 'jean@test.com' }],
 *   [{ key: 'name', label: 'Nom' }, { key: 'email', label: 'Email' }],
 *   'utilisateurs.csv'
 * )
 */
export function exportToCSV(data, columns, filename = 'export.csv') {
  if (!data || data.length === 0) {
    console.warn('Aucune donnée à exporter');
    return;
  }

  // Header
  const headers = columns.map(col => col.label).join(',');

  // Rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key];

      // Échapper les virgules et guillemets
      if (value === null || value === undefined) return '';

      const stringValue = String(value);

      // Si contient virgule, guillemet ou saut de ligne, mettre entre guillemets
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    }).join(',');
  });

  // Combiner header et rows
  const csv = [headers, ...rows].join('\n');

  // Créer le blob et télécharger
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Exporte des données en JSON et déclenche le téléchargement
 * @param {*} data - Données à exporter
 * @param {string} filename - Nom du fichier
 *
 * @example
 * exportToJSON({ users: [...], missions: [...] }, 'backup.json')
 */
export function exportToJSON(data, filename = 'export.json') {
  if (!data) {
    console.warn('Aucune donnée à exporter');
    return;
  }

  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json;charset=utf-8;');
}

/**
 * Crée un blob et déclenche le téléchargement
 * @param {string} content - Contenu du fichier
 * @param {string} filename - Nom du fichier
 * @param {string} mimeType - Type MIME
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Génère un nom de fichier avec timestamp
 * @param {string} prefix - Préfixe du fichier
 * @param {string} extension - Extension (.csv, .json, etc.)
 * @returns {string} Nom de fichier
 *
 * @example
 * generateFilename('export_missions', 'csv')
 * // 'export_missions_2026-02-17_14-30-45.csv'
 */
export function generateFilename(prefix, extension) {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '_');

  return `${prefix}_${timestamp}.${extension}`;
}

/**
 * Exporte une liste de candidats en CSV
 * @param {Array} candidates - Liste des candidats
 * @param {string} filename - Nom du fichier (optionnel)
 */
export function exportCandidates(candidates, filename) {
  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Téléphone' },
    { key: 'position', label: 'Poste' },
    { key: 'location', label: 'Localisation' },
    { key: 'experience', label: 'Expérience (années)' },
    { key: 'status', label: 'Statut' },
    { key: 'salary', label: 'Salaire' },
    { key: 'availability', label: 'Disponibilité' },
    { key: 'source', label: 'Source' },
    { key: 'dateAdded', label: 'Date ajout' },
  ];

  const fname = filename || generateFilename('candidats', 'csv');
  exportToCSV(candidates, columns, fname);
}

/**
 * Exporte une liste de missions en CSV
 * @param {Array} missions - Liste des missions
 * @param {string} filename - Nom du fichier (optionnel)
 */
export function exportMissions(missions, filename) {
  const columns = [
    { key: 'title', label: 'Titre' },
    { key: 'client', label: 'Client' },
    { key: 'location', label: 'Localisation' },
    { key: 'salary', label: 'Salaire' },
    { key: 'status', label: 'Statut' },
    { key: 'contractType', label: 'Type de contrat' },
    { key: 'workMode', label: 'Mode de travail' },
    { key: 'startDate', label: 'Date de début' },
    { key: 'urgency', label: 'Urgence' },
  ];

  const fname = filename || generateFilename('missions', 'csv');
  exportToCSV(missions, columns, fname);
}

/**
 * Exporte une liste de clients en CSV
 * @param {Array} clients - Liste des clients
 * @param {string} filename - Nom du fichier (optionnel)
 */
export function exportClients(clients, filename) {
  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'industry', label: 'Secteur' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Statut' },
    { key: 'missions', label: 'Nombre de missions' },
  ];

  const fname = filename || generateFilename('clients', 'csv');
  exportToCSV(clients, columns, fname);
}

/**
 * Exporte une liste de candidatures en CSV
 * @param {Array} applications - Liste des candidatures
 * @param {string} filename - Nom du fichier (optionnel)
 */
export function exportApplications(applications, filename) {
  const columns = [
    { key: 'candidateName', label: 'Candidat' },
    { key: 'missionTitle', label: 'Mission' },
    { key: 'status', label: 'Statut' },
    { key: 'score', label: 'Score' },
  ];

  const fname = filename || generateFilename('candidatures', 'csv');
  exportToCSV(applications, columns, fname);
}

/**
 * Copie du texte dans le presse-papier
 * @param {string} text - Texte à copier
 * @returns {Promise<boolean>} True si succès
 *
 * @example
 * await copyToClipboard('Texte à copier')
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback pour navigateurs plus anciens
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (error) {
    console.error('Erreur lors de la copie:', error);
    return false;
  }
}

/**
 * Importe un fichier CSV et le parse en array d'objets
 * @param {File} file - Fichier CSV à importer
 * @returns {Promise<Array>} Données parsées
 *
 * @example
 * const data = await importCSV(file);
 */
export async function importCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n');

        if (lines.length === 0) {
          resolve([]);
          return;
        }

        // Parse header
        const headers = lines[0].split(',').map(h => h.trim());

        // Parse rows
        const data = lines.slice(1)
          .filter(line => line.trim() !== '')
          .map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj = {};

            headers.forEach((header, index) => {
              obj[header] = values[index] || '';
            });

            return obj;
          });

        resolve(data);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Exporte le pipeline (candidatures) en CSV avec toutes les infos
 */
export function exportPipeline(applications, filename) {
  const columns = [
    { key: 'candidateName', label: 'Candidat' },
    { key: 'missionTitle',  label: 'Mission' },
    { key: 'clientName',    label: 'Client' },
    { key: 'status',        label: 'Statut' },
    { key: 'score',         label: 'Score IA (%)' },
    { key: 'dateApplied',   label: 'Date candidature' },
    { key: 'notes',         label: 'Notes' },
  ];
  exportToCSV(applications, columns, filename || generateFilename('pipeline', 'csv'));
}

/**
 * Ouvre une fenêtre d'impression HTML pour la fiche d'un candidat
 * @param {object} candidate - Données du candidat
 * @param {Array}  candidateApplications - Candidatures liées
 * @param {Array}  allTags - Tous les tags pour résoudre les IDs
 */
export function printCandidateProfile(candidate, candidateApplications = [], allTags = []) {
  const tags = (candidate.tags || [])
    .map(id => allTags.find(t => t.id === id))
    .filter(Boolean)
    .map(t => t.name)
    .join(', ');

  const skills = (candidate.skills || []).join(', ');

  const STATUS_FR = {
    received: 'Reçue', screening: 'Présélection',
    interview_1: 'Entretien 1', interview_2: 'Entretien 2',
    offer: 'Offre', final: 'Finaliste', hired: 'Recruté', rejected: 'Refusé',
  };

  const appRows = candidateApplications.map(a => `
    <tr>
      <td>${a.missionTitle || '—'}</td>
      <td>${a.clientName || '—'}</td>
      <td>${STATUS_FR[a.status] || a.status}</td>
      <td>${a.score || 0}%</td>
      <td>${a.dateApplied ? new Date(a.dateApplied).toLocaleDateString('fr-FR') : '—'}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Fiche Candidat – ${candidate.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1F2937; padding: 40px; font-size: 13px; }
    .header { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 3px solid #667EEA; }
    .avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #667EEA, #764BA2); display: flex; align-items: center; justify-content: center; font-size: 36px; flex-shrink: 0; }
    .header-info h1 { font-size: 26px; font-weight: 900; color: #1F2937; }
    .header-info p { font-size: 15px; color: #6B7280; margin-top: 4px; }
    .badge { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-top: 8px; }
    .badge-active { background: #D1FAE5; color: #065F46; }
    .badge-passive { background: #FEF3C7; color: #92400E; }
    .badge-hired { background: #FCE7F3; color: #9D174D; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 11px; font-weight: 800; color: #6B7280; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #F3F4F6; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
    .info-row { display: flex; gap: 8px; margin-bottom: 6px; }
    .info-label { font-weight: 700; color: #374151; min-width: 130px; }
    .info-value { color: #6B7280; }
    .skills { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-tag { padding: 4px 10px; background: #EFF6FF; color: #3B82F6; border-radius: 6px; font-size: 12px; font-weight: 600; }
    .notes-box { padding: 12px 16px; background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 6px; color: #92400E; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #F9FAFB; padding: 8px 12px; text-align: left; font-weight: 700; color: #374151; border-bottom: 2px solid #E5E7EB; }
    td { padding: 8px 12px; border-bottom: 1px solid #F3F4F6; color: #6B7280; }
    tr:last-child td { border-bottom: none; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF; display: flex; justify-content: space-between; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="avatar">${candidate.avatar || '👤'}</div>
    <div class="header-info">
      <h1>${candidate.name}</h1>
      <p>${candidate.position || ''}</p>
      <span class="badge badge-${candidate.status || 'active'}">${candidate.status === 'active' ? 'Actif' : candidate.status === 'passive' ? 'Passif' : candidate.status === 'hired' ? 'Recruté' : candidate.status || ''}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">📞 Contact</div>
    <div class="grid-2">
      <div class="info-row"><span class="info-label">Email :</span><span class="info-value">${candidate.email || '—'}</span></div>
      <div class="info-row"><span class="info-label">Téléphone :</span><span class="info-value">${candidate.phone || '—'}</span></div>
      <div class="info-row"><span class="info-label">Localisation :</span><span class="info-value">${candidate.location || '—'}</span></div>
      ${candidate.department ? `<div class="info-row"><span class="info-label">Département :</span><span class="info-value">${candidate.department}</span></div>` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">💼 Profil Professionnel</div>
    <div class="grid-2">
      <div class="info-row"><span class="info-label">Expérience :</span><span class="info-value">${candidate.experience || 0} ans</span></div>
      ${candidate.metier ? `<div class="info-row"><span class="info-label">Métier :</span><span class="info-value">${candidate.metier}</span></div>` : ''}
      ${candidate.sector ? `<div class="info-row"><span class="info-label">Secteur :</span><span class="info-value">${candidate.sector}</span></div>` : ''}
      ${candidate.salary ? `<div class="info-row"><span class="info-label">Prétentions :</span><span class="info-value">${candidate.salary}</span></div>` : ''}
      ${candidate.availability ? `<div class="info-row"><span class="info-label">Disponibilité :</span><span class="info-value">${candidate.availability}</span></div>` : ''}
      ${candidate.source ? `<div class="info-row"><span class="info-label">Source :</span><span class="info-value">${candidate.source}</span></div>` : ''}
    </div>
  </div>

  ${skills ? `
  <div class="section">
    <div class="section-title">🎯 Compétences</div>
    <div class="skills">
      ${(candidate.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('')}
    </div>
  </div>` : ''}

  ${tags ? `
  <div class="section">
    <div class="section-title">🏷️ Tags</div>
    <p style="color:#6B7280">${tags}</p>
  </div>` : ''}

  ${candidateApplications.length > 0 ? `
  <div class="section">
    <div class="section-title">🗂️ Candidatures</div>
    <table>
      <thead><tr><th>Mission</th><th>Client</th><th>Statut</th><th>Score</th><th>Date</th></tr></thead>
      <tbody>${appRows}</tbody>
    </table>
  </div>` : ''}

  ${candidate.notes ? `
  <div class="section">
    <div class="section-title">💬 Notes Internes</div>
    <div class="notes-box">${candidate.notes}</div>
  </div>` : ''}

  <div class="footer">
    <span>ATS SaaS Platform</span>
    <span>Généré le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
  </div>

  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

/**
 * Importe un fichier JSON
 * @param {File} file - Fichier JSON à importer
 * @returns {Promise<*>} Données parsées
 *
 * @example
 * const data = await importJSON(file);
 */
export async function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
