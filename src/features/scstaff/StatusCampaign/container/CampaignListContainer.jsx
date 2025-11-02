import React, { useState, useEffect, useCallback } from "react";
import CampaignList from "../components/CampaignList";
import { request, ApiEnum } from "../../../../services/NetworkUntil";

const CampaignListContainer = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [filterVin, setFilterVin] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchCampaignVehicles = useCallback(
    async (
      page = 0,
      size = pageSize,
      vin = filterVin,
      status = filterStatus
    ) => {
      setLoading(true);
      setError(null);
      try {
        const query = { Page: page, Size: size };
        if (vin) query.Vin = vin;
        if (status) query.Status = status;

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
    [pageSize, filterVin, filterStatus]
  );

  useEffect(() => {
    fetchCampaignVehicles(0, pageSize, filterVin, filterStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCampaignVehicles(0, pageSize, filterVin, filterStatus);
    }, 300);
    return () => clearTimeout(timer);
  }, [filterVin, filterStatus, fetchCampaignVehicles, pageSize]);

  const handlePageChange = (newPage, newSize) => {
    setPageNumber(newPage);
    setPageSize(newSize ?? pageSize);
    fetchCampaignVehicles(newPage, newSize ?? pageSize, filterVin, filterStatus);
  };

  return (
    <CampaignList
      data={data}
      loading={loading}
      error={error}
      pagination={{ pageNumber, pageSize, totalRecords }}
      onPageChange={handlePageChange}
      onSearchVin={setFilterVin}
      onFilterStatus={setFilterStatus}
      onRefresh={() => fetchCampaignVehicles(pageNumber, pageSize, filterVin, filterStatus)}
    />
  );
};

export default CampaignListContainer;
