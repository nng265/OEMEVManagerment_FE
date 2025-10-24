import { useState, useMemo } from 'react';

export const useTable = (data, options = {}) => {
  const {
    initialSort = { field: null, direction: 'asc' },
    initialPage = 1,
    pageSize = 10,
    sortable = true,
    pageable = true,
    searchable = false,
    searchFields = []
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sortConfig, setSortConfig] = useState(initialSort);
  const [searchTerm, setSearchTerm] = useState('');

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortable || !sortConfig.field) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Handle different data types
      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    });
  }, [data, sortConfig, sortable]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm) return sortedData;

    return sortedData.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [sortedData, searchTerm, searchable, searchFields]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pageable) return filteredData;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize, pageable]);

  const totalPages = useMemo(() => {
    if (!pageable) return 1;
    return Math.ceil(filteredData.length / pageSize);
  }, [filteredData, pageSize, pageable]);

  // Handle sorting
  const handleSort = (field) => {
    if (!sortable) return;

    setSortConfig((prevConfig) => ({
      field,
      direction:
        prevConfig.field === field && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc'
    }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (!pageable) return;
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  // Handle search
  const handleSearch = (term) => {
    if (!searchable) return;
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  return {
    // Data
    data: paginatedData,
    totalItems: filteredData.length,
    
    // Pagination
    currentPage,
    totalPages,
    pageSize,
    handlePageChange,
    
    // Sorting
    sortConfig,
    handleSort,
    
    // Search
    searchTerm,
    handleSearch,
    
    // Utility methods
    reset: () => {
      setCurrentPage(initialPage);
      setSortConfig(initialSort);
      setSearchTerm('');
    }
  };
};

export default useTable;
