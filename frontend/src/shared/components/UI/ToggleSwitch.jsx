import React from 'react';
import styles from './ToggleSwitch.module.css';

/**
 * Toggle Switch Component
 * Switch réutilisable pour basculer entre deux options
 *
 * @param {Object} props
 * @param {boolean} props.checked - État du toggle
 * @param {function} props.onChange - Callback appelé au changement
 * @param {string} props.leftLabel - Label option gauche
 * @param {string} props.rightLabel - Label option droite
 * @param {string} props.size - Taille du toggle ('small' | 'medium' | 'large')
 */
export function ToggleSwitch({
  checked = false,
  onChange,
  leftLabel = '',
  rightLabel = '',
  size = 'medium'
}) {
  const handleToggle = () => {
    if (onChange) {
      onChange(!checked);
    }
  };

  return (
    <div className={`${styles.toggleContainer} ${styles[size]}`}>
      {leftLabel && (
        <span className={`${styles.label} ${!checked ? styles.active : ''}`}>
          {leftLabel}
        </span>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={
          leftLabel && rightLabel
            ? `Basculer entre ${leftLabel} et ${rightLabel}`
            : 'Basculer'
        }
        className={`${styles.toggle} ${checked ? styles.checked : ''}`}
        onClick={handleToggle}>
        <span className={styles.slider} />
      </button>

      {rightLabel && (
        <span className={`${styles.label} ${checked ? styles.active : ''}`}>
          {rightLabel}
        </span>
      )}
    </div>
  );
}

export default ToggleSwitch;
