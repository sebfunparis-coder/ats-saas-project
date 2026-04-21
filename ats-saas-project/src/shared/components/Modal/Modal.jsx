import React, { useEffect } from 'react';

/**
 * Composant Modal avec composition
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Modal ouvert/fermé
 * @param {Function} props.onClose - Callback de fermeture
 * @param {React.ReactNode} props.children - Contenu de la modal
 * @param {'sm'|'md'|'lg'|'xl'|'full'} props.size - Taille de la modal
 *
 * @example
 * <Modal isOpen={isOpen} onClose={handleClose} size="lg">
 *   <Modal.Header>Titre</Modal.Header>
 *   <Modal.Body>Contenu</Modal.Body>
 *   <Modal.Footer>Actions</Modal.Footer>
 * </Modal>
 */
export function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  className = '',
  ...rest
}) {
  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Bloquer le scroll du body quand modal ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeMap = {
    sm: '400px',
    md: '600px',
    lg: '800px',
    xl: '1000px',
    full: '95vw',
  };

  const backdropStyles = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
    padding: '20px',
    animation: 'fadeIn 0.2s ease-in-out',
  };

  const modalStyles = {
    background: 'white',
    borderRadius: '20px',
    maxWidth: sizeMap[size],
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    animation: 'slideUp 0.3s ease-out',
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div style={backdropStyles} onClick={handleBackdropClick}>
        <div style={modalStyles} className={className} {...rest}>
          {children}
        </div>
      </div>
    </>
  );
}

/**
 * Header de la modal
 */
Modal.Header = function ModalHeader({ children, onClose, className = '', ...rest }) {
  const styles = {
    padding: '24px 32px',
    borderBottom: '1px solid #E5E7EB',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const titleStyles = {
    fontSize: '24px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667EEA 0%, #FF6B9D 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  };

  const closeButtonStyles = {
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6B7280',
    padding: '4px',
    lineHeight: '1',
    transition: 'color 0.2s',
  };

  return (
    <div style={styles} className={className} {...rest}>
      <h2 style={titleStyles}>{children}</h2>
      {onClose && (
        <button
          style={closeButtonStyles}
          onClick={onClose}
          onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
        >
          ×
        </button>
      )}
    </div>
  );
};

/**
 * Body de la modal
 */
Modal.Body = function ModalBody({ children, className = '', ...rest }) {
  const styles = {
    padding: '32px',
  };

  return (
    <div style={styles} className={className} {...rest}>
      {children}
    </div>
  );
};

/**
 * Footer de la modal
 */
Modal.Footer = function ModalFooter({ children, className = '', ...rest }) {
  const styles = {
    padding: '20px 32px',
    borderTop: '1px solid #E5E7EB',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  };

  return (
    <div style={styles} className={className} {...rest}>
      {children}
    </div>
  );
};

export default Modal;
