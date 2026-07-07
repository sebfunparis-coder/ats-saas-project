import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/core/contexts/AuthContext';

const base = { minHeight: '100vh', background: 'linear-gradient(135deg, #667EEA15 0%, #764BA215 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' };
const card = { background: 'white', borderRadius: '24px', maxWidth: '440px', width: '100%', padding: '40px', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' };
const input = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', marginBottom: '14px' };
const ROLE_LABELS = { recruiter: 'Recruteur', viewer: 'Lecteur', manager: 'Manager', admin: 'Admin' };

/**
 * Page publique d'acceptation d'invitation équipe (T-336). Accès via lien
 * tokenisé envoyé par un Manager depuis AdminPage → onglet Équipe. Toute
 * lecture publique passe par la fonction RPC SECURITY DEFINER get_invite_details
 * (migration 019) ; l'inscription passe par registerForInvite() (AuthContext),
 * qui appelle ensuite accept_invite() une fois l'email confirmé et l'utilisateur
 * connecté.
 */
export default function InviteAcceptPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { registerForInvite, isLoggedIn } = useAuth();

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase.rpc('get_invite_details', { p_token: token });
      if (cancelled) return;
      if (err || !data || !data.valid) setNotFound(true);
      else setInvite(data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    // Si déjà connecté (session existante), l'acceptation se fait directement
    // au montage plutôt que de demander de créer un nouveau compte.
    if (isLoggedIn && invite?.valid) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [isLoggedIn, invite, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || form.password.length < 6) {
      setError('Merci de remplir tous les champs (mot de passe : 6 caractères minimum).');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const result = await registerForInvite({
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        token,
      });
      if (!result.success) {
        setError(result.error || 'Impossible de créer le compte.');
        return;
      }
      if (result.immediate) {
        navigate('/app/dashboard', { replace: true });
      } else {
        setAwaitingConfirmation(true);
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={base}><div style={{ fontSize: '32px' }}>⏳</div></div>;

  if (notFound) return (
    <div style={base}>
      <div style={{ ...card, textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔍</div>
        <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1F2937', marginBottom: '8px' }}>Invitation invalide</h1>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>Ce lien d'invitation est invalide, a expiré, ou a déjà été utilisé. Contactez la personne qui vous l'a envoyé.</p>
      </div>
    </div>
  );

  if (awaitingConfirmation) return (
    <div style={base}>
      <div style={{ ...card, textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>📧</div>
        <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1F2937', marginBottom: '8px' }}>Vérifiez votre boîte mail</h1>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>
          Cliquez sur le lien de confirmation que nous venons de vous envoyer, puis connectez-vous : vous rejoindrez automatiquement <strong>{invite.companyName}</strong>.
        </p>
      </div>
    </div>
  );

  return (
    <div style={base}>
      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤝</div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1F2937', marginBottom: '4px' }}>Rejoindre {invite.companyName}</h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>
            Vous avez été invité(e) en tant que <strong>{ROLE_LABELS[invite.role] || invite.role}</strong>. Créez votre compte pour accéder à l'espace de recrutement.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input style={input} placeholder="Prénom" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
          <input style={input} placeholder="Nom" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
          <input style={input} type="email" placeholder="Email professionnel" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <input style={input} type="password" placeholder="Mot de passe (6 caractères min.)" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />

          {error && <p style={{ color: '#EF4444', fontSize: '13px', marginBottom: '14px' }}>{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #667EEA, #764BA2)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? 'Création du compte...' : 'Rejoindre l\'équipe'}
          </button>
        </form>
      </div>
    </div>
  );
}
