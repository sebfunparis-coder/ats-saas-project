import React, { useState, useRef, useEffect } from 'react';

/**
 * Select avec possibilité de créer de nouvelles options
 * Combine un dropdown avec auto-complétion et création manuelle
 *
 * @param {Object} props
 * @param {Array<string>} props.options - Liste des options disponibles
 * @param {string} props.value - Valeur sélectionnée
 * @param {Function} props.onChange - Callback lors du changement
 * @param {Function} props.onCreateOption - Callback lors de la création d'une nouvelle option
 * @param {string} props.placeholder - Placeholder
 * @param {string} props.name - Nom du champ
 * @param {string} props.createLabel - Label pour créer (défaut: "Créer")
 */
export function CreatableSelect({
  options = [],
  value = '',
  onChange,
  onCreateOption,
  onBlur,
  placeholder = 'Sélectionner...',
  name = '',
  createLabel = 'Créer',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fermer le dropdown lors d'un clic extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrer les options selon le terme de recherche, en priorisant les
  // options qui COMMENCENT par le texte tapé avant celles qui le contiennent
  // seulement plus loin dans le libellé (ex: "dev" -> "Développeur..." avant
  // "Chef de projet développement").
  const term = searchTerm.toLowerCase();
  const startsWithMatches = [];
  const containsMatches = [];
  for (const option of options) {
    const lower = option.toLowerCase();
    if (lower.startsWith(term)) startsWithMatches.push(option);
    else if (lower.includes(term)) containsMatches.push(option);
  }
  const filteredOptions = [...startsWithMatches, ...containsMatches];

  // Vérifier si la recherche correspond exactement à une option
  const exactMatch = options.some(
    (option) => option.toLowerCase() === searchTerm.toLowerCase()
  );

  // Plafond du nombre d'options rendues à l'écran — au-delà de quelques
  // dizaines de résultats, le rendu DOM devient coûteux sans apporter de
  // valeur (l'utilisateur affine sa recherche plutôt que de scroller des
  // milliers de lignes). Utile pour les listes volumineuses (ex: métiers).
  const MAX_VISIBLE_OPTIONS = 50;
  const truncatedCount = filteredOptions.length - MAX_VISIBLE_OPTIONS;
  const visibleOptions = filteredOptions.slice(0, MAX_VISIBLE_OPTIONS);

  // Options à afficher
  const displayOptions = [...visibleOptions];

  // Ajouter l'option "Créer" si le terme de recherche ne correspond à aucune option
  const canCreate = searchTerm.trim() && !exactMatch;
  if (canCreate) {
    displayOptions.push(`${createLabel} "${searchTerm}"`);
  }

  const handleInputClick = () => {
    setIsOpen(true);
    setSearchTerm('');
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  const handleSelectOption = (option) => {
    // Si c'est l'option "Créer", on crée une nouvelle option
    if (option.startsWith(createLabel)) {
      const newValue = searchTerm.trim();
      if (onCreateOption) {
        onCreateOption(newValue);
      }
      onChange({ target: { name, value: newValue } });
    } else {
      onChange({ target: { name, value: option } });
    }

    setSearchTerm('');
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < displayOptions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;

      case 'Enter':
        e.preventDefault();
        if (displayOptions.length > 0) {
          handleSelectOption(displayOptions[highlightedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        break;

      default:
        break;
    }
  };

  // Styles
  const containerStyles = {
    position: 'relative',
    width: '100%',
  };

  const inputStyles = {
    width: '100%',
    padding: '10px 36px 10px 12px',
    border: '2px solid #E5E7EB',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    outline: 'none',
    transition: 'all 0.3s',
    background: 'white',
    cursor: 'text',
  };

  const arrowStyles = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: isOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
    transition: 'transform 0.2s',
    pointerEvents: 'none',
    fontSize: '12px',
    color: '#6B7280',
  };

  const dropdownStyles = {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    background: 'white',
    border: '2px solid #E5E7EB',
    borderRadius: '10px',
    maxHeight: '240px',
    overflowY: 'auto',
    zIndex: 1000,
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    display: isOpen ? 'block' : 'none',
  };

  const optionStyles = (index, isCreate = false) => ({
    padding: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isCreate ? '700' : '500',
    color: isCreate ? '#667EEA' : '#1F2937',
    background: index === highlightedIndex ? '#F3F4F6' : 'white',
    borderBottom: index < displayOptions.length - 1 ? '1px solid #F3F4F6' : 'none',
    transition: 'all 0.15s',
  });

  return (
    <div style={containerStyles}>
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={isOpen && searchTerm ? searchTerm : value}
        onChange={handleInputChange}
        onClick={handleInputClick}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          inputRef.current.style.borderColor = '#667EEA';
          inputRef.current.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#E5E7EB';
          e.currentTarget.style.boxShadow = 'none';
          if (onBlur) onBlur(e);
        }}
        placeholder={placeholder}
        style={inputStyles}
        autoComplete="off"
      />

      <div style={arrowStyles}>▼</div>

      {isOpen && (
        <div ref={dropdownRef} style={dropdownStyles}>
          {displayOptions.length === 0 ? (
            <div style={{ padding: '12px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>
              Aucune option disponible
            </div>
          ) : (
            <>
              {displayOptions.map((option, index) => {
                const isCreateOption = option.startsWith(createLabel);
                return (
                  <div
                    key={index}
                    onClick={() => handleSelectOption(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    style={optionStyles(index, isCreateOption)}
                  >
                    {isCreateOption ? `✨ ${option}` : option}
                  </div>
                );
              })}
              {truncatedCount > 0 && (
                <div style={{ padding: '10px 12px', textAlign: 'center', color: '#9CA3AF', fontSize: '12px', fontStyle: 'italic' }}>
                  +{truncatedCount} autre{truncatedCount > 1 ? 's' : ''} résultat{truncatedCount > 1 ? 's' : ''} — affinez votre recherche
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default CreatableSelect;
