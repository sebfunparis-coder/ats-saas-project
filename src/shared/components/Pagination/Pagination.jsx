/**
 * 📄 Pagination Component
 *
 * Composant de pagination réutilisable
 */

import React from 'react';
import { Button } from '../Button/Button';

/**
 * @param {object} props
 * @param {number} props.currentPage - Current page (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.pageSize - Items per page
 * @param {number} props.totalItems - Total number of items
 * @param {Function} props.onPageChange - Page change handler
 * @param {Function} props.onPageSizeChange - Page size change handler
 */
export const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange
}) => {
  if (totalPages <= 1) return null;

  const pageSizes = [10, 20, 50, 100];

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg">
      {/* Info */}
      <div className="flex flex-1 items-center justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Affichage de{' '}
            <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>
            {' - '}
            <span className="font-medium">
              {Math.min(currentPage * pageSize, totalItems)}
            </span>
            {' sur '}
            <span className="font-medium">{totalItems}</span>
            {' résultats'}
          </p>
        </div>

        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Par page:</label>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {pageSizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pagination buttons */}
      <div className="flex gap-1 ml-4">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Préc.
        </button>

        {/* Page numbers */}
        {pages.map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded border text-sm font-medium ${
                currentPage === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          )
        ))}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suiv. →
        </button>
      </div>
    </div>
  );
};
