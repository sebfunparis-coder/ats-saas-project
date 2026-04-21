import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

/**
 * Page Contact
 */
export function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const containerStyles = { minHeight: '100vh', background: 'linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%)', padding: '120px 40px 80px' };
  const maxWidthStyles = { maxWidth: '1200px', margin: '0 auto' };
  const titleStyles = { fontSize: '56px', fontWeight: '900', marginBottom: '24px', textAlign: 'center', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };

  return (
    <div style={containerStyles}>
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
                ✅ Message envoyé ! Nous vous répondrons sous 24h.
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

              <button type="submit" style={{ padding: '16px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '18px', boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)' }}>
                ✉️ Envoyer le message
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
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📞</div>
                  <div style={{ fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>Téléphone</div>
                  <a href="tel:+33140506070" style={{ color: '#667EEA', fontSize: '16px' }}>+33 1 40 50 60 70</a>
                </div>

                <div>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📍</div>
                  <div style={{ fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>Adresse</div>
                  <div style={{ color: '#4B5563', fontSize: '16px' }}>
                    123 Avenue des Champs-Élysées<br/>
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
    </div>
  );
}

export default Contact;
