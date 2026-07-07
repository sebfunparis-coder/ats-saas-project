import React, { useState } from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Button from '@/shared/components/Button/Button';
import { importCSV } from '@/core/utils/exporters';
import { useIsMobile } from '@/core/hooks/useIsMobile';

const CANDIDATE_FIELDS = [
  { key: '', label: '— Ignorer —' },
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
  { key: 'notes', label: 'Notes' },
];

// Devine le champ candidat le plus probable pour un en-tête CSV donné (pré-remplissage)
function guessField(header) {
  const h = header.toLowerCase().trim();
  const matches = {
    name: ['nom', 'name', 'candidat'],
    email: ['email', 'e-mail', 'mail'],
    phone: ['téléphone', 'telephone', 'phone', 'tel'],
    position: ['poste', 'position', 'titre', 'job'],
    location: ['localisation', 'location', 'ville', 'city'],
    experience: ['expérience', 'experience', 'années'],
    status: ['statut', 'status'],
    salary: ['salaire', 'salary'],
    availability: ['disponibilité', 'disponibilite', 'availability'],
    source: ['source'],
    notes: ['notes', 'note', 'commentaire'],
  };
  for (const [field, keywords] of Object.entries(matches)) {
    if (keywords.some(k => h.includes(k))) return field;
  }
  return '';
}

const STEPS = ['Fichier', 'Mapping', 'Aperçu', 'Rapport'];

/**
 * Import CSV candidats avec mapping de colonnes configurable, détection des
 * doublons (par email) et rapport d'import (T-252).
 */
export function ImportCSVModal({ isOpen, onClose, candidates, addCandidate, updateCandidate }) {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [importing, setImporting] = useState(false);
  const [report, setReport] = useState(null);

  const reset = () => {
    setStep(0); setHeaders([]); setRows([]); setMapping({}); setReport(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importCSV(file);
      if (data.length === 0) return;
      const csvHeaders = Object.keys(data[0]);
      const initialMapping = {};
      csvHeaders.forEach(h => { initialMapping[h] = guessField(h); });
      setHeaders(csvHeaders);
      setRows(data);
      setMapping(initialMapping);
      setStep(1);
    } catch {
      // Le fichier n'a pas pu être lu — l'utilisateur reste sur l'étape upload
    }
    e.target.value = '';
  };

  const mapRow = (row) => {
    const candidate = {};
    Object.entries(mapping).forEach(([csvHeader, field]) => {
      if (field) candidate[field] = row[csvHeader] || '';
    });
    if (candidate.experience !== undefined) candidate.experience = Number(candidate.experience) || 0;
    return candidate;
  };

  const findDuplicate = (email) => {
    if (!email) return null;
    return candidates.find(c => (c.email || '').toLowerCase().trim() === email.toLowerCase().trim()) || null;
  };

  const previewRows = rows.slice(0, 5).map(row => {
    const mapped = mapRow(row);
    return { mapped, duplicate: findDuplicate(mapped.email) };
  });

  const duplicateCount = rows.filter(row => findDuplicate(mapRow(row).email)).length;

  const handleImport = async () => {
    setImporting(true);
    let created = 0, updated = 0;
    const errors = [];
    // Copie locale pour détecter aussi les doublons internes au fichier CSV
    const knownByEmail = new Map(candidates.map(c => [(c.email || '').toLowerCase().trim(), c]));

    for (let i = 0; i < rows.length; i++) {
      const candidateData = mapRow(rows[i]);
      if (!candidateData.name) {
        errors.push({ row: i + 2, message: 'Nom manquant — ligne ignorée' });
        continue;
      }
      try {
        const emailKey = (candidateData.email || '').toLowerCase().trim();
        const existing = emailKey ? knownByEmail.get(emailKey) : null;
        if (existing) {
          await updateCandidate(existing.id, candidateData);
          updated++;
        } else {
          const newCandidate = await addCandidate({ ...candidateData, skills: [], tags: [] });
          created++;
          if (emailKey) knownByEmail.set(emailKey, newCandidate);
        }
      } catch (err) {
        errors.push({ row: i + 2, message: err.message || 'Erreur inconnue' });
      }
    }

    setReport({ created, updated, errors });
    setImporting(false);
    setStep(3);
  };

  const selectStyle = { width: '100%', padding: '7px 10px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit' };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <Modal.Header onClose={handleClose}>📥 Import CSV candidats</Modal.Header>

      <Modal.Body>
        {/* Stepper */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {STEPS.map((label, i) => (
            <div key={label} style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: '8px', background: i === step ? '#EEF2FF' : '#F9FAFB', color: i === step ? '#667EEA' : '#9CA3AF', fontSize: '12px', fontWeight: '700' }}>
              {i + 1}. {label}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed #E5E7EB', borderRadius: '12px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
            <p style={{ color: '#6B7280', marginBottom: '16px', fontSize: '14px' }}>Sélectionnez un fichier CSV de candidats à importer.</p>
            <input type="file" accept=".csv" onChange={handleFile} />
          </div>
        )}

        {step === 1 && (
          <div>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
              Associez chaque colonne de votre fichier au champ candidat correspondant ({rows.length} ligne(s) détectée(s)).
            </p>
            <div style={{ display: 'grid', gap: '10px' }}>
              {headers.map(h => (
                <div key={h} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '10px', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={h}>{h}</div>
                  <span style={{ color: '#9CA3AF' }}>→</span>
                  <select value={mapping[h] || ''} onChange={e => setMapping(prev => ({ ...prev, [h]: e.target.value }))} style={selectStyle}>
                    {CANDIDATE_FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
              Aperçu des 5 premières lignes — {rows.length} candidat(s) au total, dont{' '}
              <strong style={{ color: duplicateCount > 0 ? '#F59E0B' : '#6B7280' }}>{duplicateCount} doublon(s)</strong> détecté(s) par email (seront mis à jour, pas dupliqués).
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {previewRows.map((r, i) => (
                <div key={i} style={{ padding: '10px 14px', background: r.duplicate ? '#FFFBEB' : '#F9FAFB', borderRadius: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{r.mapped.name || <em style={{ color: '#EF4444' }}>Nom manquant</em>} — {r.mapped.email || '—'}</span>
                  {r.duplicate && <span style={{ color: '#92400E', fontWeight: '700', fontSize: '11px' }}>🔁 Mise à jour</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && report && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '16px', background: '#ECFDF5', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#10B981' }}>{report.created}</div>
                <div style={{ fontSize: '12px', color: '#065F46', fontWeight: '700' }}>Créés</div>
              </div>
              <div style={{ padding: '16px', background: '#FFFBEB', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#F59E0B' }}>{report.updated}</div>
                <div style={{ fontSize: '12px', color: '#92400E', fontWeight: '700' }}>Mis à jour</div>
              </div>
              <div style={{ padding: '16px', background: report.errors.length > 0 ? '#FEF2F2' : '#F9FAFB', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: '900', color: report.errors.length > 0 ? '#EF4444' : '#9CA3AF' }}>{report.errors.length}</div>
                <div style={{ fontSize: '12px', color: report.errors.length > 0 ? '#991B1B' : '#6B7280', fontWeight: '700' }}>Erreurs</div>
              </div>
            </div>
            {report.errors.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                {report.errors.map((err, i) => (
                  <div key={i} style={{ padding: '8px 12px', background: '#FEF2F2', borderRadius: '8px', fontSize: '12px', color: '#991B1B' }}>
                    Ligne {err.row} : {err.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%' }}>
          {step === 3 ? (
            <Button variant="primary" onClick={handleClose}>Fermer</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={handleClose}>Annuler</Button>
              {step === 1 && <Button variant="primary" onClick={() => setStep(2)} disabled={!Object.values(mapping).includes('name')}>Suivant →</Button>}
              {step === 2 && <Button variant="primary" onClick={handleImport} disabled={importing}>{importing ? 'Import…' : `Importer ${rows.length} candidat(s)`}</Button>}
            </>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default ImportCSVModal;
