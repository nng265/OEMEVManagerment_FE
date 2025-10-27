// File: src/components/organisms/DataTable/DataTableServer.jsx
import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../../components/organisms/DataTable/DataTable.css';
import { LoadingSpinner } from '../../../components/atoms/LoadingSpinner';
import { Input } from '../../../atoms/Input/Input';
import { Button } from '../../../atoms/Button/Button';

// Đặt tên component là DataTableServer
export const DataTableServer = ({
  data,
  columns,
  isLoading = false,
  noDataMessage = 'No data available',
  onRowClick,
  sortable = true, // Client-side sort cho trang hiện tại (optional)
  pagination = true,
  pageSize = 10, // PageSize nhận từ container
  paginationServer = true, // Mặc định là true
  totalRecords = 0,
  currentPage = 1,
  onPageChange,
  onPageSizeChange,
  selectable = false,
  searchable = false, // Client-side search cho trang hiện tại (optional)
  exportable = false, // Client-side export cho trang hiện tại (optional)
  responsive = true,
  striped = true,
  hoverable = true,
  dense = false,
  onRowSelect,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);

  const processedData = useMemo(() => {
    let resultData = [...data]; // Data đã được phân trang từ server

    if (searchable && searchTerm) {
      resultData = resultData.filter(row =>
        columns.some(column => {
          if (!column.key) return false;
          const value = row[column.key];
          return value != null && String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    if (sortable && sortConfig.key) {
      resultData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
         if (typeof aValue === 'string' && typeof bValue === 'string') {
            const compare = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
            return sortConfig.direction === 'asc' ? compare : -compare;
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        if (aString < bString) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aString > bString) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return resultData;
  }, [data, columns, searchTerm, searchable, sortConfig, sortable]);

  const displayTotalRecords = totalRecords;
  const totalPages = Math.ceil(displayTotalRecords / pageSize) || 1;
  const paginatedData = processedData; // Data đã được phân trang

  const handleSort = (key) => {
    if (!sortable) return;
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChangeWrapper = (newPage) => {
    if (onPageChange) onPageChange(newPage);
  };
  const handlePageSizeChangeWrapper = (newSize) => {
    if (onPageSizeChange) onPageSizeChange(newSize);
  };

   const handleRowSelect = (row, isSelected) => {
       const rowId = row.id || row.orderId || row.vin;
       if (!rowId) { console.error("DataTableServer: Row needs id/orderId/vin."); return; }
       setSelectedRows(prev => {
         const newSelected = isSelected ? [...prev, rowId] : prev.filter(id => id !== rowId);
         if (onRowSelect) {
             const selectedObjs = data.filter(r => newSelected.includes(r.id || r.orderId || r.vin));
             onRowSelect(newSelected, selectedObjs);
         } return newSelected; });
    };
   const handleSelectAll = (isSelected) => {
        const pageIds = paginatedData.map(r => r.id||r.orderId||r.vin).filter(Boolean);
        let newIds = [];
        if (isSelected) { newIds = [...new Set([...selectedRows, ...pageIds])]; }
        else { newIds = selectedRows.filter(id => !pageIds.includes(id)); }
        setSelectedRows(newIds);
        if (onRowSelect) {
            const selectedObjs = data.filter(r => newIds.includes(r.id || r.orderId || r.vin));
            onRowSelect(newIds, selectedObjs); }
    };
   const handleExport = () => {
        const exportD = selectedRows.length > 0 ? data.filter(r => selectedRows.includes(r.id||r.orderId||r.vin)) : paginatedData;
        if (exportD.length === 0) { alert("No data to export."); return; }
        const header = columns.filter(c=>c.key).map(c=>`"${c.label.replace(/"/g,'""')}"`).join(',');
        const rows = exportD.map(row => columns.filter(c=>c.key).map(col => {
            const val = col.render ? col.render(row[col.key], row) : row[col.key];
            const strVal = val==null?"":String(val);
            return (strVal.includes(',')||strVal.includes('"')||strVal.includes('\n')) ? `"${strVal.replace(/"/g,'""')}"` : strVal; }).join(','));
        const csv = [header, ...rows].join('\n');
        const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
        const link = document.createElement('a');
        if(link.download!==undefined){
            const url=URL.createObjectURL(blob);
            link.setAttribute('href',url); link.setAttribute('download','table_data.csv');
            link.style.visibility='hidden'; document.body.appendChild(link);
            link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
        } else { alert("CSV export not supported."); }
    };


  if (isLoading) {
    return ( <div className="data-table-container data-table-loading-wrapper"><div className="data-table-loading"><LoadingSpinner size="lg" /><p>Loading data...</p></div></div> );
  }

  const tableClasses = ["table", striped && "table-striped", hoverable && "table-hover", dense && "table-sm"].filter(Boolean).join(" ");

  return (
    <div className="data-table-container">
      <div className="data-table-toolbar">
        {searchable && (<div className="data-table-search"><Input type="search" placeholder="Search..." value={searchTerm} onChange={handleSearchChange} prefix={/* svg */} /></div>)}
        {exportable && (<Button onClick={handleExport} variant="secondary" size="sm" disabled={data.length === 0}>Export CSV</Button>)}
      </div>

      <div className={responsive ? "table-responsive" : ""}>
        <table className={tableClasses}>
          <thead>
            <tr>
              {selectable && (<th className="select-cell"><input type="checkbox" onChange={e => handleSelectAll(e.target.checked)} checked={ paginatedData.length > 0 && paginatedData.every(row => selectedRows.includes(row.id||row.orderId||row.vin))} ref={el => { if (el) { const vIds=paginatedData.map(r=>r.id||r.orderId||r.vin).filter(Boolean); const sCnt=vIds.filter(id=>selectedRows.includes(id)).length; el.indeterminate = sCnt > 0 && sCnt < vIds.length; }}} disabled={paginatedData.length === 0} /></th>)}
              {columns.map(column => (<th key={column.key || column.label} onClick={() => column.key && sortable && handleSort(column.key)} className={column.key && sortable ? "sortable" : ""} style={column.key && sortable ? { cursor: "pointer" } : {}}>{column.label}{column.key && sortable && sortConfig.key === column.key && (<span className={`sort-icon ${sortConfig.direction}`}>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>)}</th>))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => { const rId=row.id||row.orderId||row.vin; const isSel=rId?selectedRows.includes(rId):false; return (<tr key={rId||index} onClick={()=>onRowClick&&onRowClick(row)} className={`${onRowClick?"clickable":""} ${isSel?"table-row-selected":""}`}>{selectable&&(<td className="select-cell" onClick={e=>e.stopPropagation()}><input type="checkbox" checked={isSel} onChange={e=>handleRowSelect(row,e.target.checked)} disabled={!rId}/></td>)}{columns.map(col=>(<td key={col.key||col.label}>{col.render?col.render(row[col.key],row):row[col.key]}</td>))}</tr>); })
            ) : (<tr><td colSpan={selectable?columns.length+1:columns.length} className="text-center">{noDataMessage}</td></tr>)}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 0 && (
        <div className="data-table-footer">
          <div className="page-size-selector">
            <span>Rows per page:</span>
            <select value={pageSize} onChange={e => handlePageSizeChangeWrapper(Number(e.target.value))}>
              {[10, 25, 50, 100].map(size => (<option key={size} value={size}>{size}</option>))}
            </select>
          </div>
          <div className="pagination-info">Showing {Math.min(((currentPage - 1) * pageSize) + 1, displayTotalRecords)} to {Math.min(currentPage * pageSize, displayTotalRecords)} of {displayTotalRecords} entries</div>
          <div className="pagination">
            <Button variant="secondary" size="sm" onClick={() => handlePageChangeWrapper(1)} disabled={currentPage === 1}>First</Button>
            <Button variant="secondary" size="sm" onClick={() => handlePageChangeWrapper(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
            <div className="pagination-pages">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => { let pN; if (totalPages <= 5) pN=i+1; else if (currentPage <= 3) pN=i+1; else if (currentPage >= totalPages - 2) pN=totalPages - 4 + i; else pN=currentPage - 2 + i; return (<Button key={pN} variant={pN === currentPage ? 'primary' : 'secondary'} size="sm" onClick={() => handlePageChangeWrapper(pN)}>{pN}</Button>); })}
            </div>
            <Button variant="secondary" size="sm" onClick={() => handlePageChangeWrapper(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
            <Button variant="secondary" size="sm" onClick={() => handlePageChangeWrapper(totalPages)} disabled={currentPage === totalPages}>Last</Button>
          </div>
        </div>
      )}
    </div>
  );
};

DataTableServer.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string, label: PropTypes.string.isRequired, render: PropTypes.func, sortable: PropTypes.bool, })).isRequired,
  isLoading: PropTypes.bool,
  noDataMessage: PropTypes.string,
  onRowClick: PropTypes.func,
  sortable: PropTypes.bool,
  pagination: PropTypes.bool,
  pageSize: PropTypes.number.isRequired,
  selectable: PropTypes.bool,
  searchable: PropTypes.bool,
  exportable: PropTypes.bool,
  responsive: PropTypes.bool,
  striped: PropTypes.bool,
  hoverable: PropTypes.bool,
  dense: PropTypes.bool,
  onRowSelect: PropTypes.func,
  paginationServer: PropTypes.bool,
  totalRecords: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
};

export default DataTableServer; // Export default