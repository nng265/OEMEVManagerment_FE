import React, { useState, useEffect, useRef, useCallback } from "react";
import AccessoryList from "../components/AccessoryList";
import InStock from "../components/InStock";
import Installed from "../components/OnVehicle";
import Removed from "../components/Returned";

import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { normalizePagedResult } from "../../../../services/helpers";
import { toast } from "react-toastify";

export function AccessoryListContainer() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 20,
    totalRecords: 0,
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");//mới

  const searchRef = useRef("");
  const statusRef = useRef("");
  const conditionRef = useRef("");//mới
  const paginationRef = useRef(pagination);

  const [selected, setSelected] = useState(null);

  // Keep refs updated
  useEffect(() => { paginationRef.current = pagination; }, [pagination]);
  useEffect(() => { searchRef.current = debouncedSearch; }, [debouncedSearch]);
  useEffect(() => { statusRef.current = statusFilter; }, [statusFilter]);
  useEffect(() => { conditionRef.current = conditionFilter; }, [conditionFilter]); //mới

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // ================================
  // FETCH ACCESSORY DATA
  // ================================
  const fetchAccessory = useCallback(
    async (page = 0, size, searchText, statusText, conditionText) => {//mới
      const effectiveSize = typeof size === "number" && size > 0 ? size : paginationRef.current.pageSize;
      const effectiveSearch = typeof searchText === "string" ? searchText : searchRef.current;
      const effectiveStatus = typeof statusText === "string" ? statusText : statusRef.current;
      const effectiveCondition = typeof conditionText === "string" ? conditionText : conditionRef.current;//mới

      setLoading(true);
      setError(null);

      try {
        const params = {
          Page: page,
          Size: effectiveSize,
        };
        if (effectiveSearch?.trim()) params.Search = effectiveSearch.trim();
        if (effectiveStatus?.trim()) params.Status = effectiveStatus;
        if (effectiveCondition?.trim()) params.Condition = effectiveCondition;//mới
        const res = await request(ApiEnum.GET_PART_HISTORY, params);

        const { success, items, totalRecords, page: pg, size: sz, message } =
          normalizePagedResult(res, []);

        if (!success) {
          setRows([]);
          setPagination({ pageNumber: 0, pageSize: effectiveSize, totalRecords: 0 });
          setError(message || "Unable to load accessories");
          return;
        }

        setRows(items);
        setPagination({
          pageNumber: typeof pg === "number" ? pg : page,
          pageSize: typeof sz === "number" && sz > 0 ? sz : effectiveSize,
          totalRecords: typeof totalRecords === "number" ? totalRecords : items.length,
        });
      } catch (err) {
        console.error("❌ Failed to load accessory", err);
        setError(err?.message || "Unable to load accessories");
        setRows([]);
        setPagination({ pageNumber: page, pageSize: effectiveSize, totalRecords: 0 });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Reload on search
  useEffect(() => {
    setPagination((p) => ({ ...p, pageNumber: 0 }));
    fetchAccessory(0, paginationRef.current.pageSize, debouncedSearch, statusFilter, conditionFilter);
    
  }, [debouncedSearch]);

  // Reload on status filter change
  useEffect(() => {
    setPagination((p) => ({ ...p, pageNumber: 0 }));
    fetchAccessory(0, paginationRef.current.pageSize, searchRef.current, statusFilter, conditionFilter);
  }, [statusFilter]);

  // Reload whenever search, status, or condition changes
useEffect(() => {
  setPagination((p) => ({ ...p, pageNumber: 0 }));
  fetchAccessory(
    0,
    paginationRef.current.pageSize,
    debouncedSearch,
    statusFilter,
    conditionFilter
  );
}, [debouncedSearch, statusFilter, conditionFilter]);

  // Page change
  const handlePageChange = useCallback(
    (page, size) => {
      fetchAccessory(page, size, searchRef.current, statusRef.current, conditionRef.current);
    },
    [fetchAccessory]
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAccessory(
      paginationRef.current.pageNumber,
      paginationRef.current.pageSize,
      searchRef.current,
      statusRef.current,
      conditionRef.current
    ).finally(() => setRefreshing(false));
  }, [fetchAccessory]);

  return (
    <div style={{ padding: 16 }}>
      <AccessoryList
        data={rows}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        statusFilter={statusFilter}
        onStatusFilterChange={(e) => setStatusFilter(e.target.value)}
        conditionFilter={conditionFilter}
        onConditionFilterChange={(e) => setConditionFilter(e.target.value)}
        onView={setSelected}
      />

      {selected?.status === "InStock" && <InStock item={selected} onClose={() => setSelected(null)} />}
      {selected?.status === "OnVehicle" && <Installed item={selected} onClose={() => setSelected(null)} />}
      {selected?.status === "Returned" && <Removed item={selected} onClose={() => setSelected(null)} />}        
    </div>
  );
}

export default AccessoryListContainer;
