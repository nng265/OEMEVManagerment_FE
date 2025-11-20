import React, { useState, useEffect } from "react";
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

import { request, ApiEnum } from "../services/NetworkUntil";

import BuildIcon from "@mui/icons-material/Build";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CampaignIcon from "@mui/icons-material/Campaign";

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
        backgroundColor: `${color}20`,
        color: `${color}`,
      }}
    >
      <IconComponent />
    </Box>
  </Paper>
);

const Dashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();

  const [stats, setStats] = useState({
    vehiclesInService: 0,
    scheduledAppointments: 0,
    readyForPickup: 0,
    activeCampaigns: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);

  const [lineChartData, setLineChartData] = useState({
    labels: [],
    series: [
      {
        data: [],
        label: "Claims",
        color: "var(--primary-color, #00509d)",
        area: true,
        showMark: false,
      },
    ],
  });

  const [pieData, setPieData] = useState([]);

  const [campaignProgressData, setCampaignProgressData] = useState({
    labels: ["Active Campaigns"],
    series: [
      {
        label: "Completed",
        data: [0],
        color: "#2e7d32",
      },
      {
        label: "In Progress",
        data: [0],
        color: "#ed6c02",
      },
      {
        label: "Pending",
        data: [0],
        color: "#d32f2f",
      },
    ],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoadingStats(true);
        setLoadingCharts(true);

        const response = await request(ApiEnum.GET_DASHBOARD_SC_SUMMARY);

        if (response.success && response.data) {
          const data = response.data;

          setStats({
            vehiclesInService: data.vehicleInServiceCount || 0,
            scheduledAppointments: data.scheduledAppointmentCount || 0,
            readyForPickup: data.repairedWarrantyClaimCount || 0,
            activeCampaigns: data.activeCampaignCount || 0,
          });

          if (data.warrantyClaimLastSixMonths) {
            const labels = data.warrantyClaimLastSixMonths.map(
              (item) => item.monthName
            );
            const chartData = data.warrantyClaimLastSixMonths.map(
              (item) => item.count
            );
            setLineChartData({
              labels: labels,
              series: [
                {
                  data: chartData,
                  label: "Claims",
                  color: "var(--primary-color, #00509d)",
                  area: true,
                  showMark: false,
                },
              ],
            });
          }

          if (data.techWorkOrderCounts) {
            const colors = [
              "#00509D",
              "#0079B8",
              "#00A3D2",
              "#00CCEB",
              "#5CE1E6",
            ];
            const pieChartData = data.techWorkOrderCounts.map(
              (tech, index) => ({
                id: index,
                value: tech.workOrderCount,
                label: tech.techName,
                color: colors[index % colors.length],
              })
            );
            setPieData(pieChartData);
          }

          if (data.activeCampaignProgress) {
            setCampaignProgressData({
              labels: ["Active Campaigns"],
              series: [
                {
                  label: "Completed",
                  data: [data.activeCampaignProgress.completed || 0],
                  color: "#2e7d32",
                },
                {
                  label: "In Progress",
                  data: [data.activeCampaignProgress.inProgress || 0],
                  color: "#ed6c02",
                },
                {
                  label: "Pending",
                  data: [data.activeCampaignProgress.pending || 0],
                  color: "#d32f2f",
                },
              ],
            });
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoadingStats(false);
        setLoadingCharts(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Box sx={{ p: 3, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Service Center Dashboard
      </Typography>

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
            color="#17a2b8"
          />
        </Grid>
      </Grid>

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

        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: "12px",
              height: "400px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
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
                  flexGrow: 1,
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexGrow: 1,
                }}
              >
                <PieChart
                  width={300}
                  height={300}
                  series={[
                    {
                      data: pieData,
                      arcLabel: (item) => `${item.value}`,
                      innerRadius: 60,
                      outerRadius: 100,
                      paddingAngle: 3,
                      cornerRadius: 5,
                      animation: fals,
                    },
                  ]}
                  sx={{
                    [`& .${pieArcLabelClasses.root}`]: {
                      fill: "white",
                      fontWeight: "bold",
                      fontSize: 14,
                    },
                  }}
                  legend={{
                    hidden: false,
                    direction: "row",
                    position: { vertical: "bottom", horizontal: "middle" },
                    itemMarkWidth: 10,
                    itemMarkHeight: 10,
                    padding: 10,
                  }}
                />
              </Box>
            )}
          </Paper>
        </Grid>

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
                xAxis={[
                  { scaleType: "band", data: campaignProgressData.labels },
                ]}
                series={campaignProgressData.series}
                stackingStrategy="normal"
                height={300}
                margin={{ left: 50, right: 20, top: 50, bottom: 50 }}
                grid={{ vertical: true }}
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
