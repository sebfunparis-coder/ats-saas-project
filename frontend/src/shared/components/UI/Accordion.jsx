import React, { useState } from 'react';
import styles from './Accordion.module.css';

/**
 * Accordion Component - Item FAQ accordéon
 *
 * @param {Object} props
 * @param {string} props.question - Question affichée
 * @param {string} props.answer - Réponse (peut contenir du HTML)
 * @param {boolean} props.defaultOpen - Ouvert par défaut
 */
export function AccordionItem({ question, answer, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`${styles.accordionItem} ${isOpen ? styles.open : ''}`}>
      <button
        className={styles.accordionButton}
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${question}`}>
        <span className={styles.question}>{question}</span>
        <span className={styles.icon}>{isOpen ? '−' : '+'}</span>
      </button>

      <div
        id={`accordion-content-${question}`}
        className={styles.accordionContent}
        aria-hidden={!isOpen}>
        <div className={styles.answer}>
          {answer}
        </div>
      </div>
    </div>
  );
}

/**
 * Accordion - Groupe d'items accordéon
 *
 * @param {Object} props
 * @param {Array} props.items - Tableau d'objets {question, answer}
 * @param {boolean} props.allowMultiple - Permettre plusieurs items ouverts
 */
export function Accordion({ items = [], allowMultiple = false }) {
  const [openIndexes, setOpenIndexes] = useState([]);

  const handleToggle = (index) => {
    if (allowMultiple) {
      setOpenIndexes(prev =>
        prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenIndexes(prev =>
        prev.includes(index) ? [] : [index]
      );
    }
  };

  return (
    <div className={styles.accordion}>
      {items.map((item, index) => (
        <div
          key={index}
          className={`${styles.accordionItem} ${openIndexes.includes(index) ? styles.open : ''}`}>
          <button
            className={styles.accordionButton}
            onClick={() => handleToggle(index)}
            aria-expanded={openIndexes.includes(index)}>
            <span className={styles.question}>{item.question}</span>
            <span className={styles.icon}>
              {openIndexes.includes(index) ? '−' : '+'}
            </span>
          </button>

          <div
            className={styles.accordionContent}
            aria-hidden={!openIndexes.includes(index)}>
            <div className={styles.answer}>
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Accordion;
