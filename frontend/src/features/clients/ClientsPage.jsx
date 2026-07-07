import React, { useState } from 'react';
import { useClients } from '@/core/hooks/useClients';
import { useMissions } from '@/core/hooks/useMissions';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import { useConfirm } from '@/core/contexts/ConfirmContext';
import { useDebounce } from '@/core/hooks/useDebounce';
import { useAuth } from '@/core/contexts/AuthContext';
import ClientForm from './components/ClientForm';
import { ClientCard } from './components/ClientCard';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import StatsCard, { StatsGrid } from '@/shared/components/StatsCard/StatsCard';
import { fileToBase64, formatFileSize, downloadBase64File } from '@/core/utils/fileHandlers';
import { createClientPortalLink } from '@/core/utils/clientPortalLink';
import { sanitizeInput } from '@/core/utils/validators';

/**
 * Page Clients - Gestion complète des clients avec CRUD
 */

// Composant extrait — hooks dans un IIFE = violation des Rules of Hooks (corrigé)
function ContactHistory({ clientId }) {
  const CONTACT_KEY = 'ats_client_contacts_' + clientId;
  const [contactNotes, setContactNotes] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(CONTACT_KEY) || '[]'); } catch { return []; }
  });
  const [newNote, setNewNote] = React.useState('');
  const [newType, setNewType] = React.useState('call');
  const addNote = () => {
    if (!newNote.trim()) return;
    const note = { id: Date.now(), text: newNote.trim(), type: newType, date: new Date().toISOString(), dateStr: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }), time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) };
    const updated = [note, ...contactNotes];
    setContactNotes(updated);
    localStorage.setItem(CONTACT_KEY, JSON.stringify(updated));
    setNewNote('');
  };
  const TYPE_ICONS = { call: '📞', email: '📧', meeting: '🤝', note: '📝' };
  return (
    <div style={{ background: '#FFFBEB', borderRadius: '16px', padding: '22px', border: '1px solid #FDE68A' }}>
      <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>📋 Historique des échanges</h4>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <select value={newType} onChange={e => setNewType(e.target.value)} style={{ padding: '8px 10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }}>
          <option value='call'>📞 Appel</option>
          <option value='email'>📧 Email</option>
          <option value='meeting'>🤝 RDV</option>
          <option value='note'>📝 Note</option>
        </select>
        <input value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNote()} placeholder='Ajouter une note de contact...' style={{ flex: 1, padding: '8px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }} />
        <button onClick={addNote} disabled={!newNote.trim()} style={{ padding: '8px 16px', background: newNote.trim() ? '#F59E0B' : '#E5E7EB', color: newNote.trim() ? 'white' : '#9CA3AF', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: newNote.trim() ? 'pointer' : 'default', fontSize: '13px' }}>
          ➕ Ajouter
        </button>
      </div>
      {contactNotes.length === 0 ? (
        <p style={{ color: '#9CA3AF', fontSize: '13px', fontStyle: 'italic' }}>Aucun échange enregistré pour l'instant.</p>
      ) : (
        <div style={{ display: 'grid', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
          {contactNotes.map(n => (
            <div key={n.id} style={{ display: 'flex', gap: '12px', padding: '10px 14px', background: 'white', borderRadius: '10px', border: '1px solid #FDE68A' }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{TYPE_ICONS[n.type] || '📌'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#1F2937', fontWeight: '600' }}>{n.text}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF' }}>{n.dateStr} à {n.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Liens et documents du client — auparavant affichés uniquement en lecture,
// sans aucun moyen d'en ajouter (voir CLAUDE.md). Documents stockés en base64
// dans la colonne JSONB `documents` (même pattern que le CV candidat).
const MAX_DOC_SIZE = 5 * 1024 * 1024; // 5MB, cohérent avec la limite CV candidat

function ClientLinksDocuments({ client, onSave }) {
  const [linkLabel, setLinkLabel] = React.useState('');
  const [linkUrl, setLinkUrl] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState('');
  const fileInputRef = React.useRef(null);
  const links = client.links || [];
  const documents = client.documents || [];

  const addLink = () => {
    if (!linkLabel.trim() || !linkUrl.trim()) return;
    const url = /^https?:\/\//i.test(linkUrl.trim()) ? linkUrl.trim() : `https://${linkUrl.trim()}`;
    onSave({ links: [...links, { label: linkLabel.trim(), url }] });
    setLinkLabel('');
    setLinkUrl('');
  };

  const removeLink = (i) => {
    onSave({ links: links.filter((_, idx) => idx !== i) });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    if (file.size > MAX_DOC_SIZE) {
      setUploadError('Le fichier ne doit pas dépasser 5 Mo.');
      e.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const base64Data = await fileToBase64(file);
      onSave({
        documents: [...documents, {
          name: file.name,
          size: formatFileSize(file.size),
          base64Data,
          uploadDate: new Date().toISOString(),
        }],
      });
    } catch {
      setUploadError('Échec de la lecture du fichier.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeDocument = (i) => {
    onSave({ documents: documents.filter((_, idx) => idx !== i) });
  };

  return (
    <>
      {/* Liens */}
      <div style={{ background: '#F0F4FF', borderRadius: '16px', padding: '22px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>🔗 Liens</h4>
        {links.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
            {links.map((link, i) => (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'white', border: '2px solid #667EEA33', borderRadius: '10px', paddingRight: '6px' }}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 8px 10px 18px', color: '#667EEA', fontWeight: '700', fontSize: '14px', textDecoration: 'none' }}>
                  🔗 {link.label}
                </a>
                <button onClick={() => removeLink(i)} title="Supprimer ce lien" aria-label="Supprimer ce lien" style={{ padding: '4px 8px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '900' }}>✕</button>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input value={linkLabel} onChange={e => setLinkLabel(e.target.value)} placeholder="Libellé (ex: Site web)" style={{ flex: '1 1 160px', padding: '8px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }} />
          <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addLink()} placeholder="https://..." style={{ flex: '2 1 220px', padding: '8px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }} />
          <button onClick={addLink} disabled={!linkLabel.trim() || !linkUrl.trim()} style={{ padding: '8px 16px', background: linkLabel.trim() && linkUrl.trim() ? '#667EEA' : '#E5E7EB', color: linkLabel.trim() && linkUrl.trim() ? 'white' : '#9CA3AF', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: linkLabel.trim() && linkUrl.trim() ? 'pointer' : 'default', fontSize: '13px' }}>
            ➕ Ajouter
          </button>
        </div>
      </div>

      {/* Documents */}
      <div style={{ background: '#FFF8F0', borderRadius: '16px', padding: '22px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>📎 Documents</h4>
        {documents.length > 0 && (
          <div style={{ display: 'grid', gap: '10px', marginBottom: '14px' }}>
            {documents.map((doc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'white', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                <span style={{ fontSize: '24px' }}>
                  {doc.name.endsWith('.pdf') ? '📄' : doc.name.endsWith('.docx') || doc.name.endsWith('.doc') ? '📝' : (doc.name.endsWith('.pptx') || doc.name.endsWith('.ppt')) ? '📊' : '📁'}
                </span>
                <div style={{ flex: 1, cursor: doc.base64Data ? 'pointer' : 'default', minWidth: 0 }} onClick={() => doc.base64Data && downloadBase64File(doc.base64Data, doc.name)}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: doc.base64Data ? '#667EEA' : '#1F2937' }}>{doc.name}</div>
                  {doc.size && <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{doc.size}</div>}
                </div>
                <button onClick={() => removeDocument(i)} title="Supprimer ce document" aria-label="Supprimer ce document" style={{ padding: '6px 10px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '900' }}>✕</button>
              </div>
            ))}
          </div>
        )}
        <input ref={fileInputRef} type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{ padding: '10px 18px', background: uploading ? '#E5E7EB' : '#F59E0B', color: uploading ? '#9CA3AF' : 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: uploading ? 'default' : 'pointer', fontSize: '13px' }}>
          {uploading ? '⏳ Envoi...' : '📎 Ajouter un document'}
        </button>
        {uploadError && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '8px' }}>{uploadError}</p>}
      </div>
    </>
  );
}

function DevisModal({ client, onClose, onSave }) {
  const [devisTitle, setDevisTitle] = React.useState('');
  const [devisLines, setDevisLines] = React.useState([{ desc: '', qty: '1', price: '' }]);
  const [devisNotes, setDevisNotes] = React.useState('');
  const addLine = () => setDevisLines(prev => [...prev, { desc: '', qty: '1', price: '' }]);
  const updateLine = (i, field, val) => setDevisLines(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l));
  const removeLine = (i) => setDevisLines(prev => prev.filter((_, idx) => idx !== i));
  const total = devisLines.reduce((s, l) => s + (parseFloat(l.qty) || 0) * (parseFloat(l.price) || 0), 0);
  const handleCreate = () => {
    if (!devisTitle.trim() || devisLines.every(l => !l.desc.trim())) return;
    onSave(client.id, { title: devisTitle, lines: devisLines, notes: devisNotes });
    onClose();
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '36px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#1F2937', marginBottom: '6px' }}>Nouveau devis — {client.name}</h2>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>Saisissez les prestations a facturer</p>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '4px' }}>Titre du devis</label>
          <input value={devisTitle} onChange={e => setDevisTitle(e.target.value)} placeholder="Ex: Recrutement Chef de projet" style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151' }}>Lignes de prestation</label>
            <button onClick={addLine} style={{ padding: '4px 12px', background: '#EFF6FF', color: '#1D4ED8', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>+ Ligne</button>
          </div>
          {devisLines.map((line, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 28px', gap: '6px', marginBottom: '6px' }}>
              <input value={line.desc} onChange={e => updateLine(i, 'desc', e.target.value)} placeholder="Prestation" style={{ padding: '8px 10px', border: '1.5px solid #E5E7EB', borderRadius: '6px', fontSize: '12px' }} />
              <input value={line.qty} onChange={e => updateLine(i, 'qty', e.target.value)} type="number" min="1" style={{ padding: '8px 6px', border: '1.5px solid #E5E7EB', borderRadius: '6px', fontSize: '12px', textAlign: 'center' }} />
              <input value={line.price} onChange={e => updateLine(i, 'price', e.target.value)} type="number" placeholder="0" style={{ padding: '8px 6px', border: '1.5px solid #E5E7EB', borderRadius: '6px', fontSize: '12px', textAlign: 'right' }} />
              <button onClick={() => removeLine(i)} disabled={devisLines.length === 1} aria-label="Supprimer cette ligne" style={{ padding: '4px', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '900' }}>x</button>
            </div>
          ))}
          <div style={{ textAlign: 'right', fontWeight: '900', fontSize: '18px', color: '#0EA5E9', marginTop: '8px' }}>
            Total HT : {total.toLocaleString('fr-FR')} EUR
          </div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '4px' }}>Notes / Conditions</label>
          <textarea value={devisNotes} onChange={e => setDevisNotes(e.target.value)} rows={2} placeholder="Conditions particulieres, delais..." style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>Annuler</button>
          <button onClick={handleCreate} disabled={!devisTitle.trim()} style={{ flex: 1, padding: '12px', background: devisTitle.trim() ? '#0EA5E9' : '#E5E7EB', color: devisTitle.trim() ? 'white' : '#9CA3AF', border: 'none', borderRadius: '10px', cursor: devisTitle.trim() ? 'pointer' : 'not-allowed', fontWeight: '700' }}>
            Creer le devis
          </button>
        </div>
      </div>
    </div>
  );
}

export function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const { missions } = useMissions();
  const { user } = useAuth();
  const { success, error: showError } = useNotifications();
  const { confirm } = useConfirm();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [portalLink, setPortalLink] = useState(null);
  const [portalCopied, setPortalCopied] = useState(false);

  const NPS_KEY = 'ats_client_nps';
  const [npsData, setNpsData] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('ats_client_nps') || '{}'); } catch { return {}; }
  });
  const [npsModal, setNpsModal] = React.useState(null);
  const [npsScore, setNpsScore] = React.useState(null);
  const [npsVerbatim, setNpsVerbatim] = React.useState('');

  const OPPS_KEY = 'ats_commercial_opps';
  const [activeTab, setActiveTab] = React.useState('clients');
  const [opportunities, setOpportunities] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('ats_commercial_opps') || '[]'); } catch { return []; }
  });
  const [oppForm, setOppForm] = React.useState(null);
  const OPP_STAGES = ['Decouverte','Proposition','Negociation','Gagne','Perdu'];

  const DEVIS_KEY = 'ats_client_devis';
  const [devisData, setDevisData] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(DEVIS_KEY) || '{}'); } catch { return {}; }
  });
  const [devisModal, setDevisModal] = React.useState(null);

  const saveOpps = (updated) => {
    setOpportunities(updated);
    localStorage.setItem(OPPS_KEY, JSON.stringify(updated));
  };
  const addOpp = (opp) => saveOpps([...opportunities, { ...opp, id: Date.now() }]);
  const updateOpp = (id, changes) => saveOpps(opportunities.map(o => o.id === id ? { ...o, ...changes } : o));
  const deleteOpp = (id) => saveOpps(opportunities.filter(o => o.id !== id));

  const saveDevis = (clientId, devisInfo) => {
    const ref = 'DEV-' + Date.now().toString(36).toUpperCase().slice(-6);
    const newDevis = { id: Date.now(), ref, ...devisInfo, date: new Date().toISOString(), status: 'pending' };
    const existing = devisData[clientId] || [];
    const updated = { ...devisData, [clientId]: [newDevis, ...existing] };
    setDevisData(updated);
    localStorage.setItem(DEVIS_KEY, JSON.stringify(updated));
    success('Devis cree', ref + ' ajoute a l\'historique');
  };

  const updateDevisStatus = (clientId, devisId, status) => {
    const existing = (devisData[clientId] || []).map(d => d.id === devisId ? { ...d, status } : d);
    const updated = { ...devisData, [clientId]: existing };
    setDevisData(updated);
    localStorage.setItem(DEVIS_KEY, JSON.stringify(updated));
  };

  // T-385 : `printDevis`/`generateClientReport` interpolent des champs
  // saisis par l'équipe (nom/adresse client, description de ligne de devis,
  // notes...) directement dans du HTML écrit via `document.write()` dans une
  // fenêtre de même origine que l'app authentifiée — même famille de faille
  // que `printCandidateProfile`/`printInterviewReport` (exporters.js). `s()`
  // échappe chaque champ texte avant interpolation.
  const s = (v) => sanitizeInput(v ?? '');

  const printDevis = (client, devis) => {
    const total = (devis.lines || []).reduce((sum, l) => sum + (parseFloat(l.qty) || 0) * (parseFloat(l.price) || 0), 0);
    const rows = (devis.lines || []).map(l => {
      const ht = (parseFloat(l.qty) || 0) * (parseFloat(l.price) || 0);
      return '<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">' + s(l.desc) + '</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">' + s(l.qty) + '</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">' + parseFloat(l.price).toLocaleString('fr-FR') + ' EUR</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:700">' + ht.toLocaleString('fr-FR') + ' EUR</td></tr>';
    }).join('');
    const html = '<!DOCTYPE html><html><head><title>Devis ' + s(devis.ref) + '</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#1F2937}h1{color:#667EEA}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#667EEA;color:white;padding:10px 12px;text-align:left}@media print{button{display:none}}</style></head><body>'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px">'
      + '<div><h1>Devis</h1><div style="font-size:28px;font-weight:900;color:#667EEA">' + s(devis.ref) + '</div><div style="color:#6B7280;margin-top:4px">Date : ' + new Date(devis.date).toLocaleDateString('fr-FR') + '</div></div>'
      + '<div style="text-align:right"><div style="font-weight:700;font-size:18px">' + s(client.name) + '</div><div style="color:#6B7280">' + s(client.email) + '</div><div style="color:#6B7280">' + s(client.address) + '</div></div></div>'
      + '<table><thead><tr><th>Description</th><th style="text-align:center">Qte</th><th style="text-align:right">Prix unitaire</th><th style="text-align:right">Total HT</th></tr></thead><tbody>' + rows + '</tbody></table>'
      + '<div style="text-align:right;margin-top:24px;font-size:24px;font-weight:900;color:#667EEA">Total HT : ' + total.toLocaleString('fr-FR') + ' EUR</div>'
      + (devis.notes ? '<div style="margin-top:32px;padding:16px;background:#F9FAFB;border-radius:8px"><strong>Notes :</strong><br>' + s(devis.notes) + '</div>' : '')
      + '<div style="margin-top:40px;text-align:center"><button onclick="window.print()" style="padding:12px 32px;background:#667EEA;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px">Imprimer / PDF</button></div>'
      + '</body></html>';
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
  };

  const generateClientReport = (client) => {
    const score = computeHealthScore(client);
    const health = getHealthLabel(score);
    const clientMissions = (missions || []).filter(m => m.client === client.name || m.clientId === client.id);
    const npsAvg = getClientNpsAvg(client.id);
    const html = '<!DOCTYPE html><html><head><title>Rapport ' + s(client.name) + '</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#1F2937}h1{color:#667EEA}@media print{button{display:none}}</style></head><body>'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px"><div><h1>' + s(client.emoji) + ' ' + s(client.name) + '</h1><div style="color:#6B7280">' + s(client.industry) + '</div></div><div style="text-align:right"><div style="font-size:32px;font-weight:900;color:' + health.color + '">' + score + '%</div><div style="color:#6B7280">Sante client</div></div></div>'
      + '<table style="width:100%;border-collapse:collapse;margin-bottom:32px">'
      + '<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#6B7280">Email</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700">' + (client.email ? s(client.email) : '-') + '</td></tr>'
      + '<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#6B7280">Statut</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700">' + s(client.status) + '</td></tr>'
      + '<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#6B7280">Missions actives</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700">' + s(client.missions) + '</td></tr>'
      + '<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#6B7280">NPS moyen</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700">' + (npsAvg !== null ? npsAvg + '/10' : 'N/A') + '</td></tr>'
      + '</table>'
      + '<h3>Missions (' + clientMissions.length + ')</h3>'
      + clientMissions.map(m => '<div style="padding:8px;background:#F9FAFB;border-radius:4px;margin-bottom:4px"><strong>' + s(m.title) + '</strong> — ' + s(m.status) + '</div>').join('')
      + '<div style="margin-top:40px;text-align:center"><button onclick="window.print()" style="padding:12px 32px;background:#667EEA;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px">Imprimer / PDF</button></div>'
      + '</body></html>';
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
  };

  const submitNps = (clientId) => {
    if (npsScore === null) return;
    const existing = npsData[clientId] || [];
    const updated = { ...npsData, [clientId]: [...existing, { score: npsScore, verbatim: npsVerbatim, date: new Date().toISOString() }] };
    setNpsData(updated);
    localStorage.setItem(NPS_KEY, JSON.stringify(updated));
    setNpsModal(null);
    setNpsScore(null);
    setNpsVerbatim('');
    success('NPS enregistre');
  };

  const getClientNpsAvg = (clientId) => {
    const entries = npsData[clientId] || [];
    if (!entries.length) return null;
    return Math.round(entries.reduce((s, e) => s + e.score, 0) / entries.length * 10) / 10;
  };
  // T-373 : localStorage remplacé par une table Supabase dédiée (client_portal_links,
  // migration 030) + fonction SECURITY DEFINER — même correctif que TrackingPage
  // (T-251) pour le même bug (données écrites uniquement sur le navigateur du
  // recruteur, jamais visibles pour le client réel qui ouvre le lien ailleurs).
  const handleGeneratePortal = async (client) => {
    try {
      const link = await createClientPortalLink({ clientId: client.id, companyId: user?.companyId });
      setPortalLink(link);
    } catch (err) {
      console.error('Erreur génération portail client:', err);
      showError('Erreur', "Impossible de générer le lien du portail client");
    }
  };

  // 🔥 Debounce de la recherche (300ms)
  const debouncedSearch = useDebounce(searchQuery, 300);

  // 🔥 Gestion des clients
  const handleCreateClient = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setIsFormOpen(true);
    setSelectedClient(null);
  };

  const handleSubmitClient = async (clientData) => {
    // 🚀 Fermeture optimiste : fermer immédiatement la modal
    const isEditing = !!editingClient;
    const editId = editingClient?.id;
    setIsFormOpen(false);
    setEditingClient(null);

    // Appel API en arrière-plan
    try {
      if (isEditing) {
        await updateClient(editId, clientData);
        success('Client modifié', `${clientData.name} a été mis à jour avec succès`);
      } else {
        await addClient(clientData);
        success('Client créé', `${clientData.name} a été ajouté avec succès`);
      }
    } catch (error) {
      console.error('Erreur formulaire client:', error);
      showError('Erreur', error.message);
    }
  };

  const handleDeleteClient = async (client) => {
    if (await confirm(`Supprimer ${client.name} ?`, { title: 'Supprimer le client' })) {
      try {
        await deleteClient(client.id);
        success('Client supprimé', `${client.name} a été supprimé avec succès`);
        setSelectedClient(null);
      } catch (error) {
        console.error('Erreur suppression client:', error);
        showError('Erreur', error.message);
      }
    }
  };

  // Filtrer les clients selon la recherche (avec debounce)
  const filteredClients = clients.filter(client =>
    !debouncedSearch ||
    client.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    client.industry.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    client.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const computeHealthScore = (client) => {
    let score = 0;
    // Missions actives (0-40 pts)
    const activeMissions = (missions || []).filter(m =>
      (m.client === client.name || m.clientId === client.id) && ['open','active'].includes(m.status)
    ).length;
    score += Math.min(activeMissions * 10, 40);
    // Statut (0-30 pts)
    if (client.status === 'active') score += 30;
    else if (client.status === 'prospect') score += 10;
    // Dernier contact récent (0-20 pts)
    if (client.lastContact) {
      const daysSince = (Date.now() - new Date(client.lastContact).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) score += 20;
      else if (daysSince < 30) score += 10;
    }
    // Potentiel CA (0-10 pts)
    if (client.revenue && parseInt(client.revenue) > 100000) score += 10;
    else if (client.missions > 2) score += 5;
    return Math.min(score, 100);
  };

  const getHealthLabel = (score) => {
    if (score >= 75) return { label: 'Excellent', color: '#10B981', icon: '🟢' };
    if (score >= 50) return { label: 'Bon', color: '#F59E0B', icon: '🟡' };
    if (score >= 25) return { label: 'Faible', color: '#F97316', icon: '🟠' };
    return { label: 'Critique', color: '#EF4444', icon: '🔴' };
  };

  const staleClients = clients.filter(client => {
    if (client.status !== 'active') return false;
    if (!client.lastContact) return true;
    const daysSince = (Date.now() - new Date(client.lastContact).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 30;
  });

  const stats = [
    { icon: '🏢', label: 'Total Clients', value: clients.length, color: '#667EEA' },
    { icon: '✅', label: 'Actifs', value: clients.filter(c => c.status === 'active').length, color: '#10B981' },
    { icon: '📊', label: 'Prospects', value: clients.filter(c => c.status === 'prospect').length, color: '#8B5CF6' },
    { icon: '⏸️', label: 'Inactifs', value: clients.filter(c => c.status === 'inactive').length, color: '#6B7280' },
    { icon: '💼', label: 'Missions Totales', value: clients.reduce((sum, c) => sum + c.missions, 0), color: '#F59E0B' },
    { icon: '⚠️', label: 'Sans contact 30j+', value: staleClients.length, color: '#EF4444' },
  ];

  return (
    <div style={{ padding: '32px', background: 'linear-gradient(180deg, #ffffff 0%, #fef5ff 50%, #f3e7ff 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '8px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Clients
            </h1>
            <p style={{ fontSize: '16px', color: '#6B7280' }}>Gestion complète de votre portefeuille clients</p>
          </div>
          <button
            onClick={handleCreateClient}
            style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)', transition: 'all 0.3s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            ➕ Nouveau Client
          </button>
        </div>

        {/* Stats */}
        <StatsGrid>
          {stats.map((stat, i) => (
            <StatsCard key={i} icon={stat.icon} label={stat.label} value={stat.value} color={stat.color} />
          ))}
        </StatsGrid>

        {/* Alerte relance automatique */}
        {staleClients.length > 0 && (
          <div style={{ background: '#FFFBEB', border: '2px solid #FDE68A', borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '24px', flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '800', color: '#92400E', margin: '0 0 4px' }}>
                {staleClients.length} client{staleClients.length > 1 ? 's' : ''} actif{staleClients.length > 1 ? 's' : ''} sans contact depuis +30 jours
              </p>
              <p style={{ color: '#B45309', fontSize: '13px', margin: 0 }}>
                {staleClients.map(c => c.name).join(', ')}
              </p>
            </div>
            <button
              onClick={() => { if (staleClients[0]) setSelectedClient(staleClients[0]); }}
              style={{ padding: '8px 16px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', flexShrink: 0 }}>
              Voir le premier
            </button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', background: 'white', padding: '6px', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: 'fit-content' }}>
          {[['clients', 'Clients'], ['opps', 'Opportunites']].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px',
              background: activeTab === tab ? 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' : 'transparent',
              color: activeTab === tab ? 'white' : '#6B7280',
            }}>{label}</button>
          ))}
        </div>

        {/* Opportunities pipeline */}
        {activeTab === 'opps' && (() => {
          const STAGE_COLORS = { Decouverte: '#6B7280', Proposition: '#3B82F6', Negociation: '#F59E0B', Gagne: '#10B981', Perdu: '#EF4444' };
          const totalValue = opportunities.filter(o => o.stage !== 'Perdu').reduce((s, o) => s + (parseFloat(o.value) || 0), 0);
          const wonValue = opportunities.filter(o => o.stage === 'Gagne').reduce((s, o) => s + (parseFloat(o.value) || 0), 0);
          return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ padding: '12px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase' }}>Pipeline</div>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#667EEA' }}>{totalValue.toLocaleString()} EUR</div>
                  </div>
                  <div style={{ padding: '12px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase' }}>Gagnes</div>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#10B981' }}>{wonValue.toLocaleString()} EUR</div>
                  </div>
                </div>
                <button onClick={() => setOppForm({ name: '', client: '', value: '', probability: '50', stage: 'Decouverte', notes: '' })}
                  style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700' }}>
                  + Opportunite
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: '12px', alignItems: 'start' }}>
                {OPP_STAGES.map(stage => {
                  const stageOpps = opportunities.filter(o => o.stage === stage);
                  return (
                    <div key={stage} style={{ background: 'white', borderRadius: '14px', padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: STAGE_COLORS[stage], textTransform: 'uppercase', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{stage}</span><span>{stageOpps.length}</span>
                      </div>
                      {stageOpps.map(o => (
                        <div key={o.id} style={{ padding: '10px', background: '#F9FAFB', borderRadius: '10px', marginBottom: '8px', border: '1.5px solid ' + (STAGE_COLORS[stage] + '30') }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#1F2937', marginBottom: '2px' }}>{o.name}</div>
                          <div style={{ fontSize: '11px', color: '#6B7280' }}>{o.client}</div>
                          {o.value && <div style={{ fontSize: '12px', fontWeight: '700', color: STAGE_COLORS[stage], marginTop: '4px' }}>{parseFloat(o.value).toLocaleString()} EUR</div>}
                          {o.probability && <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{o.probability}% prob.</div>}
                          <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                            {OPP_STAGES.filter(s => s !== stage).map(s => (
                              <button key={s} onClick={() => updateOpp(o.id, { stage: s })}
                                style={{ padding: '2px 6px', background: (STAGE_COLORS[s] + '20'), color: STAGE_COLORS[s], border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '9px', fontWeight: '700' }}>{s}</button>
                            ))}
                            <button onClick={() => deleteOpp(o.id)}
                              aria-label="Supprimer l'opportunité"
                              style={{ padding: '2px 6px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '9px' }}>X</button>
                          </div>
                        </div>
                      ))}
                      {stageOpps.length === 0 && <div style={{ textAlign: 'center', color: '#D1D5DB', fontSize: '12px', padding: '20px 0' }}>Vide</div>}
                    </div>
                  );
                })}
              </div>
              {oppForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                  <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '480px', width: '90%' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '20px' }}>Nouvelle opportunite</h3>
                    {[['name', "Nom de l'opportunite"], ['client', 'Client'], ['value', 'Valeur estimee (EUR)'], ['probability', 'Probabilite (%)']].map(([field, label]) => (
                      <div key={field} style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '4px' }}>{label}</label>
                        <input value={oppForm[field]} onChange={e => setOppForm({ ...oppForm, [field]: e.target.value })}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit' }} />
                      </div>
                    ))}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '4px' }}>Stade</label>
                      <select value={oppForm.stage} onChange={e => setOppForm({ ...oppForm, stage: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit' }}>
                        {OPP_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => setOppForm(null)} style={{ flex: 1, padding: '12px', background: '#F3F4F6', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>Annuler</button>
                      <button onClick={() => { addOpp(oppForm); setOppForm(null); }} disabled={!oppForm.name.trim()}
                        style={{ flex: 1, padding: '12px', background: oppForm.name.trim() ? '#667EEA' : '#E5E7EB', color: oppForm.name.trim() ? 'white' : '#9CA3AF', border: 'none', borderRadius: '10px', cursor: oppForm.name.trim() ? 'pointer' : 'not-allowed', fontWeight: '700' }}>
                        Creer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {activeTab === 'clients' && <div>
        {/* Recherche */}
        <div style={{ marginBottom: '32px' }}>
          <input
            type="text"
            placeholder="🔍 Rechercher un client (nom, industrie, email)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 20px',
              border: '2px solid #E5E7EB',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '500',
              outline: 'none',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#667EEA'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
          />
        </div>

        {/* Liste Clients */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {filteredClients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => setSelectedClient(client)}
              healthScore={computeHealthScore(client)}
              npsAvg={getClientNpsAvg(client.id)}
            />
          ))}
        </div>

        {/* Message si aucun résultat */}
        {filteredClients.length === 0 && (
          <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '80px', marginBottom: '24px', opacity: 0.5 }}>🔍</div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#6B7280', marginBottom: '12px' }}>Aucun client trouvé</h3>
            <p style={{ fontSize: '16px', color: '#9CA3AF' }}>Essayez de modifier vos critères de recherche</p>
          </div>
        )}

        {/* Modal Détail Client */}
        {selectedClient && (
          <div
            onClick={() => setSelectedClient(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              backdropFilter: 'blur(10px)',
              padding: '20px'
            }}>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '24px',
                maxWidth: '860px',
                width: '100%',
                maxHeight: '92vh',
                overflowY: 'auto',
                boxShadow: '0 40px 100px rgba(0,0,0,0.25)'
              }}>

              {/* Header Banner */}
              <div style={{
                background: `linear-gradient(135deg, ${selectedClient.color || '#667EEA'}22 0%, ${selectedClient.color || '#667EEA'}44 100%)`,
                borderRadius: '24px 24px 0 0',
                padding: '36px 40px 28px',
                borderBottom: `3px solid ${selectedClient.color || '#667EEA'}33`,
                position: 'relative'
              }}>
                <button
                  onClick={() => setSelectedClient(null)}
                  aria-label="Fermer la fiche client"
                  style={{ position: 'absolute', top: '20px', right: '20px', width: '36px', height: '36px', background: 'rgba(0,0,0,0.15)', color: '#1F2937', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ fontSize: '72px', lineHeight: 1 }}>{selectedClient.emoji || '🏢'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '30px', fontWeight: '900', color: '#1F2937', margin: 0 }}>{selectedClient.name}</h2>
                      <span style={{
                        padding: '5px 14px',
                        background: selectedClient.status === 'active' ? '#10B981' : selectedClient.status === 'prospect' ? '#F59E0B' : '#6B7280',
                        color: 'white', borderRadius: '20px', fontSize: '13px', fontWeight: '700'
                      }}>
                        {selectedClient.status === 'active' ? '✓ Actif' : selectedClient.status === 'prospect' ? '🎯 Prospect' : 'Inactif'}
                      </span>
                      {(() => {
                        const score = computeHealthScore(selectedClient);
                        const h = getHealthLabel(score);
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ padding: '5px 14px', background: '#F9FAFB', border: `2px solid ${h.color}`, borderRadius: '20px', fontSize: '13px', fontWeight: '700', color: h.color }}>
                              {h.icon} Santé {score}%
                            </span>
                            <div style={{ width: '80px', height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${score}%`, height: '100%', background: h.color, borderRadius: '3px' }} />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    <p style={{ fontSize: '16px', color: '#6B7280', fontWeight: '600', margin: 0 }}>
                      🏭 {selectedClient.industry}
                      {selectedClient.size && <span style={{ marginLeft: '16px' }}>👥 {selectedClient.size}</span>}
                      {selectedClient.revenue && <span style={{ marginLeft: '16px' }}>💰 CA {selectedClient.revenue}</span>}
                    </p>
                    {selectedClient.siret && (
                      <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '6px', fontWeight: '500' }}>
                        SIRET : {selectedClient.siret}
                      </p>
                    )}
                  </div>
                  {/* KPI Missions */}
                  <div style={{ textAlign: 'center', background: 'white', borderRadius: '16px', padding: '16px 24px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '36px', fontWeight: '900', color: selectedClient.color || '#667EEA' }}>{selectedClient.missions || 0}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase' }}>Missions actives</div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '32px 40px', display: 'grid', gap: '24px' }}>

                {/* Grille 2 colonnes */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>

                  {/* Coordonnées entreprise */}
                  <div style={{ background: '#F9FAFB', borderRadius: '16px', padding: '22px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>📞 Coordonnées</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {selectedClient.email && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>Email principal</div>
                          <a href={`mailto:${selectedClient.email}`} style={{ fontSize: '15px', fontWeight: '700', color: '#667EEA', textDecoration: 'none' }}>
                            📧 {selectedClient.email}
                          </a>
                        </div>
                      )}
                      {selectedClient.phone && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>Téléphone principal</div>
                          <a href={`tel:${selectedClient.phone}`} style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937', textDecoration: 'none' }}>
                            📱 {selectedClient.phone}
                          </a>
                        </div>
                      )}
                      {selectedClient.website && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>Site web</div>
                          <a href={selectedClient.website} target="_blank" rel="noreferrer" style={{ fontSize: '14px', fontWeight: '600', color: '#667EEA', textDecoration: 'none', wordBreak: 'break-all' }}>
                            🌐 {selectedClient.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Adresse */}
                  <div style={{ background: '#F9FAFB', borderRadius: '16px', padding: '22px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>📍 Localisation</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {selectedClient.address && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>Adresse</div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937' }}>{selectedClient.address}</div>
                        </div>
                      )}
                      {(selectedClient.zipCode || selectedClient.city) && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>Ville</div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937' }}>
                            {selectedClient.zipCode} {selectedClient.city}
                          </div>
                        </div>
                      )}
                      {selectedClient.country && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>Pays</div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937' }}>🇫🇷 {selectedClient.country}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dates */}
                  <div style={{ background: '#F9FAFB', borderRadius: '16px', padding: '22px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>📅 Historique</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {selectedClient.createdAt && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>Client depuis</div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#10B981' }}>
                            🗓️ {new Date(selectedClient.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                      )}
                      {selectedClient.lastContact && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>Dernier contact</div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937' }}>
                            📞 {new Date(selectedClient.lastContact).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Infos entreprise */}
                  <div style={{ background: '#F9FAFB', borderRadius: '16px', padding: '22px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>🏢 Entreprise</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {selectedClient.size && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>Effectif</div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937' }}>👥 {selectedClient.size}</div>
                        </div>
                      )}
                      {selectedClient.revenue && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>Chiffre d'affaires</div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#10B981' }}>💰 {selectedClient.revenue}</div>
                        </div>
                      )}
                      {selectedClient.siret && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '3px' }}>SIRET</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937', fontFamily: 'monospace' }}>{selectedClient.siret}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contacts */}
                {(() => {
                  const contactsList = selectedClient.contacts && selectedClient.contacts.length > 0
                    ? selectedClient.contacts
                    : selectedClient.contact
                      ? [{ name: selectedClient.contact, role: selectedClient.position || '', email: '', phone: '' }]
                      : [];
                  return contactsList.length > 0 ? (
                    <div style={{ background: '#F0F4FF', borderRadius: '16px', padding: '22px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                        👥 Contacts ({contactsList.length})
                      </h4>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {contactsList.map((c, i) => (
                          <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            {/* Avatar initiales */}
                            <div style={{
                              width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                              background: `linear-gradient(135deg, ${selectedClient.color || '#667EEA'} 0%, ${selectedClient.color || '#764BA2'}99 100%)`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontWeight: '800', fontSize: '16px'
                            }}>
                              {c.name ? c.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
                            </div>
                            <div style={{ flex: 1, minWidth: '120px' }}>
                              <div style={{ fontWeight: '800', fontSize: '15px', color: '#1F2937' }}>{c.name || '—'}</div>
                              {c.role && <div style={{ fontSize: '12px', color: '#667EEA', fontWeight: '700', marginTop: '2px' }}>{c.role}</div>}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              {c.email && (
                                <a href={`mailto:${c.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#EEF2FF', borderRadius: '8px', color: '#667EEA', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = '#667EEA'; e.currentTarget.style.color = 'white'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.color = '#667EEA'; }}>
                                  📧 {c.email}
                                </a>
                              )}
                              {c.phone && (
                                <a href={`tel:${c.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#F0FFF4', borderRadius: '8px', color: '#10B981', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.color = 'white'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = '#F0FFF4'; e.currentTarget.style.color = '#10B981'; }}>
                                  📱 {c.phone}
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Missions */}
                {(() => {
                  const clientMissions = missions.filter(m =>
                    m.client && selectedClient.name &&
                    (m.client.toLowerCase().includes(selectedClient.name.split(' ')[0].toLowerCase()) ||
                     selectedClient.name.toLowerCase().includes(m.client.toLowerCase()))
                  );
                  const activeMissions = clientMissions.filter(m => m.status === 'open' || m.status === 'in_progress');
                  const pastMissions = clientMissions.filter(m => m.status === 'filled' || m.status === 'closed' || m.status === 'cancelled');
                  if (clientMissions.length === 0) return null;

                  const statusConfig = {
                    open: { label: 'En cours', bg: '#DCFCE7', color: '#16A34A', dot: '#22C55E' },
                    in_progress: { label: 'En cours', bg: '#DCFCE7', color: '#16A34A', dot: '#22C55E' },
                    filled: { label: 'Pourvue', bg: '#DBEAFE', color: '#1D4ED8', dot: '#3B82F6' },
                    closed: { label: 'Clôturée', bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF' },
                    cancelled: { label: 'Annulée', bg: '#FEE2E2', color: '#DC2626', dot: '#EF4444' },
                  };

                  const MissionRow = ({ mission }) => {
                    const cfg = statusConfig[mission.status] || statusConfig.closed;
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                        <span style={{ fontSize: '28px', flexShrink: 0 }}>{mission.emoji || '💼'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '800', fontSize: '15px', color: '#1F2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mission.title}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '3px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {mission.location && <span>📍 {mission.location}</span>}
                            {mission.contractType && <span>📄 {mission.contractType}</span>}
                            {mission.salary && <span>💰 {mission.salary}</span>}
                            {mission.startDate && <span>🗓️ {new Date(mission.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: cfg.bg, color: cfg.color, borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
                            {cfg.label}
                          </span>
                          {typeof mission.progress === 'number' && mission.status === 'open' && (
                            <div style={{ width: '80px', height: '5px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${mission.progress}%`, background: 'linear-gradient(90deg, #667EEA, #10B981)', borderRadius: '3px' }} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  };

                  return (
                    <div style={{ background: '#F8FAFF', borderRadius: '16px', padding: '22px', border: '1px solid #E0E7FF' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                          💼 Missions ({clientMissions.length})
                        </h4>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {activeMissions.length > 0 && (
                            <span style={{ padding: '3px 10px', background: '#DCFCE7', color: '#16A34A', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                              {activeMissions.length} active{activeMissions.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {pastMissions.length > 0 && (
                            <span style={{ padding: '3px 10px', background: '#DBEAFE', color: '#1D4ED8', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                              {pastMissions.length} pourvue{pastMissions.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {activeMissions.length > 0 && (
                        <div style={{ marginBottom: pastMissions.length > 0 ? '16px' : 0 }}>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>▶ En cours</div>
                          <div style={{ display: 'grid', gap: '8px' }}>
                            {activeMissions.map(m => <MissionRow key={m.id} mission={m} />)}
                          </div>
                        </div>
                      )}

                      {pastMissions.length > 0 && (
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>✓ Historique</div>
                          <div style={{ display: 'grid', gap: '8px' }}>
                            {pastMissions.map(m => <MissionRow key={m.id} mission={m} />)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Liens et documents */}
                <ClientLinksDocuments
                  client={selectedClient}
                  onSave={(patch) => {
                    updateClient(selectedClient.id, patch).catch(error => {
                      console.error('Erreur mise à jour liens/documents client:', error);
                      showError('Erreur', error.message);
                    });
                    setSelectedClient(prev => ({ ...prev, ...patch }));
                  }}
                />

                {/* Notes */}
                {selectedClient.notes && (
                  <div style={{ background: '#F0FFF4', borderRadius: '16px', padding: '22px', border: '1px solid #A7F3D0' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>📝 Notes internes</h4>
                    <p style={{ fontSize: '15px', color: '#1F2937', lineHeight: '1.7', margin: 0, fontStyle: 'italic' }}>
                      "{selectedClient.notes}"
                    </p>
                  </div>
                )}

                {/* Historique devis */}
                {(devisData[selectedClient.id] || []).length > 0 && (
                  <div style={{ background: '#EFF6FF', borderRadius: '16px', padding: '22px', border: '1px solid #BFDBFE' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>📄 Devis ({(devisData[selectedClient.id] || []).length})</h4>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {(devisData[selectedClient.id] || []).slice(0, 5).map(d => {
                        const total = (d.lines || []).reduce((s, l) => s + (parseFloat(l.qty) || 0) * (parseFloat(l.price) || 0), 0);
                        const statusCfg = { pending: { label: 'En attente', bg: '#FEF3C7', color: '#92400E' }, accepted: { label: 'Accepte', bg: '#D1FAE5', color: '#065F46' }, refused: { label: 'Refuse', bg: '#FEE2E2', color: '#991B1B' } };
                        const sc = statusCfg[d.status] || statusCfg.pending;
                        return (
                          <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'white', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: '700', fontSize: '13px', color: '#1F2937' }}>{d.ref}</div>
                              <div style={{ fontSize: '11px', color: '#6B7280' }}>{d.title} — {new Date(d.date).toLocaleDateString('fr-FR')}</div>
                            </div>
                            <div style={{ fontWeight: '900', fontSize: '14px', color: '#0EA5E9', whiteSpace: 'nowrap' }}>{total.toLocaleString('fr-FR')} EUR</div>
                            <div style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: sc.bg, color: sc.color, whiteSpace: 'nowrap' }}>{sc.label}</div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {d.status !== 'accepted' && <button onClick={() => updateDevisStatus(selectedClient.id, d.id, 'accepted')} style={{ padding: '3px 8px', background: '#D1FAE5', color: '#065F46', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: '700' }}>OK</button>}
                              {d.status !== 'refused' && <button onClick={() => updateDevisStatus(selectedClient.id, d.id, 'refused')} style={{ padding: '3px 8px', background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: '700' }}>KO</button>}
                              <button onClick={() => printDevis(selectedClient, d)} style={{ padding: '3px 8px', background: '#DBEAFE', color: '#1D4ED8', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: '700' }}>PDF</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Historique des échanges */}
                <ContactHistory clientId={selectedClient.id} />

                {/* Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', paddingTop: '8px' }}>
                  <button
                    onClick={() => {
                      window.location.href = `mailto:${selectedClient.email}`;
                      success('Email ouvert', `Messagerie ouverte pour ${selectedClient.email}`);
                    }}
                    style={{ padding: '16px', background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', transition: 'all 0.3s', boxShadow: '0 4px 16px rgba(102,126,234,0.4)' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    📧 Contacter
                  </button>
                  <button
                    onClick={() => { setPortalLink(null); handleGeneratePortal(selectedClient); }}
                    style={{ padding: '16px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', transition: 'all 0.3s', boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    🔗 Portail client
                  </button>
                  <button
                    onClick={() => { setNpsModal(selectedClient); setNpsScore(null); setNpsVerbatim(''); }}
                    style={{ padding: '16px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', transition: 'all 0.3s', boxShadow: '0 4px 16px rgba(236,72,153,0.4)' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    NPS
                  </button>
                  <button
                    onClick={() => generateClientReport(selectedClient)}
                    style={{ padding: '16px', background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', transition: 'all 0.3s', boxShadow: '0 4px 16px rgba(139,92,246,0.4)' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    Rapport PDF
                  </button>
                  <button
                    onClick={() => setDevisModal(selectedClient)}
                    style={{ padding: '16px', background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', transition: 'all 0.3s', boxShadow: '0 4px 16px rgba(14,165,233,0.4)' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    Devis
                  </button>
                  <button
                    onClick={() => handleEditClient(selectedClient)}
                    style={{ padding: '16px', background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', transition: 'all 0.3s', boxShadow: '0 4px 16px rgba(245,158,11,0.4)' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteClient(selectedClient)}
                    style={{ padding: '16px', background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', transition: 'all 0.3s', boxShadow: '0 4px 16px rgba(239,68,68,0.4)' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal lien portail client */}
        {portalLink && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '520px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '56px', marginBottom: '12px' }}>🔗</div>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1F2937', marginBottom: '8px' }}>Portail client généré</h3>
                <p style={{ color: '#6B7280', fontSize: '14px' }}>Partagez ce lien avec votre client pour qu'il puisse suivre ses missions en lecture seule.</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input readOnly value={portalLink} style={{ flex: 1, padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '12px', background: '#F9FAFB' }} />
                <button
                  onClick={() => { navigator.clipboard.writeText(portalLink); setPortalCopied(true); setTimeout(() => setPortalCopied(false), 2000); }}
                  style={{ padding: '10px 16px', background: portalCopied ? '#10B981' : '#667EEA', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {portalCopied ? '✅ Copié' : '📋 Copier'}
                </button>
              </div>
              <button onClick={() => setPortalLink(null)} style={{ width: '100%', padding: '12px', background: 'none', border: '2px solid #E5E7EB', borderRadius: '12px', color: '#6B7280', fontWeight: '600', cursor: 'pointer' }}>
                Fermer
              </button>
            </div>
          </div>
        )}

        </div>}

        {/* NPS Modal */}
        {npsModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '36px', maxWidth: '480px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#1F2937', marginBottom: '6px' }}>NPS — {npsModal.name}</h2>
              <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>De 0 (pas du tout) a 10 (tout a fait), recommanderiez-vous nos services ?</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
                {Array.from({ length: 11 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setNpsScore(i)}
                    style={{
                      width: '40px', height: '40px', borderRadius: '10px', border: '2px solid',
                      borderColor: npsScore === i ? (i >= 9 ? '#10B981' : i >= 7 ? '#F59E0B' : '#EF4444') : '#E5E7EB',
                      background: npsScore === i ? (i >= 9 ? '#D1FAE5' : i >= 7 ? '#FEF3C7' : '#FEE2E2') : 'white',
                      fontWeight: '900', fontSize: '14px', cursor: 'pointer',
                      color: npsScore === i ? (i >= 9 ? '#065F46' : i >= 7 ? '#92400E' : '#991B1B') : '#374151',
                    }}
                  >{i}</button>
                ))}
              </div>
              <textarea
                placeholder="Commentaire (optionnel)..."
                value={npsVerbatim}
                onChange={e => setNpsVerbatim(e.target.value)}
                rows={3}
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', fontFamily: 'inherit', resize: 'none', marginBottom: '16px' }}
              />
              {/* Past scores */}
              {(npsData[npsModal.id] || []).length > 0 && (
                <div style={{ marginBottom: '16px', padding: '12px', background: '#F9FAFB', borderRadius: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                    Score moyen : {getClientNpsAvg(npsModal.id)}/10 ({(npsData[npsModal.id] || []).length} reponse(s))
                  </div>
                  {(npsData[npsModal.id] || []).slice(-3).map((e, i) => (
                    <div key={i} style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                      Note {e.score} — {new Date(e.date).toLocaleDateString('fr-FR')} {e.verbatim ? '— "' + e.verbatim + '"' : ''}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setNpsModal(null)} style={{ flex: 1, padding: '12px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>Annuler</button>
                <button onClick={() => submitNps(npsModal.id)} disabled={npsScore === null}
                  style={{ flex: 1, padding: '12px', background: npsScore !== null ? '#EC4899' : '#E5E7EB', color: npsScore !== null ? 'white' : '#9CA3AF', border: 'none', borderRadius: '10px', cursor: npsScore !== null ? 'pointer' : 'not-allowed', fontWeight: '700' }}>
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal creation devis */}
        {devisModal && <DevisModal client={devisModal} onClose={() => setDevisModal(null)} onSave={saveDevis} />}

        {/* Formulaire de gestion des clients */}
        <ClientForm
          client={editingClient}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingClient(null);
          }}
          onSubmit={handleSubmitClient}
        />
      </div>
    </div>
  );
}

export default ClientsPage;
