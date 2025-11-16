import React, { useState, useEffect, useCallback, useRef } from "react";
import CampaignList from "../components/CampaignList";
import { request, ApiEnum } from "../../../../services/NetworkUntil";

const CampaignListContainer = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [statusOptions, setStatusOptions] = useState([
    { value: "", label: "All Status" }
  ]);

  const searchRef = useRef("");
  const typeFilterRef = useRef("");
  const statusFilterRef = useRef("");

  useEffect(() => {
    searchRef.current = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    typeFilterRef.current = typeFilter;
  }, [typeFilter]);

  useEffect(() => {
    statusFilterRef.current = statusFilter;
  }, [statusFilter]);

  // Fetch status options from API
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await request(ApiEnum.GET_CAMPAIGN_VEHICLE_STATUSES);
        if (res.success && Array.isArray(res.data)) {
          const options = [
            { value: "", label: "All Status" },
            ...res.data.map((s) => ({
              value: s.description || s.name || "",
              label: s.description || s.name || "Unknown",
            })),
          ];
          setStatusOptions(options);
        }
      } catch (err) {
        console.error("Error fetching campaign vehicle statuses:", err);
        setStatusOptions([{ value: "", label: "All Status" }]);
      }
    };
    fetchStatuses();
  }, []);

  const fetchCampaignVehicles = useCallback(
    async (
      page = 0,
      size = pageSize,
      search = searchQuery,
      type = typeFilter,
      status = statusFilter
    ) => {
      setLoading(true);
      setError(null);
      try {
        const query = { Page: page, Size: size };
        
        // Thêm search query nếu có
        if (search && search.trim()) {
          query.Search = search.trim();
        }
        
        // Thêm type filter nếu có
        if (type && type.trim()) {
          query.Type = type.trim();
        }
        
        // Thêm status filter nếu có
        if (status && status.trim()) {
          query.Status = status.trim();
        }

        const res = await request(ApiEnum.CAMPAIGNVEHICLE_STAFF, query);
        // NetworkUntil returns responseData; adapt to existing shape
        const items = Array.isArray(res?.data?.items)
          ? res.data.items
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.items)
          ? res.items
          : [];

        const normalized = items.map((it, idx) => ({
          id: it.campaignVehicleId ?? `${it.vin ?? "unknown"}-${idx}`,
          vin: it.vin ?? it.vehicle?.vin ?? "—",
          customer: it.customer?.name ?? "—",
          type: it.vehicle?.model ?? "—",
          status: it.status ?? "—",
          replacements: it.replacements ?? "_",
          title: it.title ?? "—",
          raw: it,
        }));

        setData(normalized);
        // try to take paging from response if present
        setPageNumber(res?.data?.pageNumber ?? page);
        setPageSize(res?.data?.pageSize ?? size);
        setTotalRecords(res?.data?.totalRecords ?? normalized.length);
      } catch (err) {
        console.error("fetchCampaignVehicles error", err);
        setError("Failed to load data");
        setData([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, searchQuery, typeFilter, statusFilter]
  );

  useEffect(() => {
    fetchCampaignVehicles(0, pageSize, searchQuery, typeFilter, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, typeFilter, statusFilter]);

  const handlePageChange = (newPage, newSize) => {
    setPageNumber(newPage);
    setPageSize(newSize ?? pageSize);
    fetchCampaignVehicles(
      newPage,
      newSize ?? pageSize,
      searchRef.current,
      typeFilterRef.current,
      statusFilterRef.current
    );
  };

  const handleSearchChange = (e) => {
    const value = e.target.value || "";
    setSearchQuery(value);
  };

  const handleTypeFilterChange = (e) => {
    const value = e.target.value || "";
    setTypeFilter(value);
  };

  const handleStatusFilterChange = (e) => {
    const value = e.target.value || "";
    setStatusFilter(value);
  };

  return (
    <CampaignList
      data={data}
      loading={loading}
      error={error}
      pagination={{ pageNumber, pageSize, totalRecords }}
      onPageChange={handlePageChange}
      onRefresh={() =>
        fetchCampaignVehicles(
          pageNumber,
          pageSize,
          searchRef.current,
          typeFilterRef.current,
          statusFilterRef.current
        )
      }
      refreshing={loading}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      typeFilter={typeFilter}
      onTypeFilterChange={handleTypeFilterChange}
      statusFilter={statusFilter}
      onStatusFilterChange={handleStatusFilterChange}
      statusOptions={statusOptions}
    />
  );
};

export default CampaignListContainer;
