import React, { useState, useEffect } from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Button from '@/shared/components/Button/Button';

const DEFAULT_TEMPLATES = [
  {
    id: 'followup',
    name: '📬 Relance candidature',
    subject: 'Suite à votre candidature — {position}',
    body: `Bonjour {name},

Nous avons bien reçu votre candidature pour le poste de {position} et nous vous en remercions.

Après examen de votre profil, nous souhaiterions vous proposer un entretien pour approfondir votre candidature.

Pourriez-vous nous indiquer vos disponibilités pour la semaine prochaine ?

Cordialement,
L'équipe recrutement`,
  },
  {
    id: 'interview',
    name: '🗓️ Invitation entretien',
    subject: 'Invitation à un entretien — {position}',
    body: `Bonjour {name},

Votre candidature pour le poste de {position} a retenu toute notre attention.

Nous souhaitons vous rencontrer lors d'un entretien et vous proposons le créneau suivant :
📅 Date : [À compléter]
⏰ Heure : [À compléter]
📍 Lieu : [À compléter / Visioconférence]

Merci de confirmer votre présence en répondant à cet email.

Cordialement,
L'équipe recrutement`,
  },
  {
    id: 'rejection',
    name: '❌ Refus de candidature',
    subject: 'Réponse à votre candidature — {position}',
    body: `Bonjour {name},

Nous vous remercions de l'intérêt que vous avez porté à notre entreprise et du temps consacré à votre candidature pour le poste de {position}.

Après examen attentif de votre dossier, nous avons le regret de vous informer que nous ne pouvons pas donner suite à votre candidature.

Nous conservons votre profil dans notre CVthèque et n'hésiterons pas à vous recontacter si une opportunité correspondant à vos compétences se présente.

Cordialement,
L'équipe recrutement`,
  },
  {
    id: 'offer',
    name: '🎉 Proposition d\'offre',
    subject: 'Proposition d\'embauche — {position}',
    body: `Bonjour {name},

Nous avons le plaisir de vous informer que votre candidature pour le poste de {position} a été retenue.

Nous souhaitons vous adresser une proposition d'embauche et vous invitons à nous contacter dès que possible afin de discuter des modalités.

Félicitations et bienvenue dans notre équipe !

Cordialement,
L'équipe recrutement`,
  },
  {
    id: 'custom',
    name: '✏️ Message personnalisé',
    subject: '',
    body: '',
  },
];

function interpolate(text, vars) {
  return text.replace(/\{(\w+)\}/g, (_, key) => vars[key] || `{${key}}`);
}

export function EmailComposerModal({ isOpen, onClose, candidate }) {
  const [selectedTemplate, setSelectedTemplate] = useState('followup');
  const [subject, setSubject]   = useState('');
  const [body, setBody]         = useState('');
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);

  const vars = {
    name: candidate?.name || '',
    position: candidate?.position || '',
    email: candidate?.email || '',
  };

  useEffect(() => {
    if (!isOpen) { setSent(false); return; }
    const tpl = DEFAULT_TEMPLATES.find(t => t.id === selectedTemplate);
    if (tpl) {
      setSubject(interpolate(tpl.subject, vars));
      setBody(interpolate(tpl.body, vars));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate, isOpen]);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    // Demo mode: simulate send with a short delay
    await new Promise(r => setTimeout(r, 900));
    setSending(false);
    setSent(true);
  };

  if (!isOpen || !candidate) return null;

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB',
    borderRadius: '10px', fontSize: '14px', color: '#1F2937',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>
        ✉️ Envoyer un email à {candidate.name}
      </Modal.Header>

      <Modal.Body>
        <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '-16px', marginBottom: '16px' }}>
          {candidate.email}
        </div>
        {sent ? (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
            borderRadius: '16px',
          }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#065F46', marginBottom: '8px' }}>
              Email envoyé !
            </h3>
            <p style={{ fontSize: '14px', color: '#047857' }}>
              Votre message a été transmis à {candidate.email}
            </p>
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
              (Mode démo — connectez le backend email pour l'envoi réel)
            </p>
          </div>
        ) : (
          <>
            {/* Template picker */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                Modèle
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {DEFAULT_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    style={{
                      padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                      cursor: 'pointer',
                      border: `2px solid ${selectedTemplate === t.id ? '#667EEA' : '#E5E7EB'}`,
                      background: selectedTemplate === t.id ? '#EEF2FF' : 'white',
                      color: selectedTemplate === t.id ? '#667EEA' : '#6B7280',
                      transition: 'all 0.15s',
                    }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Objet
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Objet de l'email…"
                style={inputStyle}
              />
            </div>

            {/* Body */}
            <div style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Message
              </label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={12}
                placeholder="Rédigez votre message…"
                style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
              />
            </div>

            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
              Variables disponibles : <code style={{ background: '#F3F4F6', padding: '1px 4px', borderRadius: '4px' }}>{'{name}'}</code>{' '}
              <code style={{ background: '#F3F4F6', padding: '1px 4px', borderRadius: '4px' }}>{'{position}'}</code>{' '}
              <code style={{ background: '#F3F4F6', padding: '1px 4px', borderRadius: '4px' }}>{'{email}'}</code>
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          {sent ? 'Fermer' : 'Annuler'}
        </Button>
        {!sent && (
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={sending || !subject.trim() || !body.trim()}
          >
            {sending ? '⏳ Envoi…' : '📤 Envoyer'}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default EmailComposerModal;
