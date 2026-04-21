/**
 * ✅ Validation Middleware
 *
 * Validations avec express-validator pour toutes les entités
 */

import { body, param, query } from 'express-validator';

// ===== AUTH VALIDATIONS =====

export const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('company')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom de l\'entreprise doit contenir entre 2 et 100 caractères'),
  body('plan')
    .optional()
    .isIn(['Starter', 'Pro', 'Enterprise'])
    .withMessage('Plan invalide')
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
];

export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Le mot de passe actuel est requis'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre')
];

// ===== MISSION VALIDATIONS =====

export const validateMission = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le titre doit contenir entre 3 et 200 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('La description ne peut pas dépasser 5000 caractères'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le nom de l\'entreprise ne peut pas dépasser 100 caractères'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le département ne peut pas dépasser 100 caractères'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La localisation ne peut pas dépasser 100 caractères'),
  body('contract')
    .optional()
    .isIn(['CDI', 'CDD', 'Freelance', 'Stage'])
    .withMessage('Type de contrat invalide'),
  body('remote')
    .optional()
    .isIn(['Sur site', 'Hybride', 'Full remote'])
    .withMessage('Mode de travail invalide'),
  body('status')
    .optional()
    .isIn(['draft', 'active', 'paused', 'closed'])
    .withMessage('Statut invalide')
];

// ===== CANDIDATE VALIDATIONS =====

export const validateCandidate = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\+\-\(\)]+$/)
    .withMessage('Numéro de téléphone invalide'),
  body('position')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le poste doit contenir entre 2 et 100 caractères'),
  body('experience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('L\'expérience doit être un nombre entre 0 et 50'),
  body('experienceLevel')
    .optional()
    .isIn(['Junior', 'Confirmé', 'Senior', 'Expert'])
    .withMessage('Niveau d\'expérience invalide'),
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'interview', 'offer', 'hired', 'rejected'])
    .withMessage('Statut invalide'),
  body('availability')
    .optional()
    .isIn(['Immédiate', '1 mois', '2 mois', '3 mois+'])
    .withMessage('Disponibilité invalide'),
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('La note doit être entre 0 et 5')
];

// ===== APPLICATION VALIDATIONS =====

export const validateApplication = [
  body('missionId')
    .isMongoId()
    .withMessage('ID de mission invalide'),
  body('candidateId')
    .isMongoId()
    .withMessage('ID de candidat invalide'),
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('La lettre de motivation ne peut pas dépasser 2000 caractères'),
  body('salaryExpectation')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Le salaire doit être un nombre positif')
];

export const validateApplicationStatus = [
  body('status')
    .isIn(['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'])
    .withMessage('Statut invalide')
];

export const validateInterview = [
  body('type')
    .isIn(['phone', 'video', 'onsite', 'technical'])
    .withMessage('Type d\'entretien invalide'),
  body('scheduledAt')
    .isISO8601()
    .withMessage('Date invalide'),
  body('interviewer')
    .optional()
    .isMongoId()
    .withMessage('ID d\'intervieweur invalide')
];

// ===== CLIENT VALIDATIONS =====

export const validateClient = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('type')
    .optional()
    .isIn(['company', 'individual'])
    .withMessage('Type invalide'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('URL invalide'),
  body('status')
    .optional()
    .isIn(['lead', 'prospect', 'active', 'inactive'])
    .withMessage('Statut invalide')
];

export const validateContact = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('isPrimary')
    .optional()
    .isBoolean()
    .withMessage('isPrimary doit être un booléen')
];

// ===== TEAM VALIDATIONS =====

export const validateTeamMember = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('role')
    .isIn(['Admin', 'Recruteur', 'Manager', 'Consultant'])
    .withMessage('Rôle invalide'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Les permissions doivent être un tableau')
];

// ===== EVENT VALIDATIONS =====

export const validateEvent = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le titre doit contenir entre 3 et 200 caractères'),
  body('type')
    .isIn(['interview', 'meeting', 'call', 'deadline', 'other'])
    .withMessage('Type d\'événement invalide'),
  body('startDate')
    .isISO8601()
    .withMessage('Date de début invalide'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Date de fin invalide'),
  body('status')
    .optional()
    .isIn(['scheduled', 'completed', 'cancelled', 'rescheduled'])
    .withMessage('Statut invalide'),
  body('missionId')
    .optional()
    .isMongoId()
    .withMessage('ID de mission invalide'),
  body('candidateId')
    .optional()
    .isMongoId()
    .withMessage('ID de candidat invalide'),
  body('applicationId')
    .optional()
    .isMongoId()
    .withMessage('ID de candidature invalide')
];

// ===== USER VALIDATIONS =====

export const validateUser = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('role')
    .optional()
    .isIn(['user', 'admin', 'superadmin'])
    .withMessage('Rôle invalide')
];

export const validateUserRole = [
  body('role')
    .isIn(['user', 'admin', 'superadmin'])
    .withMessage('Rôle invalide')
];

export const validateResetPassword = [
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre')
];

// ===== PARAM VALIDATIONS =====

export const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('ID invalide')
];

// ===== QUERY VALIDATIONS =====

export const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit doit être entre 1 et 100'),
  query('skip')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Skip doit être un nombre positif')
];

// Export par défaut
export default {
  // Auth
  validateRegister,
  validateLogin,
  validateChangePassword,
  // Mission
  validateMission,
  // Candidate
  validateCandidate,
  // Application
  validateApplication,
  validateApplicationStatus,
  validateInterview,
  // Client
  validateClient,
  validateContact,
  // Team
  validateTeamMember,
  // Event
  validateEvent,
  // User
  validateUser,
  validateUserRole,
  validateResetPassword,
  // Generic
  validateMongoId,
  validatePagination
};
