import React, { useEffect, useState } from "react";
import { request, ApiEnum } from "../../../services/NetworkUntil";
import OverView from "../components/OverView";

export default function OverViewContainer() {
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    warranty: 0,
    campaign: 0,
    inspection: 0,
    repair: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("m"); // 'm' for month, 'y' for year

  // Fetch Task Counts (Total, In Progress, Completed)
  const fetchTaskCounts = async () => {
    try {
      const response = await request(ApiEnum.GET_WORK_ORDER_TASK_COUNTS);
      console.log("Task Counts API:", response);

      if (response.success && response.data) {
        setStats((prev) => ({
          ...prev,
          total: response.data.total || 0,
          inProgress: response.data.inProgress || 0,
          completed: response.data.completed || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching task counts:", error);
    }
  };

  // Fetch Task Group Counts (Warranty, Campaign, Inspection, Repair)
  const fetchTaskGroupCounts = async (unit) => {
    try {
      const response = await request(ApiEnum.GET_WORK_ORDER_TASK_GROUP_COUNTS, {
        unit: unit, // 'y' for year, 'm' for month
      });
      console.log("Task Group Counts API:", response);

      if (response.success && response.data && response.data.items) {
        const items = response.data.items;
        
        // Tính toán số lượng theo target và type
        const warranty = items
          .filter((item) => item.target === "Warranty")
          .reduce((sum, item) => sum + (item.count || 0), 0);
        
        const campaign = items
          .filter((item) => item.target === "Campaign")
          .reduce((sum, item) => sum + (item.count || 0), 0);
        
        const inspection = items
          .filter((item) => item.type === "Inspection")
          .reduce((sum, item) => sum + (item.count || 0), 0);
        
        const repair = items
          .filter((item) => item.type === "Repair")
          .reduce((sum, item) => sum + (item.count || 0), 0);

        setStats((prev) => ({
          ...prev,
          warranty,
          campaign,
          inspection,
          repair,
        }));
      }
    } catch (error) {
      console.error("Error fetching task group counts:", error);
    }
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchTaskCounts(),
        fetchTaskGroupCounts(selectedUnit),
      ]);
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedUnit]);

  return (
    <OverView
      loading={isLoading}
      stats={stats}
      selectedUnit={selectedUnit}
      onUnitChange={setSelectedUnit}
    />
  );
}
