import React from 'react';
import { useNotifications } from '@/core/contexts/NotificationsContext';

/**
 * Composant Toast pour afficher les notifications
 */
export function Toast() {
  const { notifications, removeNotification } = useNotifications();

  // Ne rien afficher si pas de notifications
  if (notifications.length === 0) return null;

  // Couleurs par type
  const typeColors = {
    success: {
      bg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      icon: '✅'
    },
    error: {
      bg: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      icon: '❌'
    },
    warning: {
      bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      icon: '⚠️'
    },
    info: {
      bg: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
      icon: 'ℹ️'
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '400px'
    }}>
      {notifications.map((notif, index) => {
        const colors = typeColors[notif.type] || typeColors.info;

        return (
          <div
            key={notif.id}
            style={{
              background: colors.bg,
              color: 'white',
              padding: '16px 20px',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              animation: 'slideIn 0.3s ease-out',
              cursor: 'pointer',
              transition: 'all 0.3s',
              opacity: index < 3 ? 1 : 0.7, // Fade older notifications
              transform: index < 3 ? 'scale(1)' : 'scale(0.95)'
            }}
            onClick={() => removeNotification(notif.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = index < 3 ? 'scale(1)' : 'scale(0.95)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{ fontSize: '24px', flexShrink: 0 }}>
                {colors.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: '700',
                  marginBottom: '4px',
                  fontSize: '15px'
                }}>
                  {notif.title}
                </div>
                {notif.message && (
                  <div style={{
                    fontSize: '14px',
                    opacity: 0.95,
                    lineHeight: '1.4'
                  }}>
                    {notif.message}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notif.id);
                }}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  flexShrink: 0,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                ×
              </button>
            </div>
          </div>
        );
      })}

      {/* CSS Animation */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default Toast;
