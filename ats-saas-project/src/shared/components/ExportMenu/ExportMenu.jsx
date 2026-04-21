import React, { useState } from 'react';
import { useExport } from '@/core/hooks/useExport';

/**
 * Menu d'export avec support CSV, JSON, Excel
 *
 * @param {Object} props
 * @param {string} props.entityType - Type d'entité ('candidates', 'missions', 'clients', 'applications', 'all')
 * @param {Array} props.data - Données à exporter
 * @param {string} props.label - Label du bouton (défaut: "Exporter")
 * @param {string} props.variant - Variante du style (défaut: "primary")
 */
export function ExportMenu({
  entityType = 'all',
  data = [],
  label = 'Exporter',
  variant = 'primary'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    exportCandidates,
    exportMissions,
    exportClients,
    exportApplications,
    exportAll,
    exportToJSON
  } = useExport();

  const handleExport = (format) => {
    setIsOpen(false);

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return;
    }

    switch (entityType) {
      case 'candidates':
        if (format === 'json') {
          exportToJSON(data, `candidats_${new Date().toISOString().split('T')[0]}.json`);
        } else {
          exportCandidates(data);
        }
        break;

      case 'missions':
        if (format === 'json') {
          exportToJSON(data, `missions_${new Date().toISOString().split('T')[0]}.json`);
        } else {
          exportMissions(data);
        }
        break;

      case 'clients':
        if (format === 'json') {
          exportToJSON(data, `clients_${new Date().toISOString().split('T')[0]}.json`);
        } else {
          exportClients(data);
        }
        break;

      case 'applications':
        if (format === 'json') {
          exportToJSON(data, `candidatures_${new Date().toISOString().split('T')[0]}.json`);
        } else {
          exportApplications(data);
        }
        break;

      case 'all':
        if (format === 'json') {
          exportAll(data);
        }
        break;

      default:
        console.warn('Type d\'entité non supporté:', entityType);
    }
  };

  const buttonBaseStyles = {
    padding: '12px 24px',
    borderRadius: '10px',
    border: 'none',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    position: 'relative',
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    },
    secondary: {
      background: '#F3F4F6',
      color: '#1F2937',
      border: '2px solid #E5E7EB',
    },
    success: {
      background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    }
  };

  const buttonStyles = {
    ...buttonBaseStyles,
    ...variantStyles[variant]
  };

  const menuStyles = {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    padding: '8px',
    minWidth: '200px',
    zIndex: 1000,
    display: isOpen ? 'block' : 'none',
  };

  const menuItemStyles = {
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1F2937',
    background: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left',
  };

  const overlayStyles = {
    position: 'fixed',
    inset: 0,
    zIndex: 999,
    display: isOpen ? 'block' : 'none',
  };

  const exportFormats = [
    { format: 'csv', icon: '📊', label: 'CSV (Excel)', color: '#10B981' },
    { format: 'json', icon: '📦', label: 'JSON', color: '#667EEA' },
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* Overlay pour fermer le menu */}
      <div style={overlayStyles} onClick={() => setIsOpen(false)} />

      {/* Bouton principal */}
      <button
        style={buttonStyles}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
        📥 {label}
        <span style={{ fontSize: '12px' }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Menu déroulant */}
      <div style={menuStyles}>
        <div style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>
          Format d'export
        </div>
        {exportFormats.map(({ format, icon, label: formatLabel, color }) => (
          <button
            key={format}
            style={menuItemStyles}
            onClick={() => handleExport(format)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F9FAFB';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateX(0)';
            }}>
            <span style={{ fontSize: '20px' }}>{icon}</span>
            <span>{formatLabel}</span>
            <span style={{
              marginLeft: 'auto',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: color
            }} />
          </button>
        ))}

        {data && Array.isArray(data) && data.length > 0 && (
          <div style={{ padding: '8px 16px', fontSize: '12px', color: '#9CA3AF', borderTop: '1px solid #E5E7EB', marginTop: '8px', paddingTop: '12px' }}>
            {data.length} élément{data.length > 1 ? 's' : ''} à exporter
          </div>
        )}
      </div>
    </div>
  );
}

export default ExportMenu;
