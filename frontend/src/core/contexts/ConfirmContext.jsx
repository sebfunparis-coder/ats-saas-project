import React, { createContext, useContext, useState, useCallback } from 'react';
import { useFocusTrap } from '@/core/hooks/useFocusTrap';

// T-262 — Remplace window.confirm() par une modale cohérente avec bouton rouge
// et texte "Cette action est irréversible." partout dans l'app.
// T-264 — Focus trap WCAG 2.1 AA ajouté via useFocusTrap.
// Usage : const { confirm } = useConfirm();
//         if (await confirm('Supprimer ce candidat ?')) { ... }

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setDialog({
        message,
        title: options.title || 'Confirmer',
        confirmLabel: options.confirmLabel || 'Supprimer',
        cancelLabel: options.cancelLabel || 'Annuler',
        destructive: options.destructive !== false,
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    const res = dialog?.resolve;
    setDialog(null);
    res?.(true);
  };

  const handleCancel = () => {
    const res = dialog?.resolve;
    setDialog(null);
    res?.(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialog && (
        <ConfirmDialog
          dialog={dialog}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  );
}

function ConfirmDialog({ dialog, onConfirm, onCancel }) {
  const trapRef = useFocusTrap(true);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      style={{
        position: 'fixed', inset: 0, zIndex: 20000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        ref={trapRef}
        style={{
          background: 'white', borderRadius: '20px', padding: '32px',
          width: '100%', maxWidth: '440px', margin: '0 16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          animation: 'confirm-appear 0.15s ease',
        }}
      >
        <style>{`@keyframes confirm-appear { from { transform: scale(0.93); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
        {dialog.destructive && (
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: '#FEF2F2', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '24px', marginBottom: '20px',
          }}>
            🗑️
          </div>
        )}
        <h3 id="confirm-title" style={{ fontSize: '18px', fontWeight: '800', color: '#1F2937', marginBottom: '10px' }}>
          {dialog.title}
        </h3>
        <p id="confirm-message" style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px', lineHeight: 1.5 }}>
          {dialog.message}
        </p>
        {dialog.destructive && (
          <p style={{ fontSize: '13px', color: '#EF4444', fontWeight: '600', marginBottom: '28px' }}>
            Cette action est irréversible.
          </p>
        )}
        {!dialog.destructive && <div style={{ marginBottom: '28px' }} />}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px', borderRadius: '10px', border: '2px solid #E5E7EB',
              background: 'white', color: '#374151', fontWeight: '700', fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {dialog.cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: dialog.destructive ? '#EF4444' : '#667EEA',
              color: 'white', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
            }}
          >
            {dialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}
