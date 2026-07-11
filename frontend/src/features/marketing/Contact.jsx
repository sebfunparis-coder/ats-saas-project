import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { supabase } from '@/services/supabase';
import { SEO } from '@/shared/components/SEO';
import { Navbar, Footer } from '@/shared/components/Marketing';

// T-295 — Formulaire contact → CRM
// Stockage principal : table Supabase `contact_requests` (consultable dans
// /superadmin, onglet "Demandes de démo"). Formspree reste optionnel, en
// best-effort, comme notification email secondaire — configurable via
// VITE_FORMSPREE_ENDPOINT (créer un form sur formspree.io et coller l'ID ici).
const FORMSPREE_URL = import.meta.env.VITE_FORMSPREE_ENDPOINT;

/**
 * Page Contact
 */
export function Contact() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '', company: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pré-remplit le sujet si le lien entrant le précise (ex: depuis la page Tarifs, ?sujet=demo)
  useEffect(() => {
    const sujet = searchParams.get('sujet');
    const validSubjects = ['demo', 'pricing', 'support', 'partnership', 'other'];
    if (sujet && validSubjects.includes(sujet)) {
      setFormData(prev => ({ ...prev, subject: sujet }));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Stockage principal — source de vérité, consultée depuis /superadmin
      const { error: dbError } = await supabase.from('contact_requests').insert({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        subject: formData.subject,
        message: formData.message,
      });
      if (dbError) throw dbError;

      // Notification email best-effort (n'empêche pas le succès si ça échoue)
      if (FORMSPREE_URL) {
        fetch(FORMSPREE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            company: formData.company,
            subject: formData.subject,
            message: formData.message,
            _subject: `[ATS Ultimate] Nouveau contact — ${formData.subject}`,
          }),
        }).catch(() => {});
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '', company: '' });
    } catch {
      setError('Une erreur est survenue. Écrivez-nous directement : contact@ats-ultimate.com');
    } finally {
      setLoading(false);
    }
  };

  const containerStyles = { minHeight: '100vh', background: 'linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%)', padding: '120px 40px 80px' };
  const maxWidthStyles = { maxWidth: '1200px', margin: '0 auto' };
  const titleStyles = { fontSize: '56px', fontWeight: '900', marginBottom: '24px', textAlign: 'center', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };

  return (
    <div style={containerStyles}>
      <SEO
        title="Contact"
        description="Contactez l'équipe ATS Ultimate pour une démo, une question tarifaire ou un partenariat."
        url="https://ats-ultimate.com/contact"
      />
      <Navbar />
      <div style={maxWidthStyles}>
        <button onClick={() => navigate(ROUTES.LANDING)} style={{ marginBottom: '32px', padding: '12px 24px', background: '#EEF2FF', color: '#667EEA', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
          ← Retour à l'accueil
        </button>

        <h1 style={titleStyles}>Contactez-nous</h1>
        <p style={{ textAlign: 'center', fontSize: '20px', color: '#6B7280', marginBottom: '64px' }}>
          Notre équipe est là pour répondre à toutes vos questions
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
          {/* Formulaire */}
          <div style={{ background: 'white', padding: '48px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '32px', color: '#1F2937' }}>📧 Envoyez-nous un message</h2>

            {submitted && (
              <div style={{ padding: '16px', background: '#DCFCE7', border: '2px solid #10B981', borderRadius: '12px', marginBottom: '24px', color: '#065F46', fontWeight: '600' }}>
                ✅ Message envoyé ! Notre équipe vous répondra sous 24h.
              </div>
            )}
            {error && (
              <div style={{ padding: '16px', background: '#FEE2E2', border: '2px solid #EF4444', borderRadius: '12px', marginBottom: '24px', color: '#991B1B', fontWeight: '600' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1F2937' }}>Nom complet *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '16px' }}
                  placeholder="Ex: Jean Dupont"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1F2937' }}>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: '14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '16px' }}
                  placeholder="jean.dupont@entreprise.com"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1F2937' }}>Sujet *</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  style={{ width: '100%', padding: '14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '16px' }}
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="demo">Demande de démo</option>
                  <option value="pricing">Question sur les tarifs</option>
                  <option value="support">Support technique</option>
                  <option value="partnership">Partenariat</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1F2937' }}>Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={6}
                  style={{ width: '100%', padding: '14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '16px', resize: 'vertical' }}
                  placeholder="Décrivez votre demande..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ padding: '16px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '800', fontSize: '18px', boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? '⏳ Envoi en cours...' : '✉️ Envoyer le message'}
              </button>
            </form>
          </div>

          {/* Informations */}
          <div>
            <div style={{ background: 'white', padding: '48px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '32px', color: '#1F2937' }}>📍 Coordonnées</h2>

              <div style={{ display: 'grid', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📧</div>
                  <div style={{ fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>Email</div>
                  <a href="mailto:contact@ats-ultimate.com" style={{ color: '#667EEA', fontSize: '16px' }}>contact@ats-ultimate.com</a>
                </div>

                <div>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📍</div>
                  <div style={{ fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>Adresse</div>
                  <div style={{ color: '#4B5563', fontSize: '16px' }}>
                    GETWORK<br/>
                    60 rue François 1er<br/>
                    75008 Paris, France
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏰</div>
                  <div style={{ fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>Horaires</div>
                  <div style={{ color: '#4B5563', fontSize: '16px' }}>
                    Lun - Ven : 9h - 18h<br/>
                    Sam - Dim : Fermé
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', padding: '48px', borderRadius: '24px', color: 'white', textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>💬 Besoin d'aide immédiate ?</h3>
              <p style={{ fontSize: '16px', marginBottom: '24px', opacity: 0.9 }}>Consultez notre FAQ ou notre centre d'aide</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={() => navigate('/faq')} style={{ padding: '12px 24px', background: 'white', color: '#667EEA', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                  📚 FAQ
                </button>
                <button onClick={() => navigate('/aide')} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid white', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                  🆘 Centre d'aide
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer variant="light" />
    </div>
  );
}

export default Contact;
