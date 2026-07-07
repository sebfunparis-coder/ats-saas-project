import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import { queryClient } from '@/core/lib/queryClient';

const AuthContext = createContext(null);

// Vérifie un mot de passe via un client Supabase jetable et isolé (persistSession: false).
// Indispensable pour confirmer le mot de passe d'un utilisateur déjà connecté en AAL2 :
// un signInWithPassword sur le client principal réinitialiserait sa session à AAL1
// (confirmé en test : Supabase ne ré-élève pas l'AAL après un simple re-login),
// ce qui ferait systématiquement échouer mfa.unenroll() ensuite ("AAL2 required").
async function verifyPasswordIsolated(email, password) {
  const ephemeral = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { error } = await ephemeral.auth.signInWithPassword({ email, password });
  return !error;
}

// Clé sessionStorage : marque qu'un accès a été accordé via code de récupération 2FA
// (le facteur TOTP Supabase n'a pas pu être retiré côté serveur, car cela exige AAL2
// que l'utilisateur n'a justement pas — voir recoverWithBackupCode). Permet de ne pas
// re-bloquer l'utilisateur au prochain rechargement de page durant cette session navigateur.
//
// T-353 : la valeur stockée DOIT être un secret à haute entropie (crypto.randomUUID()),
// jamais `session.user.id` — cet identifiant est public (renvoyé par Supabase dès un simple
// signInWithPassword, avant même le challenge 2FA), donc quiconque connaît juste le mot de
// passe pouvait auparavant forger le bypass en 2 lignes de console sans jamais fournir de
// code de récupération. Le token ci-dessous n'est généré QUE par un recoverWithBackupCode()
// réussi (donc seulement si l'appelant connaît un vrai code de récupération), et expire pour
// borner la fenêtre d'exposition en cas d'ordinateur laissé déverrouillé.
const MFA_RECOVERY_BYPASS_KEY = 'mfaRecoveryBypass';
const MFA_RECOVERY_BYPASS_TTL_MS = 30 * 60 * 1000; // 30 minutes

function readMfaRecoveryBypass(userId) {
  try {
    const stored = JSON.parse(sessionStorage.getItem(MFA_RECOVERY_BYPASS_KEY) || 'null');
    if (!stored?.token || stored.userId !== userId) return false;
    if (!stored.expiresAt || Date.now() > stored.expiresAt) {
      sessionStorage.removeItem(MFA_RECOVERY_BYPASS_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Génère un code de récupération 2FA lisible (10 caractères hexadécimaux)
function generateBackupCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Hash SHA-256 (hex) — utilisé pour stocker les codes de récupération sans les exposer en clair
async function sha256Hex(text) {
  const enc = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Détermine si la session courante nécessite une vérification 2FA (AAL2) non encore satisfaite
async function checkMfaRequired() {
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (data?.nextLevel === 'aal2' && data.currentLevel !== data.nextLevel) {
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const totpFactor = factorsData?.totp?.find(f => f.status === 'verified');
    return { required: true, factorId: totpFactor?.id || null };
  }
  return { required: false, factorId: null };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mfaPending, setMfaPending] = useState(null); // { factorId, email } | null

  // Charger le profil complet depuis Supabase
  const loadProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, companies(*)')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data);
        setIsSuperAdmin(data.role === 'superadmin');
        return data;
      }
    } catch (err) {
      console.warn('Profil non trouvé, création en cours...');
    }
    return null;
  };

  // Écouter les changements d'auth Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !session.user.email_confirmed_at) {
        supabase.auth.signOut().finally(() => setIsLoading(false));
        return;
      }
      if (session?.user) {
        if (readMfaRecoveryBypass(session.user.id)) {
          setUser(session.user);
          setIsLoggedIn(true);
          loadProfile(session.user.id).finally(() => setIsLoading(false));
          return;
        }
        checkMfaRequired().then(({ required, factorId }) => {
          if (required) {
            setMfaPending({ factorId, email: session.user.email });
            setIsLoading(false);
            return;
          }
          setUser(session.user);
          setIsLoggedIn(true);
          loadProfile(session.user.id).finally(() => setIsLoading(false));
        });
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && !session.user.email_confirmed_at) {
        supabase.auth.signOut();
        return;
      }

      if (session?.user) {
        const finalizeSignIn = () => {
          setUser(session.user);
          setIsLoggedIn(true);
          setMfaPending(null);
          // Fire-and-forget : ne bloque pas le client Supabase
          const pendingSetup = sessionStorage.getItem('pendingSetup');
          // T-336 : un invité qui accepte une invitation équipe doit rejoindre
          // la company DE L'INVITATION, pas en créer une nouvelle — prioritaire
          // sur pendingSetup si les deux étaient présents (ne devrait pas arriver).
          const pendingInvite = sessionStorage.getItem('pendingInvite');
          if (pendingInvite) {
            sessionStorage.removeItem('pendingInvite');
            sessionStorage.removeItem('pendingSetup');
            const { token, firstName, lastName } = JSON.parse(pendingInvite);
            acceptInvite(token, firstName, lastName)
              .then(() => loadProfile(session.user.id))
              .then(profile => {
                if (profile) {
                  setProfile(profile);
                  setIsSuperAdmin(profile.role === 'superadmin');
                }
              })
              .catch(console.error);
          } else if (pendingSetup) {
            sessionStorage.removeItem('pendingSetup');
            const { firstName, lastName, companyName, email, phone, plan } = JSON.parse(pendingSetup);
            setupUserAccount(session.user.id, email, firstName, lastName, companyName, phone, plan)
              .then(() => loadProfile(session.user.id))
              .then(profile => {
                if (profile) {
                  setProfile(profile);
                  setIsSuperAdmin(profile.role === 'superadmin');
                }
              })
              .catch(console.error);
          } else {
            loadProfile(session.user.id)
              .then(profile => {
                if (profile) {
                  setProfile(profile);
                  setIsSuperAdmin(profile.role === 'superadmin');
                }
              })
              .catch(console.error);
          }
        };

        // Un challenge 2FA réussi élève directement la session à AAL2 : pas besoin de re-vérifier
        if (event === 'MFA_CHALLENGE_VERIFIED') {
          finalizeSignIn();
          return;
        }

        if (readMfaRecoveryBypass(session.user.id)) {
          finalizeSignIn();
          return;
        }

        checkMfaRequired().then(({ required, factorId }) => {
          if (required) {
            setMfaPending({ factorId, email: session.user.email });
            return;
          }
          finalizeSignIn();
        });
      } else {
        setUser(null);
        setProfile(null);
        setIsLoggedIn(false);
        setIsSuperAdmin(false);
        setMfaPending(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Plans réels vendus (cf. config/constants.js PLANS / PLAN_PRICING) — tout autre
  // valeur retombe sur 'solo', jamais sur l'ancien 'starter' qui ne correspond à
  // aucun plan facturé (T-354 : le plan choisi/payé en amont n'était jusqu'ici
  // jamais transmis jusqu'ici, la company recevait toujours 'starter' en dur).
  const VALID_PLANS = ['solo', 'team_3', 'team_6'];

  // Crée company + profil pour un user nouvellement inscrit
  const setupUserAccount = async (userId, email, firstName, lastName, companyName, phone, plan) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles').select('company_id').eq('id', userId).maybeSingle();
      if (existingProfile?.company_id) return; // déjà configuré

      const safePlan = VALID_PLANS.includes(plan) ? plan : 'solo';
      const companyId = crypto.randomUUID();
      // T-345 : created_by permet à la policy RLS de profiles (migration 020) de
      // vérifier qu'un utilisateur ne peut s'auto-assigner que la company qu'il
      // vient de créer lui-même, jamais celle d'un autre client.
      await supabase.from('companies')
        .insert({ id: companyId, name: companyName || `${firstName} ${lastName}`, email, plan: safePlan, created_by: userId });
      await supabase.from('profiles')
        .upsert({ id: userId, email, first_name: firstName, last_name: lastName, role: 'admin', company_id: companyId, phone: phone || null });
    } catch (err) {
      console.error('setupUserAccount error:', err);
    }
  };

  // T-336 : rattache le compte (déjà créé via signUp) à la company/rôle d'une
  // invitation équipe, via la fonction SECURITY DEFINER accept_invite
  // (migration 019) — nécessite une session authentifiée (auth.uid()).
  const acceptInvite = async (token, firstName, lastName) => {
    const { data, error } = await supabase.rpc('accept_invite', {
      p_token: token,
      p_first_name: firstName,
      p_last_name: lastName,
    });
    if (error) throw error;
    return data;
  };

  // Inscription : signUp uniquement, la configuration du compte se fait via onAuthStateChange
  const register = async ({ email, password, firstName, lastName, companyName, phone, plan }) => {
    try {
      const { data: authData, error: authError } = await Promise.race([
        supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/login` }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 12000))
      ]);

      if (authError) {
        if (authError.status === 422 || authError.message?.toLowerCase().includes('already registered')) {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
          if (loginError) return { success: false, error: 'Email déjà utilisé. Connectez-vous.' };
          // Compléter la configuration si nécessaire
          await setupUserAccount(loginData.user.id, email, firstName, lastName, companyName, phone, plan);
          return { success: true };
        }
        return { success: false, error: authError.message };
      }

      if (!authData?.user?.id) return { success: false, error: 'Erreur Supabase' };

      // Stocker les infos pour que onAuthStateChange puisse créer le compte
      sessionStorage.setItem('pendingSetup', JSON.stringify({ firstName, lastName, companyName, email, phone: phone || null, plan: plan || null }));
      return { success: true };

    } catch (err) {
      if (err.message === 'TIMEOUT') return { success: false, error: 'Supabase ne répond pas — faites Settings → Infrastructure → Restart dans Supabase.' };
      return { success: false, error: err.message };
    }
  };

  // T-336 : inscription depuis un lien d'invitation équipe (/invite/:token).
  // Même mécanique que register() (signUp + sessionStorage + finalisation via
  // onAuthStateChange une fois l'email confirmé), mais rejoint la company de
  // l'invitation via acceptInvite() au lieu d'en créer une nouvelle.
  const registerForInvite = async ({ email, password, firstName, lastName, token }) => {
    try {
      const { data: authData, error: authError } = await Promise.race([
        supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/login` }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 12000))
      ]);

      if (authError) {
        if (authError.status === 422 || authError.message?.toLowerCase().includes('already registered')) {
          // Compte existant : on tente une connexion directe (session immédiate,
          // pas besoin de repasser par la confirmation d'email).
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
          if (loginError) return { success: false, error: 'Email déjà utilisé. Connectez-vous puis réessayez ce lien.' };
          await acceptInvite(token, firstName, lastName);
          return { success: true, immediate: true };
        }
        return { success: false, error: authError.message };
      }

      if (!authData?.user?.id) return { success: false, error: 'Erreur Supabase' };

      sessionStorage.setItem('pendingInvite', JSON.stringify({ token, firstName, lastName }));
      return { success: true };

    } catch (err) {
      if (err.message === 'TIMEOUT') return { success: false, error: 'Supabase ne répond pas, réessayez.' };
      return { success: false, error: err.message };
    }
  };

  // Comptes démo locaux — bypass Supabase UNIQUEMENT en mode développement
  const LOCAL_DEMO_ACCOUNTS = import.meta.env.DEV ? [
    { email: import.meta.env.VITE_DEMO_EMAIL || 'demo@techcorp.com', password: import.meta.env.VITE_DEMO_PASSWORD || 'demo123', firstName: 'Marie', lastName: 'Dupont', role: 'admin', company: 'TechCorp Demo' },
  ] : [];

  // Connexion
  const login = async (email, password) => {
    // Bypass local pour les comptes démo (dev uniquement, jamais en production)
    const demoAccount = LOCAL_DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
    if (demoAccount) {
      const fakeUser = {
        id: `demo-${btoa(email)}`,
        email: demoAccount.email,
        firstName: demoAccount.firstName,
        lastName: demoAccount.lastName,
        role: demoAccount.role,
        company: demoAccount.company,
        companyId: `demo-company-${btoa(email)}`,
        plan: 'Pro',
        isDemo: true,
      };
      setUser({ id: fakeUser.id, email: fakeUser.email, _demo: demoAccount });
      setProfile({
        first_name: demoAccount.firstName,
        last_name: demoAccount.lastName,
        role: demoAccount.role,
        company_id: fakeUser.companyId,
        companies: { name: demoAccount.company, plan: 'Pro' },
      });
      setIsLoggedIn(true);
      return { success: true, user: fakeUser };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Bloquer l'accès tant que l'email n'est pas vérifié (Supabase email confirmation)
      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        return {
          success: false,
          code: 'EMAIL_NOT_VERIFIED',
          email: data.user.email,
          error: 'Veuillez vérifier votre adresse email avant de vous connecter.',
        };
      }

      // Compte protégé par 2FA : la connexion n'est complète qu'après vérification du code
      const { required, factorId } = await checkMfaRequired();
      if (required) {
        setMfaPending({ factorId, email: data.user.email });
        return { success: false, code: 'MFA_REQUIRED', factorId, email: data.user.email };
      }

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }
  };

  // Renvoyer l'email de confirmation Supabase
  const resendVerificationEmail = async (email) => {
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Échec de l\'envoi du lien de vérification' };
    }
  };

  // ===== 2FA (TOTP via Supabase Auth MFA) =====

  // Valide le code TOTP lors du login et termine la connexion (élève la session à AAL2)
  const confirmMfaLogin = async (factorId, code) => {
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
      if (error) throw error;
      setMfaPending(null);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message || 'Code invalide' };
    }
  };

  // Recovery : un code de récupération valide accorde l'accès à l'application.
  // Limite connue de la plateforme Supabase : retirer définitivement le facteur TOTP
  // (mfa.unenroll) exige une session AAL2, que ce flux ne peut PAS atteindre (le code de
  // récupération est une vérification 100% côté app, pas un challenge Supabase reconnu).
  // On tente quand même l'unenroll (utile si jamais la session est déjà AAL2), mais en cas
  // d'échec on ne ment pas : l'accès est accordé via un bypass local pour cette session
  // navigateur, et l'utilisateur est invité à gérer son 2FA depuis l'onglet Sécurité.
  const recoverWithBackupCode = async (email, password, code) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error('Email ou mot de passe incorrect');

      const hashes = data.user.user_metadata?.twoFactorBackupCodeHashes || [];
      const codeHash = await sha256Hex(code.trim().toLowerCase());
      const idx = hashes.indexOf(codeHash);
      if (idx === -1) {
        await supabase.auth.signOut();
        return { success: false, error: 'Code de récupération invalide ou déjà utilisé' };
      }

      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totpFactors = factorsData?.totp || [];
      let factorRemoved = totpFactors.length === 0;
      for (const factor of totpFactors) {
        const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        if (!unenrollError) factorRemoved = true;
      }

      const remaining = hashes.filter((_, i) => i !== idx);
      await supabase.auth.updateUser({ data: { twoFactorBackupCodeHashes: remaining } });

      if (!factorRemoved) {
        // Le facteur reste enregistré côté Supabase : on autorise l'accès pour cette
        // session navigateur (30 min max) sans re-déclencher le gate 2FA à chaque
        // rechargement. Token aléatoire (jamais l'id utilisateur, public) — voir T-353.
        sessionStorage.setItem(MFA_RECOVERY_BYPASS_KEY, JSON.stringify({
          userId: data.user.id,
          token: crypto.randomUUID(),
          expiresAt: Date.now() + MFA_RECOVERY_BYPASS_TTL_MS,
        }));
      }

      setUser(data.user);
      setIsLoggedIn(true);
      setMfaPending(null);
      loadProfile(data.user.id).catch(() => {});

      return { success: true, user: data.user, factorRemoved };
    } catch (error) {
      return { success: false, error: error.message || 'Code de récupération invalide' };
    }
  };

  // Démarre l'inscription d'un nouvel appareil TOTP (génère secret + QR code, pas encore actif)
  const enrollMfa = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `ATS Ultimate ${new Date().toLocaleDateString('fr-FR')}`,
      });
      if (error) throw error;
      return { success: true, factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret, uri: data.totp.uri };
    } catch (error) {
      return { success: false, error: error.message || 'Impossible de démarrer la configuration 2FA' };
    }
  };

  // Confirme le code TOTP affiché par l'app d'authentification et active le 2FA + génère les codes de récupération
  const confirmMfaEnrollment = async (factorId, code) => {
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });
      if (verifyError) throw verifyError;

      const backupCodes = Array.from({ length: 8 }, () => generateBackupCode());
      const hashes = await Promise.all(backupCodes.map(sha256Hex));
      await supabase.auth.updateUser({ data: { twoFactorBackupCodeHashes: hashes } });

      return { success: true, backupCodes };
    } catch (error) {
      // Le code est invalide : on retire le facteur en attente pour permettre une nouvelle tentative propre
      await supabase.auth.mfa.unenroll({ factorId }).catch(() => {});
      return { success: false, error: error.message || 'Code invalide' };
    }
  };

  // Désactive le 2FA (nécessite confirmation du mot de passe).
  // Le mot de passe est vérifié via un client isolé (verifyPasswordIsolated) plutôt que
  // par un signInWithPassword sur le client principal : cela évite de réinitialiser l'AAL2
  // de la session courante, ce qui ferait échouer mfa.unenroll() juste après (confirmé en test).
  const disableMfa = async (password) => {
    try {
      if (!user) return { success: false, error: 'Non connecté' };
      const passwordOk = await verifyPasswordIsolated(user.email, password);
      if (!passwordOk) return { success: false, error: 'Mot de passe incorrect' };

      const { data: factorsData, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) throw listError;
      const totpFactors = factorsData?.totp || [];
      for (const factor of totpFactors) {
        const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        if (unenrollError) throw unenrollError;
      }
      await supabase.auth.updateUser({ data: { twoFactorBackupCodeHashes: [] } });
      sessionStorage.removeItem(MFA_RECOVERY_BYPASS_KEY);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Erreur lors de la désactivation du 2FA' };
    }
  };

  // Liste les facteurs TOTP enregistrés pour le compte courant
  const getMfaFactors = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) return [];
    return data?.totp || [];
  };

  // Déconnexion
  const logout = async () => {
    if (!user?._demo) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem(MFA_RECOVERY_BYPASS_KEY);
    setUser(null);
    setProfile(null);
    setIsLoggedIn(false);
    setIsSuperAdmin(false);
    // T-384 : les clés React Query (['missions'], ['candidates']...) ne sont
    // scopées ni par company_id ni par user.id — sans ce clear(), un second
    // compte (autre company) se connectant dans les 30s (staleTime) sur le
    // même navigateur verrait instantanément les données déjà en cache du
    // compte précédent, sans le moindre appel réseau. Vidage total plutôt que
    // scoping des clés : plus sûr immédiatement, et évite de devoir retoucher
    // chaque queryKey/invalidateQueries de useAPIData.js (risque de casser la
    // dédup de cache partagée entre DataContext et AdminPage sur ['users']).
    queryClient.clear();
  };

  // Connexion démo rapide (crée un compte démo si besoin)
  const loginDemo = async () => {
    return login('demo@ats-ultimate.com', 'Demo2026!');
  };

  // Mise à jour du profil
  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'Non connecté' };
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (error) throw error;
      setProfile(prev => ({ ...prev, ...updates }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Compatibilité avec l'ancien registerAndLogin (utilisé dans RegisterPage)
  const registerAndLogin = async (accountData) => {
    return register(accountData);
  };

  // Objet user unifié (compatibilité avec l'ancien format)
  const userFormatted = user ? {
    id: user.id,
    email: user.email,
    firstName: profile?.first_name || user.email?.split('@')[0],
    lastName: profile?.last_name || '',
    company: profile?.companies?.name || 'Mon entreprise',
    companyId: profile?.company_id,
    // T-324 : tant que le profil n'est pas chargé, ne jamais présumer un rôle/plan
    // privilégié — usePlanAccess() traite déjà un rôle/plan absent comme le plus
    // restrictif (fallback 'recruiter'/'solo'), donc null ici ne dégrade aucun accès légitime.
    role: profile?.role || null,
    plan: profile?.companies?.plan || null,
    avatar: profile?.avatar,
    // T-356 : permissions granulaires par équipier (définies par le Manager dans
    // AdminPage → Équipe), consommées par usePlanAccess().hasPermission(). null/[]
    // signifie "pas de restriction custom définie" — usePlanAccess retombe alors sur
    // les permissions par défaut du rôle, jamais sur un accès total non voulu.
    permissions: profile?.permissions ?? null,
  } : null;

  const value = {
    user: userFormatted,
    profile,
    isLoggedIn,
    isSuperAdmin,
    isLoading,
    mfaPending,
    login,
    logout,
    register,
    registerForInvite,
    acceptInvite,
    registerAndLogin,
    resendVerificationEmail,
    loginDemo,
    updateProfile,
    confirmMfaLogin,
    recoverWithBackupCode,
    enrollMfa,
    confirmMfaEnrollment,
    disableMfa,
    getMfaFactors,
    demoUsers: [{ email: 'demo@ats-ultimate.com', password: 'Demo2026!' }],
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return context;
}

export default AuthContext;
