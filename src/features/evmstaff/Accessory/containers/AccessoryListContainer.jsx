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
  const [orgFilter, setOrgFilter] = useState("");

  const searchRef = useRef("");
  const statusRef = useRef("");
  const conditionRef = useRef("");//mới
  const orgRef = useRef("");
  const paginationRef = useRef(pagination);

  const [selected, setSelected] = useState(null);

  // Keep refs updated
  useEffect(() => { paginationRef.current = pagination; }, [pagination]);
  useEffect(() => { searchRef.current = debouncedSearch; }, [debouncedSearch]);
  useEffect(() => { statusRef.current = statusFilter; }, [statusFilter]);
  useEffect(() => { conditionRef.current = conditionFilter; }, [conditionFilter]); //mới
  useEffect(() => { orgRef.current = orgFilter; }, [orgFilter]);

  const [orgOptions, setOrgOptions] = useState([{ value: "", label: "All Organizations" }]);
  const [statusOptions, setStatusOptions] = useState([{ value: "", label: "All Status" }]);
  const [conditionOptions, setConditionOptions] = useState([{ value: "", label: "All Conditions" }]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch options for the select filters (organization, status, condition)
  useEffect(() => {
    let mounted = true;

    const mapToOptions = (arr, emptyLabel, type = "") => {
      if (!Array.isArray(arr)) return [{ value: "", label: emptyLabel }];
      const mapped = arr.map((item) => {
        if (type === "org") {
          return {
            value: item.orgId ?? item.id ?? item.value ?? item, // prefer orgId
            label: item.name ?? item.display ?? String(item),
          };
        }
        // Default for status, condition
        if (typeof item === "string") return { value: item, label: item };
        const value = item.name ?? item.value ?? item.code ?? item.id ?? item;
        const label = item.label ?? item.display ?? item.name ?? item;
        return { value, label };
      });
      return [{ value: "", label: emptyLabel }, ...mapped];
    };


    const isEmptyResponse = (res) => {
      if (res == null) return true;
      if (Array.isArray(res)) return res.length === 0;
      if (typeof res === "object") return Object.keys(res).length === 0;
      return false;
    };

    const retryRequest = async (api, attempts = 3, delayMs = 500) => {
      let last;
      for (let i = 0; i < attempts; i++) {
        try {
          last = await request(api);
          // unwrap common shapes
          const unwrapped = last?.data ?? last?.items ?? last;
          if (!isEmptyResponse(unwrapped)) return unwrapped;
        } catch (err) {
          last = undefined;
        }
        // wait before retrying
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
      }
      return last?.data ?? last?.items ?? last ?? [];
    };

    const fetchOptions = async () => {
      try {
        const [orgData, statusData, condData] = await Promise.all([
          retryRequest(ApiEnum.ORGANIZATION_ALL),
          retryRequest(ApiEnum.GET_PART_STATUS),
          retryRequest(ApiEnum.GET_PART_CONDITION),
        ]);

        if (!mounted) return;

        setOrgOptions(mapToOptions(orgData, "All Organizations", "org"));
        setStatusOptions(mapToOptions(statusData, "All Status"));
        setConditionOptions(mapToOptions(condData, "All Conditions"));
      } catch (err) {
        console.error("Failed to load filter options", err);
        toast.error(err?.message || "Unable to load filter options");
      }
    };

    fetchOptions();

    return () => {
      mounted = false;
    };
  }, []);

  // ================================
  // FETCH ACCESSORY DATA
  // ================================
  const fetchAccessory = useCallback(
    async (page = 0, size, searchText, statusText, conditionText, orgText) => {//mới
      const effectiveSize = typeof size === "number" && size > 0 ? size : paginationRef.current.pageSize;
      const effectiveSearch = typeof searchText === "string" ? searchText : searchRef.current;
      const effectiveStatus = typeof statusText === "string" ? statusText : statusRef.current;
      const effectiveCondition = typeof conditionText === "string" ? conditionText : conditionRef.current;//mới
      const effectiveOrg = typeof orgText === "string" ? orgText : orgRef.current;

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
        if (effectiveOrg?.trim()) params.serviceCenterId = effectiveOrg; // pass organization name
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
    fetchAccessory(0, paginationRef.current.pageSize, searchRef.current, statusFilter, conditionFilter, orgFilter);
  }, [statusFilter]);

  // Reload whenever search, status, or condition changes
useEffect(() => {
  setPagination((p) => ({ ...p, pageNumber: 0 }));
  fetchAccessory(
    0,
    paginationRef.current.pageSize,
      debouncedSearch,
      statusFilter,
      conditionFilter,
      orgFilter
  );
}, [debouncedSearch, statusFilter, conditionFilter]);

  // Reload on organization filter change
  useEffect(() => {
    setPagination((p) => ({ ...p, pageNumber: 0 }));
    fetchAccessory(
      0,
      paginationRef.current.pageSize,
      searchRef.current,
      statusRef.current,
      conditionRef.current,
      orgRef.current
    );
  }, [orgFilter]);

  // Page change
  const handlePageChange = useCallback(
    (page, size) => {
      fetchAccessory(page, size, searchRef.current, statusRef.current, conditionRef.current, orgRef.current);
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
      conditionRef.current,
      orgRef.current
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
        statusOptions={statusOptions}
        conditionOptions={conditionOptions}
        orgOptions={orgOptions}
        orgFilter={orgFilter}
        onOrgFilterChange={(e) => setOrgFilter(e.target.value)}
        onView={setSelected}
      />

      {selected?.status === "InStock" && <InStock item={selected} onClose={() => setSelected(null)} />}
      {selected?.status === "OnVehicle" && <Installed item={selected} onClose={() => setSelected(null)} />}
      {selected?.status === "Returned" && <Removed item={selected} onClose={() => setSelected(null)} />}    
      {selected?.status === "InTransit" && <InTransit item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default AccessoryListContainer;
