import React, { useState, useEffect, useRef } from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Button from '@/shared/components/Button/Button';
import Input from '@/shared/components/Form/Input';
import CreatableSelect from '@/shared/components/Form/CreatableSelect';
import Textarea from '@/shared/components/Form/Textarea';
import FormField from '@/shared/components/Form/FormField';
import { validateCandidate, isValidEmail, isValidPhone } from '@/core/utils/validators';
import { useDebounce } from '@/core/hooks/useDebounce';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import { useData } from '@/core/contexts/DataContext';
import { fileToBase64, validatePDF, formatFileSize } from '@/core/utils/fileHandlers';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import { useLazyMetiers } from '@/core/hooks/useLazyMetiers';

/**
 * Formulaire de création/édition de candidat avec validation avancée
 */
export function CandidateForm({ candidate = null, isOpen, onClose, onSubmit }) {
  const isEditing = !!candidate;
  const { error: showError, success: showSuccess } = useNotifications();
  const isMobile = useIsMobile();
  const METIERS = useLazyMetiers();

  // 🔥 Récupérer les options dynamiques depuis DataContext
  const {
    candidateStatuses,
    candidateSources,
    candidateSectors,
    addCandidateStatus,
    addCandidateSource,
    addCandidateSector,
    checkCandidateDuplicate,
    tags: allTags = [],
    addTag,
  } = useData();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    skills: '',
    status: 'active',
    location: '',
    experience: 0,
    avatar: '👤',
    color: '#667EEA',
    notes: '',
    videoInterviewUrl: '',
    department: '',
    metier: '',
    sector: 'Tech & IT',
    salary: '',
    availability: '',
    source: 'Site carrière',
    resume: null, // { fileName, fileSize, uploadDate, base64Data }
    legalBasis: 'consent',
    consentDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [isAIParsing, setIsAIParsing] = useState(false);
  const [aiParseError, setAiParseError] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#667EEA');
  const fileInputRef = useRef(null);
  const aiFileInputRef = useRef(null);

  // Debounce pour validation en temps réel
  const debouncedFormData = useDebounce(formData, 300);

  // Validation en temps réel sur les champs modifiés
  useEffect(() => {
    if (Object.keys(touched).length === 0) return;

    const candidateToValidate = {
      ...formData,
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : []
    };

    const validation = validateCandidate(candidateToValidate);

    if (!validation.isValid) {
      const newErrors = {};
      validation.errors.forEach(errorMsg => {
        // Mapper les messages d'erreur aux champs
        if (errorMsg.includes('nom')) newErrors.name = errorMsg;
        else if (errorMsg.includes('email') || errorMsg.includes('Email')) newErrors.email = errorMsg;
        else if (errorMsg.includes('téléphone')) newErrors.phone = errorMsg;
        else if (errorMsg.includes('poste')) newErrors.position = errorMsg;
        else if (errorMsg.includes('localisation')) newErrors.location = errorMsg;
        else if (errorMsg.includes('expérience')) newErrors.experience = errorMsg;
      });
      setErrors(newErrors);
    } else {
      setErrors({});
    }
  }, [debouncedFormData, touched]);

  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        position: candidate.position || '',
        skills: Array.isArray(candidate.skills) ? candidate.skills.join(', ') : '',
        status: candidate.status || 'active',
        location: candidate.location || '',
        experience: candidate.experience || 0,
        avatar: candidate.avatar || '👤',
        color: candidate.color || '#667EEA',
        notes: candidate.notes || '',
        videoInterviewUrl: candidate.videoInterviewUrl || '',
        department: candidate.department || '',
        metier: candidate.metier || '',
        sector: candidate.sector || 'Tech & IT',
        salary: candidate.salary || '',
        availability: candidate.availability || '',
        source: candidate.source || 'Site carrière',
        resume: candidate.resume || null,
        legalBasis: candidate.legalBasis || 'consent',
        consentDate: candidate.consentDate || new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        skills: '',
        status: 'active',
        location: '',
        experience: 0,
        avatar: '👤',
        color: '#667EEA',
        notes: '',
        videoInterviewUrl: '',
        department: '',
        metier: '',
        sector: 'Tech & IT',
        salary: '',
        availability: '',
        source: 'Site carrière',
        resume: null,
        legalBasis: 'consent',
        consentDate: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
    setTouched({});
  }, [candidate, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Vérification doublon sur email
    if (name === 'email' && value) {
      const dup = checkCandidateDuplicate({ email: value }, candidate?.id);
      setDuplicateWarning(dup);
    } else if (name === 'email' && !value) {
      setDuplicateWarning(null);
    }

    // Validation instantanée pour email et phone
    if (name === 'email' && value && !isValidEmail(value)) {
      setErrors((prev) => ({ ...prev, email: 'Email invalide' }));
    } else if (name === 'phone' && value && !isValidPhone(value)) {
      setErrors((prev) => ({ ...prev, phone: 'Téléphone invalide' }));
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  /**
   * Gestion de l'upload du CV PDF
   */
  const handleCVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const validation = validatePDF(file);
    if (!validation.isValid) {
      showError('Fichier invalide', validation.error);
      // Réinitialiser l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      setIsUploadingCV(true);

      // Convertir en base64
      const base64Data = await fileToBase64(file);

      // Créer l'objet resume
      const resumeData = {
        fileName: file.name,
        fileSize: file.size,
        fileSizeFormatted: formatFileSize(file.size),
        uploadDate: new Date().toISOString(),
        base64Data: base64Data,
      };

      setFormData((prev) => ({ ...prev, resume: resumeData }));
      showSuccess('CV uploadé', `${file.name} (${formatFileSize(file.size)})`);
    } catch (error) {
      console.error('Erreur upload CV:', error);
      showError('Erreur d\'upload', 'Impossible de charger le fichier');
    } finally {
      setIsUploadingCV(false);
    }
  };

  /**
   * Supprime le CV uploadé
   */
  const handleRemoveCV = () => {
    setFormData((prev) => ({ ...prev, resume: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showSuccess('CV supprimé', 'Le CV a été retiré');
  };

  /**
   * Extraction PDF.js enrichie — retourne :
   *   fullText   : texte complet joint
   *   condensed  : variante sans espaces entre caractères isolés
   *                (corrige "j t y @ g m a i l . c o m" → "jty@gmail.com")
   *   nameItems  : items avec la plus grande taille de police (= prénom/nom)
   */
  const extractTextFromPDF = async (base64Data) => {
    const empty = { fullText: '', condensed: '', nameItems: [] };
    try {
      // Import dynamique — pdfjs-dist (~272 kB gzippé) ne se charge que lors du
      // premier appel à cette fonction, c'est-à-dire quand l'utilisateur sélectionne
      // un PDF (T-260). Vite détecte le new URL() ci-dessous et émet le worker
      // en asset séparé même à l'intérieur d'une fonction (analyse statique complète du fichier).
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;

      const raw = base64Data.split(',')[1] || base64Data;
      const binary = atob(raw);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const pdf = await pdfjsLib.getDocument({ data: bytes, verbosity: 0 }).promise;
      const maxPages = Math.min(pdf.numPages, 3);
      const allItems = [];

      for (let p = 1; p <= maxPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        for (const item of content.items) {
          if ('str' in item && item.str.trim()) allItems.push(item);
        }
      }

      // Texte complet
      const fullText = allItems.map((i) => i.str).join(' ');

      // Texte condensé : collapse les espaces entre caractères isolés
      // "j t y @ g m a i l . c o m" → "jty@gmail.com"
      // "D J I B R I L" → "DJIBRIL"
      // Collapse uniquement les LETTRES/SYMBOLES isolés séparés par des espaces
      // "j t y @ g m a i l . c o m" → "jty@gmail.com"
      // "06 10 19 09 57" → inchangé (chiffres, ne colle pas le téléphone à l'email)
      const condensed = fullText.replace(/((?:[A-Za-zÀ-ÿ@.\-+_] ){2,}[A-Za-zÀ-ÿ@.\-+_])/g, (m) => m.replace(/ /g, ''));

      // Candidats nom : items avec >= 75% de la hauteur de font maximale (page 1)
      const page1Items = allItems.filter((i) => i.height > 0);
      const maxH = page1Items.length ? Math.max(...page1Items.map((i) => i.height)) : 0;
      const nameItems = maxH > 0
        ? page1Items
            .filter((i) => i.height >= maxH * 0.75 && i.str.trim().length > 1)
            .map((i) => i.str.trim())
            .slice(0, 6)
        : [];

      return { fullText, condensed, nameItems };
    } catch { return empty; }
  };

  /**
   * Parsing enrichi du CV : nom, email, téléphone, poste, expérience,
   * salaire, disponibilité, LinkedIn, compétences, localisation
   */
  const parseCV = async () => {
    if (!formData.resume?.base64Data) return;
    setIsParsing(true);
    setParsedPreview(null);

    await new Promise((r) => setTimeout(r, 800));

    try {
      const { fullText, condensed, nameItems } = await extractTextFromPDF(formData.resume.base64Data);
      const result = {};

      // ── EMAIL ──────────────────────────────────────────────────────────────
      // Cherche dans condensed EN PREMIER (corrige les PDFs avec espacement char)
      // puis fallback sur fullText
      const IGNORE_EMAILS = ['example', 'noreply', 'no-reply', 'donotreply', 'sentry', 'adobe', 'w3.org', 'schema'];
      const findEmail = (src) => {
        for (let i = 0; i < src.length; i++) {
          if (src[i] !== '@') continue;
          let s = i - 1;
          while (s >= 0 && /[^\s@"'<>()\[\],;:\\]/.test(src[s])) s--;
          let e = i + 1;
          while (e < src.length && /[^\s@"'<>()\[\],;:\\]/.test(src[e])) e++;
          const candidate = src.slice(s + 1, e).replace(/[.,;:]+$/, '');
          if (
            candidate.length > 5 &&
            candidate.includes('.') &&
            /\.[a-zA-Z]{2,}$/.test(candidate) &&
            !IGNORE_EMAILS.some((x) => candidate.toLowerCase().includes(x))
          ) return candidate.toLowerCase();
        }
        return null;
      };
      result.email = findEmail(condensed) || findEmail(fullText) || undefined;
      if (!result.email) delete result.email;

      // ── TÉLÉPHONE ──────────────────────────────────────────────────────────
      const phoneCandidates = [...fullText.matchAll(/[\+\d][\d\s.\-()]{5,22}\d/g)]
        .map((m) => ({ raw: m[0].trim(), digits: m[0].replace(/\D/g, '') }))
        .filter((p) => p.digits.length >= 9 && p.digits.length <= 15);

      if (phoneCandidates.length > 0) {
        // Score : favoriser les formats FR et mobiles
        const scored = phoneCandidates.map((p) => {
          let score = 0;
          const d = p.digits;
          const r = p.raw;
          if (r.startsWith('+33'))                          score += 20; // +33 explicite
          if (d.startsWith('33') && d.length === 11)        score += 15; // 33 6/7 XXXXXXXX
          if (d.startsWith('06') || d.startsWith('07'))     score += 12; // mobile FR
          if (d.startsWith('0') && d.length === 10)         score += 8;  // fixe FR
          if (d.length === 10)                               score += 5;  // longueur FR standard
          if (d.length === 11 && d.startsWith('1'))                  score -= 5;  // ISBN/code
          if (/^\d{9,}$/.test(d) && !/[\s.\-]/.test(r))            score -= 2;  // collé sans séparateur
          if (/^(19|20)\d{2}/.test(d) && d.length <= 8)            score -= 30; // année seule (2024...)
          if (/^(19|20)\d{2}(19|20)\d{2}/.test(d))                 score -= 25; // plage d'années (20242026)
          if (d.length === 5 && /^\d{5}$/.test(d))                  score -= 20; // code postal seul
          return { ...p, score };
        });

        const best = scored.sort((a, b) => b.score - a.score)[0];
        result.phone = best.raw.startsWith('+') ? '+' + best.digits : best.digits;
      }

      // LinkedIn
      const linkedinMatch = fullText.match(/linkedin\.com\/in\/[\w%-]+/i);
      if (linkedinMatch) result.linkedin = 'https://' + linkedinMatch[0];

      // ── NOM / PRÉNOM ───────────────────────────────────────────────────────
      const NAME_EXCLUDE = new Set([
        'curriculum','vitae','resume','experience','experiences','formation','formations',
        'competences','contact','profil','about','summary','skills','languages','education',
        'references','objectif','langues','projets','certifications','divers',
        'telephone','email','adresse','disponibilite','mobilite','permis','linkedin',
      ]);
      const ALPHA = /^[A-ZÀ-ÖØ-Ýa-zà-öø-ý\-']{2,25}$/;
      const isRealName = (w) => ALPHA.test(w) && !NAME_EXCLUDE.has(w.toLowerCase());

      // S0 : items PDF avec la plus grande police (= prénom/nom en en-tête)
      if (nameItems.length > 0) {
        // Concaténer les items de grande police, filtrer les mots valides
        const joined = nameItems.join(' ');
        const words = joined.split(/\s+/).filter(isRealName);
        if (words.length >= 2) result.name = words.slice(0, 3).join(' ');
        else if (words.length === 1 && nameItems.length > 1) {
          // Tout concaténer si les items sont des morceaux d'un même nom
          const raw = nameItems.join(' ').replace(/\s+/g, ' ').trim();
          if (raw.length > 2) result.name = raw;
        }
      }

      // S1 : labels explicites "Nom :" et/ou "Prénom :"
      if (!result.name) {
        const nomLbl    = fullText.match(/\bNom\s*[:\-]\s*([A-ZÉÀÂÙÛÊÔÄËÏÖÜÇ][a-zéàâùûêîäëïöüç\-']{1,25})/i);
        const prenomLbl = fullText.match(/\bPrénom\s*[:\-]\s*([A-ZÉÀÂÙÛÊÔÄËÏÖÜÇ][a-zéàâùûêîäëïöüç\-']{1,25})/i);
        if (nomLbl && prenomLbl) result.name = `${prenomLbl[1]} ${nomLbl[1]}`;
        else if (nomLbl) result.name = nomLbl[1];
      }

      // S2 : "CV Prénom Nom" dans le texte
      if (!result.name) {
        const cvInText = fullText.match(/\bCV[\s_\-]+([A-ZÉÀÂÙÛÊÔ][a-zéàâùûêî\-']{1,20}(?:[\s_\-][A-ZÉÀÂÙÛÊÔ][a-zéàâùûêî\-']{1,20})+)/);
        if (cvInText) result.name = cvInText[1].replace(/[_-]/g, ' ').trim();
      }

      // S3 : 2-3 mots PascalCase dans les 500 premiers caractères
      if (!result.name) {
        const header = fullText.slice(0, 500);
        const pascalRe = /([A-ZÉÀÂÙÛÊÔÄËÏÖÜÇ][a-zéàâùûêîäëïöüç\-']{1,20})(?:\s+([A-ZÉÀÂÙÛÊÔÄËÏÖÜÇ][a-zéàâùûêîäëïöüç\-']{1,20})){1,2}/g;
        let pm;
        while ((pm = pascalRe.exec(header)) !== null) {
          const words = pm[0].split(/\s+/).filter(isRealName);
          if (words.length >= 2) { result.name = words.join(' '); break; }
        }
      }

      // S4 : nom du fichier (filet de sécurité absolu)
      if (!result.name) {
        const fileBase = formData.resume.fileName
          .replace(/\.(pdf|PDF)$/, '')
          .replace(/[_.\-]+/g, ' ')          // underscores/tirets → espaces
          .replace(/^(CV|Cv|cv|Resume|RESUME)\s+/i, '')   // "CV" en début
          .replace(/\s+(CV|Cv|cv|Resume|RESUME)$/i, '')   // "CV" en fin
          .replace(/\s+/g, ' ')
          .trim();
        if (fileBase.length > 2) result.name = fileBase;
      }

      // Poste — cherche label explicite ou titre en début de section
      const positionPatterns = [
        /(?:Poste\s*[:\-]\s*)([^\n\r.]{5,60})/i,
        /(?:Titre\s*[:\-]\s*)([^\n\r.]{5,60})/i,
        /(?:Position\s*[:\-]\s*)([^\n\r.]{5,60})/i,
        /(?:Fonction\s*[:\-]\s*)([^\n\r.]{5,60})/i,
        /(?:Profil\s*[:\-]\s*)([^\n\r.]{5,60})/i,
      ];
      for (const pat of positionPatterns) {
        const pm = fullText.match(pat);
        if (pm) { result.position = pm[1].trim(); break; }
      }

      // Salaire (20k–200k ou 20 000–200 000)
      const salaryMatch = fullText.match(/(\d[\d\s]{1,6})\s*[kK]?\s*[€$£]/);
      if (salaryMatch) {
        const num = parseInt(salaryMatch[1].replace(/\s/g, ''));
        if (num >= 20 && num <= 200) result.salary = `${num}k€`;
        else if (num >= 20000 && num <= 200000) result.salary = `${Math.round(num / 1000)}k€`;
      }

      // Disponibilité
      const availMatch = fullText.match(/(?:disponible?|disponibilité\s*[:\-]?)\s*([^\n\r,.]{3,40})/i);
      if (availMatch) result.availability = availMatch[1].trim();

      // Localisation
      const CITIES = [
        'Paris','Lyon','Marseille','Toulouse','Bordeaux','Nantes','Strasbourg','Lille','Rennes','Nice',
        'Montpellier','Grenoble','Tours','Rouen','Reims','Saint-Étienne','Toulon','Dijon','Brest','Angers',
        'Clermont-Ferrand','Metz','Caen','Nancy','Orléans','Besançon','Perpignan',
        'Remote','Télétravail','Full Remote',
      ];
      const cityFound = CITIES.find((c) => new RegExp(`\\b${c.replace('-', '[- ]?')}\\b`, 'i').test(fullText));
      if (cityFound) result.location = cityFound;

      if (Object.keys(result).length === 0) {
        showError('Parsing', 'Aucune information détectée. Remplissez manuellement.');
        return;
      }

      // Toutes les cases cochées par défaut
      const selected = {};
      Object.keys(result).forEach((k) => { selected[k] = true; });
      setParsedPreview({ fields: result, selected });

    } catch {
      showError('Erreur', 'Impossible d\'analyser ce PDF');
    } finally {
      setIsParsing(false);
    }
  };

  /**
   * Applique uniquement les champs sélectionnés (cases cochées)
   */
  const applyParsed = () => {
    if (!parsedPreview) return;
    const { fields, selected } = parsedPreview;
    const updates = {};
    if (selected.name && fields.name) updates.name = fields.name;
    if (selected.email && fields.email) updates.email = fields.email;
    if (selected.phone && fields.phone) updates.phone = fields.phone;
    if (selected.position && fields.position) updates.position = fields.position;
    if (selected.location && fields.location) updates.location = fields.location;
    if (selected.salary && fields.salary) updates.salary = fields.salary;
    if (selected.availability && fields.availability) updates.availability = fields.availability;
    const count = Object.values(selected).filter(Boolean).length;
    setFormData((prev) => ({ ...prev, ...updates }));
    setParsedPreview(null);
    showSuccess('Données importées', `${count} champ(s) pré-rempli(s) depuis le CV`);
  };

  const toggleParsedField = (field) => {
    setParsedPreview((prev) => ({
      ...prev,
      selected: { ...prev.selected, [field]: !prev.selected[field] },
    }));
  };

  const handleAIParseCV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAIParsing(true);
    setAiParseError('');
    try {
      const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const fd = new FormData();
      fd.append('cv', file);
      const res = await fetch(`${BASE}/upload/cv/parse`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || 'Erreur serveur');
      const parsed = json.candidate || json;
      const updates = {};
      if (parsed.firstName || parsed.lastName) updates.name = [parsed.firstName, parsed.lastName].filter(Boolean).join(' ');
      if (parsed.email) updates.email = parsed.email;
      if (parsed.phone) updates.phone = parsed.phone;
      if (parsed.currentPosition || parsed.position) updates.position = parsed.currentPosition || parsed.position;
      if (parsed.location) updates.location = parsed.location;
      if (parsed.skills?.length) updates.skills = Array.isArray(parsed.skills) ? parsed.skills.join(', ') : parsed.skills;
      if (parsed.experience || parsed.experienceYears) updates.experience = parsed.experience || parsed.experienceYears;
      if (parsed.salary) updates.salary = parsed.salary;
      if (parsed.availability) updates.availability = parsed.availability;
      setFormData(prev => ({ ...prev, ...updates }));
      showSuccess('CV analysé par IA', `Champs pré-remplis par Claude AI`);
    } catch (err) {
      setAiParseError(err.message);
      showError('Erreur IA', err.message);
    } finally {
      setIsAIParsing(false);
      if (aiFileInputRef.current) aiFileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const candidateToValidate = {
      ...formData,
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : []
    };

    const validation = validateCandidate(candidateToValidate);

    if (!validation.isValid) {
      const newErrors = {};
      validation.errors.forEach(errorMsg => {
        if (errorMsg.includes('nom')) newErrors.name = errorMsg;
        else if (errorMsg.includes('email') || errorMsg.includes('Email')) newErrors.email = errorMsg;
        else if (errorMsg.includes('téléphone')) newErrors.phone = errorMsg;
        else if (errorMsg.includes('poste')) newErrors.position = errorMsg;
        else if (errorMsg.includes('localisation')) newErrors.location = errorMsg;
        else if (errorMsg.includes('expérience')) newErrors.experience = errorMsg;
      });
      setErrors(newErrors);

      // Afficher notification
      showError('Formulaire invalide', `${validation.errors.length} erreur(s) détectée(s)`);
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Marquer tous les champs comme touchés pour afficher les erreurs
    const allFields = Object.keys(formData);
    const touchedAll = {};
    allFields.forEach(field => touchedAll[field] = true);
    setTouched(touchedAll);

    if (!validate()) return;

    const candidateData = {
      ...(candidate?.id ? { id: candidate.id } : {}),
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      position: formData.position.trim(),
      skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      status: formData.status,
      location: formData.location.trim(),
      experience: parseInt(formData.experience) || 0,
      avatar: formData.avatar,
      color: formData.color,
      notes: formData.notes.trim(),
      videoInterviewUrl: formData.videoInterviewUrl || '',
      department: formData.department.trim(),
      metier: formData.metier.trim(),
      sector: formData.sector,
      salary: formData.salary.trim(),
      availability: formData.availability.trim(),
      source: formData.source,
      resume: formData.resume,
      legalBasis: formData.legalBasis,
      consentDate: formData.consentDate || new Date().toISOString().split('T')[0],
      dateAdded: candidate?.dateAdded || new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0],
      tags: candidate?.tags || [],
      favorite: candidate?.favorite || false,
      links: candidate?.links || [],
      documents: candidate?.documents || [],
    };

    onSubmit(candidateData);
    showSuccess(
      isEditing ? 'Candidat modifié' : 'Candidat ajouté',
      `${candidateData.name} a été ${isEditing ? 'modifié' : 'ajouté'} avec succès`
    );
  };

  const twoColumnsStyles = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: '16px',
  };

  const sectionTitleStyles = {
    fontSize: '14px',
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '16px',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '2px solid #E5E7EB',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>
        {isEditing ? '✏️ Modifier le candidat' : '➕ Nouveau candidat'}
      </Modal.Header>

      <Modal.Body>
        {/* T-288 — Rappel légal anti-discrimination affiché à chaque ouverture du formulaire */}
        <div style={{
          padding: '12px 16px',
          background: '#FFF7ED',
          border: '1px solid #FED7AA',
          borderRadius: '10px',
          marginBottom: '20px',
          fontSize: '13px',
          color: '#92400E',
          lineHeight: 1.5,
        }}>
          <strong>⚖️ Rappel légal :</strong> le recrutement ne peut être fondé sur des critères discriminatoires (Art. L. 1132-1 du Code du travail). Sont notamment interdits : l'origine, le sexe, l'âge, l'état de santé, le handicap, la religion, les opinions politiques, l'orientation sexuelle. Seules les compétences et aptitudes professionnelles peuvent guider votre décision.{' '}
          <a href="/non-discrimination" style={{ color: '#B45309', fontWeight: '700' }} target="_blank" rel="noopener noreferrer">Politique anti-discrimination →</a>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          <div>
            <h3 style={sectionTitleStyles}>👤 Informations Personnelles</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <FormField label="Nom complet *" error={errors.name}>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ex: Alice Martin"
                />
              </FormField>

              {/* Avertissement doublon */}
              {duplicateWarning && (
                <div style={{
                  padding: '12px 16px', borderRadius: '10px', marginBottom: '4px',
                  background: '#FFFBEB', border: '1.5px solid #F59E0B',
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                }}>
                  <span style={{ fontSize: '20px' }}>⚠️</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#92400E', marginBottom: '2px' }}>
                      Doublon potentiel détecté
                    </div>
                    <div style={{ fontSize: '12px', color: '#78350F' }}>
                      {duplicateWarning.type === 'email'
                        ? `Un candidat avec cet email existe déjà : ${duplicateWarning.existing.name}`
                        : `Un candidat avec ce nom et téléphone existe déjà : ${duplicateWarning.existing.name}`}
                    </div>
                  </div>
                </div>
              )}

              <div style={twoColumnsStyles}>
                <FormField label="Email *" error={errors.email}>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ex: alice@email.com"
                  />
                </FormField>

                <FormField label="Téléphone" error={errors.phone}>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ex: +33612345678"
                  />
                </FormField>
              </div>

              <div style={twoColumnsStyles}>
                <FormField label="Localisation" error={errors.location}>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ex: Paris"
                  />
                </FormField>

                <FormField label="Département">
                  <Input
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Ex: 75"
                  />
                </FormField>
              </div>

              <div style={twoColumnsStyles}>
                <FormField label="Avatar">
                  <Input
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="👤"
                    maxLength={2}
                  />
                </FormField>

                <FormField label="Couleur">
                  <Input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                  />
                </FormField>
              </div>
            </div>
          </div>

          <div>
            <h3 style={sectionTitleStyles}>💼 Profil Professionnel</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <FormField label="Poste recherché *" error={errors.position}>
                <CreatableSelect
                  name="position"
                  value={formData.position}
                  options={METIERS}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ex: Développeur Full Stack"
                />
              </FormField>

              <div style={twoColumnsStyles}>
                <FormField label="Métier">
                  <CreatableSelect
                    name="metier"
                    value={formData.metier}
                    options={METIERS}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ex: Développeur Full Stack"
                  />
                </FormField>

                <FormField label="Secteur">
                  <CreatableSelect
                    name="sector"
                    value={formData.sector}
                    options={candidateSectors}
                    onChange={handleChange}
                    onCreateOption={addCandidateSector}
                    placeholder="Sélectionner ou créer..."
                  />
                </FormField>
              </div>

              <div style={twoColumnsStyles}>
                <FormField label="Expérience (années)">
                  <Input
                    type="number"
                    name="experience"
                    min="0"
                    value={formData.experience}
                    onChange={handleChange}
                  />
                </FormField>

                <FormField label="Statut">
                  <CreatableSelect
                    name="status"
                    value={formData.status}
                    options={candidateStatuses}
                    onChange={handleChange}
                    onCreateOption={addCandidateStatus}
                    placeholder="Sélectionner ou créer..."
                  />
                </FormField>
              </div>

              <div style={twoColumnsStyles}>
                <FormField label="Prétentions salariales">
                  <Input
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="Ex: 55k€"
                  />
                </FormField>

                <FormField label="Disponibilité">
                  <Input
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    placeholder="Ex: Immédiate"
                  />
                </FormField>
              </div>

              <FormField label="Source">
                <CreatableSelect
                  name="source"
                  value={formData.source}
                  options={candidateSources}
                  onChange={handleChange}
                  onCreateOption={addCandidateSource}
                  placeholder="Sélectionner ou créer..."
                />
              </FormField>
            </div>
          </div>

          <div>
            <h3 style={sectionTitleStyles}>🎯 Compétences & Notes</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <FormField label="Compétences (séparées par des virgules)">
                <Textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="Ex: React, Node.js, TypeScript"
                  rows={3}
                />
              </FormField>

              <FormField label="🎥 Lien entretien vidéo (Zoom / Meet / Teams)">
                <Input
                  type="url"
                  name="videoInterviewUrl"
                  value={formData.videoInterviewUrl}
                  onChange={handleChange}
                  placeholder="https://zoom.us/j/... ou https://meet.google.com/..."
                />
              </FormField>

              <FormField label="Notes internes">
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Notes privées..."
                  rows={4}
                />
              </FormField>
            </div>
          </div>

          {/* Section AI CV Parser */}
          <div>
            <h3 style={sectionTitleStyles}>🤖 Analyse IA du CV</h3>
            <div style={{
              padding: '20px', borderRadius: '12px', border: '2px dashed #8B5CF6',
              background: isAIParsing ? '#F5F3FF' : '#FAFAFF', textAlign: 'center',
            }}>
              {isAIParsing ? (
                <div>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>⏳</div>
                  <div style={{ fontWeight: '700', color: '#7C3AED' }}>Analyse IA en cours…</div>
                  <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>Claude analyse votre CV</div>
                </div>
              ) : (
                <>
                  <input
                    ref={aiFileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleAIParseCV}
                    style={{ display: 'none' }}
                    id="ai-cv-parse"
                  />
                  <label htmlFor="ai-cv-parse" style={{ cursor: 'pointer' }}>
                    <div style={{ fontSize: '40px', marginBottom: '8px' }}>🤖</div>
                    <div style={{ fontWeight: '700', color: '#7C3AED', marginBottom: '4px' }}>
                      Parser le CV avec Claude AI
                    </div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                      Déposez un PDF · Claude extrait automatiquement toutes les infos
                    </div>
                  </label>
                  {aiParseError && (
                    <div style={{ marginTop: '10px', padding: '8px 12px', background: '#FEF2F2', borderRadius: '8px', color: '#DC2626', fontSize: '13px' }}>
                      {aiParseError}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Section CV PDF */}
          <div>
            <h3 style={sectionTitleStyles}>📄 CV / Documents</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <FormField label="CV (PDF uniquement, max 5MB)">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Bouton upload */}
                  {!formData.resume && (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleCVUpload}
                        style={{ display: 'none' }}
                        id="cv-upload"
                      />
                      <label htmlFor="cv-upload">
                        <div
                          style={{
                            padding: '20px',
                            border: '2px dashed #D1D5DB',
                            borderRadius: '12px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            background: '#F9FAFB',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#667EEA';
                            e.currentTarget.style.background = '#EEF2FF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#D1D5DB';
                            e.currentTarget.style.background = '#F9FAFB';
                          }}
                        >
                          <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                            {isUploadingCV ? '⏳' : '📄'}
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#667EEA', marginBottom: '4px' }}>
                            {isUploadingCV ? 'Upload en cours...' : 'Cliquez pour uploader un CV'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>
                            PDF uniquement, max 5MB
                          </div>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Aperçu du CV uploadé */}
                  {formData.resume && (
                    <div
                      style={{
                        padding: '16px',
                        background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                        borderRadius: '12px',
                        border: '2px solid #667EEA',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <div style={{ fontSize: '40px' }}>📄</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>
                          {formData.resume.fileName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>
                          {formData.resume.fileSizeFormatted} • Uploadé le{' '}
                          {new Date(formData.resume.uploadDate).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCV}
                        style={{
                          padding: '8px 12px',
                          background: '#EF4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '12px',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#DC2626')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#EF4444')}
                      >
                        🗑️ Retirer
                      </button>
                    </div>
                  )}
                </div>
              </FormField>

              {formData.resume && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={parseCV}
                    disabled={isParsing}
                    style={{
                      padding: '10px 18px', border: '1.5px solid #667EEA',
                      borderRadius: '10px', background: isParsing ? '#EEF2FF' : 'white',
                      color: '#667EEA', cursor: isParsing ? 'wait' : 'pointer',
                      fontWeight: '700', fontSize: '13px', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => { if (!isParsing) { e.currentTarget.style.background = '#667EEA'; e.currentTarget.style.color = 'white'; } }}
                    onMouseLeave={(e) => { if (!isParsing) { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#667EEA'; } }}
                  >
                    {isParsing ? '⏳ Analyse en cours...' : '🔍 Analyser le CV pour pré-remplir'}
                  </button>

                  {parsedPreview && (() => {
                    const FIELD_META = {
                      name:         { icon: '👤', label: 'Nom' },
                      email:        { icon: '✉️', label: 'Email' },
                      phone:        { icon: '📱', label: 'Téléphone' },
                      position:     { icon: '💼', label: 'Poste' },
                      location:     { icon: '📍', label: 'Ville' },
                      experience:   { icon: '📅', label: 'Expérience' },
                      salary:       { icon: '💰', label: 'Salaire' },
                      availability: { icon: '🗓️', label: 'Disponibilité' },
                      linkedin:     { icon: '🔗', label: 'LinkedIn' },
                      skills:       { icon: '🎯', label: 'Compétences' },
                    };
                    const { fields, selected } = parsedPreview;
                    const selectedCount = Object.values(selected).filter(Boolean).length;
                    return (
                      <div style={{
                        padding: '16px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                        border: '1.5px solid #10B981',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: '#065F46' }}>
                            ✅ {Object.keys(fields).length} champ(s) détecté(s)
                          </div>
                          <div style={{ fontSize: '11px', color: '#6B7280' }}>
                            Cochez les champs à importer
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                          {Object.entries(fields).map(([key, value]) => {
                            const meta = FIELD_META[key] || { icon: '•', label: key };
                            const displayVal = key === 'experience' ? `${value} ans` : String(value);
                            const alreadyFilled = !!formData[key] && formData[key] !== 0 && formData[key] !== '';
                            return (
                              <label
                                key={key}
                                style={{
                                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                                  padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
                                  background: selected[key] ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.03)',
                                  border: `1px solid ${selected[key] ? '#A7F3D0' : '#E5E7EB'}`,
                                  transition: 'all 0.15s',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={!!selected[key]}
                                  onChange={() => toggleParsedField(key)}
                                  style={{ marginTop: '2px', accentColor: '#10B981', cursor: 'pointer' }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#374151' }}>
                                    {meta.icon} {meta.label}
                                  </span>
                                  {alreadyFilled && (
                                    <span style={{ fontSize: '11px', color: '#F59E0B', marginLeft: '6px', fontWeight: '600' }}>
                                      ⚠️ écrase la valeur actuelle
                                    </span>
                                  )}
                                  <div style={{
                                    fontSize: '11px', color: '#6B7280', marginTop: '2px',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                  }}>
                                    {displayVal}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={applyParsed}
                            disabled={selectedCount === 0}
                            style={{
                              padding: '8px 16px',
                              background: selectedCount === 0 ? '#D1D5DB' : '#10B981',
                              color: 'white', border: 'none', borderRadius: '8px',
                              cursor: selectedCount === 0 ? 'not-allowed' : 'pointer',
                              fontWeight: '700', fontSize: '12px',
                            }}
                          >
                            ✅ Importer ({selectedCount})
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const allSelected = Object.keys(fields).reduce((acc, k) => ({ ...acc, [k]: true }), {});
                              setParsedPreview((p) => ({ ...p, selected: allSelected }));
                            }}
                            style={{
                              padding: '8px 12px', background: 'white', color: '#10B981',
                              border: '1px solid #10B981', borderRadius: '8px', cursor: 'pointer',
                              fontWeight: '600', fontSize: '11px',
                            }}
                          >
                            Tout sélectionner
                          </button>
                          <button
                            type="button"
                            onClick={() => setParsedPreview(null)}
                            style={{
                              padding: '8px 12px', background: 'white', color: '#6B7280',
                              border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer',
                              fontWeight: '600', fontSize: '11px', marginLeft: 'auto',
                            }}
                          >
                            Ignorer
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
          {/* Section RGPD */}
          <div>
            <h3 style={sectionTitleStyles}>🔒 Conformité RGPD</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', padding: '16px', background: '#F0FDF4', borderRadius: '12px', border: '1.5px solid #BBF7D0' }}>
              <FormField label="Base légale du traitement">
                <select
                  name="legalBasis"
                  value={formData.legalBasis}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', background: 'white' }}
                >
                  <option value="consent">Consentement explicite</option>
                  <option value="legitimate_interest">Intérêt légitime</option>
                  <option value="contract">Exécution d'un contrat</option>
                </select>
              </FormField>
              <FormField label="Date de consentement">
                <input
                  type="date"
                  name="consentDate"
                  value={formData.consentDate}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', background: 'white' }}
                />
              </FormField>
              <div style={{ gridColumn: '1 / -1', fontSize: '12px', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>ℹ️</span>
                <span>Conforme au RGPD — Une alerte sera générée automatiquement 2 ans après la date de consentement pour renouvellement.</span>
              </div>
            </div>
          </div>

          {/* Labels personnalisés */}
          {(() => {
            const currentTags = formData.tags || [];
            const createLabel = () => {
              if (!newLabel.trim()) return;
              addTag && addTag({ name: newLabel.trim(), color: newColor });
              setNewLabel('');
            };
            return (
              <div>
                <h3 style={sectionTitleStyles}>🏷️ Labels personnalisés</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {allTags.map(tag => {
                    const active = currentTags.includes(tag.id);
                    return (
                      <label key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '20px', border: `2px solid ${active ? tag.color : '#E5E7EB'}`, background: active ? tag.color : 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <input type="checkbox" checked={active} onChange={() => {
                          const next = active ? currentTags.filter(id => id !== tag.id) : [...currentTags, tag.id];
                          setFormData(p => ({ ...p, tags: next }));
                        }} style={{ display: 'none' }} />
                        <span style={{ fontSize: '12px', fontWeight: '700', color: active ? 'white' : '#374151' }}>{tag.name}</span>
                      </label>
                    );
                  })}
                  {allTags.length === 0 && <span style={{ fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic' }}>Aucun label. Créez-en un ci-dessous.</span>}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input value={newLabel} onChange={e => setNewLabel(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); createLabel(); } }} placeholder="Nom du label (ex: Top profil)" style={{ flex: 1, padding: '8px 10px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit' }} />
                  <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} style={{ width: '36px', height: '36px', border: 'none', padding: '2px', borderRadius: '6px', cursor: 'pointer' }} />
                  <button type="button" onClick={createLabel} style={{ padding: '8px 14px', background: newColor, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>+ Créer</button>
                </div>
              </div>
            );
          })()}

        </form>
      </Modal.Body>

      <Modal.Footer>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEditing ? '✅ Enregistrer' : '➕ Créer'}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default CandidateForm;
