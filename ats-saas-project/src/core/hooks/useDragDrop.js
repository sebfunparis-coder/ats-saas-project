import { useState } from 'react';

/**
 * Hook pour gérer le drag & drop
 * Utilisé pour le pipeline Kanban
 *
 * @example
 * const { draggedItem, handleDragStart, handleDragEnd, handleDrop } = useDragDrop(onDropCallback);
 */
export function useDragDrop(onDropCallback) {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  /**
   * Démarrer le drag
   */
  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  /**
   * Terminer le drag
   */
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  /**
   * Survol d'une colonne (pour effet visuel)
   */
  const handleDragOver = (e, columnId) => {
    e.preventDefault(); // Nécessaire pour permettre le drop
    setDragOverColumn(columnId);
  };

  /**
   * Quitter le survol d'une colonne
   */
  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  /**
   * Drop dans une colonne
   */
  const handleDrop = (e, newStatus) => {
    e.preventDefault();

    if (draggedItem && onDropCallback) {
      onDropCallback(draggedItem, newStatus);
    }

    handleDragEnd();
  };

  return {
    draggedItem,
    dragOverColumn,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isDragging: draggedItem !== null,
  };
}
