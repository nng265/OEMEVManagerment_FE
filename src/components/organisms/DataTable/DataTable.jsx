// src/components/molecules/DataTable/DataTable.jsx
import React, { useState, useMemo, useId } from 'react';
import PropTypes from 'prop-types';
import './DataTable.css';
import { LoadingSpinner } from '../../atoms/LoadingSpinner/LoadingSpinner';
import { Input } from '../../atoms/Input/Input';
import { Button } from '../../atoms/Button/Button';

export const DataTable = ({
  data = [],
  columns = [],
  isLoading = false,
  noDataMessage = "No data available",
  onRowClick,
  serverSide = false,
  pagination = true,
  pageSize = 10,
  totalRecords = 0,
  currentPage = 0, // 0-based index
  onPageChange,
  searchable = false,
  exportable = false,
  sortable = true,
  responsive = true,
  striped = true,
  hoverable = true,
  dense = false,
  searchPlaceholder = 'Search...',
  onSearchChange,
  toolbarActions,
  onRefresh,
  refreshing = false,
  refreshLabel = 'Refresh',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const searchInputId = useId();
  const searchInputName = useMemo(
    () => `datatable-search-${String(searchInputId).replace(/:/g, '-')}`,
    [searchInputId]
  );

  // ✅ Search local
  const filteredData = useMemo(() => {
    if (!searchable || serverSide || !searchTerm.trim()) return data;
    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, searchable, serverSide]);

  // ✅ Sort local
  const sortedData = useMemo(() => {
    if (!sortable || !sortConfig.key) return filteredData;

    const activeColumn = columns.find((col) => col.key === sortConfig.key);
    if (!activeColumn) return filteredData;

    const resolveValue = (row) => {
      if (typeof activeColumn.getSortValue === 'function') {
        return activeColumn.getSortValue(row);
      }
      if (typeof activeColumn.sortValue === 'function') {
        return activeColumn.sortValue(row[activeColumn.key], row);
      }
      return row[activeColumn.key];
    };

    const toComparable = (value) => {
      if (value === null || value === undefined) {
        return { type: 'null', value: null };
      }

      const { sortType } = activeColumn;

      if (sortType === 'number') {
        const numeric = Number(value);
        return Number.isNaN(numeric)
          ? { type: 'string', value: String(value).toLowerCase() }
          : { type: 'number', value: numeric };
      }

      if (sortType === 'date') {
        const timestamp = value instanceof Date ? value.getTime() : Date.parse(value);
        return Number.isNaN(timestamp)
          ? { type: 'string', value: String(value).toLowerCase() }
          : { type: 'number', value: timestamp };
      }

      if (typeof value === 'number') {
        return { type: 'number', value };
      }

      if (value instanceof Date) {
        return { type: 'number', value: value.getTime() };
      }

      if (typeof value === 'boolean') {
        return { type: 'number', value: value ? 1 : 0 };
      }

      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (sortType !== 'string' && trimmed !== '') {
          const numericCandidate = Number(trimmed);
          if (!Number.isNaN(numericCandidate)) {
            return { type: 'number', value: numericCandidate };
          }
        }
        return { type: 'string', value: trimmed.toLowerCase() };
      }

      return { type: 'string', value: String(value).toLowerCase() };
    };

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = resolveValue(a);
      const bValue = resolveValue(b);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const aComparable = toComparable(aValue);
      const bComparable = toComparable(bValue);

      let comparison = 0;

      if (aComparable.type === 'number' && bComparable.type === 'number') {
        comparison = aComparable.value - bComparable.value;
      } else {
        const aStr = String(aComparable.value);
        const bStr = String(bComparable.value);
        comparison = aStr.localeCompare(bStr, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredData, sortConfig, sortable, columns]);

  // ✅ Pagination client-side (0-based)
  const totalPages = serverSide
    ? Math.ceil(totalRecords / pageSize)
    : Math.ceil(sortedData.length / pageSize);

  const paginatedData = !serverSide && pagination
    ? sortedData.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    : sortedData;

  // ✅ Page change (gửi ra ngoài)
  const handlePageChange = (pageIndex) => {
    if (onPageChange) onPageChange(pageIndex, pageSize);
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    if (onPageChange) onPageChange(0, newSize);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (typeof onSearchChange === 'function') {
      onSearchChange(value);
    }
  };

  // ✅ Sort handler
  const handleSort = (column) => {
    if (!sortable || column?.sortable === false) return;
    const key = column.key;
    if (!key) return;
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // ✅ Export CSV (optional)
  const handleExport = () => {
    const csv = [
      columns.map(c => c.label).join(','),
      ...sortedData.map(row =>
        columns.map(c => `"${row[c.key] ?? ''}"`).join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'data.csv';
    link.click();
  };

  // ✅ Loading
  if (isLoading) {
    return (
      <div className="data-table-loading">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const tableClasses = [
    'table',
    striped && 'table-striped',
    hoverable && 'table-hover',
    dense && 'table-sm',
  ]
    .filter(Boolean)
    .join(' ');

  const showRefreshButton = typeof onRefresh === 'function';

  const handleRefreshClick = () => {
    if (!showRefreshButton || refreshing) {
      return;
    }
    onRefresh();
  };

  const shouldShowSearch =
    searchable && (!serverSide || typeof onSearchChange === 'function');
  const shouldShowToolbar =
    shouldShowSearch || exportable || toolbarActions || showRefreshButton;

  return (
    <div className="data-table-container">
      {/* Toolbar */}
      {shouldShowToolbar && (
        <div className="data-table-toolbar">
          {shouldShowSearch && (
            <div className="data-table-search">
              <Input
                type="search"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={handleSearchInputChange}
                name={searchInputName}
                id={searchInputName}
              />
            </div>
          )}

          {(toolbarActions || exportable || showRefreshButton) && (
            <div className="data-table-toolbar-actions">
              {showRefreshButton && (
                <Button
                  className="color"
                  size="sm"
                  onClick={handleRefreshClick}
                  disabled={refreshing}
                >
                  {refreshing ? 'Refreshing...' : refreshLabel}
                </Button>
              )}
              {toolbarActions}
              {exportable && (
                <Button variant="secondary" size="sm" onClick={handleExport}>
                  Export CSV
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className={responsive ? 'table-responsive' : ''}>
        <table className={tableClasses}>
          <thead>
            <tr>
              {columns.map((column) => {
                const columnSortable = sortable && column?.sortable !== false;
                return (
                  <th
                    key={column.key}
                    onClick={() => handleSort(column)}
                    className={columnSortable ? 'sortable' : ''}
                  >
                    {column.label}
                    {columnSortable && sortConfig.key === column.key && (
                      <span className={`sort-icon ${sortConfig.direction}`}>
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData && paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr
                  key={row.id || index}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? "clickable" : ""}
                >
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center">
                  {noDataMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="data-table-footer">
          <div className="page-size-selector">
            <span>Rows per page:</span>
            <select value={pageSize} onChange={handlePageSizeChange}>
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div className="pagination-info">
            {serverSide ? (
              <>
                Showing {currentPage * pageSize + 1}–
                {Math.min((currentPage + 1) * pageSize, totalRecords)} of {totalRecords}
              </>
            ) : (
              <>
                Showing {currentPage * pageSize + 1}–
                {Math.min((currentPage + 1) * pageSize, sortedData.length)} of {sortedData.length}
              </>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(0)}
                disabled={currentPage === 0}
              >
                First
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Prev
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i)
                .slice(
                  Math.max(0, currentPage - 2),
                  Math.min(totalPages, currentPage + 3)
                )
                .map((pageIndex) => (
                  <Button
                    key={pageIndex}
                    variant={pageIndex === currentPage ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handlePageChange(pageIndex)}
                  >
                    {pageIndex + 1}
                  </Button>
                ))}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                Next
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
              >
                Last
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

DataTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  noDataMessage: PropTypes.string,
  onRowClick: PropTypes.func,
  sortable: PropTypes.bool,
  pagination: PropTypes.bool,
  serverSide: PropTypes.bool,
  totalRecords: PropTypes.number,
  pageSize: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  onSearchChange: PropTypes.func,
  toolbarActions: PropTypes.node,
  onRefresh: PropTypes.func,
  refreshing: PropTypes.bool,
  refreshLabel: PropTypes.string,
};
