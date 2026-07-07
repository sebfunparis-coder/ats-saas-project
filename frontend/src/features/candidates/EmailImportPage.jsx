import React, { useState, useMemo } from 'react';
import PageContainer from '@/shared/components/Layout/PageContainer';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import { useAuth } from '@/core/contexts/AuthContext';
import { useCandidates } from '@/core/hooks/useCandidates';
import { useIsMobile } from '@/core/hooks/useIsMobile';

const IMPORT_LOG_KEY = 'ats_email_imports';

const SAMPLE_EMAILS = [
  {
    from: 'jean.dupont@gmail.com',
    subject: 'Candidature spontanee - Developpeur React Senior',
    body: 'Bonjour, je me permets de vous adresser ma candidature pour un poste de developpeur React. Avec 6 ans d\'experience, je maitrise React, TypeScript, Node.js et AWS. Base a Paris, ouvert au remote. Cordialement, Jean Dupont.',
    attachment: 'CV_Jean_Dupont.pdf',
    date: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    from: 'marie.martin@outlook.fr',
    subject: 'CV - UX Designer',
    body: 'Madame, Monsieur, Suite a votre annonce pour un poste de UX Designer, je vous soumets ma candidature. 4 ans d\'experience en design produit, maitrise de Figma et Adobe XD. Disponible immediatement. Marie Martin, Lyon.',
    attachment: 'CV_Marie_Martin.pdf',
    date: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    from: 'pierre.leblanc@yahoo.fr',
    subject: 'Candidature - Product Manager',
    body: 'Bonjour, je suis Product Manager avec 8 ans d\'experience dans le SaaS B2B. Certifie Scrum Master, expertise data-driven product management. Je travaille actuellement chez une scale-up parisienne et suis a l\'ecoute d\'opportunites. Pierre Leblanc.',
    attachment: 'CV_Pierre_Leblanc.pdf',
    date: new Date(Date.now() - 86400000).toISOString(),
  },
];

function parseEmailToCandidate(email) {
  const text = (email.subject + ' ' + email.body).toLowerCase();
  const nameMatch = email.from.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const skills = [];
  const TECHS = ['react', 'typescript', 'node', 'aws', 'figma', 'adobe xd', 'python', 'java', 'vue', 'angular', 'sql', 'docker', 'scrum'];
  TECHS.forEach(t => { if (text.includes(t)) skills.push(t.charAt(0).toUpperCase() + t.slice(1)); });

  const expMatch = text.match(/(\d+)\s*ans?\s*(d'|de\s)?exp/);
  const experience = expMatch ? parseInt(expMatch[1]) : null;

  const cities = ['paris', 'lyon', 'bordeaux', 'marseille', 'toulouse', 'nantes', 'lille', 'strasbourg', 'remote'];
  const location = cities.find(c => text.includes(c));

  const posMatch = email.subject.match(/(?:candidature|cv)\s*[-:—]?\s*(.+)/i);
  const position = posMatch ? posMatch[1].trim() : 'Non specifie';

  return {
    name: nameMatch,
    email: email.from,
    position,
    skills,
    experience: experience || 0,
    location: location ? location.charAt(0).toUpperCase() + location.slice(1) : '',
    source: 'Email',
    status: 'new',
    dateAdded: new Date().toISOString().split('T')[0],
    notes: email.body.substring(0, 300),
  };
}

export default function EmailImportPage() {
  const { user } = useAuth();
  const { addCandidate } = useCandidates();
  const { showNotification } = useNotifications();
  const isMobile = useIsMobile();

  const slug = (user?.company || user?.companyId || 'demo').toString().toLowerCase().replace(/\s+/g, '-');
  const emailAddress = `cv@${slug}.ats.app`;

  const [importLog, setImportLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem(IMPORT_LOG_KEY) || '[]'); } catch { return []; }
  });
  const [simulating, setSimulating] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [creating, setCreating] = useState(false);

  const simulate = (email) => {
    setSimulating(email);
    setParsed(parseEmailToCandidate(email));
  };

  const createCandidate = async () => {
    if (!parsed) return;
    setCreating(true);
    try {
      await addCandidate(parsed);
      const log = [{ ...simulating, parsedName: parsed.name, importedAt: new Date().toISOString() }, ...importLog];
      setImportLog(log);
      localStorage.setItem(IMPORT_LOG_KEY, JSON.stringify(log));
      showNotification('Candidat cree depuis l\'email avec succes', 'success');
      setSimulating(null);
      setParsed(null);
    } catch { /* handled in hook */ }
    setCreating(false);
  };

  const box = { padding: '20px', background: 'white', borderRadius: '14px', border: '1.5px solid #E5E7EB', marginBottom: '12px' };

  return (
    <PageContainer title="Import CV par email" subtitle={'Adresse unique : ' + emailAddress}>
      {/* Address card */}
      <div style={{ ...box, background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', border: '2px solid #C4B5FD', marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>Adresse email d\'import unique pour votre espace :</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <code style={{ fontSize: '18px', fontWeight: '900', color: '#5B21B6', flex: 1 }}>{emailAddress}</code>
          <button
            onClick={() => { navigator.clipboard.writeText(emailAddress); showNotification('Adresse copiee !', 'success'); }}
            style={{ padding: '8px 16px', background: '#7C3AED', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}
          >
            Copier
          </button>
        </div>
        <div style={{ fontSize: '12px', color: '#8B5CF6', marginTop: '8px' }}>
          Les CVs envoyes a cette adresse sont automatiquement analyses et crees comme candidats.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Emails entrants simules */}
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1F2937', marginBottom: '14px' }}>
            Emails recus (simulation)
          </h3>
          {SAMPLE_EMAILS.map((email, i) => (
            <div key={i} style={{ ...box, cursor: 'pointer', borderColor: simulating === email ? '#667EEA' : '#E5E7EB' }}
              onClick={() => simulate(email)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937' }}>{email.subject}</div>
                  <div style={{ fontSize: '11px', color: '#667EEA', marginTop: '2px' }}>{email.from}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', lineHeight: '1.5' }}>
                    {email.body.substring(0, 80)}...
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: '#9CA3AF', flexShrink: 0 }}>
                  {new Date(email.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {email.attachment && (
                <div style={{ marginTop: '8px', padding: '4px 8px', background: '#F3F4F6', borderRadius: '6px', fontSize: '11px', color: '#374151', display: 'inline-block' }}>
                  📎 {email.attachment}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Parsing preview */}
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1F2937', marginBottom: '14px' }}>
            Candidat parse
          </h3>
          {parsed ? (
            <div style={box}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#5B21B6', marginBottom: '12px' }}>Extraction automatique</div>
              {[
                ['Nom', parsed.name],
                ['Email', parsed.email],
                ['Poste', parsed.position],
                ['Experience', parsed.experience ? parsed.experience + ' ans' : 'Non detecte'],
                ['Localisation', parsed.location || 'Non detecte'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', gap: '12px', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ fontWeight: '700', color: '#374151', minWidth: '100px' }}>{label} :</span>
                  <span style={{ color: '#6B7280' }}>{value}</span>
                </div>
              ))}
              {parsed.skills.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Competences detectees :</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {parsed.skills.map(s => (
                      <span key={s} style={{ padding: '3px 10px', background: '#EFF6FF', color: '#3B82F6', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={createCandidate}
                disabled={creating}
                style={{ marginTop: '16px', width: '100%', padding: '10px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '14px' }}
              >
                {creating ? 'Creation...' : 'Creer le candidat'}
              </button>
            </div>
          ) : (
            <div style={{ ...box, textAlign: 'center', color: '#9CA3AF', padding: '40px 20px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📧</div>
              <div style={{ fontSize: '13px' }}>Selectionnez un email pour voir le parsing</div>
            </div>
          )}

          {/* Import log */}
          {importLog.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px' }}>Imports recents</div>
              {importLog.slice(0, 3).map((log, i) => (
                <div key={i} style={{ padding: '10px 12px', background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: '10px', marginBottom: '6px', fontSize: '12px' }}>
                  <span style={{ fontWeight: '700', color: '#065F46' }}>{log.parsedName}</span>
                  <span style={{ color: '#6B7280' }}> depuis {log.from}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
