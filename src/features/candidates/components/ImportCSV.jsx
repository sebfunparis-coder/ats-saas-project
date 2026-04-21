/**
 * 📥 Import CSV Component
 *
 * Modal pour importer des candidats depuis un fichier CSV
 */

import React, { useState, useRef } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from '@/shared/components';

export const ImportCSV = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Veuillez sélectionner un fichier CSV');
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Parse CSV for preview
    try {
      const text = await selectedFile.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length === 0) {
        setError('Le fichier CSV est vide');
        setPreview(null);
        return;
      }

      // Parse header
      const header = lines[0].split(',').map(h => h.trim());

      // Parse first few rows for preview
      const previewRows = lines.slice(1, 4).map(line => {
        const values = line.split(',').map(v => v.trim());
        return header.reduce((obj, key, idx) => {
          obj[key] = values[idx] || '';
          return obj;
        }, {});
      });

      setPreview({
        header,
        rows: previewRows,
        totalRows: lines.length - 1
      });
    } catch (err) {
      console.error('CSV parsing error:', err);
      setError('Erreur lors de la lecture du fichier');
      setPreview(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length <= 1) {
        throw new Error('Le fichier ne contient aucune donnée');
      }

      // Parse header
      const header = lines[0].split(',').map(h => h.trim().toLowerCase());

      // Required fields
      const requiredFields = ['firstname', 'lastname', 'email'];
      const missingFields = requiredFields.filter(field => !header.includes(field));

      if (missingFields.length > 0) {
        throw new Error(`Colonnes manquantes: ${missingFields.join(', ')}`);
      }

      // Parse all rows
      const candidates = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const candidate = {};

        header.forEach((key, idx) => {
          const value = values[idx] || '';

          // Map CSV columns to candidate fields
          switch(key.toLowerCase()) {
            case 'firstname':
            case 'prénom':
            case 'prenom':
              candidate.firstName = value;
              break;
            case 'lastname':
            case 'nom':
              candidate.lastName = value;
              break;
            case 'email':
              candidate.email = value;
              break;
            case 'phone':
            case 'téléphone':
            case 'telephone':
              candidate.phone = value;
              break;
            case 'position':
            case 'poste':
              candidate.position = value;
              break;
            case 'experience':
            case 'expérience':
              candidate.experience = value;
              break;
            case 'sector':
            case 'secteur':
              candidate.sector = value;
              break;
            case 'location':
            case 'localisation':
              candidate.location = value;
              break;
            case 'skills':
            case 'compétences':
            case 'competences':
              candidate.skills = value ? value.split(';').map(s => s.trim()).filter(Boolean) : [];
              break;
            case 'status':
            case 'statut':
              candidate.status = value || 'new';
              break;
            case 'rating':
            case 'note':
              candidate.rating = parseFloat(value) || 0;
              break;
            case 'available':
            case 'disponible':
              candidate.available = value.toLowerCase() === 'true' || value.toLowerCase() === 'oui' || value === '1';
              break;
            default:
              // Ignore unknown columns
              break;
          }
        });

        // Only add if has required fields
        if (candidate.firstName && candidate.lastName && candidate.email) {
          // Set defaults
          candidate.status = candidate.status || 'new';
          candidate.rating = candidate.rating || 0;
          candidate.available = candidate.available !== undefined ? candidate.available : true;
          candidate.skills = candidate.skills || [];

          candidates.push(candidate);
        }
      }

      if (candidates.length === 0) {
        throw new Error('Aucun candidat valide trouvé dans le fichier');
      }

      // Call onImport with parsed data
      await onImport(candidates);

      // Reset and close
      setFile(null);
      setPreview(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message || 'Erreur lors de l\'importation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="large">
      <ModalHeader>
        📥 Importer des candidats (CSV)
      </ModalHeader>

      <ModalBody>
        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Format du fichier CSV</h4>
            <p className="text-sm text-blue-800 mb-2">
              Votre fichier doit contenir au minimum ces colonnes (ordre flexible):
            </p>
            <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
              <li><strong>firstName</strong> ou <strong>prénom</strong> (obligatoire)</li>
              <li><strong>lastName</strong> ou <strong>nom</strong> (obligatoire)</li>
              <li><strong>email</strong> (obligatoire)</li>
              <li><strong>phone</strong> ou <strong>téléphone</strong> (optionnel)</li>
              <li><strong>position</strong> ou <strong>poste</strong> (optionnel)</li>
              <li><strong>experience</strong> ou <strong>expérience</strong> (optionnel)</li>
              <li><strong>sector</strong> ou <strong>secteur</strong> (optionnel)</li>
              <li><strong>location</strong> ou <strong>localisation</strong> (optionnel)</li>
              <li><strong>skills</strong> ou <strong>compétences</strong> (optionnel, séparées par ;)</li>
              <li><strong>status</strong> ou <strong>statut</strong> (optionnel, par défaut: new)</li>
              <li><strong>rating</strong> ou <strong>note</strong> (optionnel, 0-5)</li>
              <li><strong>available</strong> ou <strong>disponible</strong> (optionnel, true/false)</li>
            </ul>
          </div>

          {/* File input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner un fichier CSV
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isProcessing}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                Aperçu ({preview.totalRows} ligne{preview.totalRows > 1 ? 's' : ''} au total)
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {preview.header.map((h, idx) => (
                        <th key={idx} className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row, idx) => (
                      <tr key={idx} className="border-b">
                        {preview.header.map((h, colIdx) => (
                          <td key={colIdx} className="px-3 py-2 text-gray-900">
                            {row[h] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.totalRows > 3 && (
                <p className="text-xs text-gray-500 mt-2">
                  ... et {preview.totalRows - 3} autre{preview.totalRows - 3 > 1 ? 's' : ''} ligne{preview.totalRows - 3 > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button
          variant="secondary"
          onClick={handleCancel}
          disabled={isProcessing}
        >
          Annuler
        </Button>
        <Button
          onClick={handleImport}
          disabled={!file || isProcessing}
          icon={isProcessing ? '⏳' : '📥'}
        >
          {isProcessing ? 'Importation...' : 'Importer'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
