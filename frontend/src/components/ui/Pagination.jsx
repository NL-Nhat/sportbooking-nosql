import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ currentPage, totalPages, totalItems, pageSize = 10, onPageChange }) {
  const computedPages = totalPages || Math.ceil((totalItems || 0) / pageSize) || 1;
  if (computedPages <= 1) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '24px'
    }}>
      <button
        className="btn btn-secondary btn-sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Trang trước"
      >
        <ChevronLeft size={16} />
      </button>

      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--sb-text-secondary)', margin: '0 8px' }}>
        Trang {currentPage} / {computedPages}
      </div>

      <button
        className="btn btn-secondary btn-sm"
        disabled={currentPage >= computedPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Trang kế tiếp"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default Pagination;
