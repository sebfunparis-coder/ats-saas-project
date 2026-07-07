import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import { useData } from '@/core/contexts/DataContext';
import { useAuth } from '@/core/contexts/AuthContext';

const ONBOARDING_KEY = 'ats_onboarding_done';
const ONBOARDING_MANUAL_KEY = 'ats_onboarding_manual';

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { success } = useNotifications();
  const { missions = [], candidates = [], team = [] } = useData();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [manual, setManual] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ONBOARDING_MANUAL_KEY)) || {}; } catch { return {}; }
  });

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setVisible(true);
  }, []);

  const saveManual = (key, val) => {
    const next = { ...manual, [key]: val };
    setManual(next);
    localStorage.setItem(ONBOARDING_MANUAL_KEY, JSON.stringify(next));
  };

  const CHECKLIST = useMemo(() => [
    {
      id: 'account',
      icon: '✅',
      label: 'Compte créé',
      desc: 'Votre espace est prêt.',
      done: true,
      auto: true,
    },
    {
      id: 'logo',
      icon: '🏢',
      label: 'Logo entreprise ajouté',
      desc: "Personnalisez votre espace avec le logo de votre entreprise.",
      done: !!manual.logo,
      route: '/app/admin',
      actionLabel: 'Configurer',
      manualKey: 'logo',
    },
    {
      id: 'mission',
      icon: '💼',
      label: 'Première mission créée',
      desc: "Publiez votre première offre d'emploi.",
      done: missions.length > 0 || !!manual.mission,
      route: '/app/missions',
      actionLabel: 'Créer une mission',
      manualKey: 'mission',
    },
    {
      id: 'candidate',
      icon: '👤',
      label: 'Premier candidat ajouté',
      desc: 'Importez ou créez un profil candidat.',
      done: candidates.length > 0 || !!manual.candidate,
      route: '/app/candidates',
      actionLabel: 'Ajouter un candidat',
      manualKey: 'candidate',
    },
    {
      id: 'team',
      icon: '👥',
      label: 'Collègue invité',
      desc: 'Collaborez en invitant un membre de votre équipe.',
      done: team.length > 1 || !!manual.team,
      route: '/app/team',
      actionLabel: "Inviter l'équipe",
      manualKey: 'team',
    },
    {
      id: 'pipeline',
      icon: '📋',
      label: 'Pipeline consulté',
      desc: 'Découvrez le tableau Kanban pour suivre vos recrutements.',
      done: !!manual.pipeline,
      route: '/app/pipeline',
      actionLabel: 'Voir le pipeline',
      manualKey: 'pipeline',
    },
  ], [missions.length, candidates.length, team.length, manual]);

  const doneCount = CHECKLIST.filter(c => c.done).length;
  const progress = Math.round((doneCount / CHECKLIST.length) * 100);
  const allDone = doneCount === CHECKLIST.length;

  useEffect(() => {
    if (allDone && visible) {
      setTimeout(() => {
        localStorage.setItem(ONBOARDING_KEY, '1');
        setVisible(false);
        success('Configuration terminée !', 'Vous êtes prêt à recruter 🚀');
      }, 800);
    }
  }, [allDone, visible]);

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setVisible(false);
  };

  const goTo = (item) => {
    if (item.manualKey) saveManual(item.manualKey, true);
    if (item.route) navigate(item.route);
    if (!item.route) dismiss();
  };

  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '560px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', padding: '28px 32px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#fff' }}>Bienvenue ! Configurez votre espace</h2>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                {doneCount === CHECKLIST.length ? 'Tout est prêt — félicitations !' : `${doneCount} sur ${CHECKLIST.length} étapes complétées`}
              </p>
            </div>
            <button onClick={dismiss} aria-label="Fermer le guide de démarrage" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#fff', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>Progression</span>
              <span style={{ fontSize: '14px', color: '#fff', fontWeight: '800' }}>{progress}%</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.25)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: '#fff', borderRadius: '4px', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div style={{ padding: '20px 24px', maxHeight: '380px', overflowY: 'auto' }}>
          {CHECKLIST.map((item, idx) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: idx < CHECKLIST.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
              {/* Status circle */}
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: item.done ? '#ECFDF5' : '#F9FAFB', border: `2px solid ${item.done ? '#10B981' : '#E5E7EB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0, transition: 'all 0.3s' }}>
                {item.done ? '✓' : item.icon}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: item.done ? '#6B7280' : '#111827', textDecoration: item.done ? 'line-through' : 'none' }}>{item.label}</div>
                {!item.done && <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{item.desc}</div>}
              </div>

              {/* Action button */}
              {!item.done && item.route && (
                <button
                  onClick={() => goTo(item)}
                  style={{ padding: '7px 14px', background: '#667EEA', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
                >
                  {item.actionLabel} →
                </button>
              )}
              {item.done && !item.auto && (
                <span style={{ fontSize: '20px', flexShrink: 0 }}>✅</span>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px 24px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={dismiss} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '13px', cursor: 'pointer', padding: '4px 8px' }}>
            Passer pour l'instant
          </button>
          {allDone && (
            <button onClick={dismiss} style={{ padding: '10px 24px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
              ✅ Commencer !
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_KEY);
  localStorage.removeItem(ONBOARDING_MANUAL_KEY);
}

export default OnboardingWizard;
