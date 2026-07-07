import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Grid } from 'react-window';

/**
 * Grille virtualisée responsive (T-257) — ne monte dans le DOM que les cartes
 * réellement visibles (+ overscan), au lieu de toutes les cartes d'un coup.
 * Nécessaire pour rester fluide au-delà de quelques centaines de candidats
 * (CandidatesPage/CVThequePage n'avaient aucune pagination ni limite).
 *
 * Calcule lui-même le nombre de colonnes selon la largeur du conteneur (via
 * ResizeObserver), pour reproduire le comportement de l'ancien
 * `repeat(auto-fill, minmax(itemMinWidth, 1fr))` tout en fournissant à
 * react-window les dimensions fixes dont il a besoin pour virtualiser.
 *
 * ⚠️ Contrairement au rendu "plein DOM" précédent, cette grille scrolle dans
 * son propre conteneur borné (height) plutôt que de laisser toute la page
 * défiler — c'est le fonctionnement standard de toute grille virtualisée
 * (react-window ne peut virtualiser que par rapport à un conteneur scrollable
 * dont il connaît les dimensions, pas par rapport au scroll de la fenêtre).
 */
export function VirtualizedGrid({
  items,
  renderItem,
  itemMinWidth = 360,
  itemHeight = 340,
  gap = 24,
  height = '70vh',
  emptyState = null,
}) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width;
      if (width) setContainerWidth(width);
    });
    observer.observe(el);
    setContainerWidth(el.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  const Cell = useCallback(({ columnIndex, rowIndex, style, items: cellItems, columnCount }) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= cellItems.length) return null;
    const item = cellItems[index];
    return (
      <div style={{ ...style, padding: gap / 2, boxSizing: 'border-box' }}>
        {renderItem(item)}
      </div>
    );
  }, [renderItem, gap]);

  if (items.length === 0) return emptyState;

  if (containerWidth === 0) {
    // Premier rendu : on mesure le conteneur avant de calculer les colonnes
    return <div ref={containerRef} style={{ width: '100%', height: 1 }} />;
  }

  const columnCount = Math.max(1, Math.floor(containerWidth / itemMinWidth));
  const rowCount = Math.ceil(items.length / columnCount);
  const columnWidth = containerWidth / columnCount;

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <Grid
        cellComponent={Cell}
        cellProps={{ items, columnCount }}
        columnCount={columnCount}
        columnWidth={columnWidth}
        rowCount={rowCount}
        rowHeight={itemHeight}
        overscanCount={2}
        style={{ height, width: '100%' }}
      />
    </div>
  );
}

export default VirtualizedGrid;
