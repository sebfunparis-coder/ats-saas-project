import React, { useState } from 'react';
import Modal from '@/shared/components/Modal/Modal';
import Button from '@/shared/components/Button/Button';
import { supabase } from '@/services/supabase';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import { useConfirm } from '@/core/contexts/ConfirmContext';
import { PLAN_LABELS, PLAN_PRICING } from '@/config/constants';

/**
 * Modal détail et édition entreprise
 */
export function CompanyDetailModal({ company, isOpen, onClose, onSave, onDelete, onReload }) {
  const isMobile = useIsMobile();
  const { confirm } = useConfirm();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(company || {});

  if (!company) return null;

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Message depuis ATS Ultimate — ${company.name}`);
    const body = encodeURIComponent(`Bonjour,\n\nMessage de l'équipe ATS Ultimate concernant votre compte.\n\nCordialement,\nL'équipe ATS Ultimate`);
    window.open(`mailto:${company.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleLoginAs = () => {
    alert(`🔐 Connexion en tant que ${company.name}\n\n⚠️ Cette fonctionnalité nécessite une clé API Supabase admin côté serveur.\nÀ implémenter via une Edge Function sécurisée.`);
  };

  const handleUpgrade = async () => {
    const newPlan = company.plan === 'solo' ? 'team_3' : 'team_6';
    const label = `${PLAN_LABELS[newPlan]} (${PLAN_PRICING[newPlan].monthly.toFixed(2).replace('.', ',')}€/mois)`;
    if (!await confirm(`Upgrader ${company.name} vers ${label} ?`, { title: 'Changer le plan', confirmLabel: 'Upgrader', destructive: false })) return;
    const { error } = await supabase.from('companies').update({ plan: newPlan }).eq('id', company.id);
    if (error) { alert('Erreur : ' + error.message); return; }
    onReload && onReload();
    alert(`✅ Plan mis à jour : ${newPlan}`);
    onClose();
  };

  const handleSuspend = async () => {
    const isSuspended = company.status === 'suspended';
    const action = isSuspended ? 'réactiver' : 'suspendre';
    if (!await confirm(`Voulez-vous ${action} le compte "${company.name}" ?`, { title: isSuspended ? 'Réactiver le compte' : 'Suspendre le compte', confirmLabel: isSuspended ? 'Réactiver' : 'Suspendre' })) return;
    const newStatus = isSuspended ? 'active' : 'suspended';
    const { error } = await supabase.from('companies').update({ status: newStatus }).eq('id', company.id);
    if (error) { alert('Erreur : ' + error.message); return; }
    onReload && onReload();
    alert(`✅ Compte ${isSuspended ? 'réactivé' : 'suspendu'} avec succès`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <Modal.Header onClose={onClose}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '48px' }}>🏢</div>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#1F2937', marginBottom: '8px' }}>
              {company.name}
            </h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{
                padding: '4px 12px',
                background: company.status === 'active' ? '#10B981' : '#F59E0B',
                color: 'white',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                {company.status === 'active' ? '✅ Actif' : '⏳ Trial'}
              </span>
              <span style={{
                padding: '4px 12px',
                background: company.plan === 'team_6' ? '#8B5CF6' : company.plan === 'team_3' ? '#667EEA' : '#6B7280',
                color: 'white',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                {PLAN_LABELS[company.plan] || company.plan}
              </span>
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        {/* Statistiques rapides */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px', padding: '24px', background: '#F9FAFB', borderRadius: '12px' }}>
          {[
            { label: 'Utilisateurs', value: company.users?.length || 0, icon: '👥' },
            { label: 'Candidats', value: company.candidates, icon: '💼' },
            { label: 'Missions', value: company.missions, icon: '🎯' },
            { label: 'Health Score', value: `${company.health}%`, icon: '❤️' }
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#667EEA', marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Informations détaillées */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1F2937', marginBottom: '16px' }}>📊 Informations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
            {[
              { label: 'MRR', value: company.mrr },
              { label: 'Revenue Total', value: company.revenue },
              { label: 'Date d\'inscription', value: company.joinDate },
              { label: 'Dernière connexion', value: company.lastLogin },
              { label: 'Prochaine facturation', value: company.nextBilling },
              { label: 'Moyen de paiement', value: company.paymentMethod },
              { label: 'Engagement', value: company.engagement },
              { label: 'Health Score', value: `${company.health}%` }
            ].map((item, i) => (
              <div key={i} style={{ padding: '12px', background: '#F9FAFB', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions rapides */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1F2937', marginBottom: '16px' }}>⚡ Actions Rapides</h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
            <button
              onClick={handleSendEmail}
              style={{ padding: '12px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              📧 Envoyer Email
            </button>
            <button
              onClick={handleLoginAs}
              style={{ padding: '12px', background: '#8B5CF6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              🔐 Login As
            </button>
            {company.status === 'trial' && (
              <button
                onClick={handleUpgrade}
                style={{ padding: '12px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                ⬆️ Upgrade Plan
              </button>
            )}
            <button
              onClick={handleSuspend}
              style={{ padding: '12px', background: company.status === 'suspended' ? '#10B981' : '#EF4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {company.status === 'suspended' ? '▶️ Réactiver Compte' : '🔒 Suspendre Compte'}
            </button>
          </div>
        </div>

        {/* Activité récente */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1F2937', marginBottom: '16px' }}>📈 Activité Récente</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { date: '17/02/2026 09:23', action: 'Connexion utilisateur', user: 'admin@techcorp.com' },
              { date: '17/02/2026 08:15', action: 'Création candidat', user: 'recruteur@techcorp.com' },
              { date: '16/02/2026 18:30', action: 'Export CVs', user: 'admin@techcorp.com' },
              { date: '16/02/2026 14:20', action: 'Création mission', user: 'recruteur@techcorp.com' }
            ].map((activity, i) => (
              <div key={i} style={{ padding: '12px', background: '#F9FAFB', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937', marginBottom: '4px' }}>{activity.action}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>{activity.user}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{activity.date}</div>
              </div>
            ))}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', width: '100%' }}>
          <Button variant="error" onClick={() => onDelete && onDelete(company)}>
            🗑️ Supprimer
          </Button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="secondary" onClick={onClose}>
              Fermer
            </Button>
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              ✏️ Éditer
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default CompanyDetailModal;
