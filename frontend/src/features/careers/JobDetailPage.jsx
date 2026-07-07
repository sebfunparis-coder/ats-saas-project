import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { fileToBase64, validatePDF, formatFileSize } from '@/core/utils/fileHandlers';
import { createPublicTrackingLink } from '@/core/utils/trackingLink';
import { computeEliminated } from '@/core/utils/screeningElimination';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import { SEO } from '@/shared/components/SEO';

const STEPS = ['Infos perso', 'CV', 'Questions', 'Test', 'Confirmation'];

/**
 * Page publique de candidature à une offre — wizard multi-étapes (T-245).
 * Migré depuis l'API Express/MongoDB (jamais déployée en prod, déconnectée
 * des missions Supabase réelles) vers Supabase directement, avec policies
 * RLS dédiées à l'INSERT public restreint aux missions status='open'
 * (voir migration 007).
 */
export default function JobDetailPage() {
  const { slug, jobId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(0);
  const [personalInfo, setPersonalInfo] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [cvFile, setCvFile] = useState(null);
  const [cvError, setCvError] = useState('');
  const [answers, setAnswers] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // T-357 : select('*') sur une page 100% publique/anonyme fuitait des colonnes
      // internes (notes recruteur, coordonnées du contact client, historique
      // d'approbation, grille d'évaluation) à tout visiteur inspectant la requête
      // réseau. Liste explicite des seules colonnes réellement affichées/utilisées
      // par ce composant (voir usages de `job.*` plus bas dans ce fichier).
      const { data, error } = await supabase
        .from('missions')
        .select('id, title, description, location, "contractType", "workMode", client, company_id, "screeningQuestions", "testLink", status')
        .eq('id', jobId)
        .eq('company_id', slug)
        .eq('status', 'open')
        .single();
      if (!cancelled) {
        setJob(error ? null : data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug, jobId]);

  const screeningQuestions = job?.screeningQuestions || [];
  const hasScreening = screeningQuestions.length > 0;
  const hasTestLink = !!job?.testLink;

  // Étapes effectivement affichées (on saute "Questions"/"Test" si non configurés sur la mission)
  const visibleSteps = STEPS.filter(s => (s !== 'Questions' || hasScreening) && (s !== 'Test' || hasTestLink));
  const stepKey = visibleSteps[step];

  const isPersonalInfoValid = personalInfo.firstName.trim() && personalInfo.lastName.trim() && personalInfo.email.trim();
  const isCvValid = !!cvFile;

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { isValid, error } = validatePDF(file);
    if (!isValid) {
      setCvError(error);
      setCvFile(null);
      return;
    }
    setCvError('');
    setCvFile(file);
  };

  const goNext = () => setStep(s => Math.min(s + 1, visibleSteps.length - 1));
  const goBack = () => setStep(s => Math.max(s - 1, 0));

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const base64Data = await fileToBase64(cvFile);
      const resume = {
        fileName: cvFile.name,
        fileSize: cvFile.size,
        fileSizeFormatted: formatFileSize(cvFile.size),
        uploadDate: new Date().toISOString(),
        base64Data,
      };

      const candidateName = `${personalInfo.firstName.trim()} ${personalInfo.lastName.trim()}`;
      const eliminated = computeEliminated(screeningQuestions, answers);

      const candidatePayload = {
        name: candidateName,
        email: personalInfo.email.trim().toLowerCase(),
        phone: personalInfo.phone.trim(),
        position: job.title,
        status: 'active',
        resume,
        source: 'portail carrières',
        legalBasis: 'consent',
        consentDate: new Date().toISOString().split('T')[0],
        dateAdded: new Date().toISOString().split('T')[0],
        lastActivity: new Date().toISOString().split('T')[0],
        company_id: job.company_id,
      };

      // T-424 : anon n'a AUCUNE policy SELECT sur candidates/applications — un
      // `.insert().select()` échoue donc systématiquement avec une violation RLS
      // trompeuse (Postgres exige aussi la policy SELECT pour le RETURNING
      // implicite d'un insert suivi de .select(), même quand la policy INSERT
      // elle-même est satisfaite). Confirmé en conditions réelles : un insert
      // identique SANS .select() réussit et la ligne est bien créée. Corrigé en
      // générant les id côté client (comme setupUserAccount()/shareLink.js
      // ailleurs dans ce projet) — on n'a alors plus besoin de relire la ligne
      // insérée du tout, quelle que soit la policy SELECT.
      const candidateId = crypto.randomUUID();

      // T-362 : `sourceMissionId` prouve à la policy RLS publique que ce candidat
      // postule réellement à CETTE mission ouverte précise (migration 026), pas
      // seulement à "une company qui a un poste ouvert quelque part" (faille de
      // spam). Repli si la migration 026 n'a pas encore été exécutée (colonne
      // absente, PGRST204) : on retente sans ce champ pour ne jamais casser le
      // formulaire de candidature public en attendant — au prix de retomber
      // temporairement sur l'ancien niveau de protection, déjà en place avant ce
      // correctif.
      let { error: candidateErr } = await supabase
        .from('candidates')
        .insert({ id: candidateId, ...candidatePayload, sourceMissionId: job.id });
      if (candidateErr?.code === 'PGRST204') {
        ({ error: candidateErr } = await supabase
          .from('candidates')
          .insert({ id: candidateId, ...candidatePayload }));
      }
      if (candidateErr) throw candidateErr;

      const screeningAnswers = screeningQuestions.map(q => ({ questionId: q.id, question: q.question, answer: answers[q.id] ?? null }));
      const applicationId = crypto.randomUUID();

      const { error: applicationErr } = await supabase
        .from('applications')
        .insert({
          id: applicationId,
          candidate_id: candidateId,
          mission_id: job.id,
          candidateName,
          candidateAvatar: '👤',
          missionTitle: job.title,
          clientName: job.client || '',
          status: eliminated ? 'rejected' : 'received',
          dateApplied: new Date().toISOString().split('T')[0],
          screeningAnswers,
          eliminated,
          company_id: job.company_id,
        });
      if (applicationErr) throw applicationErr;

      // T-251 — Lien de suivi candidat, généré dès la candidature
      try {
        const link = await createPublicTrackingLink({ applicationId, companyId: job.company_id });
        setTrackingUrl(link);
      } catch {
        // Non bloquant : la candidature est déjà enregistrée même si le lien échoue
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Erreur lors de l'envoi de la candidature");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#6B7280' }}>
      Chargement…
    </div>
  );

  if (!job) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#6B7280' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
      <p>Cette offre n&apos;existe pas ou a été clôturée.</p>
      <button onClick={() => navigate(`/careers/${slug}`)} style={{ marginTop: '16px', padding: '10px 20px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
        ← Retour aux offres
      </button>
    </div>
  );

  if (submitted) return (
    <div style={{ textAlign: 'center', padding: '80px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
      <h2 style={{ fontWeight: '900', color: '#1F2937' }}>Candidature envoyée !</h2>
      <p style={{ color: '#6B7280' }}>Nous avons bien reçu votre candidature pour <strong>{job.title}</strong>. Nous vous contacterons prochainement.</p>
      {trackingUrl && (
        <div style={{ marginTop: '24px', padding: '16px 20px', background: '#F9FAFB', borderRadius: '12px', textAlign: 'left' }}>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
            🔗 Suivez votre candidature à tout moment :
          </p>
          <a href={trackingUrl} style={{ fontSize: '13px', color: '#667EEA', wordBreak: 'break-all' }}>{trackingUrl}</a>
        </div>
      )}
      <button onClick={() => navigate(`/careers/${slug}`)} style={{ marginTop: '24px', padding: '12px 24px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>
        Voir d&apos;autres offres
      </button>
    </div>
  );

  const inputStyle = {
    width: '100%', padding: '12px 14px', border: '2px solid #E5E7EB',
    borderRadius: '10px', fontSize: '15px', boxSizing: 'border-box',
    outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle = { display: 'block', fontWeight: '700', fontSize: '14px', marginBottom: '6px', color: '#374151' };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px', fontFamily: 'system-ui, sans-serif' }}>
      <SEO
        title={job.title}
        description={(job.description || `Postulez à l'offre ${job.title}`).slice(0, 160)}
        url={`https://ats-ultimate.com/careers/${slug}/job/${jobId}`}
      />
      <button
        onClick={() => navigate(`/careers/${slug}`)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#667EEA', fontWeight: '700', fontSize: '14px', marginBottom: '24px', padding: 0 }}
      >
        ← Retour aux offres
      </button>

      {/* Job header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 16px', fontWeight: '900', fontSize: '28px', color: '#1F2937' }}>{job.title}</h1>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {job.location && <span style={{ fontSize: '14px', color: '#6B7280' }}>📍 {job.location}</span>}
          {job.contractType && <span style={{ fontSize: '14px', color: '#6B7280' }}>📄 {job.contractType}</span>}
          {job.workMode && <span style={{ fontSize: '14px', color: '#6B7280' }}>🏠 {job.workMode}</span>}
        </div>
        {job.description && (
          <div style={{ color: '#374151', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{job.description}</div>
        )}
      </div>

      {/* Wizard */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
          {visibleSteps.map((label, i) => (
            <React.Fragment key={label}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', fontSize: '13px',
                  background: i <= step ? '#667EEA' : '#E5E7EB',
                  color: i <= step ? 'white' : '#9CA3AF',
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '11px', color: i <= step ? '#667EEA' : '#9CA3AF', fontWeight: '700', whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < visibleSteps.length - 1 && (
                <div style={{ flex: 1, height: '2px', background: i < step ? '#667EEA' : '#E5E7EB', margin: '0 8px 18px' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Étape : Infos perso */}
        {stepKey === 'Infos perso' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Prénom *</label>
                <input required style={inputStyle} value={personalInfo.firstName} onChange={e => setPersonalInfo(p => ({ ...p, firstName: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Nom *</label>
                <input required style={inputStyle} value={personalInfo.lastName} onChange={e => setPersonalInfo(p => ({ ...p, lastName: e.target.value }))} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input required type="email" style={inputStyle} value={personalInfo.email} onChange={e => setPersonalInfo(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input style={inputStyle} value={personalInfo.phone} onChange={e => setPersonalInfo(p => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>
        )}

        {/* Étape : CV */}
        {stepKey === 'CV' && (
          <div>
            <label style={labelStyle}>CV (PDF) *</label>
            <input type="file" accept=".pdf" onChange={handleCvChange} style={{ ...inputStyle, padding: '10px' }} />
            {cvError && <div role="alert" style={{ marginTop: '8px', color: '#DC2626', fontSize: '13px' }}>{cvError}</div>}
            {cvFile && !cvError && (
              <div style={{ marginTop: '12px', padding: '12px 16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', fontSize: '13px', color: '#065F46' }}>
                📄 {cvFile.name} ({formatFileSize(cvFile.size)})
              </div>
            )}
          </div>
        )}

        {/* Étape : Questions de pré-sélection */}
        {stepKey === 'Questions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {screeningQuestions.map(q => (
              <div key={q.id}>
                <label style={labelStyle}>{q.question}{q.eliminatory && <span style={{ color: '#DC2626' }}> *</span>}</label>
                {q.type === 'yesno' ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['yes', 'no'].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setAnswers(a => ({ ...a, [q.id]: v }))}
                        style={{
                          flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700',
                          border: `2px solid ${answers[q.id] === v ? '#667EEA' : '#E5E7EB'}`,
                          background: answers[q.id] === v ? '#EEF2FF' : 'white',
                          color: answers[q.id] === v ? '#667EEA' : '#6B7280',
                        }}
                      >
                        {v === 'yes' ? 'Oui' : 'Non'}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    value={answers[q.id] || ''}
                    onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Étape : Test de pré-qualification */}
        {stepKey === 'Test' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '40px' }}>🧪</div>
            <p style={{ color: '#374151', fontSize: '15px', maxWidth: '480px' }}>
              Cette offre nécessite de compléter un test de pré-qualification. Cliquez sur le lien ci-dessous pour le réaliser, puis revenez ici pour finaliser votre candidature.
            </p>
            <a
              href={job.testLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: '12px 24px', background: '#667EEA', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: '700' }}
            >
              🔗 Réaliser le test
            </a>
          </div>
        )}

        {/* Étape : Confirmation */}
        {stepKey === 'Confirmation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#F9FAFB', borderRadius: '10px', fontSize: '14px', color: '#374151', lineHeight: '1.8' }}>
              <div><strong>Candidat :</strong> {personalInfo.firstName} {personalInfo.lastName}</div>
              <div><strong>Email :</strong> {personalInfo.email}</div>
              {personalInfo.phone && <div><strong>Téléphone :</strong> {personalInfo.phone}</div>}
              <div><strong>CV :</strong> {cvFile?.name}</div>
              {hasScreening && <div><strong>Questions :</strong> {screeningQuestions.length} réponse(s) renseignée(s)</div>}
            </div>
            {submitError && (
              <div role="alert" style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', fontSize: '14px' }}>
                {submitError}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            style={{ padding: '12px 24px', background: 'white', color: '#6B7280', border: '2px solid #E5E7EB', borderRadius: '10px', cursor: step === 0 ? 'not-allowed' : 'pointer', fontWeight: '700', opacity: step === 0 ? 0.5 : 1 }}
          >
            ← Précédent
          </button>

          {stepKey !== 'Confirmation' ? (
            <button
              type="button"
              onClick={goNext}
              disabled={(stepKey === 'Infos perso' && !isPersonalInfoValid) || (stepKey === 'CV' && !isCvValid)}
              style={{
                padding: '12px 24px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '10px',
                cursor: 'pointer', fontWeight: '700',
                opacity: ((stepKey === 'Infos perso' && !isPersonalInfoValid) || (stepKey === 'CV' && !isCvValid)) ? 0.5 : 1,
              }}
            >
              Suivant →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={submitting}
              style={{
                padding: '14px 28px', background: submitting ? '#9CA3AF' : 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                color: 'white', border: 'none', borderRadius: '12px',
                cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: '800', fontSize: '16px',
              }}
            >
              {submitting ? 'Envoi en cours…' : 'Envoyer ma candidature'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
