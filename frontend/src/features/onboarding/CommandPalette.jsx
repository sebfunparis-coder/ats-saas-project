import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/core/contexts/DataContext';

const SHORTCUTS = [
  { key: 'n', label: 'Nouvelle mission', icon: '💼', action: 'new-mission', hint: 'N' },
  { key: 'c', label: 'Nouveau candidat', icon: '👤', action: 'new-candidate', hint: 'C' },
  { key: 'g d', label: 'Dashboard', icon: '📊', action: 'nav-dashboard', hint: 'G D' },
  { key: 'g m', label: 'Missions', icon: '💼', action: 'nav-missions', hint: 'G M' },
  { key: 'g c', label: 'Candidats', icon: '👤', action: 'nav-candidates', hint: 'G C' },
  { key: 'g p', label: 'Pipeline', icon: '📋', action: 'nav-pipeline', hint: 'G P' },
  { key: 'g t', label: 'Équipe', icon: '👥', action: 'nav-team', hint: 'G T' },
  { key: 'g a', label: 'Admin', icon: '⚙️', action: 'nav-admin', hint: 'G A' },
];

const ACTION_ROUTES = {
  'nav-dashboard': '/app/dashboard',
  'nav-missions': '/app/missions',
  'nav-candidates': '/app/candidates',
  'nav-pipeline': '/app/pipeline',
  'nav-team': '/app/team',
  'nav-admin': '/app/admin',
};

export function CommandPalette() {
  const navigate = useNavigate();
  const { missions = [], candidates = [] } = useData();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const inputRef = useRef(null);

  const allItems = [
    ...missions.slice(0, 5).map(m => ({ label: m.title || m.name, icon: '💼', action: 'nav-missions', sub: 'Mission' })),
    ...candidates.slice(0, 5).map(c => ({ label: `${c.firstName || ''} ${c.lastName || c.name || ''}`.trim(), icon: '👤', action: 'nav-candidates', sub: 'Candidat' })),
    ...SHORTCUTS.map(s => ({ ...s, sub: 'Action' })),
  ];

  const filtered = query
    ? allItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : SHORTCUTS.map(s => ({ ...s, sub: 'Raccourci' }));

  const executeAction = useCallback((action) => {
    setOpen(false);
    setQuery('');
    if (ACTION_ROUTES[action]) {
      navigate(ACTION_ROUTES[action]);
    } else if (action === 'new-mission') {
      navigate('/app/missions');
      setTimeout(() => window.dispatchEvent(new CustomEvent('ats:new-mission')), 100);
    } else if (action === 'new-candidate') {
      navigate('/app/candidates');
      setTimeout(() => window.dispatchEvent(new CustomEvent('ats:new-candidate')), 100);
    }
  }, [navigate]);

  useEffect(() => {
    let gPressed = false;
    let gTimer = null;

    const handleKey = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select' || document.activeElement?.contentEditable === 'true';

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
        return;
      }

      if (e.key === 'Escape') {
        setOpen(false);
        setHelpOpen(false);
        return;
      }

      if (open) return;
      if (isInput) return;

      if (e.key === '?') { setHelpOpen(h => !h); return; }

      if (e.key.toLowerCase() === 'g') {
        gPressed = true;
        clearTimeout(gTimer);
        gTimer = setTimeout(() => { gPressed = false; }, 1000);
        return;
      }

      if (gPressed) {
        const map = { d: 'nav-dashboard', m: 'nav-missions', c: 'nav-candidates', p: 'nav-pipeline', t: 'nav-team', a: 'nav-admin' };
        if (map[e.key.toLowerCase()]) { executeAction(map[e.key.toLowerCase()]); gPressed = false; return; }
      }

      if (e.key.toLowerCase() === 'n' && !isInput) { executeAction('new-mission'); return; }
      if (e.key.toLowerCase() === 'c' && !isInput) { executeAction('new-candidate'); return; }
    };

    window.addEventListener('keydown', handleKey);
    return () => { window.removeEventListener('keydown', handleKey); clearTimeout(gTimer); };
  }, [open, executeAction]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelected(0);
    }
  }, [open]);

  useEffect(() => { setSelected(0); }, [query]);

  const handlePaletteKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && filtered[selected]) { executeAction(filtered[selected].action); }
  };

  if (!open && !helpOpen) return null;

  if (helpOpen) return (
    <>
      <div onClick={() => setHelpOpen(false)} style={{ position:'fixed', inset:0, zIndex:9998, background:'rgba(0,0,0,0.6)' }} />
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:9999, background:'#fff', borderRadius:'20px', padding:'32px', width:'500px', maxWidth:'95vw', boxShadow:'0 25px 60px rgba(0,0,0,0.3)' }}>
        <h2 style={{ margin:'0 0 24px', fontSize:'20px', fontWeight:'800' }}>⌨️ Raccourcis clavier</h2>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'24px' }}>
          {[
            ['Ctrl+K / ⌘K', 'Ouvrir la recherche'],
            ['N', 'Nouvelle mission'],
            ['C', 'Nouveau candidat'],
            ['?', 'Aide raccourcis'],
            ['G puis D', 'Dashboard'],
            ['G puis M', 'Missions'],
            ['G puis C', 'Candidats'],
            ['G puis P', 'Pipeline'],
            ['G puis T', 'Équipe'],
            ['G puis A', 'Admin'],
          ].map(([k, v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', background:'#F9FAFB', borderRadius:'8px' }}>
              <span style={{ fontSize:'13px', color:'#374151' }}>{v}</span>
              <kbd style={{ fontSize:'11px', fontFamily:'monospace', background:'#E5E7EB', padding:'3px 7px', borderRadius:'5px', color:'#1F2937', fontWeight:'700' }}>{k}</kbd>
            </div>
          ))}
        </div>
        <button onClick={() => setHelpOpen(false)} style={{ width:'100%', padding:'12px', background:'#F3F4F6', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'600', fontSize:'14px' }}>Fermer</button>
      </div>
    </>
  );

  return (
    <>
      <div onClick={() => { setOpen(false); setQuery(''); }} style={{ position:'fixed', inset:0, zIndex:9998, background:'rgba(0,0,0,0.5)' }} />
      <div style={{ position:'fixed', top:'120px', left:'50%', transform:'translateX(-50%)', zIndex:9999, width:'580px', maxWidth:'95vw', background:'#fff', borderRadius:'16px', boxShadow:'0 25px 60px rgba(0,0,0,0.3)', overflow:'hidden' }}>
        <div style={{ padding:'16px', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid #F3F4F6' }}>
          <span style={{ fontSize:'18px' }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handlePaletteKey}
            placeholder="Rechercher missions, candidats, actions..."
            style={{ flex:1, border:'none', outline:'none', fontSize:'16px', color:'#111827', background:'transparent' }}
          />
          <kbd style={{ fontSize:'11px', fontFamily:'monospace', background:'#F3F4F6', padding:'3px 7px', borderRadius:'5px', color:'#6B7280' }}>ESC</kbd>
        </div>
        <div style={{ maxHeight:'340px', overflowY:'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding:'32px', textAlign:'center', color:'#9CA3AF', fontSize:'14px' }}>Aucun résultat pour "{query}"</div>
          ) : filtered.map((item, i) => (
            <div
              key={i}
              onClick={() => executeAction(item.action)}
              style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', background: i === selected ? '#EFF6FF' : 'transparent', borderLeft: i === selected ? '3px solid #3B82F6' : '3px solid transparent' }}
            >
              <span style={{ fontSize:'18px', width:'24px', textAlign:'center' }}>{item.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'14px', fontWeight:'500', color:'#111827' }}>{item.label}</div>
                {item.sub && <div style={{ fontSize:'12px', color:'#9CA3AF' }}>{item.sub}</div>}
              </div>
              {item.hint && <kbd style={{ fontSize:'11px', fontFamily:'monospace', background:'#F3F4F6', padding:'3px 7px', borderRadius:'5px', color:'#6B7280' }}>{item.hint}</kbd>}
            </div>
          ))}
        </div>
        <div style={{ padding:'8px 16px', borderTop:'1px solid #F3F4F6', display:'flex', gap:'16px', fontSize:'12px', color:'#9CA3AF' }}>
          <span>↑↓ naviguer</span>
          <span>↵ sélectionner</span>
          <span>? aide</span>
        </div>
      </div>
    </>
  );
}

export default CommandPalette;
