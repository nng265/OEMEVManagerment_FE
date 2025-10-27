import React, { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import "./DataTable.css";
import { LoadingSpinner } from "../../atoms/LoadingSpinner/LoadingSpinner";
import { Input } from "../../atoms/Input/Input";
import { Button } from "../../atoms/Button/Button";

export const DataTable = ({
  data,
  columns,
  isLoading = false,
  noDataMessage = "No data available",
  onRowClick,
  sortable = true,
  pagination = true,
  pageSize = 10,
  selectable = false,
  searchable = false,
  exportable = false,
  responsive = true,
  striped = true,
  hoverable = true,
  dense = false,
  onRowSelect,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [pageSizeOption, setPageSizeOption] = useState(pageSize);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((row) => {
      return columns.some((column) => {
        const value = row[column.key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, columns, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (aString < bString) return sortConfig.direction === "asc" ? -1 : 1;
      if (aString > bString) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / pageSizeOption);
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSizeOption;
    return sortedData.slice(start, start + pageSizeOption);
  }, [sortedData, currentPage, pageSizeOption, pagination]);

  const handleSort = (key) => {
    if (!sortable) return;

    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSelectAll = (isSelected) => {
    setSelectedRows(isSelected ? paginatedData.map((row) => row.id) : []);
    if (onRowSelect) {
      onRowSelect(isSelected ? paginatedData.map((row) => row.id) : []);
    }
  };

  const handleExport = () => {
    const exportData =
      selectedRows.length > 0
        ? sortedData.filter((row) => selectedRows.includes(row.id))
        : sortedData;

    const csvContent = [
      columns.map((col) => col.label).join(","),
      ...exportData.map((row) =>
        columns
          .map((col) => {
            const value = row[col.key];
            return typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value;
          })
          .join(",")
      ),
    ].join("\\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "table_data.csv";
    link.click();
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (isLoading) {
    return (
      <div className="data-table-loading">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const tableClasses = [
    "table",
    striped && "table-striped",
    hoverable && "table-hover",
    dense && "table-sm",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="data-table-container">
      <div className="data-table-toolbar">
        {searchable && (
          <div className="data-table-search">
            <Input
              type="search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="16"
                  height="16"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              }
            />
          </div>
        )}
        {exportable && (
          <Button
            onClick={handleExport}
            variant="secondary"
            size="sm"
            disabled={data.length === 0}
          >
            Export CSV
          </Button>
        )}
      </div>

      <div className={responsive ? "table-responsive" : ""}>
        <table className={tableClasses}>
          <thead>
            <tr>
              {selectable && (
                <th className="select-cell">
                  <input
                    type="checkbox"
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every((row) =>
                        selectedRows.includes(row.id)
                      )
                    }
                    disabled={paginatedData.length === 0}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => sortable && handleSort(column.key)}
                  className={sortable ? "sortable" : ""}
                >
                  {column.label}
                  {sortable && sortConfig.key === column.key && (
                    <span className={`sort-icon ${sortConfig.direction}`}>
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
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
                <td
                  colSpan={selectable ? columns.length + 1 : columns.length}
                  className="text-center"
                >
                  {noDataMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="data-table-footer">
          <div className="page-size-selector">
            <span>Rows per page:</span>
            <select
              value={pageSizeOption}
              onChange={(e) => {
                setPageSizeOption(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="pagination-info">
            Showing {(currentPage - 1) * pageSizeOption + 1} to{" "}
            {Math.min(currentPage * pageSizeOption, sortedData.length)} of{" "}
            {sortedData.length} entries
          </div>

          <div className="pagination">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="pagination-pages">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

DataTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
      sortable: PropTypes.bool,
    })
  ).isRequired,
  isLoading: PropTypes.bool,
  noDataMessage: PropTypes.string,
  onRowClick: PropTypes.func,
  sortable: PropTypes.bool,
  pagination: PropTypes.bool,
  pageSize: PropTypes.number,
  selectable: PropTypes.bool,
  searchable: PropTypes.bool,
  exportable: PropTypes.bool,
  responsive: PropTypes.bool,
  striped: PropTypes.bool,
  hoverable: PropTypes.bool,
  dense: PropTypes.bool,
  onRowSelect: PropTypes.func,
};
