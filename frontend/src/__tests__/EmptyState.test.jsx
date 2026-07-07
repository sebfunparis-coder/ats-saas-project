/**
 * Tests composant EmptyState (T-306)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../shared/components/Feedback/EmptyState';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'fr' } }),
}));

describe('EmptyState', () => {
  it('affiche le titre et l\'icône', () => {
    render(<EmptyState icon="🚀" title="Aucune donnée" />);
    expect(screen.getByText('🚀')).toBeTruthy();
    expect(screen.getByText('Aucune donnée')).toBeTruthy();
  });

  it('affiche la description si fournie', () => {
    render(<EmptyState icon="📋" title="Vide" description="Créez votre premier élément." />);
    expect(screen.getByText('Créez votre premier élément.')).toBeTruthy();
  });

  it('affiche le bouton d\'action si action fournie', () => {
    const onClick = vi.fn();
    render(<EmptyState icon="➕" title="Vide" action={{ label: 'Créer', onClick }} />);
    const btn = screen.getByText('Créer');
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('n\'affiche pas de bouton si action non fournie', () => {
    render(<EmptyState icon="📋" title="Vide" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('n\'affiche pas de description si non fournie', () => {
    render(<EmptyState icon="📋" title="Vide" />);
    // Pas de <p> de description
    const headings = screen.getAllByText('Vide');
    expect(headings.length).toBe(1);
  });
});
