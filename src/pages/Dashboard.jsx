// src/pages/Dashboard/Dashboard.jsx (hoặc đường dẫn của bạn)

import React, { useState, useEffect } from "react";
// ⚠️ HÃY CHẮC CHẮN ĐƯỜNG DẪN NÀY ĐÚNG
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  LineChart,
  BarChart,
  PieChart,
  pieArcLabelClasses,
} from "@mui/x-charts";
// ⚠️ HÃY CHẮC CHẮN ĐƯỜNG DẪN NÀY ĐÚNG
import { request, ApiEnum } from "../services/NetworkUntil";

// --- Biểu tượng (Icon) ---
import BuildIcon from "@mui/icons-material/Build"; // Icon cho "Đang sửa"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"; // Icon cho "Lịch hẹn"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Icon cho "Sẵn sàng giao"
import CampaignIcon from "@mui/icons-material/Campaign"; // Icon cho "Campaign"

/**
 * Component Thẻ thống kê (StatCard)
 */
const StatCard = ({ title, value, icon: IconComponent, loading, color }) => (
  <Paper
    elevation={3}
    sx={{
      p: 3,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      height: "120px",
    }}
  >
    <Box>
      <Typography
        variant="h5"
        component="div"
        sx={{ fontWeight: 700, fontSize: "2rem" }}
      >
        {loading ? <CircularProgress size={28} /> : value}
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mt: 0.5 }}>
        {title}
      </Typography>
    </Box>
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: `${color}20`, // Màu nền mờ
        color: `${color}`, // Màu icon
      }}
    >
      <IconComponent />
    </Box>
  </Paper>
);

/**
 * Component Dashboard chính (Dành cho SC_STAFF)
 */
const Dashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();

  // ⚠️ DÙNG SỐ LIỆU GIẢ LẬP VÌ CHƯA CÓ API
  const [stats, setStats] = useState({
    vehiclesInService: 5, // 5 xe đang sửa
    scheduledAppointments: 8, // 8 lịch hẹn
    readyForPickup: 2, // 2 xe sẵn sàng giao
    activeCampaigns: 4, // 4 chiến dịch đang chạy
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingCharts, setLoadingCharts] = useState(false);

  // --- ⚠️ DỮ LIỆU GIẢ LẬP (MOCK DATA) CHO BIỂU ĐỒ ---
  const lineChartData = {
    labels: ["T5", "T6", "T7", "T8", "T9", "T10", "T11"],
    series: [
      {
        data: [12, 19, 15, 25, 22, 30, 28],
        label: "Claims",
        color: "var(--primary-color, #00509d)",
        area: true,
        showMark: false,
      },
    ],
  };

  const pieData = [
    { id: 0, value: 5, label: "Tech. Anh", color: "#00509D" },
    { id: 1, value: 3, label: "Tech. Bình", color: "#0079B8" },
    { id: 2, value: 4, label: "Tech. Cường", color: "#00A3D2" },
  ];
  const totalPieValue = pieData.reduce((acc, item) => acc + item.value, 0);

  const campaignProgressData = {
    labels: [
      "Campaign 'Recall Pin'",
      "Campaign 'Update ECM'",
      "Campaign 'Check Battery'",
    ],
    series: [
      {
        label: "Completed",
        data: [20, 10, 5],
        color: "#2e7d32", // Xanh lá
      },
      {
        label: "In Progress",
        data: [5, 15, 2],
        color: "#ed6c02", // Cam
      },
      {
        label: "Pending",
        data: [10, 5, 1],
        color: "#d32f2f", // Đỏ
      },
    ],
  };
  // --- Hết Dữ liệu giả lập ---

  /*
  useEffect(() => {
    // ... 
  }, []);
  */

  return (
    <Box sx={{ p: 3, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Service Center Dashboard
      </Typography>

      {/* =================================================================
        ⬇️ SỬA LỖI NẰM Ở ĐÂY ⬇️
        Thêm: sx={{ flexDirection: 'row' }}
        =================================================================
      */}
      <Grid container spacing={3} sx={{ mb: 3, flexDirection: "row" }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Vehicles In Service"
            value={stats.vehiclesInService}
            icon={BuildIcon}
            loading={loadingStats}
            color="#00509D"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Appointment Schedule"
            value={stats.scheduledAppointments}
            icon={CalendarMonthIcon}
            loading={loadingStats}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ready for Pickup"
            value={stats.readyForPickup}
            icon={CheckCircleIcon}
            loading={loadingStats}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Campaigns"
            value={stats.activeCampaigns}
            icon={CampaignIcon}
            loading={loadingStats}
            color="#17a2b8" // Màu info
          />
        </Grid>
      </Grid>

      {/* =================================================================
        ⬇️ SỬA LỖI NẰM Ở ĐÂY ⬇️
        Thêm: sx={{ flexDirection: 'row' }}
        =================================================================
      */}
      <Grid container spacing={3} sx={{ flexDirection: "row" }}>
        {/* Biểu đồ đường (Line Chart) */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={3}
            sx={{ p: 3, borderRadius: "12px", height: "400px" }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Warranty Claims Overview (Last 6 Months)
            </Typography>
            {loadingCharts ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 300,
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <LineChart
                xAxis={[{ scaleType: "point", data: lineChartData.labels }]}
                series={lineChartData.series}
                height={300}
                margin={{ left: 50, right: 20, top: 20, bottom: 30 }}
                grid={{ vertical: true, horizontal: true }}
              />
            )}
          </Paper>
        </Grid>

        {/* Biểu đồ tròn (Pie Chart) */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{ p: 3, borderRadius: "12px", height: "400px" }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Technician Workload
            </Typography>
            {loadingCharts ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 300,
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <PieChart
                series={[
                  {
                    data: pieData,
                    arcLabel: (item) => `${item.value}`,
                    innerRadius: 40,
                    outerRadius: 100,
                    paddingAngle: 3,
                    cornerRadius: 5,
                  },
                ]}
                sx={{
                  [`& .${pieArcLabelClasses.root}`]: {
                    fill: "white",
                    fontWeight: "bold",
                    fontSize: 14,
                  },
                }}
                height={300}
                legend={{
                  hidden: false,
                  direction: "row",
                  position: { vertical: "bottom", horizontal: "middle" },
                  itemMarkWidth: 10,
                  itemMarkHeight: 10,
                  padding: 10,
                }}
              />
            )}
          </Paper>
        </Grid>

        {/* Biểu đồ cột ngang (Bar Chart) */}
        <Grid item xs={12} md={12}>
          <Paper
            elevation={3}
            sx={{ p: 3, borderRadius: "12px", height: "400px" }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Active Campaign Progress
            </Typography>
            {loadingCharts ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 300,
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <BarChart
                layout="horizontal"
                yAxis={[
                  { scaleType: "band", data: campaignProgressData.labels },
                ]}
                series={campaignProgressData.series}
                stackingStrategy="normal"
                height={300}
                margin={{ left: 150, right: 20, top: 50, bottom: 30 }}
                grid={{ horizontal: true }}
                legend={{
                  hidden: false,
                  direction: "row",
                  position: { vertical: "top", horizontal: "middle" },
                }}
                sx={{
                  "& .MuiBarElement-root": {
                    rx: 6,
                  },
                }}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
