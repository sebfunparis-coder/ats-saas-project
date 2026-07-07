/**
 * 📖 OpenAPI 3.0 Spec — ATS Ultimate API
 *
 * Spec centralisée (pas de JSDoc dispersé dans les routes).
 * Consultable sur GET /api/docs
 * Exportable en JSON sur GET /api/docs/spec.json
 */

import swaggerJsdoc from 'swagger-jsdoc';

// ── Composants réutilisables ───────────────────────────────────────────────────

const schemas = {
  // ── Auth ──
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'alice@acme.com' },
      password: { type: 'string', example: 'MySecret123!' },
    },
  },
  RegisterRequest: {
    type: 'object',
    required: ['firstName', 'lastName', 'email', 'password', 'companyName'],
    properties: {
      firstName: { type: 'string', example: 'Alice' },
      lastName: { type: 'string', example: 'Martin' },
      email: { type: 'string', format: 'email', example: 'alice@acme.com' },
      password: { type: 'string', minLength: 8, example: 'MySecret123!' },
      companyName: { type: 'string', example: 'Acme Corp' },
    },
  },
  AuthResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
    },
  },
  TwoFactorChallengeResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        properties: {
          requiresTwoFactor: { type: 'boolean', example: true },
          tempToken: { type: 'string', example: 'eyJ...' },
        },
      },
    },
  },

  // ── User ──
  User: {
    type: 'object',
    properties: {
      id: { type: 'string', example: '65a1b2c3d4e5f6a7b8c9d0e1' },
      email: { type: 'string', format: 'email' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      fullName: { type: 'string' },
      role: { type: 'string', enum: ['user', 'recruiter', 'manager', 'admin', 'superadmin'] },
      companyId: { type: 'string' },
      companyName: { type: 'string' },
      companyPlan: { type: 'string', enum: ['starter', 'pro', 'enterprise'] },
      twoFactorEnabled: { type: 'boolean' },
    },
  },

  // ── Mission ──
  Mission: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      title: { type: 'string', example: 'Développeur React Senior' },
      description: { type: 'string' },
      department: { type: 'string', example: 'Engineering' },
      location: { type: 'string', example: 'Paris, France' },
      contract: { type: 'string', enum: ['CDI', 'CDD', 'Freelance', 'Stage', 'Alternance'] },
      remote: { type: 'string', enum: ['none', 'partial', 'full'] },
      salary: {
        type: 'object',
        properties: {
          min: { type: 'number', example: 50000 },
          max: { type: 'number', example: 70000 },
          currency: { type: 'string', example: 'EUR' },
        },
      },
      skills: { type: 'array', items: { type: 'string' }, example: ['React', 'TypeScript'] },
      status: { type: 'string', enum: ['draft', 'active', 'paused', 'closed'] },
      companyId: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  MissionInput: {
    type: 'object',
    required: ['title', 'contract'],
    properties: {
      title: { type: 'string', example: 'Développeur React Senior' },
      description: { type: 'string' },
      department: { type: 'string' },
      location: { type: 'string' },
      contract: { type: 'string', enum: ['CDI', 'CDD', 'Freelance', 'Stage', 'Alternance'] },
      remote: { type: 'string', enum: ['none', 'partial', 'full'] },
      salary: { type: 'object', properties: { min: { type: 'number' }, max: { type: 'number' }, currency: { type: 'string' } } },
      skills: { type: 'array', items: { type: 'string' } },
      status: { type: 'string', enum: ['draft', 'active'] },
    },
  },

  // ── Candidate ──
  Candidate: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      firstName: { type: 'string', example: 'Jean' },
      lastName: { type: 'string', example: 'Dupont' },
      email: { type: 'string', format: 'email' },
      phone: { type: 'string' },
      position: { type: 'string', example: 'Développeur Full Stack' },
      status: { type: 'string', enum: ['active', 'passive', 'hired', 'archived'] },
      rating: { type: 'number', minimum: 0, maximum: 5 },
      skills: { type: 'array', items: { type: 'string' } },
      cvUrl: { type: 'string' },
      companyId: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  CandidateInput: {
    type: 'object',
    required: ['firstName', 'lastName', 'email'],
    properties: {
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string', format: 'email' },
      phone: { type: 'string' },
      position: { type: 'string' },
      status: { type: 'string', enum: ['active', 'passive', 'hired', 'archived'] },
      skills: { type: 'array', items: { type: 'string' } },
      location: { type: 'string' },
      notes: { type: 'string' },
    },
  },

  // ── Application ──
  Application: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      candidateId: { type: 'string' },
      missionId: { type: 'string' },
      status: {
        type: 'string',
        enum: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'],
      },
      score: { type: 'number', minimum: 0, maximum: 100 },
      notes: { type: 'string' },
      companyId: { type: 'string' },
      appliedAt: { type: 'string', format: 'date-time' },
    },
  },

  // ── ApiKey ──
  ApiKey: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      name: { type: 'string', example: 'CI/CD Pipeline' },
      keyPrefix: { type: 'string', example: 'sk_live_xxxxx' },
      scopes: {
        type: 'array',
        items: { type: 'string' },
        example: ['missions:read', 'candidates:read'],
      },
      isActive: { type: 'boolean' },
      lastUsedAt: { type: 'string', format: 'date-time', nullable: true },
      expiresAt: { type: 'string', format: 'date-time', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  ApiKeyCreated: {
    allOf: [
      { $ref: '#/components/schemas/ApiKey' },
      {
        type: 'object',
        properties: {
          key: {
            type: 'string',
            example: 'sk_live_...',
            description: 'Clé brute — affichée une seule fois',
          },
        },
      },
    ],
  },

  // ── Pagination wrapper ──
  PaginatedResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: { type: 'array', items: {} },
      pagination: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          page: { type: 'integer' },
          limit: { type: 'integer' },
          hasMore: { type: 'boolean' },
        },
      },
    },
  },

  // ── Errors ──
  Error: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string', example: 'Ressource non trouvée' },
      statusCode: { type: 'integer', example: 404 },
    },
  },
};

// ── Paths ────────────────────────────────────────────────────────────────────

const paths = {

  // ── AUTH ──────────────────────────────────────────────────────────────────

  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Inscription (crée Company + User)',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
      responses: {
        201: { description: 'Compte créé', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
        400: { description: 'Validation échouée', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        409: { description: 'Email déjà utilisé' },
      },
    },
  },

  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Connexion',
      description: 'Retourne un JWT ou `{ requiresTwoFactor: true, tempToken }` si 2FA activé.',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
      responses: {
        200: {
          description: 'Succès ou 2FA requis',
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/AuthResponse' },
                  { $ref: '#/components/schemas/TwoFactorChallengeResponse' },
                ],
              },
            },
          },
        },
        401: { description: 'Identifiants incorrects ou compte verrouillé' },
      },
    },
  },

  '/auth/me': {
    get: {
      tags: ['Auth'],
      summary: 'Utilisateur courant',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Données utilisateur', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
        401: { description: 'Non authentifié' },
      },
    },
  },

  '/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Déconnexion',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Déconnecté' } },
    },
  },

  '/auth/forgot-password': {
    post: {
      tags: ['Auth'],
      summary: 'Demande réinitialisation mot de passe',
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } } } } },
      responses: { 200: { description: 'Email envoyé si compte existant' } },
    },
  },

  '/auth/reset-password/{token}': {
    post: {
      tags: ['Auth'],
      summary: 'Réinitialiser le mot de passe',
      parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['newPassword'], properties: { newPassword: { type: 'string', minLength: 8 } } } } } },
      responses: { 200: { description: 'Mot de passe réinitialisé' }, 400: { description: 'Token invalide ou expiré' } },
    },
  },

  '/auth/2fa/setup': {
    post: {
      tags: ['Auth — 2FA'],
      summary: 'Générer secret TOTP + QR code',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'QR code et secret',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { qrCode: { type: 'string', description: 'Data URL base64 du QR code' }, secret: { type: 'string', description: 'Secret TOTP base32' } } } } } } },
        },
      },
    },
  },

  '/auth/2fa/enable': {
    post: {
      tags: ['Auth — 2FA'],
      summary: 'Activer le 2FA (confirme le secret avec un code TOTP)',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['token'], properties: { token: { type: 'string', example: '123456' } } } } } },
      responses: {
        200: {
          description: 'Activé — retourne les 8 codes de récupération (affichés une seule fois)',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { backupCodes: { type: 'array', items: { type: 'string' } } } } } } } },
        },
        401: { description: 'Code TOTP invalide' },
      },
    },
  },

  '/auth/2fa/disable': {
    post: {
      tags: ['Auth — 2FA'],
      summary: 'Désactiver le 2FA (nécessite le mot de passe)',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['password'], properties: { password: { type: 'string' } } } } } },
      responses: { 200: { description: 'Désactivé' }, 401: { description: 'Mot de passe incorrect' } },
    },
  },

  '/auth/2fa/verify-login': {
    post: {
      tags: ['Auth — 2FA'],
      summary: 'Vérifier le code TOTP lors du login',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', required: ['tempToken', 'code'], properties: { tempToken: { type: 'string' }, code: { type: 'string', example: '123456' } } } } },
      },
      responses: {
        200: { description: 'JWT complet retourné', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
        401: { description: 'Code invalide ou tempToken expiré' },
      },
    },
  },

  // ── MISSIONS ──────────────────────────────────────────────────────────────

  '/missions': {
    get: {
      tags: ['Missions'],
      summary: 'Lister les missions',
      security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
      parameters: [
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['draft', 'active', 'paused', 'closed'] } },
        { name: 'contract', in: 'query', schema: { type: 'string' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 50, maximum: 100 } },
        { name: 'skip', in: 'query', schema: { type: 'integer', default: 0 } },
        { name: 'sortBy', in: 'query', schema: { type: 'string', default: 'createdAt' } },
        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
      ],
      responses: { 200: { description: 'Liste paginée', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } } },
    },
    post: {
      tags: ['Missions'],
      summary: 'Créer une mission',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MissionInput' } } } },
      responses: {
        201: { description: 'Mission créée', content: { 'application/json': { schema: { $ref: '#/components/schemas/Mission' } } } },
        400: { description: 'Données invalides' },
      },
    },
  },

  '/missions/{id}': {
    get: {
      tags: ['Missions'],
      summary: 'Récupérer une mission',
      security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Mission', content: { 'application/json': { schema: { $ref: '#/components/schemas/Mission' } } } },
        404: { description: 'Non trouvée' },
      },
    },
    put: {
      tags: ['Missions'],
      summary: 'Mettre à jour une mission',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MissionInput' } } } },
      responses: { 200: { description: 'Mission mise à jour' }, 404: { description: 'Non trouvée' } },
    },
    delete: {
      tags: ['Missions'],
      summary: 'Supprimer (soft-delete) une mission',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Supprimée' }, 400: { description: 'Candidatures associées existantes' } },
    },
  },

  '/missions/{id}/publish': {
    post: {
      tags: ['Missions'],
      summary: 'Publier une mission (draft → active)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Publiée' }, 400: { description: 'Pas en statut draft' } },
    },
  },

  '/missions/{id}/close': {
    post: {
      tags: ['Missions'],
      summary: 'Fermer une mission',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Fermée' } },
    },
  },

  // ── CANDIDATES ────────────────────────────────────────────────────────────

  '/candidates': {
    get: {
      tags: ['Candidates'],
      summary: 'Lister les candidats',
      security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
      parameters: [
        { name: 'status', in: 'query', schema: { type: 'string' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
        { name: 'skip', in: 'query', schema: { type: 'integer', default: 0 } },
      ],
      responses: { 200: { description: 'Liste paginée', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } } },
    },
    post: {
      tags: ['Candidates'],
      summary: 'Créer un candidat',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CandidateInput' } } } },
      responses: { 201: { description: 'Candidat créé' }, 400: { description: 'Données invalides' } },
    },
  },

  '/candidates/{id}': {
    get: {
      tags: ['Candidates'],
      summary: 'Récupérer un candidat',
      security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Candidat', content: { 'application/json': { schema: { $ref: '#/components/schemas/Candidate' } } } }, 404: { description: 'Non trouvé' } },
    },
    put: {
      tags: ['Candidates'],
      summary: 'Mettre à jour un candidat',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CandidateInput' } } } },
      responses: { 200: { description: 'Mis à jour' } },
    },
    delete: {
      tags: ['Candidates'],
      summary: 'Supprimer un candidat',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Supprimé' } },
    },
  },

  // ── APPLICATIONS ──────────────────────────────────────────────────────────

  '/applications': {
    get: {
      tags: ['Applications'],
      summary: 'Lister les candidatures',
      security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
      parameters: [
        { name: 'missionId', in: 'query', schema: { type: 'string' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'] } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
        { name: 'skip', in: 'query', schema: { type: 'integer', default: 0 } },
      ],
      responses: { 200: { description: 'Liste paginée' } },
    },
    post: {
      tags: ['Applications'],
      summary: 'Créer une candidature',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', required: ['candidateId', 'missionId'], properties: { candidateId: { type: 'string' }, missionId: { type: 'string' }, notes: { type: 'string' } } } } },
      },
      responses: { 201: { description: 'Candidature créée' } },
    },
  },

  '/applications/{id}/status': {
    patch: {
      tags: ['Applications'],
      summary: 'Changer le statut (Kanban)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'] } } } } },
      },
      responses: { 200: { description: 'Statut mis à jour' } },
    },
  },

  // ── UPLOAD ────────────────────────────────────────────────────────────────

  '/upload/cv/{candidateId}': {
    post: {
      tags: ['Upload'],
      summary: 'Upload CV (PDF, DOC, DOCX, TXT — max 5 MB)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'candidateId', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { cv: { type: 'string', format: 'binary' } } } } } },
      responses: { 200: { description: 'CV uploadé' }, 404: { description: 'Candidat non trouvé' } },
    },
    delete: {
      tags: ['Upload'],
      summary: 'Supprimer le CV',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'candidateId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'CV supprimé' } },
    },
  },

  '/upload/cv/{filename}': {
    get: {
      tags: ['Upload'],
      summary: 'Télécharger / obtenir URL signée CV',
      description: 'En mode S3 : redirige (302) vers une URL signée (1 heure). En local : sert le fichier directement.',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'filename', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Fichier servi (local)' },
        302: { description: 'Redirection vers URL signée S3' },
        404: { description: 'Fichier non trouvé' },
      },
    },
  },

  '/upload/avatar': {
    post: {
      tags: ['Upload'],
      summary: 'Upload avatar (JPG, PNG, GIF, WEBP — max 2 MB)',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { avatar: { type: 'string', format: 'binary' } } } } } },
      responses: { 200: { description: 'Avatar uploadé' } },
    },
  },

  // ── API KEYS ──────────────────────────────────────────────────────────────

  '/apikeys': {
    get: {
      tags: ['API Keys'],
      summary: 'Lister les clés API',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Liste des clés', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/ApiKey' } } } } } } } },
    },
    post: {
      tags: ['API Keys'],
      summary: 'Créer une clé API',
      description: 'La clé brute (`sk_live_...`) est retournée **une seule fois** dans la réponse.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string', example: 'Mon intégration CI' },
                scopes: { type: 'array', items: { type: 'string' }, example: ['missions:read', 'candidates:read'] },
                expiresAt: { type: 'string', format: 'date-time', nullable: true },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Clé créée', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/ApiKeyCreated' }, message: { type: 'string' } } } } } },
      },
    },
  },

  '/apikeys/{id}/revoke': {
    delete: {
      tags: ['API Keys'],
      summary: 'Révoquer une clé (désactivation)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Révoquée' }, 404: { description: 'Non trouvée' } },
    },
  },

  '/apikeys/{id}': {
    delete: {
      tags: ['API Keys'],
      summary: 'Supprimer définitivement une clé',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Supprimée' } },
    },
  },

  // ── HEALTH ────────────────────────────────────────────────────────────────

  '/health': {
    get: {
      tags: ['System'],
      summary: 'Health check',
      responses: {
        200: {
          description: 'API opérationnelle',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, uptime: { type: 'number' }, environment: { type: 'string' } } } } },
        },
      },
    },
  },

  // ── API PUBLIQUE v1 (T-277) ────────────────────────────────────────────────

  '/v1': {
    get: {
      tags: ['API Publique v1'],
      summary: 'Informations API publique',
      description: 'Retourne la version, les scopes actifs de la clé et la liste des endpoints disponibles.',
      security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
      'x-codeSamples': [
        { lang: 'Shell', label: 'curl', source: 'curl -X GET "https://api.ats-ultimate.com/api/v1" \\\n  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx"' },
      ],
      responses: {
        200: { description: 'Informations API', content: { 'application/json': { schema: { type: 'object' } } } },
        401: { description: 'Non authentifié' },
      },
    },
  },

  '/v1/missions': {
    get: {
      tags: ['API Publique v1'],
      summary: 'Lister les missions (API Key)',
      description: 'Scope requis : `missions:read`',
      security: [{ apiKeyAuth: [] }],
      parameters: [
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['open', 'closed', 'draft'] } },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
      ],
      'x-codeSamples': [
        { lang: 'Shell', label: 'curl', source: 'curl -X GET "https://api.ats-ultimate.com/api/v1/missions?status=open&limit=10" \\\n  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx"' },
        { lang: 'JavaScript', label: 'Node.js', source: 'const res = await fetch("https://api.ats-ultimate.com/api/v1/missions", {\n  headers: { Authorization: "Bearer sk_live_xxxxxxxxxxxxxxxxxxxx" }\n});\nconst { data, pagination } = await res.json();' },
      ],
      responses: {
        200: { description: 'Liste paginée des missions', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Mission' } }, pagination: { type: 'object' } } } } } },
        401: { description: 'Non authentifié' },
        403: { description: 'Scope insuffisant — missions:read requis' },
      },
    },
    post: {
      tags: ['API Publique v1'],
      summary: 'Créer une mission (API Key)',
      description: 'Scope requis : `missions:write`',
      security: [{ apiKeyAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MissionCreate' } } } },
      'x-codeSamples': [
        { lang: 'Shell', label: 'curl', source: 'curl -X POST "https://api.ats-ultimate.com/api/v1/missions" \\\n  -H "Authorization: Bearer sk_live_xxxx" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"title":"Dev React","contract":"CDI","location":"Paris"}\'' },
      ],
      responses: {
        201: { description: 'Mission créée', content: { 'application/json': { schema: { $ref: '#/components/schemas/Mission' } } } },
        400: { description: 'Données invalides' },
        403: { description: 'Scope insuffisant — missions:write requis' },
      },
    },
  },

  '/v1/candidates': {
    get: {
      tags: ['API Publique v1'],
      summary: 'Lister les candidats (API Key)',
      description: 'Scope requis : `candidates:read`. Le champ CV (base64) est exclu pour des raisons de performance.',
      security: [{ apiKeyAuth: [] }],
      parameters: [
        { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Recherche full-text (nom, email, compétences)' },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'passive', 'not_looking'] } },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
      ],
      responses: {
        200: { description: 'Liste paginée des candidats' },
        403: { description: 'Scope insuffisant — candidates:read requis' },
      },
    },
  },

  '/v1/applications': {
    get: {
      tags: ['API Publique v1'],
      summary: 'Lister les candidatures (API Key, lecture seule)',
      description: 'Scope requis : `candidates:read`',
      security: [{ apiKeyAuth: [] }],
      parameters: [
        { name: 'missionId', in: 'query', schema: { type: 'string' } },
        { name: 'candidateId', in: 'query', schema: { type: 'string' } },
        { name: 'status', in: 'query', schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Liste paginée des candidatures' },
        403: { description: 'Scope insuffisant' },
      },
    },
  },

  // ── WEBHOOKS (T-276) ───────────────────────────────────────────────────────

  '/webhooks': {
    get: {
      tags: ['Webhooks'],
      summary: 'Lister les webhooks sortants',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Liste des webhooks configurés' } },
    },
    post: {
      tags: ['Webhooks'],
      summary: 'Créer un webhook',
      description: 'Configure un endpoint pour recevoir les événements ATS en temps réel.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['url', 'events'],
              properties: {
                url: { type: 'string', format: 'uri', example: 'https://hooks.zapier.com/hooks/catch/xxx/yyy' },
                events: { type: 'array', items: { type: 'string' }, example: ['application.created', 'application.hired'] },
                secret: { type: 'string', description: 'Secret HMAC-SHA256 pour vérifier les signatures', example: 'mon_secret_32_chars_minimum' },
                enabled: { type: 'boolean', default: true },
              },
            },
          },
        },
      },
      'x-codeSamples': [
        { lang: 'Shell', label: 'curl', source: 'curl -X POST "https://api.ats-ultimate.com/api/webhooks" \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"url":"https://hooks.zapier.com/xxx","events":["application.created","application.hired"],"secret":"my_secret"}\'' },
      ],
      responses: {
        201: { description: 'Webhook créé' },
        400: { description: 'URL invalide ou événements inconnus' },
      },
    },
  },

  '/webhooks/{id}/ping': {
    post: {
      tags: ['Webhooks'],
      summary: 'Tester un webhook (ping réel avec retry)',
      description: 'Envoie un événement `ping` au webhook avec 3 tentatives et backoff exponentiel (5s/25s/125s). Retourne le résultat de chaque tentative.',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Résultat du ping (succès ou échec avec détails des tentatives)' },
        404: { description: 'Webhook introuvable' },
      },
    },
  },

  '/webhooks/events/catalog': {
    get: {
      tags: ['Webhooks'],
      summary: 'Catalogue des événements disponibles',
      description: 'Retourne la liste de tous les événements pouvant déclencher un webhook.',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Catalogue d\'événements webhook' } },
    },
  },

  // ── CALENDAR OAUTH (T-270/T-271) ───────────────────────────────────────────

  '/calendar/google/auth-url': {
    get: {
      tags: ['Intégrations Calendrier'],
      summary: 'URL de consentement OAuth2 Google Calendar',
      description: 'Le frontend redirige le recruteur vers cette URL pour autoriser la synchronisation Google Calendar.',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'URL OAuth2 Google', content: { 'application/json': { schema: { type: 'object', properties: { url: { type: 'string', format: 'uri' } } } } } } },
    },
  },

  '/calendar/microsoft/auth-url': {
    get: {
      tags: ['Intégrations Calendrier'],
      summary: 'URL de consentement OAuth2 Microsoft Outlook / M365',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'URL OAuth2 Microsoft', content: { 'application/json': { schema: { type: 'object', properties: { url: { type: 'string', format: 'uri' } } } } } } },
    },
  },

  '/calendar/status': {
    get: {
      tags: ['Intégrations Calendrier'],
      summary: 'Statut des connexions calendrier de la company',
      description: 'Indique si Google Calendar et/ou Microsoft Outlook sont connectés, et si les tokens sont expirés.',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Statut Google + Microsoft', content: { 'application/json': { schema: { type: 'object', properties: { google: { type: 'object', properties: { connected: { type: 'boolean' }, connectedAt: { type: 'string', format: 'date-time' }, expired: { type: 'boolean' } } }, microsoft: { type: 'object', properties: { connected: { type: 'boolean' }, connectedAt: { type: 'string', format: 'date-time' }, expired: { type: 'boolean' } } } } } } } } },
    },
  },
};

// ── Spec complète ─────────────────────────────────────────────────────────────

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'ATS Ultimate API',
      version: '1.0.0',
      description: `
## ATS Ultimate — API REST

Système de gestion du recrutement (ATS) multi-tenant.

---

### 🔐 Authentification

#### Avec JWT (utilisateurs connectés)
\`\`\`bash
# 1. S'inscrire et obtenir un token
curl -X POST https://api.ats-ultimate.com/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"firstName":"Alice","lastName":"Martin","email":"alice@acme.com","password":"MySecret123!","companyName":"Acme Corp"}'

# 2. Se connecter (retourne un JWT de 7 jours)
TOKEN=$(curl -s -X POST https://api.ats-ultimate.com/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"alice@acme.com","password":"MySecret123!"}' | jq -r '.data.token')

# 3. Utiliser le token
curl -H "Authorization: Bearer $TOKEN" https://api.ats-ultimate.com/api/missions
\`\`\`

#### Avec Clé API (intégrateurs)
\`\`\`bash
# 1. Créer une clé API (dans AdminPage → Clés API, ou via API)
curl -X POST https://api.ats-ultimate.com/api/apikeys \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Mon intégration Zapier","scopes":["missions:read","candidates:read"]}'
# → Retourne sk_live_xxxxxxxxxxxxxxxxxxxx (affiché une seule fois !)

# 2. Utiliser la clé (préfixe Bearer, même header)
curl -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx" \\
  https://api.ats-ultimate.com/api/v1/missions
\`\`\`

---

### 📦 Scopes disponibles (API Keys)
| Scope | Description |
|-------|-------------|
| \`missions:read\` | Lire les missions |
| \`missions:write\` | Créer/modifier les missions |
| \`candidates:read\` | Lire les candidats et candidatures |
| \`candidates:write\` | Créer/modifier les candidats |

---

### 🔄 Rate Limiting
- **Auth** : 5 req / 15 min / IP
- **API** : 60 req / min / clé ou utilisateur
- **Global** : 100 req / 15 min / IP

---

### ⚡ Endpoints Bloc 5 (intégrations)
| Route | Description |
|-------|-------------|
| \`GET /api/v1/*\` | API publique versionnée (auth par clé API) |
| \`GET/POST /api/webhooks\` | Webhooks sortants (Zapier, Make) |
| \`POST /api/webhooks/:id/ping\` | Test webhook avec retry backoff |
| \`GET /api/calendar/:provider/auth-url\` | OAuth Google Calendar / Outlook |
| \`GET /api/calendar/status\` | Statut des connexions calendrier |
      `.trim(),
      contact: { name: 'ATS Ultimate Support', email: 'support@ats-ultimate.com' },
      license: { name: 'MIT' },
    },
    servers: [
      { url: 'http://localhost:5000/api', description: 'Développement local' },
      { url: 'https://api.votre-domaine.com/api', description: 'Production' },
    ],
    components: {
      schemas,
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT obtenu via POST /auth/login',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Format : `ApiKey sk_live_...` — clé créée via POST /apikeys',
        },
      },
    },
    paths,
    tags: [
      { name: 'Auth', description: 'Authentification et gestion de compte' },
      { name: 'Auth — 2FA', description: 'Authentification à deux facteurs (TOTP)' },
      { name: 'Missions', description: 'Offres d\'emploi' },
      { name: 'Candidates', description: 'Base de candidats' },
      { name: 'Applications', description: 'Candidatures et pipeline Kanban' },
      { name: 'Upload', description: 'Gestion des fichiers (CV, documents, avatars)' },
      { name: 'API Keys', description: 'Clés API pour intégrations tierces' },
      { name: 'API Publique v1', description: 'Endpoints REST publics accessibles par clé API (T-277)' },
      { name: 'Webhooks', description: 'Webhooks sortants vers Zapier, Make et endpoints custom (T-276)' },
      { name: 'Intégrations Calendrier', description: 'OAuth2 Google Calendar (T-270) et Microsoft Outlook/M365 (T-271)' },
      { name: 'System', description: 'Health check et statut' },
    ],
  },
  apis: [], // Spec centralisée — pas de scan JSDoc
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
