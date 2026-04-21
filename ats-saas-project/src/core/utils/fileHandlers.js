/**
 * Utilitaires pour gérer les fichiers (upload, conversion, validation)
 */

/**
 * Convertit un fichier en base64
 * @param {File} file - Fichier à convertir
 * @returns {Promise<string>} Base64 du fichier
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Valide un fichier PDF
 * @param {File} file - Fichier à valider
 * @returns {Object} { isValid, error }
 */
export function validatePDF(file) {
  // Vérifier l'existence du fichier
  if (!file) {
    return { isValid: false, error: 'Aucun fichier sélectionné' };
  }

  // Vérifier le type MIME
  const validTypes = ['application/pdf'];
  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: 'Le fichier doit être au format PDF' };
  }

  // Vérifier la taille (max 5MB pour la démo)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'Le fichier ne doit pas dépasser 5MB' };
  }

  // Vérifier l'extension
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.pdf')) {
    return { isValid: false, error: 'Le fichier doit avoir l\'extension .pdf' };
  }

  return { isValid: true, error: null };
}

/**
 * Valide une image
 * @param {File} file - Fichier à valider
 * @returns {Object} { isValid, error }
 */
export function validateImage(file) {
  if (!file) {
    return { isValid: false, error: 'Aucun fichier sélectionné' };
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: 'Le fichier doit être une image (JPEG, PNG, GIF, WebP)' };
  }

  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'L\'image ne doit pas dépasser 2MB' };
  }

  return { isValid: true, error: null };
}

/**
 * Formate la taille d'un fichier en lecture humaine
 * @param {number} bytes - Taille en bytes
 * @returns {string} Taille formatée
 *
 * @example
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1048576) // "1 MB"
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Télécharge un fichier depuis une base64 string
 * @param {string} base64Data - Données en base64 (avec ou sans préfixe data:)
 * @param {string} filename - Nom du fichier à télécharger
 */
export function downloadBase64File(base64Data, filename) {
  // Créer un lien temporaire
  const link = document.createElement('a');
  link.href = base64Data;
  link.download = filename;
  link.style.display = 'none';

  // Ajouter au DOM, cliquer, puis retirer
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Ouvre un PDF dans un nouvel onglet
 * @param {string} base64Data - PDF en base64
 */
export function openPDFInNewTab(base64Data) {
  const pdfWindow = window.open('');

  if (pdfWindow) {
    pdfWindow.document.write(
      `<iframe width='100%' height='100%' src='${base64Data}'></iframe>`
    );
  }
}

/**
 * Extrait le nom de fichier depuis une base64 data URI
 * @param {string} base64Data - Data URI
 * @returns {string} Type MIME
 */
export function getMimeTypeFromBase64(base64Data) {
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,/);
  return matches ? matches[1] : '';
}

/**
 * Compresse une image (pour les avatars)
 * @param {File} file - Image à compresser
 * @param {number} maxWidth - Largeur max
 * @param {number} maxHeight - Hauteur max
 * @param {number} quality - Qualité (0-1)
 * @returns {Promise<string>} Base64 de l'image compressée
 */
export function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculer les nouvelles dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir en base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };

      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Parse les métadonnées d'un fichier
 * @param {File} file - Fichier
 * @returns {Object} Métadonnées
 */
export function getFileMetadata(file) {
  return {
    name: file.name,
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    type: file.type,
    lastModified: new Date(file.lastModified).toISOString(),
  };
}
