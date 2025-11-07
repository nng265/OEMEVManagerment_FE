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

export default function DashboardEVMSTAFF() {
  // State cho từng loại dữ liệu
  const [totalWarrantyClaims, setTotalWarrantyClaims] = useState(0);
  const [totalPartsRequests, setTotalPartsRequests] = useState(0);
  const [activeCampaigns, setActiveCampaigns] = useState(0);
  const [campaignParticipationRate, setCampaignParticipationRate] = useState(0);
  
  const [warrantyData, setWarrantyData] = useState([]);
  const [campaignParticipation, setCampaignParticipation] = useState([]);
  const [topPolicies, setTopPolicies] = useState([]);
  const [partsRequestData, setPartsRequestData] = useState([]);
  const [centerWarranty, setCenterWarranty] = useState([]);
  
  const [loading, setLoading] = useState(true);

  // Fetch Total Warranty Claims
  const fetchTotalWarrantyClaims = async () => {
    try {
      const response = await request(ApiEnum.API_GET_TOTAL_WARRANTY_CLAIMS);
      console.log("Total Warranty Claims:", response);
      
      if (response.success && response.data !== undefined) {
        setTotalWarrantyClaims(response.data || 0);
      }
    } catch (error) {
      console.error("Error fetching total warranty claims:", error);
    }
  };

  // Fetch Total Parts Requests
  const fetchTotalPartsRequests = async () => {
    try {
      const response = await request(ApiEnum.API_GET_TOTAL_PARTS_REQUESTS);
      console.log("Total Parts Requests:", response);
      
      if (response.success && response.data !== undefined) {
        setTotalPartsRequests(response.data || 0);
      }
    } catch (error) {
      console.error("Error fetching total parts requests:", error);
    }
  };

  // Fetch Active Campaigns Count
  const fetchActiveCampaigns = async () => {
    try {
      const response = await request(ApiEnum.API_GET_ACTIVE_CAMPAIGNS_COUNT);
      console.log("Active Campaigns:", response);
      
      if (response.success && response.data !== undefined) {
        setActiveCampaigns(response.data || 0);
      }
    } catch (error) {
      console.error("Error fetching active campaigns:", error);
    }
  };

  // Fetch Campaign Participation Rate
  const fetchCampaignParticipation = async () => {
    try {
      const response = await request(ApiEnum.API_GET_CAMPAIGN_PARTICIPATION);
      console.log("Campaign Participation:", response);
      
      if (response.success && response.data) {
        const data = response.data;
        const participating = data.participating || 0;
        const affected = data.affected || 0;
        
        const rate = affected > 0 
          ? Math.round((participating / affected) * 100)
          : 0;
        
        setCampaignParticipationRate(rate);
        
        // Cập nhật pie chart data
        const notParticipating = affected - participating;
        const pieData = [
          {
            name: "Participated",
            value: affected > 0 ? Math.round((participating / affected) * 100) : 0,
          },
          {
            name: "Not Participated",
            value: affected > 0 ? Math.round((notParticipating / affected) * 100) : 0,
          },
        ];
        setCampaignParticipation(pieData);
      }
    } catch (error) {
      console.error("Error fetching campaign participation:", error);
    }
  };

  // Fetch Warranty Claims Trend (6 months)
  const fetchWarrantyTrend = async () => {
    try {
      const response = await request(ApiEnum.API_GET_WARRANTY_CLAIMS_TREND);
      console.log("Warranty Claims Trend:", response);
      
      if (response.success && response.data) {
        const formattedData = response.data.map(item => ({
          month: item.monthName?.split(" ")[0] || item.month || "",
          claims: item.count || 0,
        }));
        setWarrantyData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching warranty trend:", error);
    }
  };

  // Fetch Top Warranty Policies
  const fetchTopPolicies = async () => {
    try {
      const response = await request(ApiEnum.API_GET_TOP_WARRANTY_POLICIES);
      console.log("Top Warranty Policies:", response);
      
      if (response.success && response.data) {
        const formattedPolicies = response.data.map(item => ({
          policy: item.name || "",
          count: item.count || 0,
        }));
        setTopPolicies(formattedPolicies);
      }
    } catch (error) {
      console.error("Error fetching top policies:", error);
    }
  };

  // Fetch Parts Request Ranking
  const fetchPartsRequestRanking = async () => {
    try {
      const response = await request(ApiEnum.API_GET_PARTS_REQUEST_RANKING);
      console.log("Parts Request Ranking:", response);
      
      if (response.success && response.data) {
        const formattedParts = response.data.map(item => ({
          part: item.model || "",
          requests: item.quantity || 0,
        }));
        setPartsRequestData(formattedParts);
      }
    } catch (error) {
      console.error("Error fetching parts request ranking:", error);
    }
  };

  // Fetch Warranty by Service Center
  const fetchWarrantyByCenter = async () => {
    try {
      const response = await request(ApiEnum.API_GET_WARRANTY_BY_SERVICE_CENTER);
      console.log("Warranty by Service Center:", response);
      
      if (response.success && response.data) {
        const formattedCenters = response.data.map(item => ({
          center: item.orgName || "",
          claims: item.count || 0,
        }));
        setCenterWarranty(formattedCenters);
      }
    } catch (error) {
      console.error("Error fetching warranty by center:", error);
    }
  };

  // Fetch tất cả dữ liệu khi component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Gọi tất cả API song song
        await Promise.all([
          fetchTotalWarrantyClaims(),
          fetchTotalPartsRequests(),
          fetchActiveCampaigns(),
          fetchCampaignParticipation(),
          fetchWarrantyTrend(),
          fetchTopPolicies(),
          fetchPartsRequestRanking(),
          fetchWarrantyByCenter(),
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
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
            <p>{loading ? "..." : totalWarrantyClaims}</p>
          </div>
          <div className="card">
            <h4>Total Parts Requests</h4>
            <p>{loading ? "..." : totalPartsRequests}</p>
          </div>
          <div className="card">
            <h4>Active Campaigns</h4>
            <p>{loading ? "..." : activeCampaigns}</p>
          </div>
          <div className="card highlight-card">
            <h4>Campaign Participation (Across All Active Campaigns)</h4>
            <p>{loading ? "..." : `${campaignParticipationRate}%`}</p>
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
