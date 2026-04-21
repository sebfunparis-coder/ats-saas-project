/**
 * 📤 File Upload Component
 *
 * Composant d'upload de fichiers avec validation
 */

import React, { useState } from 'react';
import { Button } from '../Button/Button';

export const FileUpload = ({
  candidateId,
  onUploadSuccess,
  onUploadError,
  accept = '.pdf,.doc,.docx',
  maxSize = 5 * 1024 * 1024, // 5MB default
  label = 'Upload CV'
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file size
    if (selectedFile.size > maxSize) {
      setError(`Fichier trop volumineux (max ${formatFileSize(maxSize)})`);
      setFile(null);
      return;
    }

    // Validate file type
    const allowedTypes = accept.split(',').map(t => t.trim());
    const fileExt = '.' + selectedFile.name.split('.').pop().toLowerCase();
    const isValidType = allowedTypes.some(type =>
      type === fileExt || selectedFile.type.includes(type.replace('.', ''))
    );

    if (!isValidType) {
      setError(`Type de fichier invalide (acceptés: ${accept})`);
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !candidateId) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('cv', file);

      const token = localStorage.getItem('ats_token');

      const xhr = new XMLHttpRequest();

      // Progress tracking
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      });

      // Response handling
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            onUploadSuccess?.(data.data);
            setFile(null);
            setProgress(0);
            // Reset file input
            const input = document.querySelector('input[type="file"]');
            if (input) input.value = '';
          } else {
            throw new Error(data.message || 'Upload échoué');
          }
        } else {
          const data = JSON.parse(xhr.responseText);
          throw new Error(data.error || data.message || 'Upload échoué');
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        setError('Erreur réseau lors de l\'upload');
        setUploading(false);
        setProgress(0);
        onUploadError?.('Network error');
      });

      // Send request
      xhr.open('POST', `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/cv/${candidateId}`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);

    } catch (err) {
      setError(err.message || 'Erreur lors de l\'upload');
      setUploading(false);
      setProgress(0);
      onUploadError?.(err.message);
    }
  };

  return (
    <div className="space-y-3">
      {/* File Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Formats acceptés: {accept} • Taille max: {formatFileSize(maxSize)}
        </p>
      </div>

      {/* Selected File Info */}
      {file && !uploading && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📄</span>
            <div>
              <div className="text-sm font-medium text-gray-900">{file.name}</div>
              <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
            </div>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            ✕
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-700">Upload en cours...</span>
            <span className="text-sm font-semibold text-blue-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-red-600">❌</span>
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full"
        icon={uploading ? '⏳' : '📤'}
      >
        {uploading ? `Upload... ${Math.round(progress)}%` : 'Upload le fichier'}
      </Button>
    </div>
  );
};
