import React, { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/core/contexts/AuthContext';
import { useData } from '@/core/contexts/DataContext';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import { useConfirm } from '@/core/contexts/ConfirmContext';
import TeamMemberForm from './components/TeamMemberForm';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import { usePlanAccess } from '@/core/hooks/usePlanAccess';
import { createInviteLink } from '@/core/utils/inviteLink';

/**
 * Page Team - Gestion complète de l'équipe avec permissions
 */

// ─── Composants extraits depuis des IIFEs (violation Rules of Hooks corrigée) ───

function PerformanceReport({ team, applications }) {
  const [perfMonth, setPerfMonth] = React.useState(() => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  });
  const perfData = React.useMemo(() => {
    return team.map(member => {
      const memberApps = (applications || []).filter(a => {
        const appMonth = new Date(a.dateApplied || a.createdAt || '2026-01-01').toISOString().slice(0, 7);
        return appMonth === perfMonth && (a.assignedTo === member.id || a.assignedToName === member.name);
      });
      const hiredApps = memberApps.filter(a => a.status === 'hired');
      const interviewApps = memberApps.filter(a => ['interview_1','interview_2'].includes(a.status));
      const convRate = memberApps.length > 0 ? Math.round((hiredApps.length / memberApps.length) * 100) : 0;
      const avgTTH = hiredApps.length > 0
        ? Math.round(hiredApps.reduce((sum, a) => sum + (new Date(a.hiredAt || Date.now()) - new Date(a.dateApplied || Date.now())) / 86400000, 0) / hiredApps.length)
        : null;
      return { name: member.name, role: member.role, treated: memberApps.length, hired: hiredApps.length, interviews: interviewApps.length, convRate, avgTTH };
    }).filter(m => m.treated > 0 || m.hired > 0);
  }, [team, applications, perfMonth]);

  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1F2937', margin: 0 }}>Rapport de performance recruteur</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input type="month" value={perfMonth} onChange={e => setPerfMonth(e.target.value)}
            style={{ padding: '8px 12px', border: '1.5px solid #E5E7EB', borderRadius: '9px', fontSize: '13px', fontFamily: 'inherit' }} />
          <button onClick={() => window.print()} style={{ padding: '8px 16px', background: '#8B5CF6', color: 'white', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>Export PDF</button>
        </div>
      </div>
      {perfData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: '#9CA3AF', fontSize: '13px' }}>Aucune donnee pour cette periode. Assignez des candidatures aux recruteurs pour voir les stats.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                {['Recruteur','Role','Traites','Entretiens','Embauches','Taux conv.','TTH moyen'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '800', color: '#374151', fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {perfData.map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '700', color: '#1F2937' }}>{m.name}</td>
                  <td style={{ padding: '10px 12px', color: '#6B7280' }}>{m.role}</td>
                  <td style={{ padding: '10px 12px', color: '#374151' }}>{m.treated}</td>
                  <td style={{ padding: '10px 12px', color: '#374151' }}>{m.interviews}</td>
                  <td style={{ padding: '10px 12px', fontWeight: '700', color: m.hired > 0 ? '#10B981' : '#9CA3AF' }}>{m.hired}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', background: m.convRate >= 20 ? '#D1FAE5' : '#F3F4F6', color: m.convRate >= 20 ? '#065F46' : '#6B7280' }}>
                      {m.convRate}%
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#6B7280' }}>{m.avgTTH !== null ? m.avgTTH + 'j' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ActivityFeed({ missions, applications, history, team }) {
  const [feedFilter, setFeedFilter] = React.useState('');
  const activityItems = React.useMemo(() => {
    const items = [];
    (missions || []).forEach(m => {
      if (m.createdBy) items.push({ user: m.createdBy, action: 'a cree la mission', target: m.title, date: m.createdAt || m.dateAdded, type: 'mission' });
      if (m.updatedBy && m.updatedAt && m.updatedBy !== m.createdBy) items.push({ user: m.updatedBy, action: 'a mis a jour la mission', target: m.title, date: m.updatedAt, type: 'update' });
    });
    (applications || []).forEach(a => {
      if (a.assignedToName) items.push({ user: a.assignedToName, action: 'a pris en charge', target: a.candidateName, date: a.updatedAt || a.dateApplied, type: 'assign' });
    });
    (history || []).forEach(h => {
      if (h.user) items.push({ user: h.user, action: h.action || 'a effectue une action', target: h.target || '', date: h.date, type: 'history' });
    });
    return items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 30);
  }, [missions, applications, history]);

  const filtered = feedFilter ? activityItems.filter(a => a.user?.toLowerCase().includes(feedFilter.toLowerCase())) : activityItems;
  const TYPE_ICONS = { mission: '📋', update: '✏️', assign: '👤', history: '📝' };
  if (filtered.length === 0) return null;

  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1F2937', margin: 0 }}>Feed d'activite equipe</h2>
        <select value={feedFilter} onChange={e => setFeedFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1.5px solid #E5E7EB', borderRadius: '9px', fontSize: '13px', fontFamily: 'inherit' }}>
          <option value="">Tous les membres</option>
          {team.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
        {filtered.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 12px', background: '#F9FAFB', borderRadius: '10px' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>{TYPE_ICONS[item.type] || '📌'}</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#667EEA' }}>{item.user}</span>
              <span style={{ fontSize: '13px', color: '#374151' }}> {item.action} </span>
              {item.target && <span style={{ fontSize: '13px', fontWeight: '600', color: '#1F2937' }}>{item.target}</span>}
            </div>
            <span style={{ fontSize: '11px', color: '#9CA3AF', flexShrink: 0 }}>
              {item.date ? new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OKRSection({ team }) {
  const OKR_KEY = 'ats_okrs';
  const [okrs, setOkrs] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(OKR_KEY) || '[]'); } catch { return []; }
  });
  const [newMember, setNewMember] = React.useState('');
  const [newTarget, setNewTarget] = React.useState('5');
  const [newType, setNewType] = React.useState('hires');
  const saveOkrs = (updated) => { setOkrs(updated); localStorage.setItem(OKR_KEY, JSON.stringify(updated)); };
  const addOkr = () => {
    if (!newMember.trim()) return;
    const quarter = 'Q' + (Math.ceil((new Date().getMonth() + 1) / 3)) + ' ' + new Date().getFullYear();
    saveOkrs([...okrs, { id: Date.now(), member: newMember, target: parseInt(newTarget) || 5, type: newType, current: 0, quarter }]);
    setNewMember('');
  };
  const updateProgress = (id, delta) => saveOkrs(okrs.map(o => o.id === id ? { ...o, current: Math.max(0, (o.current || 0) + delta) } : o));
  const removeOkr = (id) => saveOkrs(okrs.filter(o => o.id !== id));
  const TYPE_LABELS = { hires: 'Embauches', interviews: 'Entretiens', offers: 'Offres', candidates: 'Candidats traites' };

  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', marginBottom: '32px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1F2937', marginBottom: '20px' }}>OKRs Recrutement</h2>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select value={newMember} onChange={e => setNewMember(e.target.value)}
          style={{ flex: 1, minWidth: '140px', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: '9px', fontSize: '13px', fontFamily: 'inherit' }}>
          <option value="">Choisir un membre...</option>
          {team.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
        </select>
        <select value={newType} onChange={e => setNewType(e.target.value)}
          style={{ padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: '9px', fontSize: '13px', fontFamily: 'inherit' }}>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input type="number" min="1" max="100" value={newTarget} onChange={e => setNewTarget(e.target.value)}
          style={{ width: '70px', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: '9px', fontSize: '13px', fontFamily: 'inherit' }} />
        <button onClick={addOkr} disabled={!newMember}
          style={{ padding: '9px 18px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '9px', cursor: newMember ? 'pointer' : 'not-allowed', fontWeight: '700', fontSize: '13px' }}>
          + Ajouter OKR
        </button>
      </div>
      {okrs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: '#9CA3AF', fontSize: '13px' }}>Aucun OKR defini. Ajoutez des objectifs trimestriels pour votre equipe.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {okrs.map(okr => {
            const pct = Math.min(Math.round(((okr.current || 0) / (okr.target || 1)) * 100), 100);
            const color = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#667EEA';
            return (
              <div key={okr.id} style={{ padding: '14px 18px', background: '#F9FAFB', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', flex: 1 }}>{okr.member}</span>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>{TYPE_LABELS[okr.type]} — {okr.quarter}</span>
                  <span style={{ fontSize: '14px', fontWeight: '900', color }}>{okr.current}/{okr.target}</span>
                  <button onClick={() => updateProgress(okr.id, 1)} style={{ padding: '2px 8px', background: '#D1FAE5', color: '#065F46', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>+1</button>
                  <button onClick={() => updateProgress(okr.id, -1)} style={{ padding: '2px 8px', background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>-1</button>
                  <button onClick={() => removeOkr(okr.id)} aria-label="Supprimer l'OKR" style={{ padding: '2px 6px', background: 'none', color: '#9CA3AF', border: 'none', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                </div>
                <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: pct + '%', background: color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ fontSize: '11px', color, marginTop: '4px', fontWeight: '700' }}>{pct}% atteint</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TeamPage() {
  const { user } = useAuth();
  const { team: allTeam, addTeamMember, updateTeamMember, deleteTeamMember, missions, applications, history = [] } = useData();
  const { success, error: showError } = useNotifications();
  const { confirm } = useConfirm();
  const isMobile = useIsMobile();
  const { maxSeats, plan, canSeeTeamTab, isOwner } = usePlanAccess();
  // maxSeats compte le manager lui-même comme 1 siège — les membres listés ici
  // (team_members) sont les équipiers "supplémentaires" (voir CLAUDE.md :
  // team_3 = jusqu'à 2 équipiers additionnels, team_6 = jusqu'à 5).
  const maxAdditionalMembers = maxSeats === Infinity ? Infinity : Math.max(0, maxSeats - 1);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [bulkInviteOpen, setBulkInviteOpen] = useState(false);
  const [bulkEmailsText, setBulkEmailsText] = useState('');
  const [bulkRole, setBulkRole] = useState('recruiter');
  const [bulkSent, setBulkSent] = useState(null);
  const [bulkSending, setBulkSending] = useState(false);
  const [newMemberInvite, setNewMemberInvite] = useState(null); // { email, link } | null

  // Filtrer les membres pour ne montrer que ceux de l'entreprise de l'utilisateur connecté
  const team = allTeam.filter(member => member.companyId === user?.companyId);

  // 🔥 Gestion des membres
  const handleCreateMember = () => {
    if (team.length >= maxAdditionalMembers) {
      showError(
        'Quota de sièges atteint',
        `Votre plan (${plan === 'team_3' ? 'Manager · 3 postes' : plan === 'team_6' ? 'Manager · 6 postes' : plan}) autorise ${maxAdditionalMembers} équipier${maxAdditionalMembers > 1 ? 's' : ''} supplémentaire${maxAdditionalMembers > 1 ? 's' : ''}. Passez à un plan supérieur pour inviter plus de recruteurs.`
      );
      return;
    }
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  // T-323/T-336 : team_members.role ('Admin'/'Manager'/'Recruteur'/'Consultant',
  // labels FR affichés dans TeamMemberForm) n'a pas le même vocabulaire que
  // profiles.role (utilisé par les policies RLS et usePlanAccess) — mappage
  // nécessaire pour générer un lien d'invitation avec le bon rôle Supabase.
  const TEAM_ROLE_TO_PROFILE_ROLE = { Admin: 'admin', Manager: 'manager', Recruteur: 'recruiter', Consultant: 'viewer' };

  const handleSubmitMember = async (memberData) => {
    if (editingMember) {
      updateTeamMember(memberData);
      setIsFormOpen(false);
      setEditingMember(null);
      return;
    }

    if (team.length >= maxAdditionalMembers) {
      showError('Quota de sièges atteint', 'Passez à un plan supérieur pour inviter plus de recruteurs.');
      setIsFormOpen(false);
      setEditingMember(null);
      return;
    }
    // Ajouter le companyId de l'utilisateur connecté au nouveau membre
    await addTeamMember({
      ...memberData,
      companyId: user?.companyId
    });
    setIsFormOpen(false);
    setEditingMember(null);

    // T-323/T-336 : avant, cette ligne "team_members" était purement
    // décorative — la personne n'avait aucun moyen réel de se connecter (pas
    // de compte Supabase Auth créé, pas de lien envoyé). On génère désormais
    // un vrai lien d'invitation à transmettre, en plus de la fiche roster.
    if (memberData.email) {
      try {
        const link = await createInviteLink({
          companyId: user?.companyId,
          role: TEAM_ROLE_TO_PROFILE_ROLE[memberData.role] || 'recruiter',
          actorId: user?.id,
        });
        setNewMemberInvite({ email: memberData.email, link });
      } catch (err) {
        showError('Erreur', 'Membre ajouté, mais le lien d\'invitation n\'a pas pu être généré : ' + (err.message || ''));
      }
    }
  };

  const handleToggleActive = (member) => {
    updateTeamMember({
      ...member,
      active: !member.active
    });
    success(
      member.active ? 'Membre désactivé' : 'Membre activé',
      `${member.name} a été ${member.active ? 'désactivé' : 'activé'}`
    );
  };

  const handleDeleteMember = async (member) => {
    if (await confirm(`Supprimer ${member.name} de l'équipe ?`, { title: 'Retirer le membre' })) {
      deleteTeamMember(member.id);
      success('Membre supprimé', `${member.name} a été retiré de l'équipe`);
      if (selectedMember?.id === member.id) {
        setSelectedMember(null);
      }
    }
  };

  // T-250 — Vue charge de travail : missions actives, candidatures en cours,
  // entretiens. Calculé depuis les candidatures réellement assignées au
  // recruteur (applications.assignedTo) plutôt que depuis missions.assignedTo/
  // recruiters, qui ne correspondent à aucun champ réel du schéma mission
  // (seul allowedRecruiters existe, et c'est une permission de visibilité, pas
  // une affectation de charge de travail).
  const ACTIVE_APPLICATION_STATUSES = ['received', 'screening', 'interview_1', 'interview_2', 'offer', 'final'];
  const INTERVIEW_STATUSES = ['interview_1', 'interview_2'];

  const workload = useMemo(() => {
    return team.map(member => {
      const memberActiveApps = (applications || []).filter(a =>
        (a.assignedTo === member.id || a.assignedToName === member.name) &&
        ACTIVE_APPLICATION_STATUSES.includes(a.status)
      );
      const activeMissionIds = new Set(memberActiveApps.map(a => a.missionId));
      const interviews = memberActiveApps.filter(a => INTERVIEW_STATUSES.includes(a.status)).length;
      const total = activeMissionIds.size + memberActiveApps.length;
      return {
        id: member.id,
        name: member.name,
        avatar: member.avatar,
        missions: activeMissionIds.size,
        applications: memberActiveApps.length,
        interviews,
        total,
      };
    }).sort((a, b) => b.total - a.total);
  }, [team, applications]);

  // T-319 : cette page (gestion de l'équipe, invitations, rôles) n'avait aucune
  // vérification de rôle — un Équipier pouvait y accéder en tapant directement
  // /app/team dans la barre d'adresse et gérer l'ensemble de l'équipe.
  if (!canSeeTeamTab || !isOwner) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const maxWorkload = Math.max(...workload.map(w => w.total), 1);

  const allHiredApps = (applications || []).filter(a => a.status === 'hired');
  const stats = [
    { icon: '👥', label: 'Membres Totaux', value: team.length, color: '#667EEA' },
    { icon: '✅', label: 'Actifs', value: team.filter(m => m.active).length, color: '#10B981' },
    { icon: '💼', label: 'Missions Pourvues', value: new Set(allHiredApps.map(a => a.missionId)).size, color: '#F59E0B' },
    { icon: '🎯', label: 'Placements', value: allHiredApps.length, color: '#8B5CF6' },
  ];

  return (
    <div style={{ padding: '32px', background: 'linear-gradient(180deg, #ffffff 0%, #fef5ff 50%, #f3e7ff 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '8px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Équipe
            </h1>
            <p style={{ fontSize: '16px', color: '#6B7280' }}>Gestion complète avec rôles & permissions</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => { setBulkSent(null); setBulkEmailsText(''); setBulkInviteOpen(true); }}
              style={{ padding: '14px 20px', background: 'white', color: '#667EEA', border: '2px solid #667EEA', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#EEF2FF'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
              📧 Inviter en masse
            </button>
            <button
              onClick={handleCreateMember}
              style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)', transition: 'all 0.3s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              ➕ Nouveau Membre
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ padding: '16px', background: 'white', borderRadius: '14px', border: '2px solid #F3F4F6', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '900', marginBottom: '2px', background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}99 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' }}>{stat.icon} {stat.label}</div>
            </div>
          ))}
        </div>

        {/* Liste Membres */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
          {team.map(member => (
            <div
              key={member.id}
              onClick={() => setSelectedMember(member)}
              style={{
                padding: '32px',
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                border: '2px solid transparent',
                opacity: member.active ? 1 : 0.6
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = member.color;
                e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
              }}>

              <div style={{ display: 'flex', alignItems: 'start', gap: '20px', marginBottom: '24px' }}>
                <div style={{ width: '80px', height: '80px', background: `linear-gradient(135deg, ${member.color} 0%, ${member.color}99 100%)`, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', flexShrink: 0 }}>
                  {member.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {member.name}
                    {!member.active && <span style={{ padding: '4px 10px', background: '#EF4444', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>Inactif</span>}
                  </h3>
                  <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '8px', fontWeight: '600' }}>{member.role}</p>
                  <p style={{ color: '#9CA3AF', fontSize: '13px' }}>📧 {member.email}</p>
                  <p style={{ color: '#9CA3AF', fontSize: '13px' }}>📱 {member.phone}</p>
                </div>
              </div>

              {/* Stats individuelles (candidatures embauchées réelles, tous temps) */}
              {(() => {
                const memberHiredApps = (applications || []).filter(a =>
                  (a.assignedTo === member.id || a.assignedToName === member.name) && a.status === 'hired'
                );
                const memberMissionCount = new Set(memberHiredApps.map(a => a.missionId)).size;
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px', padding: '16px', background: '#F9FAFB', borderRadius: '12px', marginBottom: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: member.color }}>{memberMissionCount}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>Missions pourvues</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: member.color }}>{memberHiredApps.length}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>Placements</div>
                    </div>
                  </div>
                );
              })()}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditMember(member);
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#667EEA',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#5568D3'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#667EEA'}>
                  ✏️ Modifier
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleActive(member);
                  }}
                  style={{
                    padding: '8px 16px',
                    background: member.active ? '#F59E0B' : '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}>
                  {member.active ? '⏸️ Désactiver' : '▶️ Activer'}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMember(member);
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#DC2626'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#EF4444'}>
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Détail Membre */}
        {selectedMember && (
          <div
            onClick={() => setSelectedMember(null)}
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
                maxWidth: '900px',
                width: '100%',
                padding: '40px',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'start' }}>
                  <div style={{ width: '100px', height: '100px', background: `linear-gradient(135deg, ${selectedMember.color} 0%, ${selectedMember.color}99 100%)`, borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px' }}>
                    {selectedMember.avatar}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '32px', fontWeight: '900', background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
                      {selectedMember.name}
                    </h3>
                    <p style={{ fontSize: '18px', color: '#6B7280', fontWeight: '700', marginBottom: '8px' }}>{selectedMember.role}</p>
                    <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Embauché le {selectedMember.hireDate}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  aria-label="Fermer la fiche du membre"
                  style={{ padding: '10px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '18px', width: '40px', height: '40px', fontWeight: '700' }}>
                  ✕
                </button>
              </div>

              {/* Statistiques globales réelles (candidatures assignées, tous statuts confondus) */}
              {(() => {
                const memberHiredApps = (applications || []).filter(a =>
                  (a.assignedTo === selectedMember.id || a.assignedToName === selectedMember.name) && a.status === 'hired'
                );
                const memberMissionIds = new Set(memberHiredApps.map(a => a.missionId));
                return (
                  <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#1F2937' }}>📊 Statistiques globales (tous temps)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Missions pourvues</div>
                        <div style={{ fontSize: '28px', fontWeight: '900', color: selectedMember.color }}>{memberMissionIds.size}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Placements</div>
                        <div style={{ fontSize: '28px', fontWeight: '900', color: '#10B981' }}>{memberHiredApps.length}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Charge de travail réelle (calculée depuis les candidatures assignées, T-250) */}
              {(() => {
                const memberWorkload = workload.find(w => w.id === selectedMember.id);
                return (
                  <div style={{ background: '#EFF6FF', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#1F2937' }}>📈 Charge de travail actuelle</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Missions actives</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937' }}>{memberWorkload?.missions ?? 0}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Candidatures en cours</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#667EEA' }}>{memberWorkload?.applications ?? 0}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Entretiens en cours</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#10B981' }}>{memberWorkload?.interviews ?? 0}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Journal d'activité */}
              {(() => {
                const memberHistory = history
                  .filter(h => h.user === selectedMember.name || h.userId === selectedMember.id)
                  .slice(0, 10);
                return (
                  <div style={{ background: '#FFFBEB', padding: '24px', borderRadius: '16px', marginTop: '16px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#1F2937' }}>📋 Journal d'activité</h4>
                    {memberHistory.length === 0 ? (
                      <p style={{ color: '#9CA3AF', fontSize: '13px' }}>Aucune activité enregistrée pour ce membre.</p>
                    ) : (
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {memberHistory.map(h => (
                          <div key={h.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '18px', flexShrink: 0 }}>{h.icon || '📌'}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>{h.action}</div>
                              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{h.details}</div>
                              {h.relatedTo && <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>↳ {h.relatedTo.name}</div>}
                            </div>
                            <div style={{ fontSize: '11px', color: '#9CA3AF', flexShrink: 0, textAlign: 'right' }}>
                              <div>{h.date}</div>
                              <div>{h.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Charge de travail par recruteur */}
        {workload.length > 0 && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1F2937', marginBottom: '4px' }}>📊 Charge de travail par recruteur</h3>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px' }}>Missions actives, candidatures en cours et entretiens en cours, par candidature réellement assignée</p>
            <div style={{ display: 'grid', gap: '16px' }}>
              {workload.map(w => {
                const missionPct = maxWorkload > 0 ? (w.missions / maxWorkload) * 100 : 0;
                const appPct = maxWorkload > 0 ? (w.applications / maxWorkload) * 100 : 0;
                const overloaded = w.total > 15;
                return (
                  <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #667EEA, #764BA2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'white', fontWeight: '700', flexShrink: 0 }}>
                      {w.avatar ? <img src={w.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : w.name.charAt(0)}
                    </div>
                    <div style={{ width: '140px', flexShrink: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937' }}>{w.name}</div>
                      <div style={{ fontSize: '11px', color: overloaded ? '#EF4444' : '#6B7280' }}>{overloaded ? '⚠️ Surchargé' : `${w.total} éléments`}</div>
                    </div>
                    <div style={{ flex: 1, display: 'grid', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '70px', fontSize: '11px', color: '#6B7280', textAlign: 'right', flexShrink: 0 }}>💼 {w.missions} missions</div>
                        <div style={{ flex: 1, height: '8px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${missionPct}%`, height: '100%', background: '#667EEA', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '70px', fontSize: '11px', color: '#6B7280', textAlign: 'right', flexShrink: 0 }}>🎯 {w.applications} candid.</div>
                        <div style={{ flex: 1, height: '8px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${appPct}%`, height: '100%', background: '#10B981', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ width: '90px', textAlign: 'center', flexShrink: 0 }}>
                      <span title="Candidatures actuellement en entretien (1er ou 2e tour)" style={{ padding: '4px 10px', background: w.interviews > 0 ? '#FFFBEB' : '#F9FAFB', color: w.interviews > 0 ? '#92400E' : '#9CA3AF', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                        🗓️ {w.interviews}
                      </span>
                    </div>
                    <div style={{ width: '40px', textAlign: 'right', fontSize: '16px', fontWeight: '900', color: overloaded ? '#EF4444' : '#1F2937', flexShrink: 0 }}>{w.total}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E5E7EB', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', background: '#667EEA', borderRadius: '2px' }} /><span style={{ fontSize: '12px', color: '#6B7280' }}>Missions actives</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', background: '#10B981', borderRadius: '2px' }} /><span style={{ fontSize: '12px', color: '#6B7280' }}>Candidatures en cours</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span>🗓️</span><span style={{ fontSize: '12px', color: '#6B7280' }}>Entretiens en cours</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', background: '#EF4444', borderRadius: '2px' }} /><span style={{ fontSize: '12px', color: '#6B7280' }}>⚠️ Surchargé (&gt;15)</span></div>
            </div>
          </div>
        )}

        {/* Modal invitation en masse */}
        {bulkInviteOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '520px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1F2937', margin: 0 }}>📧 Inviter en masse</h2>
                <button onClick={() => setBulkInviteOpen(false)} aria-label="Fermer l'invitation en masse" style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6B7280' }}>✕</button>
              </div>

              {!bulkSent ? (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                      Adresses email (une par ligne ou séparées par des virgules)
                    </label>
                    <textarea
                      value={bulkEmailsText}
                      onChange={e => setBulkEmailsText(e.target.value)}
                      placeholder={'alice@entreprise.com\nbob@entreprise.com, charlie@test.fr'}
                      rows={6}
                      style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'monospace' }}
                    />
                    <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                      Vous pouvez aussi coller un fichier CSV (colonne email)
                    </p>
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Rôle attribué</label>
                    <select value={bulkRole} onChange={e => setBulkRole(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }}>
                      <option value="recruiter">Recruteur</option>
                      <option value="manager">Manager</option>
                      <option value="viewer">Lecteur</option>
                    </select>
                  </div>
                  {(() => {
                    const emails = bulkEmailsText.split(/[\n,;]+/).map(e => e.trim()).filter(e => e.includes('@'));
                    return (
                      <>
                        {emails.length > 0 && (
                          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                            <p style={{ color: '#166534', fontWeight: '600', fontSize: '13px', margin: 0 }}>
                              ✅ {emails.length} email{emails.length > 1 ? 's' : ''} valide{emails.length > 1 ? 's' : ''} détecté{emails.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        )}
                        <button
                          onClick={async () => {
                            // T-323/T-336 : cette action affichait "Invitations envoyées" alors
                            // qu'aucun email n'était réellement envoyé et qu'aucun lien
                            // fonctionnel n'était généré (juste une ligne "team_members"
                            // décorative, sans aucun moyen réel de se connecter). On génère
                            // désormais de vrais liens d'invitation (migration 019) à copier
                            // et envoyer soi-même — honnête sur ce que fait réellement l'app.
                            const room = maxAdditionalMembers === Infinity ? emails.length : Math.max(0, maxAdditionalMembers - team.length);
                            const toInvite = emails.slice(0, room);
                            const skipped = emails.length - toInvite.length;
                            setBulkSending(true);
                            try {
                              const links = await Promise.all(toInvite.map(async email => {
                                const link = await createInviteLink({ companyId: user?.companyId, role: bulkRole, actorId: user?.id });
                                return { email, link };
                              }));
                              setBulkSent(links);
                              if (skipped > 0) {
                                showError('Quota de sièges atteint', `${skipped} lien(s) non généré(s) — quota de ${maxAdditionalMembers} équipier(s) supplémentaire(s) atteint pour votre plan.`);
                              } else {
                                success('Liens générés', `${links.length} lien(s) d'invitation généré(s) — copiez-les et envoyez-les vous-même.`);
                              }
                            } catch (err) {
                              showError('Erreur', err.message || 'Impossible de générer les liens d\'invitation');
                            } finally {
                              setBulkSending(false);
                            }
                          }}
                          disabled={emails.length === 0 || bulkSending}
                          style={{ width: '100%', padding: '14px', background: (emails.length > 0 && !bulkSending) ? 'linear-gradient(135deg, #667EEA, #764BA2)' : '#E5E7EB', color: (emails.length > 0 && !bulkSending) ? 'white' : '#9CA3AF', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: (emails.length > 0 && !bulkSending) ? 'pointer' : 'default' }}
                        >
                          {bulkSending ? 'Génération...' : `🔗 Générer ${emails.length > 0 ? `${emails.length} lien${emails.length > 1 ? 's' : ''} d'invitation` : 'les liens'}`}
                        </button>
                      </>
                    );
                  })()}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '56px', marginBottom: '12px' }}>🔗</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1F2937', marginBottom: '8px' }}>Liens d'invitation générés</h3>
                  <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>
                    {bulkSent.length} lien{bulkSent.length > 1 ? 's' : ''} en tant que <strong>{bulkRole}</strong> — copiez chaque lien et envoyez-le vous-même à la personne concernée (valable 7 jours).
                  </p>
                  <div style={{ background: '#F9FAFB', borderRadius: '10px', padding: '12px', marginBottom: '20px', textAlign: 'left', maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {bulkSent.map(({ email, link }) => (
                      <div key={email} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid #E5E7EB' }}>
                        <span style={{ fontSize: '12px', color: '#374151', flex: '0 0 auto', minWidth: '140px' }}>{email}</span>
                        <input readOnly value={link} style={{ flex: 1, minWidth: 0, padding: '6px 8px', fontSize: '11px', border: '1px solid #E5E7EB', borderRadius: '6px', background: 'white', color: '#6B7280' }} onFocus={e => e.target.select()} />
                        <button onClick={() => navigator.clipboard.writeText(link).catch(() => {})} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #667EEA', background: '#EEF2FF', color: '#667EEA', cursor: 'pointer', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>Copier</button>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setBulkInviteOpen(false)} style={{ padding: '10px 24px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                    Fermer
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lien d'invitation généré après l'ajout d'un membre */}
        {newMemberInvite && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setNewMemberInvite(null)}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔗</div>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1F2937', marginBottom: '8px' }}>Lien d'invitation à envoyer</h3>
              <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '16px' }}>
                {newMemberInvite.email} n'a pas encore de compte. Envoyez-lui ce lien (valable 7 jours) pour qu'il/elle puisse se connecter.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input readOnly value={newMemberInvite.link} style={{ flex: 1, padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '12px', background: '#F9FAFB', color: '#374151' }} onFocus={e => e.target.select()} />
                <button onClick={() => navigator.clipboard.writeText(newMemberInvite.link).catch(() => {})} style={{ padding: '10px 14px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}>
                  Copier
                </button>
              </div>
              <button onClick={() => setNewMemberInvite(null)} style={{ padding: '10px 24px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Rapport de performance recruteur */}
        <PerformanceReport team={team} applications={applications} />

        {/* Feed d'activite d'equipe */}
        <ActivityFeed missions={missions} applications={applications} history={history} team={team} />

        {/* OKRs Recrutement */}
        <OKRSection team={team} />

        {/* Formulaire de gestion des membres */}
        <TeamMemberForm
          member={editingMember}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingMember(null);
          }}
          onSubmit={handleSubmitMember}
        />
      </div>
    </div>
  );
}

export default TeamPage;
