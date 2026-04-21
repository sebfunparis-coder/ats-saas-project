/**
 * 🪟 Modal Component
 *
 * Composant modal réutilisable avec composition
 */

import React, { useEffect } from 'react';
import { Button } from '../Button/Button';

/**
 * @param {object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.size - Modal size ('sm', 'md', 'lg', 'xl', 'full')
 * @param {boolean} props.closeOnOverlayClick - Close when clicking overlay
 * @param {boolean} props.showCloseButton - Show close button
 * @param {string} props.className - Additional classes
 */
export const Modal = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = ''
}) => {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
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

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} ${className} max-h-[90vh] flex flex-col`}>
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none z-10"
            aria-label="Fermer"
          >
            ×
          </button>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Modal Header
 */
export const ModalHeader = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900">{children}</h2>
    </div>
  );
};

/**
 * Modal Body
 */
export const ModalBody = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Modal Footer
 */
export const ModalFooter = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
};
