import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import "./DashboardEVMSTAFF.css";
import { request, ApiEnum } from "../services/NetworkUntil";

const COLORS = ["#4F46E5", "#8B5CF6", "#A78BFA"];

// Top Warranty Policies (gói BH được claim nhiều nhất) - Mock data
const topPolicies = [
  { policy: "Engine Protection", count: 18 },
  { policy: "Brake System Coverage", count: 13 },
  { policy: "Powertrain Warranty", count: 10 },
  { policy: "Electrical System", count: 7 },
  { policy: "Suspension Package", count: 5 },
];

// Parts Request Ranking - Mock data
const partsRequestData = [
  { part: "Oil Filter", requests: 45 },
  { part: "Spark Plug", requests: 38 },
  { part: "Air Filter", requests: 30 },
  { part: "Fuel Pump", requests: 22 },
  { part: "Brake Pad", requests: 17 },
];

// Warranty by service center - Mock data
const centerWarranty = [
  { center: "HCMC Center 1", claims: 18 },
  { center: "Hanoi Center", claims: 14 },
  { center: "Da Nang Center", claims: 10 },
];

export default function DashboardEVMSTAFF() {
  // State cho dữ liệu từ API
  const [stats, setStats] = useState({
    totalWarrantyClaims: 0,
    totalPartsRequests: 0,
    activeCampaigns: 0,
    campaignParticipation: 0,
  });
  
  const [warrantyData, setWarrantyData] = useState([]);
  const [campaignParticipation, setCampaignParticipation] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);


        const response = await request(ApiEnum.GET_DASHBOARD_EVM_SUMMARY);
        console.log("EVM Dashboard API response:", response);

        if (response.success && response.data) {
          const data = response.data;

          // Tính tổng warranty claims từ 6 tháng
          const totalWarrantyClaims = data.warrantyClaimLastSixMonths?.reduce(
            (sum, item) => sum + item.count,
            0
          ) || 0;

          // Tính campaign participation percentage
          const campaignProgress = data.activeCampaignProgress;
          const totalCampaignVehicles =
            (campaignProgress?.completed || 0) +
            (campaignProgress?.inProgress || 0) +
            (campaignProgress?.pending || 0);

          const participationRate =
            totalCampaignVehicles > 0
              ? Math.round(
                  ((campaignProgress?.completed || 0) / totalCampaignVehicles) *
                    100
                )
              : 0;

          setStats({
            totalWarrantyClaims: totalWarrantyClaims,
            totalPartsRequests: 31, // Mock data
            activeCampaigns: data.activeCampaignCount || 0,
            campaignParticipation: participationRate,
          });

          // Cập nhật warranty claims trend (Line Chart)
          if (data.warrantyClaimLastSixMonths) {
            const formattedWarrantyData = data.warrantyClaimLastSixMonths.map(
              (item) => ({
                month: item.monthName.split(" ")[0],
                claims: item.count,
              })
            );
            setWarrantyData(formattedWarrantyData);
          }

          // Cập nhật campaign participation (Pie Chart)
          if (data.activeCampaignProgress) {
            const progress = data.activeCampaignProgress;
            const total =
              progress.completed + progress.inProgress + progress.pending;

            const pieData = [
              {
                name: "Participated",
                value:
                  total > 0
                    ? Math.round((progress.completed / total) * 100)
                    : 0,
              },
              {
                name: "In Progress",
                value:
                  total > 0
                    ? Math.round((progress.inProgress / total) * 100)
                    : 0,
              },
              {
                name: "No Response",
                value:
                  total > 0 ? Math.round((progress.pending / total) * 100) : 0,
              },
            ];
            setCampaignParticipation(pieData);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  return (
    <div className="main-content">
      <div className="dashboard-wrapper">

        <div className="dashboard-header">
          <h1>Manufacturer Dashboard</h1>
        </div>

        {/* CARDS */}
        <div className="cards">
          <div className="card">
            <h4>Total Warranty Claims</h4>
            <p>{loading ? "..." : stats.totalWarrantyClaims}</p>
          </div>
          <div className="card">
            <h4>Total Parts Requests</h4>
            <p>{loading ? "..." : stats.totalPartsRequests}</p>
          </div>
          <div className="card">
            <h4>Active Campaigns</h4>
            <p>{loading ? "..." : stats.activeCampaigns}</p>
          </div>
          <div className="card highlight-card">
            <h4>Campaign Participation (Across All Active Campaigns)</h4>
            <p>{loading ? "..." : `${stats.campaignParticipation}%`}</p>
          </div>
        </div>

        {/* CHART GRID */}
        <div className="chart-grid">

          {/* Warranty - Line */}
          <div className="chart-box">
            <h3 className="chart-title">Warranty Claims Trend</h3>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 300,
                }}
              >
                Loading...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={warrantyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="claims"
                    stroke="#4F46E5"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Warranty by Policy */}
          <div className="chart-box">
            <h3 className="chart-title"> Policies</h3>
            <table className="data-table">
              <thead><tr><th>Policy</th><th>Claims</th></tr></thead>
              <tbody>
                {topPolicies.map((i, idx) => (
                  <tr key={idx}><td>{i.policy}</td><td>{i.count}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Service Centers Claim Count */}
          <div className="chart-box">
            <h3 className="chart-title">Warranty Claims by Service Center</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={centerWarranty}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="center" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="claims" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Part Requests */}
          <div className="chart-box">
            <h3 className="chart-title">Top Requested Parts</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={partsRequestData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="part" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="requests" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Campaign Pie + Details */}
          <div className="campaign-box">
            <div className="campaign-chart">
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 250,
                  }}
                >
                  Loading...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={campaignParticipation}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {campaignParticipation.map((entry, idx) => (
                        <Cell key={idx} fill={COLORS[idx]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="campaign-info">
              <h3>Campaign Status Breakdown</h3>
              {loading ? (
                <p>Loading...</p>
              ) : (
                campaignParticipation.map((c, i) => (
                  <p key={i}>
                    <strong>{c.name}:</strong> {c.value}%
                  </p>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
