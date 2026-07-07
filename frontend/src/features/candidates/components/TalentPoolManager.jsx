import React, { useState } from 'react';

const VIVIER_KEY = 'ats_viviers';

export function useTalentPools() {
  const [pools, setPools] = useState(() => {
    try { return JSON.parse(localStorage.getItem(VIVIER_KEY) || '[]'); } catch { return []; }
  });
  const save = (next) => { setPools(next); localStorage.setItem(VIVIER_KEY, JSON.stringify(next)); };
  const createPool = (name) => save([...pools, { id: Date.now(), name, candidateIds: [], createdAt: new Date().toISOString() }]);
  const deletePool = (id) => save(pools.filter(p => p.id !== id));
  const toggleCandidate = (poolId, candidateId) => save(pools.map(p => p.id === poolId ? { ...p, candidateIds: p.candidateIds.includes(candidateId) ? p.candidateIds.filter(c => c !== candidateId) : [...p.candidateIds, candidateId] } : p));
  return { pools, createPool, deletePool, toggleCandidate };
}

export function TalentPoolManager({ isOpen, onClose, candidates = [], highlightCandidateId }) {
  const { pools, createPool, deletePool, toggleCandidate } = useTalentPools();
  const [newName, setNewName] = useState('');
  const [selected, setSelected] = useState(null);

  if (!isOpen) return null;

  const activePool = selected ? pools.find(p => p.id === selected) : null;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'20px', width:'100%', maxWidth:'980px', height:'85vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 25px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'space-between', background:'linear-gradient(135deg,#10B981,#059669)' }}>
          <h2 style={{ margin:0, color:'#fff', fontWeight:'800', fontSize:'18px' }}>🌱 Viviers de talents</h2>
          <button onClick={onClose} aria-label="Fermer les viviers de talents" style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'8px', color:'#fff', fontSize:'18px', cursor:'pointer', padding:'4px 10px' }}>✕</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', flex:1, minHeight:0, overflow:'hidden' }}>
          {/* Liste des viviers */}
          <div style={{ borderRight:'1px solid #E5E7EB', overflowY:'auto', minHeight:0, padding:'16px' }}>
            <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
              <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) { createPool(newName.trim()); setNewName(''); } }} placeholder="Nouveau vivier..." style={{ flex:1, padding:'7px 10px', border:'1.5px solid #E5E7EB', borderRadius:'8px', fontSize:'13px' }} />
              <button onClick={() => { if (newName.trim()) { createPool(newName.trim()); setNewName(''); } }} aria-label="Créer le vivier" style={{ padding:'7px 12px', background:'#10B981', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'700', fontSize:'13px' }}>+</button>
            </div>
            {pools.length === 0 && <p style={{ fontSize:'13px', color:'#9CA3AF', textAlign:'center' }}>Aucun vivier créé</p>}
            {pools.map(pool => (
              <div key={pool.id} onClick={() => setSelected(pool.id)} style={{ padding:'10px 12px', borderRadius:'10px', cursor:'pointer', background: selected === pool.id ? '#ECFDF5' : 'transparent', border: selected === pool.id ? '1.5px solid #10B981' : '1.5px solid transparent', marginBottom:'6px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:'700', color:'#1F2937' }}>{pool.name}</div>
                  <div style={{ fontSize:'11px', color:'#9CA3AF' }}>{pool.candidateIds.length} candidat{pool.candidateIds.length !== 1 ? 's' : ''}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); deletePool(pool.id); if (selected === pool.id) setSelected(null); }} aria-label={`Supprimer le vivier ${pool.name}`} style={{ background:'none', border:'none', color:'#EF4444', cursor:'pointer', fontSize:'14px' }}>🗑️</button>
              </div>
            ))}
          </div>
          {/* Contenu du vivier sélectionné */}
          <div style={{ overflowY:'auto', minHeight:0, padding:'16px' }}>
            {!activePool ? (
              <div style={{ textAlign:'center', padding:'40px', color:'#9CA3AF' }}>
                <div style={{ fontSize:'40px', marginBottom:'12px' }}>🌱</div>
                <p>Sélectionnez ou créez un vivier</p>
              </div>
            ) : (
              <>
                <h3 style={{ margin:'0 0 16px', fontWeight:'800', color:'#1F2937' }}>{activePool.name}</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {candidates.map(c => {
                    const inPool = activePool.candidateIds.includes(c.id);
                    const isHighlighted = c.id === highlightCandidateId;
                    return (
                      <div key={c.id} style={{ padding:'10px 14px', border:`1.5px solid ${inPool ? '#10B981' : '#E5E7EB'}`, borderRadius:'10px', display:'flex', alignItems:'center', gap:'10px', background: isHighlighted ? '#FFFBEB' : inPool ? '#ECFDF5' : 'white' }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:'13px', fontWeight:'700', color:'#1F2937' }}>{c.firstName || ''} {c.lastName || c.name || ''}</div>
                          <div style={{ fontSize:'11px', color:'#9CA3AF' }}>{c.currentPosition || c.title || ''} {c.location ? `· ${c.location}` : ''}</div>
                        </div>
                        <button onClick={() => toggleCandidate(activePool.id, c.id)} style={{ padding:'5px 12px', background: inPool ? '#ECFDF5' : '#F3F4F6', color: inPool ? '#10B981' : '#6B7280', border:`1px solid ${inPool ? '#10B981' : '#E5E7EB'}`, borderRadius:'8px', fontWeight:'700', fontSize:'12px', cursor:'pointer' }}>
                          {inPool ? '✓ Dans le vivier' : '+ Ajouter'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TalentPoolManager;
