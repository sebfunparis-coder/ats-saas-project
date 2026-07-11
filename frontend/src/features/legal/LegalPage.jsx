import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/shared/components/SEO';
import { Navbar, Footer } from '@/shared/components/Marketing';

const s = {
  container: { minHeight: '100vh', background: 'linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%)', padding: '100px 24px 80px', fontFamily: 'system-ui, sans-serif' },
  inner: { maxWidth: '900px', margin: '0 auto', background: 'white', padding: 'clamp(32px, 5vw, 60px)', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' },
  back: { display: 'inline-block', marginBottom: '32px', padding: '10px 20px', background: '#EEF2FF', color: '#667EEA', borderRadius: '10px', fontWeight: '700', fontSize: '14px', textDecoration: 'none' },
  title: { fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: '900', marginBottom: '8px', background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  meta: { fontSize: '14px', color: '#9CA3AF', marginBottom: '40px' },
  notice: { padding: '16px 20px', background: '#EEF2FF', borderRadius: '12px', border: '2px solid #667EEA', marginBottom: '36px', fontSize: '14px', color: '#4338CA', lineHeight: 1.6 },
  h2: { fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: '800', marginTop: '44px', marginBottom: '16px', color: '#1F2937', borderBottom: '2px solid #F3F4F6', paddingBottom: '8px' },
  h3: { fontSize: '16px', fontWeight: '800', marginTop: '20px', marginBottom: '10px', color: '#374151' },
  p: { fontSize: '15px', lineHeight: 1.8, color: '#4B5563', marginBottom: '14px' },
  ul: { paddingLeft: '20px', marginBottom: '14px' },
  li: { fontSize: '15px', lineHeight: 1.8, color: '#4B5563', marginBottom: '6px' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '14px' },
  th: { background: '#F9FAFB', padding: '10px 14px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '2px solid #E5E7EB' },
  td: { padding: '10px 14px', color: '#4B5563', borderBottom: '1px solid #F3F4F6', verticalAlign: 'top' },
  warn: { padding: '14px 18px', background: '#FEF3C7', borderRadius: '10px', border: '1px solid #F59E0B', marginBottom: '14px', fontSize: '13px', color: '#92400E', fontWeight: '600' },
  tag: { display: 'inline-block', padding: '2px 10px', background: '#EF444415', color: '#B91C1C', borderRadius: '20px', fontSize: '12px', fontWeight: '700', marginLeft: '8px' },
};

export function Section({ title, children }) {
  return <>
    <h2 style={s.h2}>{title}</h2>
    {children}
  </>;
}

export function P({ children }) { return <p style={s.p}>{children}</p>; }
export function H3({ children }) { return <h3 style={s.h3}>{children}</h3>; }
export function UL({ items }) {
  return <ul style={s.ul}>{items.map((item, i) => <li key={i} style={s.li}>{item}</li>)}</ul>;
}
export function Warn({ children }) { return <div style={s.warn}>⚠️ {children}</div>; }
export function Notice({ children }) { return <div style={s.notice}>{children}</div>; }
export function Tag({ children }) { return <span style={s.tag}>{children}</span>; }

export function LegalTable({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
      <table style={s.table}>
        <thead><tr>{headers.map((h, i) => <th key={i} style={s.th}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => (
          <tr key={i}>{row.map((cell, j) => <td key={j} style={s.td}>{cell}</td>)}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export function LegalPage({ title, updated, notice, backTo = '/', path, children }) {
  return (
    <div style={s.container}>
      {path && (
        <SEO
          title={title}
          description={notice || `${title} — GETWORK.`}
          url={`https://ats-ultimate.com${path}`}
        />
      )}
      <Navbar />
      <div style={s.inner}>
        <Link to={backTo} style={s.back}>← Retour</Link>
        <h1 style={s.title}>{title}</h1>
        <p style={s.meta}>Dernière mise à jour : {updated} · GETWORK · RGPD conforme</p>
        {notice && <Notice>{notice}</Notice>}
        {children}
      </div>
      <Footer variant="light" />
    </div>
  );
}

export default LegalPage;
