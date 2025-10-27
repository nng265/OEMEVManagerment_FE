// src/components/molecules/DataTable/DataTable.jsx
import React, { useState, useMemo } from 'react';
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
  currentPage = 0, // ✅ Chuẩn hóa luôn nhận 0-based index
  onPageChange,
  searchable = false,
  exportable = false,
  responsive = true,
  striped = true,
  hoverable = true,
  dense = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ Nếu client-side thì filter local
  const filteredData = useMemo(() => {
    if (!searchable || serverSide || !searchTerm.trim()) return data;
    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, searchable, serverSide]);

  // ✅ Tổng số trang
  const totalPages = serverSide
    ? Math.ceil(totalRecords / pageSize)
    : Math.ceil(filteredData.length / pageSize);

  // ✅ Client-side tự cắt dữ liệu theo trang (SỬA 2: Dùng 0-based)
  const paginatedData = !serverSide && pagination
    ? filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    : filteredData;

  // ✅ Gọi BE khi đổi trang / kích thước
  // Handle page change
  const handlePageChange = (pageIndex) => {
    if (onPageChange) {
      onPageChange(pageIndex, pageSize); // ✅ gửi đúng pageIndex (0-based) cho BE
    }
  };


  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    if (onPageChange) {
      onPageChange(0, newSize); // ✅ Reset về trang 0 khi đổi size
    }
  };


  // ✅ Loading state
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

  return (
    <div className="data-table-container">
      {/* Toolbar */}
      <div className="data-table-toolbar">
        {searchable && !serverSide && (
          <div className="data-table-search">
            <Input
              type="search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
        {exportable && (
          <Button variant="secondary" size="sm">
            Export CSV
          </Button>
        )}
      </div>

      {/* Table */}
      <div className={responsive ? 'table-responsive' : ''}>
        <table className={tableClasses}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
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
      {/* ✅ SỬA 1: CHỈ CẦN KIỂM TRA pagination */}
      {pagination && (
        <div className="data-table-footer">
          <div className="page-size-selector">
            <span>Rows per page:</span>
            <select value={pageSize} onChange={handlePageSizeChange}>
              {[20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>


          <div className="pagination-info">
            {serverSide ? (
              <>
                {/* (Sử dụng 0-based currentPage) */}
                Showing {currentPage * pageSize + 1}–
                {Math.min((currentPage + 1) * pageSize, totalRecords)} of {totalRecords}
              </>
            ) : (
              <>
                {/* ✅ SỬA 2: Sửa logic client-side (dùng 0-based) */}
                Showing {currentPage * pageSize + 1}–
                {Math.min((currentPage + 1) * pageSize, filteredData.length)} of {filteredData.length}
              </>
            )}
          </div>

          {/* ✅ SỬA 1: Bọc riêng các nút bằng totalPages > 1 */}
          {totalPages > 1 && (
            <div className="pagination">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(0)} // ✅ SỬA 3: Về trang 0
                disabled={currentPage === 0} // ✅ SỬA 3: Disable khi ở trang 0
              >
                First
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0} // ✅ SỬA 3: Disable khi ở trang 0
              >
                Prev
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i)
                .slice(
                  Math.max(0, currentPage - 2), // Giả sử currentPage là 0-based
                  Math.min(totalPages, currentPage + 3)
                )
                .map((pageIndex) => {
                  const displayPage = pageIndex + 1; // ✅ hiển thị từ 1
                  const isActive = pageIndex === currentPage; // ✅ So sánh 0-based

                  return (
                    <Button
                      key={pageIndex}
                      variant={isActive ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handlePageChange(pageIndex)}
                    >
                      {displayPage}
                    </Button>
                  );
                })}


              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1} // ✅ SỬA 3: Disable khi ở trang cuối
              >
                Next
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(totalPages - 1)} // ✅ SỬA 3: Về trang cuối (0-based)
                disabled={currentPage >= totalPages - 1} // ✅ SỬA 3: Disable khi ở trang cuối
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
  pagination: PropTypes.bool,
  serverSide: PropTypes.bool,
  totalRecords: PropTypes.number,
  pageSize: PropTypes.number,
  currentPage: PropTypes.number, // Nên là 0-based
  onPageChange: PropTypes.func,
};