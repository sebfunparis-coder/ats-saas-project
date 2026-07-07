import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useNotifications } from '@/core/contexts/NotificationsContext';
import { OnboardingWizard } from '@/features/onboarding/OnboardingWizard';
import { CommandPalette } from '@/features/onboarding/CommandPalette';
import { useIsMobile } from '@/core/hooks/useIsMobile';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/core/contexts/AuthContext';

const TYPE_COLORS = { success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#3B82F6' };
const TYPE_ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

function NotificationCenter({ open, onClose }) {
  const { notifLog, markLogRead, markAllLogRead, clearLog, unreadLogCount, pushPermission, requestPushPermission } = useNotifications();

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.2)' }} />
      <div style={{ position:'fixed', top:0, right:0, width:'380px', height:'100vh', background:'#fff', zIndex:1001, boxShadow:'-4px 0 24px rgba(0,0,0,0.12)', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <h2 style={{ margin:0, fontSize:'18px', fontWeight:'700', color:'#111827' }}>Notifications</h2>
            {unreadLogCount > 0 && <span style={{ fontSize:'12px', color:'#6B7280' }}>{unreadLogCount} non lue{unreadLogCount > 1 ? 's' : ''}</span>}
          </div>
          <button onClick={onClose} aria-label="Fermer les notifications" style={{ background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'#6B7280', lineHeight:1 }}>✕</button>
        </div>
        {pushPermission === 'default' && (
          <div style={{ padding:'12px 16px', background:'#FFF7ED', borderBottom:'1px solid #FED7AA', display:'flex', alignItems:'center', gap:'10px' }}>
            <span style={{ fontSize:'18px' }}>🔔</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'12px', fontWeight:'600', color:'#92400E' }}>Activer les notifications push</div>
              <div style={{ fontSize:'11px', color:'#B45309' }}>Recevez des alertes même quand l'onglet est en arrière-plan</div>
            </div>
            <button onClick={requestPushPermission} style={{ fontSize:'11px', background:'#F59E0B', color:'#fff', border:'none', borderRadius:'6px', padding:'4px 10px', cursor:'pointer', fontWeight:'600', whiteSpace:'nowrap' }}>Activer</button>
          </div>
        )}
        {notifLog.length > 0 && (
          <div style={{ padding:'8px 16px', borderBottom:'1px solid #F3F4F6', display:'flex', gap:'8px' }}>
            <button onClick={markAllLogRead} style={{ fontSize:'12px', color:'#3B82F6', background:'none', border:'none', cursor:'pointer', padding:'4px 8px' }}>Tout marquer lu</button>
            <button onClick={clearLog} style={{ fontSize:'12px', color:'#EF4444', background:'none', border:'none', cursor:'pointer', padding:'4px 8px' }}>Effacer tout</button>
          </div>
        )}
        <div style={{ flex:1, overflowY:'auto' }}>
          {notifLog.length === 0 ? (
            <div style={{ padding:'48px 24px', textAlign:'center', color:'#9CA3AF' }}>
              <div style={{ fontSize:'40px', marginBottom:'12px' }}>🔔</div>
              <p style={{ margin:0, fontSize:'14px' }}>Aucune notification</p>
            </div>
          ) : notifLog.map(n => (
            <div
              key={n.id}
              onClick={() => markLogRead(n.id)}
              style={{ padding:'14px 16px', borderBottom:'1px solid #F3F4F6', cursor:'pointer', background: n.read ? '#fff' : '#EFF6FF', display:'flex', gap:'12px', alignItems:'flex-start' }}
            >
              <span style={{ fontSize:'18px', flexShrink:0, marginTop:'2px' }}>{TYPE_ICONS[n.type] || 'ℹ️'}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'13px', fontWeight: n.read ? '400' : '600', color:'#111827', marginBottom:'2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{n.title || n.message}</div>
                {n.message && n.title && <div style={{ fontSize:'12px', color:'#6B7280', marginBottom:'4px' }}>{n.message}</div>}
                <div style={{ fontSize:'11px', color:'#9CA3AF' }}>{new Date(n.timestamp).toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}</div>
              </div>
              {!n.read && <div style={{ width:'8px', height:'8px', borderRadius:'50%', background: TYPE_COLORS[n.type] || '#3B82F6', flexShrink:0, marginTop:'6px' }} />}
            </div>
          ))}
        </div>
        {pushPermission === 'granted' && (
          <div style={{ padding:'10px 16px', borderTop:'1px solid #F3F4F6', fontSize:'11px', color:'#10B981', display:'flex', alignItems:'center', gap:'6px' }}>
            <span>✅</span> Notifications push activées
          </div>
        )}
      </div>
    </>
  );
}

function ImpersonationBanner() {
  const [imp, setImp] = useState(() => { try { return JSON.parse(sessionStorage.getItem('ats_impersonation')); } catch { return null; } });
  if (!imp) return null;
  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:9500, background:'#F59E0B', padding:'8px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <span style={{ fontWeight:'800', fontSize:'13px', color:'#000' }}>
        👁️ Mode impersonation — <strong>{imp.companyName}</strong> ({imp.plan})
      </span>
      <button onClick={() => { sessionStorage.removeItem('ats_impersonation'); setImp(null); }} style={{ padding:'5px 14px', background:'#000', color:'#F59E0B', border:'none', borderRadius:'7px', fontWeight:'800', fontSize:'12px', cursor:'pointer' }}>
        ← Retour SuperAdmin
      </button>
    </div>
  );
}

function MaintenanceScreen({ isSuperAdmin }) {
  const data = (() => { try { return JSON.parse(localStorage.getItem('ats_maintenance')) || {}; } catch { return {}; } })();
  if (!data.enabled) return null;
  if (isSuperAdmin) return null;
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9800, background:'#0F172A', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'24px', padding:'40px', textAlign:'center' }}>
      <div style={{ fontSize:'80px' }}>🔧</div>
      <h1 style={{ fontSize:'32px', fontWeight:'900', color:'#fff', margin:0 }}>Maintenance en cours</h1>
      <p style={{ fontSize:'18px', color:'#9CA3AF', maxWidth:'500px', lineHeight:'1.6', margin:0 }}>{data.message || 'La plateforme est temporairement indisponible. Revenez bientôt !'}</p>
      <div style={{ padding:'12px 24px', background:'rgba(255,255,255,0.05)', borderRadius:'10px', fontSize:'14px', color:'#6B7280' }}>Notre équipe travaille à restaurer le service.</div>
    </div>
  );
}

export function AppLayout({ children }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const { unreadLogCount } = useNotifications();
  const [hasImp] = useState(() => !!sessionStorage.getItem('ats_impersonation'));
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isLoggedIn, isLoading, isSuperAdmin } = useAuth();

  // Ferme le drawer automatiquement à chaque changement de page (ex: navigation
  // via un lien qui ne passe pas par le onClick du Sidebar, comme le retour navigateur)
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // T-318 : toutes les routes /app/* passent par AppLayout — c'est donc le point
  // unique où garder l'accès à un utilisateur réellement connecté. Avant cela,
  // n'importe qui pouvait ouvrir /app/admin, /app/team, etc. par simple saisie d'URL.
  if (isLoading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontSize:'20px', fontWeight:700, color:'#667EEA' }}>
        ✨ Chargement...
      </div>
    );
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F9FAFB', paddingTop: hasImp ? '40px' : 0 }}>
      <a href="#main-content" className="skip-link">Aller au contenu principal</a>
      <MaintenanceScreen isSuperAdmin={isSuperAdmin} />
      <ImpersonationBanner />
      {/* T-388 : SSEManager lisait un JWT Express sous localStorage['token']/
          ['authToken'] — l'auth réelle est 100% Supabase, aucun code n'écrit
          jamais sous ces clés, donc la connexion SSE n'était jamais établie
          pour un vrai utilisateur (silencieusement, sans erreur visible). De
          plus le backend Express n'est pas déployé en production (cf.
          CLAUDE.md section 10), donc même un token correctement récupéré
          n'aurait rien à joindre. Démonté plutôt que rafistolé : une vraie
          solution passerait par Supabase Realtime (nouvelle feature à part
          entière, pas un correctif ponctuel) — `useSSE.js`/`SSEManager.jsx`
          laissés en place comme base de départ si ce chantier est repris. */}
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {isMobile && (
        <div
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
          style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1050,
            opacity: sidebarOpen ? 1 : 0,
            pointerEvents: sidebarOpen ? 'auto' : 'none',
            transition: 'opacity 0.25s ease',
          }}
        />
      )}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Ouvrir le menu"
          style={{ position:'fixed', top: hasImp ? '56px' : '16px', left:'16px', zIndex:900, width:'44px', height:'44px', borderRadius:'12px', background:'white', border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', cursor:'pointer', display: sidebarOpen ? 'none' : 'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}
        >
          ☰
        </button>
      )}
      <main id="main-content" style={{ flex:1, marginLeft: isMobile ? 0 : '280px', minHeight:'100vh', width: isMobile ? '100%' : 'auto', maxWidth: '100vw', overflowX: 'hidden' }}>
        {children}
      </main>
      <button
        onClick={() => setNotifOpen(true)}
        aria-label={`Notifications${unreadLogCount > 0 ? ` (${unreadLogCount} non lue${unreadLogCount > 1 ? 's' : ''})` : ''}`}
        title="Notifications"
        style={{ position:'fixed', top:'16px', right:'16px', zIndex:900, width:'44px', height:'44px', borderRadius:'50%', background:'#fff', border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}
      >
        🔔
        {unreadLogCount > 0 && (
          <span style={{ position:'absolute', top:'-4px', right:'-4px', background:'#EF4444', color:'#fff', borderRadius:'50%', width:'20px', height:'20px', fontSize:'11px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #fff' }}>
            {unreadLogCount > 9 ? '9+' : unreadLogCount}
          </span>
        )}
      </button>
      <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />
      <OnboardingWizard />
      <CommandPalette />
    </div>
  );
}

export default AppLayout;





