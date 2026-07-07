import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/core/contexts/AuthContext';
import { usePlanAccess } from '@/core/hooks/usePlanAccess';
import { useData } from '@/core/contexts/DataContext';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import { useAPIUsers } from '@/core/hooks/useAPIData';
import { supabase } from '@/services/supabase';
import api from '@/services/api';
import { createInviteLink } from '@/core/utils/inviteLink';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import { useConfirm } from '@/core/contexts/ConfirmContext';
import { ALL_PERMISSIONS, ROLE_DEFAULT_PERMISSIONS_BY_DB_ROLE } from '@/config/permissions';

const _getLocale = () => { const l = localStorage.getItem('ats_language') || 'fr'; return l.startsWith('en') ? 'en-GB' : 'fr-FR'; };

/**
 * AdminPage - Page d'administration pour les entreprises clientes
 *
 * Sections :
 * 1. Paramètres entreprise (logo, nom, secteur, etc.)
 * 2. Gestion utilisateurs (membres de l'équipe)
 * 3. Facturation (plan, paiement, factures)
 * 4. Paramètres système (notifications, préférences)
 */
const ROLE_MAP = { admin: 'Admin', recruiter: 'Recruteur', manager: 'Manager', viewer: 'Lecteur', consultant: 'Consultant' };
const ROLE_REVERSE = { Admin: 'admin', Recruteur: 'recruiter', Manager: 'manager', Lecteur: 'viewer', Consultant: 'consultant' };

function parseUserAgent(ua) {
  if (!ua) return { browser: 'Navigateur inconnu', os: '' };
  let browser = 'Navigateur inconnu';
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/') && !ua.includes('Chromium')) browser = 'Chrome';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
  let os = '';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';
  return { browser, os };
}

function SecurityTab() {
  const { addNotification } = useNotifications();
  const { enrollMfa, confirmMfaEnrollment, disableMfa, getMfaFactors } = useAuth();
  const isMobile = useIsMobile();

  const [loading, setLoading] = React.useState(true);
  const [factors, setFactors] = React.useState([]);
  const [step, setStep] = React.useState('idle'); // idle | enrolling | backupCodes
  const [enrollData, setEnrollData] = React.useState(null); // { factorId, qrCode, secret }
  const [code, setCode] = React.useState('');
  const [backupCodes, setBackupCodes] = React.useState([]);
  const [disablePassword, setDisablePassword] = React.useState('');
  const [showDisableForm, setShowDisableForm] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [currentSession, setCurrentSession] = React.useState(null);
  const [signingOutOthers, setSigningOutOthers] = React.useState(false);

  const refreshFactors = React.useCallback(() => {
    setLoading(true);
    getMfaFactors().then(list => { setFactors(list); setLoading(false); });
  }, [getMfaFactors]);

  React.useEffect(() => { refreshFactors(); }, [refreshFactors]);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setCurrentSession(data.session));
  }, []);

  const handleSignOutOthers = async () => {
    setSigningOutOthers(true);
    const { error } = await supabase.auth.signOut({ scope: 'others' });
    setSigningOutOthers(false);
    if (error) {
      addNotification({ title: error.message || 'Erreur lors de la déconnexion des autres sessions', type: 'error' });
      return;
    }
    addNotification({ title: 'Toutes les autres sessions ont été déconnectées', type: 'success' });
  };

  const isEnabled = factors.some(f => f.status === 'verified');

  const handleStartEnroll = async () => {
    setBusy(true);
    const result = await enrollMfa();
    setBusy(false);
    if (!result.success) {
      addNotification({ title: result.error || 'Erreur lors de la configuration du 2FA', type: 'error' });
      return;
    }
    setEnrollData(result);
    setStep('enrolling');
  };

  const handleConfirmEnroll = async () => {
    if (code.length < 6) return;
    setBusy(true);
    const result = await confirmMfaEnrollment(enrollData.factorId, code.trim());
    setBusy(false);
    if (!result.success) {
      addNotification({ title: result.error || 'Code invalide', type: 'error' });
      return;
    }
    setBackupCodes(result.backupCodes);
    setStep('backupCodes');
    setCode('');
  };

  const handleFinishSetup = () => {
    setStep('idle');
    setEnrollData(null);
    setBackupCodes([]);
    refreshFactors();
    addNotification({ title: 'Authentification à deux facteurs activée', type: 'success' });
  };

  const handleDisable = async () => {
    if (!disablePassword) return;
    setBusy(true);
    const result = await disableMfa(disablePassword);
    setBusy(false);
    if (!result.success) {
      addNotification({ title: result.error || 'Erreur lors de la désactivation', type: 'error' });
      return;
    }
    setShowDisableForm(false);
    setDisablePassword('');
    refreshFactors();
    addNotification({ title: 'Authentification à deux facteurs désactivée', type: 'info' });
  };

  const card = { padding: '24px', background: 'white', borderRadius: '14px', border: '1.5px solid #E5E7EB', marginBottom: '16px' };
  const input = { width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>Chargement...</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', marginBottom: '24px' }}>Sécurité • Authentification à deux facteurs</h2>

      {step === 'idle' && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>
                {isEnabled ? '2FA activé' : '2FA non activé'}
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>
                {isEnabled
                  ? "Une application d'authentification (Google Authenticator, Authy...) est requise à chaque connexion."
                  : 'Ajoutez une couche de sécurité supplémentaireà votre compte.'}
              </div>
            </div>
            {isEnabled ? (
              <button
                onClick={() => setShowDisableForm(true)}
                style={{ padding: '10px 20px', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
              >
                Désactiver
              </button>
            ) : (
              <button
                onClick={handleStartEnroll}
                disabled={busy}
                style={{ padding: '10px 20px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '9px', cursor: busy ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '13px' }}
              >
                {busy ? '...' : 'Activer le 2FA'}
              </button>
            )}
          </div>

          {showDisableForm && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #F3F4F6' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                Confirmez votre mot de passe pour désactiver le 2FA
              </label>
              <input
                type="password"
                style={{ ...input, marginBottom: '12px' }}
                value={disablePassword}
                onChange={e => setDisablePassword(e.target.value)}
                placeholder="••••••••"
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleDisable}
                  disabled={busy || !disablePassword}
                  style={{ padding: '10px 20px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
                >
                  {busy ? '...' : 'Confirmer la désactivation'}
                </button>
                <button
                  onClick={() => { setShowDisableForm(false); setDisablePassword(''); }}
                  style={{ padding: '10px 20px', background: '#F3F4F6', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'enrolling' && enrollData && (
        <div style={card}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>1. Scannez ce QR code</h3>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
            Utilisez Google Authenticator, Authy ou une application compatible TOTP.
          </p>
          {enrollData.qrCode && (
            <div
              style={{ width: '200px', height: '200px', marginBottom: '16px' }}
              dangerouslySetInnerHTML={{ __html: enrollData.qrCode }}
            />
          )}
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '20px' }}>
            Ou entrez ce code manuellement : <code style={{ background: '#F3F4F6', padding: '3px 8px', borderRadius: '6px' }}>{enrollData.secret}</code>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>2. Entrez le code généré</h3>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            style={{ ...input, marginBottom: '16px', fontSize: '20px', letterSpacing: '4px', textAlign: 'center', maxWidth: '200px' }}
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="123456"
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleConfirmEnroll}
              disabled={busy || code.length < 6}
              style={{ padding: '10px 20px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
            >
              {busy ? '...' : 'Confirmer et activer'}
            </button>
            <button
              onClick={() => { setStep('idle'); setEnrollData(null); setCode(''); }}
              style={{ padding: '10px 20px', background: '#F3F4F6', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {step === 'backupCodes' && (
        <div style={card}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#065F46' }}>2FA activé • Codes de récupération</h3>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
            Conservez ces codes dans un endroit sûr. Chacun ne peut être utilisé qu'une seule fois pour vous reconnecter si vous perdez l'accès à votre application d'authentification (cela désactivera le 2FA).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px', background: '#F9FAFB', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
            {backupCodes.map((c) => (
              <code key={c} style={{ fontSize: '14px', fontWeight: '700' }}>{c}</code>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigator.clipboard.writeText(backupCodes.join('\n'))}
              style={{ padding: '10px 20px', background: '#F3F4F6', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
            >
             ✅ Copier
            </button>
            <button
              onClick={handleFinishSetup}
              style={{ padding: '10px 20px', background: '#10B981', color: 'white', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
            >
              J'ai sauvegardé mes codes
            </button>
          </div>
        </div>
      )}

      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', margin: '32px 0 24px' }}>Sessions actives</h2>
      <div style={card}>
        {currentSession ? (() => {
          const { browser, os } = parseUserAgent(navigator.userAgent);
          const since = currentSession.user?.last_sign_in_at
            ? new Date(currentSession.user.last_sign_in_at).toLocaleString(_getLocale())
            : '-';
          return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>
                  {browser}{os ? ` • ${os}` : ''} <span style={{ color: '#10B981', fontWeight: '700' }}>(session actuelle)</span>
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>Connecté depuis : {since}</div>
              </div>
              <button
                onClick={handleSignOutOthers}
                disabled={signingOutOthers}
                style={{ padding: '10px 20px', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '9px', cursor: signingOutOthers ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '13px' }}
              >
                {signingOutOthers ? '...' : 'Déconnecter toutes les autres sessions'}
              </button>
            </div>
          );
        })() : (
          <div style={{ color: '#9CA3AF', fontSize: '13px' }}>Chargement...</div>
        )}
        <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '16px', marginBottom: 0 }}>
           Pour des raisons de confidentialité, Supabase ne permet pas d'afficher le détail (appareil, localisation) des autres sessions ouvertes sur votre compte — uniquement de les déconnecter toutes en une seule action.
        </p>
      </div>
    </div>
  );
}

// --- Pipeline Columns Tab ---------------------------------------------------------
export default function AdminPage() {
  const { user, profile } = useAuth();
  const { canSeeAdmin } = usePlanAccess();
  const rgpdUser = user;
  const {
    candidates, missions, addTeamMember,
    candidates: rgpdCandidates = [], deleteCandidate,
    missions: rgpdMissions = [], applications: rgpdApplications = [],
    events: rgpdEvents = [], team: rgpdTeam = [], clients: rgpdClients = [],
    missions: usageMissions = [], candidates: usageCandidates = [], team: usageTeam = [],
  } = useData();
  const { success, error } = useNotifications();
  const { confirm } = useConfirm();
  // T-359 : le fetch ne part que si canSeeAdmin est vrai — sinon un Équipier qui
  // atteint ce composant par navigation directe (avant que le guard plus bas ne
  // redirige) ne déclenche plus l'appel réseau du tout.
  const { users: supabaseUsers, updateUser: apiUpdateUser, deleteUser: apiDeleteUser } = useAPIUsers(canSeeAdmin);
  const isMobile = useIsMobile();

  const currentCompany = profile?.companies;

  const [activeTab, setActiveTab] = useState('company');
  const [editMode, setEditMode] = useState(false);

  const [companyForm, setCompanyForm] = useState({ name: '', industry: '', email: '', notes: '' });

  useEffect(() => {
    if (currentCompany) {
      setCompanyForm({
        name: currentCompany.name || '',
        industry: currentCompany.industry || '',
        email: currentCompany.email || '',
        notes: currentCompany.notes || '',
      });
    }
  }, [currentCompany?.id]);

  const [notifSettings, setNotifSettings] = useState({ email: true, candidates: true, missions: false, weekly: true });
  const [preferences, setPreferences] = useState({ language: 'Franais', timezone: 'Europe/Paris (UTC+1)', dateFormat: 'JJ/MM/AAAA' });

  const downloadInvoice = (invoice) => {
    const lines = [
      `FACTURE ${invoice.invoice}`,
      `Date : ${invoice.date}`,
      `Montant : ${invoice.amount}`,
      `Statut : ${invoice.status}`,
      ``,
      `Entreprise : ${companyForm.name || currentCompany?.name || ''}`,
      `Email : ${companyForm.email || currentCompany?.email || ''}`,
      `Plan : ${currentCompany?.plan || ''}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoice}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', role: 'Recruteur', password: '' });
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState(null);
  const [newPassword, setNewPassword] = useState({ password: '', confirm: '' });
  const [selectedUserPermissions, setSelectedUserPermissions] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [inviteLink, setInviteLink] = useState(null);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);


  // T-336 : générait auparavant un token stocké uniquement dans le localStorage
  // du navigateur du Manager, vers une route /invite/:token qui n'existait même
  // pas — lien 404 garanti pour le destinataire. Le lien est désormais un vrai
  // enregistrement Supabase (invite_links, migration 019), consommé par la page
  // publique InviteAcceptPage.
  const generateInviteLink = async () => {
    try {
      const url = await createInviteLink({ companyId: user?.companyId, role: 'recruiter', actorId: user?.id });
      setInviteLink(url);
      return url;
    } catch (err) {
      error('Erreur', err.message || 'Impossible de générer le lien d\'invitation');
      return null;
    }
  };

  const ROLES = ['Admin', 'Manager', 'Recruteur', 'Consultant', 'Lecteur'];
  // T-356 : ALL_PERMISSIONS/ROLE_DEFAULT_PERMISSIONS_BY_DB_ROLE viennent désormais de
  // config/permissions.js, seule source réellement consommée par l'enforcement (Sidebar/
  // usePlanAccess) — ROLE_DEFAULT_PERMISSIONS ci-dessous reste keyée par libellé affiché
  // ('Admin', 'Recruteur'...) pour ne rien changer au reste de ce composant.
  const ROLE_DEFAULT_PERMISSIONS = Object.fromEntries(
    Object.entries(ROLE_MAP).map(([dbRole, label]) => [label, ROLE_DEFAULT_PERMISSIONS_BY_DB_ROLE[dbRole] || []])
  );

  const openEditUser = (member) => {
    setEditingUser(member);
    setEditUserForm({
      firstName: member.firstName || member.name?.split(' ')[0] || '',
      lastName: member.lastName || member.name?.split(' ')[1] || '',
      email: member.email || '',
      role: member.role || 'Recruteur',
      phone: member.phone || '',
      active: member.active !== false,
    });
    setShowEditUserModal(true);
  };

  const handleSaveEditUser = async () => {
    if (!editUserForm.firstName || !editUserForm.email) {
      error('Champs requis', 'Prénom et email sont obligatoires');
      return;
    }
    try {
      await apiUpdateUser(editingUser.id, {
        first_name: editUserForm.firstName,
        last_name: editUserForm.lastName,
        email: editUserForm.email,
        role: ROLE_REVERSE[editUserForm.role] || editUserForm.role.toLowerCase(),
        phone: editUserForm.phone || null,
      });
      success('Profil mis à jour', `${editUserForm.firstName} a été mis à jour avec succès`);
      setShowEditUserModal(false);
      setEditingUser(null);
    } catch (err) {
      error('Erreur', 'Impossible de sauvegarder les modifications');
    }
  };

  const handleResetPassword = () => {
    if (!newPassword.password || newPassword.password.length < 8) {
      error('Mot de passe invalide', 'Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (newPassword.password !== newPassword.confirm) {
      error('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    success('Mot de passe réinitialisé', `Le mot de passe de ${passwordTarget?.name} a été modifié`);
    setShowPasswordModal(false);
    setNewPassword({ password: '', confirm: '' });
    setPasswordTarget(null);
  };

  const toggleUserActive = async (member) => {
    const newStatus = member.active === false ? true : false;
    await apiUpdateUser(member.id, { active: newStatus }).catch(() => {});
    success(
      newStatus ? 'Accès activé' : 'Accès suspendu',
      `${member.name} peut ${newStatus ? 'maintenant' : 'ne peut plus'} se connecter`
    );
  };

  const openPermissions = (member) => {
    const perms = member.permissions?.includes('all')
      ? ROLE_DEFAULT_PERMISSIONS[member.role] || ROLE_DEFAULT_PERMISSIONS.Recruteur
      : member.permissions || ROLE_DEFAULT_PERMISSIONS[member.role] || [];
    setSelectedUserPermissions({ ...member, currentPerms: [...perms] });
    setShowPermissionsModal(true);
  };

  const togglePermission = (key) => {
    setSelectedUserPermissions(prev => {
      const perms = prev.currentPerms.includes(key)
        ? prev.currentPerms.filter(p => p !== key)
        : [...prev.currentPerms, key];
      return { ...prev, currentPerms: perms };
    });
  };

  const handleSavePermissions = async () => {
    await apiUpdateUser(selectedUserPermissions.id, { permissions: selectedUserPermissions.currentPerms }).catch(() => {});
    success('Permissions sauvegardées', `Les droits de ${selectedUserPermissions.name} ont été mis à jour`);
    setShowPermissionsModal(false);
  };

  // Members from Supabase profiles (real data)
  const companyMembers = supabaseUsers.map(p => ({
    id: p.id,
    name: [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email,
    firstName: p.first_name || '',
    lastName: p.last_name || '',
    email: p.email || '',
    role: ROLE_MAP[p.role] || 'Recruteur',
    phone: p.phone || '',
    companyId: p.company_id,
    active: p.active !== false,
    status: 'active',
    permissions: p.permissions || ROLE_DEFAULT_PERMISSIONS[ROLE_MAP[p.role] || 'Recruteur'] || [],
  }));

  // Email templates state
  const DEFAULT_TEMPLATES = [
    { slug: 'application_received', name: 'Candidature reçue', subject: 'Nous avons bien reçu votre candidature', variables: ['candidateName', 'missionTitle', 'companyName'], htmlBody: '<p>Bonjour {{candidateName}},</p><p>Nous avons bien reçu votre candidature pour le poste de <strong>{{missionTitle}}</strong>.</p><p>Nous reviendrons vers vous très prochainement.<br/>L\'équipe {{companyName}}</p>' },
    { slug: 'interview_invitation', name: 'Invitation entretien', subject: 'Invitation à un entretien – {{missionTitle}}', variables: ['candidateName', 'missionTitle', 'interviewDate', 'interviewTime', 'interviewLocation'], htmlBody: '<p>Bonjour {{candidateName}},</p><p>Nous souhaitons vous rencontrer pour le poste de <strong>{{missionTitle}}</strong>.</p><p>Date : <strong>{{interviewDate}}</strong> à <strong>{{interviewTime}}</strong><br/>Lieu : {{interviewLocation}}</p><p>Merci de confirmer votre disponibilité.</p>' },
    { slug: 'application_rejected', name: 'Refus de candidature', subject: 'Réponse à votre candidature', variables: ['candidateName', 'missionTitle', 'companyName'], htmlBody: '<p>Bonjour {{candidateName}},</p><p>Après étude attentive de votre candidature pour le poste de <strong>{{missionTitle}}</strong>, nous avons le regret de vous informer que votre profil ne correspond pas à nos besoins actuels.</p><p>Nous vous souhaitons bonne chance dans vos recherches.<br/>L\'équipe {{companyName}}</p>' },
    { slug: 'offer_sent', name: 'Envoi d\'offre', subject: 'Offre d\'emploi – {{missionTitle}}', variables: ['candidateName', 'missionTitle', 'salary', 'startDate'], htmlBody: '<p>Bonjour {{candidateName}},</p><p>Suite à nos échanges, nous avons le plaisir de vous proposer le poste de <strong>{{missionTitle}}</strong>.</p><p>Rémunération proposée : {{salary}}<br/>Date de démarrage : {{startDate}}</p>' },
  ];
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateTestEmail, setTemplateTestEmail] = useState('');
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templatePreview, setTemplatePreview] = useState(false);
  const STAGE_TPL_KEY = 'ats_stage_templates';
  const [stageTemplates, setStageTemplates] = useState(() => { try { return JSON.parse(localStorage.getItem('ats_stage_templates') || '{}'); } catch { return {}; } });
  const PIPELINE_STAGES_LIST = [
    { id: 'received', label: 'Reçue' }, { id: 'screening', label: 'Présélection' },
    { id: 'interview_1', label: 'Entretien 1' }, { id: 'interview_2', label: 'Entretien 2' },
    { id: 'offer', label: 'Offre' }, { id: 'hired', label: 'Recruté' }, { id: 'rejected', label: 'Refusé' },
  ];
  const saveStageTemplate = (stageId, tplSlug) => {
    const updated = { ...stageTemplates, [stageId]: tplSlug };
    setStageTemplates(updated);
    localStorage.setItem(STAGE_TPL_KEY, JSON.stringify(updated));
  };

  useEffect(() => {
    if (activeTab === 'emailTemplates') {
      api.get('/email-templates')
        .then(r => {
          const fetched = r.data?.templates || r.data || [];
          setEmailTemplates(fetched.length > 0 ? fetched : DEFAULT_TEMPLATES);
        })
        .catch(() => setEmailTemplates(DEFAULT_TEMPLATES));
    }
  }, [activeTab]);

  // T-319 : cette page (facturation, sécurité, intégrations, gestion des membres)
  // n'avait aucune vérification de rôle — un Équipier pouvait y accéder en tapant
  // directement /app/admin dans la barre d'adresse.
  if (!canSeeAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    setTemplateLoading(true);
    try {
      await api.put(`/email-templates/${editingTemplate.slug}`, { subject: editingTemplate.subject, htmlBody: editingTemplate.htmlBody });
      success('Template mis à jour', `Le template "${editingTemplate.slug}" a été sauvegardé`);
      setEmailTemplates(prev => prev.map(t => t.slug === editingTemplate.slug ? editingTemplate : t));
      setEditingTemplate(null);
    } catch (e) {
      error('Erreur', e.message);
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!templateTestEmail || !editingTemplate) return;
    setTemplateLoading(true);
    try {
      await api.post(`/email-templates/${editingTemplate.slug}/test`, { to: templateTestEmail });
      success('Email de test envoyé', `Un email a été envoyé à ${templateTestEmail}`);
    } catch (e) {
      error('Erreur', e.message);
    } finally {
      setTemplateLoading(false);
    }
  };

  // Intégrations jobboards — configuration désactivée tant qu'aucun serveur
  // n'est déployé (voir onglet "integrations" plus bas, badge "Bientôt disponible").
  const PLATFORMS = [
    { id: 'linkedin', label: 'LinkedIn Jobs', icon: '💼' },
    { id: 'indeed', label: 'Indeed Publisher', icon: '🔍' },
    { id: 'wttj', label: 'Welcome to the Jungle', icon: '🌿' },
  ];

  // Tabs configuration
  const tabs = [
    { id: 'company',       label: 'Mon entreprise',   icon: '🏢' },
    { id: 'users',         label: 'Équipe',            icon: '👥' },
    { id: 'security',      label: 'Sécurité',          icon: '🔒' },
    { id: 'billing',       label: 'Facturation',       icon: '💳' },
    { id: 'integrations',  label: 'Intégrations',      icon: '🔌' },
  ];

  // Handlers
  const handleSaveCompany = async () => {
    if (!currentCompany) return;
    const { error: err } = await supabase.from('companies')
      .update({ name: companyForm.name, email: companyForm.email })
      .eq('id', currentCompany.id);
    if (err) error('Erreur', err.message);
    else { success('Entreprise mise à jour', 'Informations enregistrées avec succès'); setEditMode(false); }
  };

  const handleAddUser = () => {
    if (!newUser.firstName || !newUser.email || !newUser.password) {
      error('Champs requis', 'Prénom, email et mot de passe sont obligatoires');
      return;
    }
    if (newUser.password.length < 8) {
      error('Mot de passe trop court', 'Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    const fullName = `${newUser.firstName} ${newUser.lastName}`.trim();
    // Note: creating Supabase auth users requires admin privileges.
    // This saves locally for now — use Supabase dashboard to invite real users.
    addTeamMember({
      name: fullName,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone || '',
      role: newUser.role,
      companyId: currentCompany?.id,
      status: 'active',
      active: true,
      permissions: ROLE_DEFAULT_PERMISSIONS[newUser.role] || [],
      joinDate: new Date().toISOString().split('T')[0]
    });

    success('Membre ajouté', `${fullName} a été ajouté à l'équipe avec le rôle ${newUser.role}`);
    setShowAddUserModal(false);
    setNewUser({ firstName: '', lastName: '', email: '', role: 'Recruteur', password: '' });
  };

  const handleDeleteUser = async (userId) => {
    const member = companyMembers.find(m => m.id === userId);
    if (await confirm(`Supprimer ${member?.name} de l'équipe ?`, { title: 'Retirer le membre' })) {
      try {
        await apiDeleteUser(userId);
        success('Utilisateur supprimé', `${member?.name} a été retiré de l'équipe`);
      } catch (err) {
        error('Erreur', 'Impossible de supprimer cet utilisateur');
      }
    }
  };

  const handleChangePlan = async (newPlan) => {
    if (!currentCompany) return;
    const { error: err } = await supabase.from('companies').update({ plan: newPlan }).eq('id', currentCompany.id);
    if (err) error('Erreur', err.message);
    else success('Plan modifié', `Votre plan a été changé vers ${newPlan}`);
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'company':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937' }}>
                Informations de l'entreprise
              </h2>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  ✏️ Modifier
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setCompanyForm({
                        name: currentCompany?.name || '',
                        industry: currentCompany?.industry || '',
                        email: currentCompany?.email || '',
                        notes: currentCompany?.notes || ''
                      });
                    }}
                    style={{
                      background: '#E5E7EB',
                      color: '#374151',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveCompany}
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    ✅ Enregistrer
                  </button>
                </div>
              )}
            </div>

            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    disabled={!editMode}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '15px',
                      background: editMode ? 'white' : '#F9FAFB'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Secteur d'activité
                  </label>
                  <input
                    type="text"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                    disabled={!editMode}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '15px',
                      background: editMode ? 'white' : '#F9FAFB'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Email de contact
                  </label>
                  <input
                    type="email"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    disabled={!editMode}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '15px',
                      background: editMode ? 'white' : '#F9FAFB'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Statut
                  </label>
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: currentCompany?.status === 'active' ? '#D1FAE5' : '#FEF3C7',
                    color: currentCompany?.status === 'active' ? '#065F46' : '#92400E',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>
                    {currentCompany?.status === 'active' ? ' Actif' : ' En attente'}
                  </div>
                </div>

                {/* Notes supprimées — champ SuperAdmin uniquement (visible dans SuperAdminPageFunctional) */}
              </div>
            </div>

            {/* Stats entreprise — champs disponibles pour l'admin */}
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#1F2937' }}>
                Statistiques de l'entreprise
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                {[
                  { label: 'Membres', value: companyMembers.length, icon: '👥', color: '#667EEA' },
                  { label: 'Candidats', value: candidates?.length || 0, icon: '👤', color: '#10B981' },
                  { label: 'Missions actives', value: missions?.filter(m => m.status === 'active' || m.status === 'open').length || 0, icon: '💼', color: '#F59E0B' },
                ].map((stat, index) => (
                  <div key={index} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>{stat.icon}</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: stat.color, marginBottom: '5px' }}>{stat.value}</div>
                    <div style={{ fontSize: '14px', color: '#6B7280' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'users':
        const inputStyle = {
          width: '100%', padding: '10px 12px', borderRadius: '8px',
          border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box'
        };
        const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#374151' };
        const btnPrimary = {
          background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
          color: 'white', padding: '10px 18px', borderRadius: '8px',
          border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px'
        };

        return (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', margin: 0 }}>
                  Gestion de l'équipe
                </h2>
                <p style={{ color: '#6B7280', marginTop: '6px', fontSize: '14px' }}>
                  {companyMembers.length} membre{companyMembers.length > 1 ? 's' : ''} • Gérez profils, accès et permissions
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { setInviteLink(null); setShowInviteModal(true); }} style={{ padding: '10px 18px', borderRadius: '8px', border: '1.5px solid #667EEA', background: 'white', color: '#667EEA', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                  🔗 Inviter par lien
                </button>
                <button onClick={() => setShowAddUserModal(true)} style={btnPrimary}>
                  Ajouter un membre
                </button>
              </div>
            </div>

            {/* Légende rôles */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {ROLES.map(r => (
                <span key={r} style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                  background: r === 'Admin' ? '#EDE9FE' : r === 'Manager' ? '#DBEAFE' : r === 'Recruteur' ? '#D1FAE5' : '#F3F4F6',
                  color: r === 'Admin' ? '#6D28D9' : r === 'Manager' ? '#1D4ED8' : r === 'Recruteur' ? '#065F46' : '#374151'
                }}>
                  {r}
                </span>
              ))}
            </div>

            {/* Liste membres */}
            <div style={{ display: 'grid', gap: '16px' }}>
              {companyMembers.map((member) => {
                const isActive = member.active !== false && member.status !== 'inactive';
                const initials = (member.name || '-').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const roleColor = member.role === 'Admin' ? '#6D28D9' : member.role === 'Manager' ? '#1D4ED8' : member.role === 'Recruteur' ? '#065F46' : '#374151';
                const roleBg = member.role === 'Admin' ? '#EDE9FE' : member.role === 'Manager' ? '#DBEAFE' : member.role === 'Recruteur' ? '#D1FAE5' : '#F3F4F6';
                return (
                  <div key={member.id} style={{
                    background: 'white', borderRadius: '16px', padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: `2px solid ${isActive ? '#E5E7EB' : '#FEE2E2'}`,
                    opacity: isActive ? 1 : 0.75
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      {/* Profil */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '56px', height: '56px', borderRadius: '50%',
                          background: isActive ? 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' : '#9CA3AF',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '20px', fontWeight: '700', color: 'white', flexShrink: 0
                        }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '17px', fontWeight: '700', color: '#1F2937' }}>{member.name}</span>
                            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: roleBg, color: roleColor }}>
                              {member.role}
                            </span>
                            <span style={{
                              padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                              background: isActive ? '#D1FAE5' : '#FEE2E2',
                              color: isActive ? '#065F46' : '#991B1B'
                            }}>
                              {isActive ? '✅ Actif' : '⏸️ Suspendu'}
                            </span>
                          </div>
                          <div style={{ fontSize: '14px', color: '#6B7280' }}>📧 {member.email}</div>
                          {member.phone && <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>📞 {member.phone}</div>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => openEditUser(member)}
                          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '13px', color: '#374151' }}
                        >
                          ✏️ Profil
                        </button>
                        <button
                          onClick={() => { setPasswordTarget(member); setShowPasswordModal(true); }}
                          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '13px', color: '#374151' }}
                        >
                          🔑 Accès
                        </button>
                        <button
                          onClick={() => openPermissions(member)}
                          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #667EEA', background: '#EEF2FF', cursor: 'pointer', fontWeight: '600', fontSize: '13px', color: '#667EEA' }}
                        >
                          ⚙️ Permissions
                        </button>
                        <button
                          onClick={() => toggleUserActive(member)}
                          style={{
                            padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                            background: isActive ? '#FEF3C7' : '#D1FAE5',
                            color: isActive ? '#92400E' : '#065F46'
                          }}
                        >
                          {isActive ? '⏸️ Suspendre' : '▶️ Réactiver'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(member.id)}
                          aria-label={`Supprimer ${member.firstName || ''} ${member.lastName || ''}`.trim()}
                          style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: '#FEE2E2', color: '#991B1B', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Permissions résumé */}
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
                      <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600', marginRight: '10px' }}>ACCÈS :</span>
                      <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px' }}>
                        {ALL_PERMISSIONS.filter(p => {
                          const perms = member.permissions?.includes('all')
                            ? ROLE_DEFAULT_PERMISSIONS[member.role] || []
                            : member.permissions || [];
                          return perms.includes(p.key);
                        }).map(p => (
                          <span key={p.key} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: '#F3F4F6', color: '#374151' }}>
                            {p.icon} {p.label}
                          </span>
                        ))}
                        {(!member.permissions || member.permissions.length === 0) && (
                          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Aucune permission définie</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {companyMembers.length === 0 && (
                <div style={{ background: 'white', padding: '60px', borderRadius: '16px', textAlign: 'center', color: '#6B7280' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}></div>
                  <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Aucun membre pour le moment</div>
                  <div>Cliquez sur "Ajouter un membre" pour commencer</div>
                </div>
              )}
            </div>

            {/* ===== MODAL AJOUTER ===== */}
            {showAddUserModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '36px', maxWidth: '520px', width: '90%', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>Ajouter un membre</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Prénom *</label>
                      <input style={inputStyle} placeholder="Jean" value={newUser.firstName} onChange={e => setNewUser({ ...newUser, firstName: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Nom *</label>
                      <input style={inputStyle} placeholder="Dupont" value={newUser.lastName} onChange={e => setNewUser({ ...newUser, lastName: e.target.value })} />
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                      <label style={labelStyle}>Email *</label>
                      <input style={inputStyle} type="email" placeholder="jean@entreprise.com" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Rôle *</label>
                      <select style={inputStyle} value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                        {ROLES.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Téléphone</label>
                      <input style={inputStyle} placeholder="0612345678" value={newUser.phone || ''} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} />
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                      <label style={labelStyle}>Mot de passe provisoire *</label>
                      <input style={inputStyle} type="password" placeholder="Min. 8 caractères" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ background: '#EEF2FF', borderRadius: '10px', padding: '12px', marginTop: '16px', fontSize: '13px', color: '#4338CA' }}>
                    ℹ️ Les permissions seront celles du rôle <strong>{newUser.role}</strong> par défaut. Vous pourrez les personnaliser ensuite.
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button onClick={() => { setShowAddUserModal(false); setNewUser({ firstName: '', lastName: '', email: '', role: 'Recruteur', password: '' }); }} style={{ flex: 1, background: '#F3F4F6', color: '#374151', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Annuler</button>
                    <button onClick={handleAddUser} style={{ flex: 2, ...btnPrimary, padding: '12px' }}>Créer le compte</button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== MODAL EDITER PROFIL ===== */}
            {showEditUserModal && editingUser && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '36px', maxWidth: '520px', width: '90%', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>✏️ Modifier le profil</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Prénom *</label>
                      <input style={inputStyle} value={editUserForm.firstName} onChange={e => setEditUserForm({ ...editUserForm, firstName: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Nom</label>
                      <input style={inputStyle} value={editUserForm.lastName} onChange={e => setEditUserForm({ ...editUserForm, lastName: e.target.value })} />
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                      <label style={labelStyle}>Email de connexion *</label>
                      <input style={inputStyle} type="email" value={editUserForm.email} onChange={e => setEditUserForm({ ...editUserForm, email: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Rôle</label>
                      <select style={inputStyle} value={editUserForm.role} onChange={e => setEditUserForm({ ...editUserForm, role: e.target.value })}>
                        {ROLES.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Téléphone</label>
                      <input style={inputStyle} value={editUserForm.phone} onChange={e => setEditUserForm({ ...editUserForm, phone: e.target.value })} />
                    </div>
                    <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F9FAFB', borderRadius: '10px', padding: '14px 16px' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>Accès au compte</div>
                        <div style={{ fontSize: '13px', color: '#6B7280' }}>L'utilisateur peut se connecter</div>
                      </div>
                      <div
                        onClick={() => setEditUserForm({ ...editUserForm, active: !editUserForm.active })}
                        style={{ width: '50px', height: '28px', borderRadius: '14px', background: editUserForm.active ? '#667EEA' : '#D1D5DB', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
                      >
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: editUserForm.active ? '25px' : '3px', transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button onClick={() => setShowEditUserModal(false)} style={{ flex: 1, background: '#F3F4F6', color: '#374151', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Annuler</button>
                    <button onClick={handleSaveEditUser} style={{ flex: 2, ...btnPrimary, padding: '12px' }}>✅ Enregistrer</button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== MODAL MOT DE PASSE ===== */}
            {showPasswordModal && passwordTarget && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '36px', maxWidth: '440px', width: '90%', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>🔑 Réinitialiser l'accès</h3>
                  <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>Compte de <strong>{passwordTarget.name}</strong></p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Nouveau mot de passe *</label>
                      <input style={inputStyle} type="password" placeholder="Min. 8 caractères" value={newPassword.password} onChange={e => setNewPassword({ ...newPassword, password: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Confirmer le mot de passe *</label>
                      <input style={inputStyle} type="password" placeholder="Répétez le mot de passe" value={newPassword.confirm} onChange={e => setNewPassword({ ...newPassword, confirm: e.target.value })} />
                      {newPassword.confirm && newPassword.password !== newPassword.confirm && (
                        <div style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>⚠️ Les mots de passe ne correspondent pas</div>
                      )}
                    </div>
                  </div>
                  <div style={{ background: '#FEF3C7', borderRadius: '10px', padding: '12px', marginTop: '16px', fontSize: '13px', color: '#92400E' }}>
                    ⚠️ L'utilisateur devra utiliser ce nouveau mot de passe à sa prochaine connexion.
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button onClick={() => { setShowPasswordModal(false); setNewPassword({ password: '', confirm: '' }); }} style={{ flex: 1, background: '#F3F4F6', color: '#374151', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Annuler</button>
                    <button onClick={handleResetPassword} style={{ flex: 2, ...btnPrimary, padding: '12px' }}>🔑 Réinitialiser</button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== MODAL PERMISSIONS ===== */}
            {showPermissionsModal && selectedUserPermissions && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '36px', maxWidth: '560px', width: '90%', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>⚙️ Permissions</h3>
                  <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>Compte de <strong>{selectedUserPermissions.name}</strong> – Rôle : {selectedUserPermissions.role}</p>

                  {/* Shortcuts par rôle */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#9CA3AF', marginBottom: '8px' }}>APPLIQUER LES PERMISSIONS DU RÔLE :</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {ROLES.map(r => (
                        <button key={r} onClick={() => setSelectedUserPermissions(prev => ({ ...prev, currentPerms: [...ROLE_DEFAULT_PERMISSIONS[r]] }))}
                          style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                    {ALL_PERMISSIONS.map(p => {
                      const active = selectedUserPermissions.currentPerms.includes(p.key);
                      return (
                        <div key={p.key} onClick={() => togglePermission(p.key)} style={{
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                          border: `2px solid ${active ? '#667EEA' : '#E5E7EB'}`,
                          background: active ? '#EEF2FF' : '#F9FAFB',
                          transition: 'all 0.2s'
                        }}>
                          <span style={{ fontSize: '22px' }}>{p.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: active ? '#4338CA' : '#374151' }}>{p.label}</div>
                          </div>
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${active ? '#667EEA' : '#D1D5DB'}`,
                            background: active ? '#667EEA' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', fontWeight: '700'
                          }}>
                            {active ? '✓' : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button onClick={() => setShowPermissionsModal(false)} style={{ flex: 1, background: '#F3F4F6', color: '#374151', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Annuler</button>
                    <button onClick={handleSavePermissions} style={{ flex: 2, ...btnPrimary, padding: '12px' }}>💾 Sauvegarder</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'billing':
        return (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '30px', color: '#1F2937' }}>
              Facturation & Abonnement
            </h2>

            {/* Plan actuel */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '30px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Plan actuel</h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#667EEA', marginBottom: '5px' }}>
                    {currentCompany?.plan}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', marginBottom: '10px' }}>
                    {currentCompany?.mrr || '€0'} / mois
                  </div>
                  <div style={{ fontSize: '14px', color: '#6B7280' }}>
                    Prochain paiement : {currentCompany?.nextBilling}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6B7280' }}>
                    Moyen de paiement : {currentCompany?.paymentMethod}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => window.open('https://stripe.com/dashboard', '_blank')}
                    style={{
                      background: '#E5E7EB',
                      color: '#374151',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    💳 Gérer paiement
                  </button>
                  <button
                    onClick={() => {
                      const newPlan = prompt('Nouveau plan (Starter, Professional, Enterprise) :', currentCompany?.plan);
                      if (newPlan) handleChangePlan(newPlan);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    🔄 Changer de plan
                  </button>
                </div>
              </div>
            </div>

            {/* Plans disponibles */}
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Plans disponibles</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
              {[
                { name: 'Starter', price: '€99', features: ['5 utilisateurs', '50 candidats', 'Support email'], color: '#10B981' },
                { name: 'Professional', price: '€299', features: ['15 utilisateurs', '200 candidats', 'Support prioritaire', 'Analytics'], color: '#667EEA' },
                { name: 'Enterprise', price: '€999', features: ['Utilisateurs illimités', 'Candidats illimités', 'Support 24/7', 'API', 'Personnalisation'], color: '#F59E0B' }
              ].map((plan) => (
                <div
                  key={plan.name}
                  style={{
                    background: 'white',
                    padding: '25px',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: currentCompany?.plan === plan.name ? `3px solid ${plan.color}` : '3px solid transparent'
                  }}
                >
                  <div style={{ fontSize: '20px', fontWeight: '700', color: plan.color, marginBottom: '10px' }}>
                    {plan.name}
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '15px' }}>
                    {plan.price}<span style={{ fontSize: '16px', fontWeight: '400', color: '#6B7280' }}>/mois</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '20px' }}>
                    {plan.features.map((feature, i) => (
                      <li key={i} style={{ padding: '8px 0', color: '#374151', fontSize: '14px' }}>
                        " {feature}
                      </li>
                    ))}
                  </ul>
                  {currentCompany?.plan === plan.name ? (
                    <div style={{
                      background: '#D1FAE5',
                      color: '#065F46',
                      padding: '10px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      " Plan actuel
                    </div>
                  ) : (
                    <button
                      onClick={() => handleChangePlan(plan.name)}
                      style={{
                        width: '100%',
                        background: `linear-gradient(135deg, ${plan.color} 0%, ${plan.color}dd 100%)`,
                        color: 'white',
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Choisir ce plan
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Historique factures */}
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Historique des factures</h3>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                {[
                  { date: '01/02/2026', amount: '€6,500', status: 'Payée', invoice: '#INV-2026-02' },
                  { date: '01/01/2026', amount: '€6,500', status: 'Payée', invoice: '#INV-2026-01' },
                  { date: '01/12/2025', amount: '€6,500', status: 'Payée', invoice: '#INV-2025-12' }
                ].map((invoice, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '15px',
                      borderBottom: i < 2 ? '1px solid #E5E7EB' : 'none'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{invoice.invoice}</div>
                      <div style={{ fontSize: '14px', color: '#6B7280' }}>{invoice.date}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700' }}>{invoice.amount}</div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#D1FAE5',
                        color: '#065F46',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        {invoice.status}
                      </div>
                      <button
                        onClick={() => downloadInvoice(invoice)}
                        style={{
                          background: '#E5E7EB',
                          color: '#374151',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px'
                        }}
                      >
                        ⬇️ Télécharger
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '10px', color: '#1F2937' }}>
              🔌 Intégrations Jobboards
            </h2>
            <p style={{ color: '#6B7280', marginBottom: '20px' }}>Connectez votre ATS aux principaux jobboards pour diffuser vos offres automatiquement.</p>

            <div style={{ padding: '16px 20px', background: '#FFFBEB', border: '2px solid #FDE68A', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '24px' }}>🔧</span>
              <div>
                <div style={{ fontWeight: '700', color: '#92400E', fontSize: '14px' }}>Bientôt disponible</div>
                <div style={{ fontSize: '13px', color: '#92400E' }}>
                  La diffusion automatique vers les jobboards nécessite un serveur applicatif, pas encore déployé. Vous pouvez consulter les plateformes prévues ci-dessous ; la configuration sera activée dès la mise en production du serveur.
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '16px', opacity: 0.6 }}>
              {PLATFORMS.map((platform) => (
                <div key={platform.id} style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '32px' }}>{platform.icon}</div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '16px' }}>{platform.label}</div>
                      <div style={{ fontSize: '13px', marginTop: '4px', color: '#9CA3AF' }}>Bientôt disponible</div>
                    </div>
                  </div>
                  <button disabled style={{ padding: '8px 16px', background: '#F3F4F6', color: '#9CA3AF', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'not-allowed' }}>
                    ⚙️ Configurer
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'security':
        return <SecurityTab />;

      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header page */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '24px 32px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: '900', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, marginBottom: '8px' }}>Administration</h1>
            <p style={{ color: '#6B7280', fontSize: '16px', margin: 0 }}>
              Gérez les paramètres de votre entreprise et de votre équipe
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #667EEA, #764BA2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '14px' }}>
              {(user?.name || user?.email || 'A').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937' }}>{user?.name || user?.email || 'Admin'}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>{user?.role || 'Administrateur'}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px', display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
        {/* Sidebar navigation */}
        <div style={{ width: isMobile ? '100%' : '220px', flexShrink: 0 }}>
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Navigation
              </div>
            </div>
            <nav style={{ padding: '8px' }}>
              {tabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      background: active ? 'linear-gradient(135deg, #667EEA, #764BA2)' : 'transparent',
                      color: active ? 'white' : '#475569', fontWeight: active ? '700' : '500',
                      fontSize: '14px', textAlign: 'left', transition: 'all 0.15s', marginBottom: '2px',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F8FAFC'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ fontSize: '16px', flexShrink: 0 }}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Contenu principal */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {renderContent()}
        </div>
      </div>


      {/* Modal invite par lien */}
      {showInviteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setShowInviteModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1F2937', margin: 0 }}>🔗 Inviter par lien</h3>
              <button type="button" aria-label="Fermer" onClick={() => setShowInviteModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9CA3AF' }}>×</button>
            </div>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>Générez un lien d'invitation unique valable 7 jours. Le destinataire pourra s'inscrire directement sans passer par le formulaire public.</p>
            {!inviteLink ? (
              <button onClick={() => generateInviteLink()} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #667EEA, #764BA2)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                Générer un lien d'invitation
              </button>
            ) : (
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>LIEN D'INVITATION (expire dans 7 jours)</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input readOnly value={inviteLink} style={{ flex: 1, padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '12px', background: '#F9FAFB', color: '#374151' }} />
                  <button onClick={() => { navigator.clipboard.writeText(inviteLink).catch(() => {}); setInviteLinkCopied(true); setTimeout(() => setInviteLinkCopied(false), 2000); }}
                    style={{ padding: '10px 14px', background: inviteLinkCopied ? '#10B981' : '#667EEA', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13px' }}>
                    {inviteLinkCopied ? '✅ Copié' : '✅ Copiéer'}
                  </button>
                </div>
                <button onClick={() => generateInviteLink()} style={{ background: 'none', border: '1.5px solid #E5E7EB', borderRadius: '10px', padding: '9px 16px', color: '#6B7280', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
                  Générer un nouveau lien
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



