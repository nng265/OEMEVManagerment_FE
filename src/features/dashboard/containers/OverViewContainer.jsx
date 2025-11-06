import React, { useEffect, useState } from "react";
import { request, ApiEnum } from "../../../services/NetworkUntil";
import { normalizePagedResult } from "../../../services/helpers";
import OverView from "../components/OverView";
import dayjs from "dayjs";

export default function OverViewContainer() {
  const [workOrders, setWorkOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await request(ApiEnum.GET_WORK_ORDERS_BY_TECH);
      console.log("API WorkOrders (raw):", res);

      // Use normalizePagedResult to support multiple API shapes
      const { items } = normalizePagedResult(res, []);
      if (Array.isArray(items)) {
        setWorkOrders(items);
      } else {
        setWorkOrders([]);
      }
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
      setWorkOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const countBy = (field, value) =>
    workOrders.filter(
      (w) => (w[field] || "").toLowerCase() === value.toLowerCase()
    ).length;

  const filteredOrders = workOrders.filter((w) => {
    const year = new Date(w.startDate).getFullYear();
    return year === selectedYear;
  });

  // ✅ Stats tính theo filteredOrders
  const stats = {
    total: filteredOrders.length,
    inProgress: filteredOrders.filter((w) => w.status === "in progress").length,
    completed: filteredOrders.filter((w) => w.status === "completed").length,

    warranty: filteredOrders.filter((w) => w.target === "Warranty").length,
    campaign: filteredOrders.filter((w) => w.target === "Campaign").length,

    inspection: filteredOrders.filter((w) => w.type === "Inspection").length,
    repair: filteredOrders.filter((w) => w.type === "Repair").length,
  };

  // ✅ Monthly data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const list = filteredOrders.filter(
      (w) => new Date(w.startDate).getMonth() + 1 === month
    );

    return {
      month: `T${month}`,
      inspection: list.filter((w) => w.type === "Inspection").length,
      repair: list.filter((w) => w.type === "Repair").length,
    };
  });

  return (
    <OverView
      loading={isLoading}
      stats={stats}
      monthlyData={monthlyData}
      selectedYear={selectedYear}
      onYearChange={setSelectedYear}
    />
  );
}
