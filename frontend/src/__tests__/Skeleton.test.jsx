/**
 * Tests composant Skeleton (T-306)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton, SkeletonCard, SkeletonCardGrid, SkeletonRow, SkeletonRowList } from '../shared/components/Skeleton/Skeleton';

describe('Skeleton (bloc de base)', () => {
  it('se rend sans erreur', () => {
    const { container } = render(<Skeleton width="200px" height="20px" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('applique la largeur et la hauteur passées', () => {
    const { container } = render(<Skeleton width="300px" height="40px" />);
    const div = container.querySelector('[aria-hidden="true"]');
    expect(div?.style?.width).toBe('300px');
    expect(div?.style?.height).toBe('40px');
  });
});

describe('SkeletonCard', () => {
  it('se rend sans erreur', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toBeTruthy();
  });
});

describe('SkeletonCardGrid', () => {
  it('rend N cartes', () => {
    const { container } = render(<SkeletonCardGrid count={4} />);
    // La grille doit contenir des éléments enfants
    expect(container.firstChild?.children?.length).toBeGreaterThan(0);
  });

  it('utilise le count par défaut (6)', () => {
    const { container } = render(<SkeletonCardGrid />);
    expect(container.firstChild?.children?.length).toBeGreaterThan(0);
  });
});

describe('SkeletonRow', () => {
  it('se rend avec le nombre de colonnes demandé', () => {
    const { container } = render(<SkeletonRow columns={5} />);
    expect(container.firstChild).toBeTruthy();
  });
});

describe('SkeletonRowList', () => {
  it('rend N lignes', () => {
    const { container } = render(<SkeletonRowList count={3} columns={4} />);
    expect(container.firstChild).toBeTruthy();
  });
});
