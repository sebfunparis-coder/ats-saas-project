import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/services/supabase';

/**
 * Page publique listant les offres ouvertes d'une company (portail carrières).
 * T-245 — migré depuis l'API Express/MongoDB (jamais déployée en prod, et
 * déconnectée des missions Supabase réellement gérées par les recruteurs)
 * vers Supabase directement : companies_public (vue id+name uniquement,
 * voir migration 007) + missions filtrées sur status='open' (RLS publique).
 * Le param :slug est l'UUID de la company (pas de slug texte dédié — hors
 * scope de ce ticket).
 */
export default function CareersPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const { data: companyData, error: companyErr } = await supabase
        .from('companies_public')
        .select('id, name')
        .eq('id', slug)
        .single();

      if (cancelled) return;
      if (companyErr || !companyData) {
        setError('Page carrière introuvable.');
        setLoading(false);
        return;
      }
      setCompany(companyData);

      const { data: missionsData, error: missionsErr } = await supabase
        .from('missions')
        .select('id, title, location, contractType, workMode')
        .eq('company_id', slug)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (cancelled) return;
      if (missionsErr) {
        setError('Impossible de charger les offres.');
      } else {
        setMissions(missionsData || []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px', color: '#6B7280' }}>
      Chargement…
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '48px' }}>😕</div>
      <p style={{ color: '#6B7280' }}>{error}</p>
    </div>
  );

  // T-301 — Schema.org JobPosting pour les Rich Results Google
  const jobPostingSchemas = missions.map(m => ({
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: m.title,
    description: m.description || `Rejoignez ${company.name} en tant que ${m.title}.`,
    datePosted: m.created_at ? m.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
    employmentType: m.contract_type === 'CDI' ? 'FULL_TIME'
      : m.contract_type === 'CDD' ? 'CONTRACTOR'
      : m.contract_type === 'Freelance' ? 'CONTRACTOR'
      : m.contract_type === 'Alternance' ? 'PART_TIME'
      : 'OTHER',
    hiringOrganization: {
      '@type': 'Organization',
      name: company.name,
      sameAs: `https://ats-ultimate.com/careers/${slug}`,
    },
    jobLocation: m.location ? {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressCountry: 'FR', addressLocality: m.location },
    } : { '@type': 'Place', address: { '@type': 'PostalAddress', addressCountry: 'FR' } },
    ...(m.salary_min && { baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'EUR',
      value: { '@type': 'QuantitativeValue', minValue: m.salary_min, maxValue: m.salary_max || m.salary_min, unitText: 'YEAR' },
    }}),
    url: `https://ats-ultimate.com/careers/${slug}/job/${m.id}`,
    applicantLocationRequirements: { '@type': 'Country', name: 'France' },
  }));

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px', fontFamily: 'system-ui, sans-serif' }}>
      {/* SEO + JobPosting Schema.org T-301 */}
      <Helmet>
        <title>{company.name} — Offres d'emploi</title>
        <meta name="description" content={`Découvrez ${missions.length} poste${missions.length !== 1 ? 's' : ''} ouvert${missions.length !== 1 ? 's' : ''} chez ${company.name}.`} />
        <link rel="canonical" href={`https://ats-ultimate.com/careers/${slug}`} />
        {jobPostingSchemas.map((schema, i) => (
          <script key={i} type="application/ld+json">{JSON.stringify(schema)}</script>
        ))}
      </Helmet>
      {/* Company header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#1F2937', margin: '0 0 12px' }}>
          {company.name}
        </h1>
      </div>

      {/* Missions list */}
      <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#374151', marginBottom: '24px' }}>
        {missions.length} poste{missions.length !== 1 ? 's' : ''} ouvert{missions.length !== 1 ? 's' : ''}
      </h2>

      {missions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px', background: '#F9FAFB', borderRadius: '16px', color: '#9CA3AF' }}>
          Aucun poste ouvert pour le moment.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {missions.map(m => (
            <div
              key={m.id}
              onClick={() => navigate(`/careers/${slug}/job/${m.id}`)}
              style={{
                background: 'white', borderRadius: '16px', padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer',
                border: '2px solid transparent', transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#667EEA'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px', fontWeight: '800', fontSize: '18px', color: '#1F2937' }}>{m.title}</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {m.location && <span style={{ fontSize: '13px', color: '#6B7280' }}>📍 {m.location}</span>}
                    {m.contractType && <span style={{ fontSize: '13px', color: '#6B7280' }}>📄 {m.contractType}</span>}
                    {m.workMode && <span style={{ fontSize: '13px', color: '#6B7280' }}>🏠 {m.workMode}</span>}
                  </div>
                </div>
                <span style={{
                  padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                  background: '#EEF2FF', color: '#667EEA', whiteSpace: 'nowrap',
                }}>
                  Postuler →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '64px', color: '#D1D5DB', fontSize: '13px' }}>
        Propulsé par ATS Ultimate
      </div>
    </div>
  );
}
