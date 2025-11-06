import React from "react";
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

// Warranty claims theo tháng
const warrantyData = [
  { month: "Jan", claims: 24 },
  { month: "Feb", claims: 31 },
  { month: "Mar", claims: 18 },
  { month: "Apr", claims: 27 },
  { month: "May", claims: 22 },
  { month: "Jun", claims: 30 },
];

// Top Warranty Policies (gói BH được claim nhiều nhất)
const topPolicies = [
  { policy: "Engine Protection", count: 18 },
  { policy: "Brake System Coverage", count: 13 },
  { policy: "Powertrain Warranty", count: 10 },
  { policy: "Electrical System", count: 7 },
  { policy: "Suspension Package", count: 5 },
];

// Parts Request Ranking
const partsRequestData = [
  { part: "Oil Filter", requests: 45 },
  { part: "Spark Plug", requests: 38 },
  { part: "Air Filter", requests: 30 },
  { part: "Fuel Pump", requests: 22 },
  { part: "Brake Pad", requests: 17 },
];

// Campaign participation
const campaignParticipation = [
  { name: "Participated", value: 61 },
  { name: "In Progress", value: 28 },
  { name: "No Response", value: 11 },
];

// Warranty by service center
const centerWarranty = [
  { center: "HCMC Center 1", claims: 18 },
  { center: "Hanoi Center", claims: 14 },
  { center: "Da Nang Center", claims: 10 },
];

const COLORS = ["#4F46E5", "#8B5CF6", "#A78BFA"];

export default function DashboardEVMSTAFF() {
  return (
    <div className="main-content">
      <div className="dashboard-wrapper">

        <div className="dashboard-header">
          <h1>Manufacturer Dashboard</h1>
        </div>

        {/* CARDS */}
        <div className="cards">
          <div className="card"><h4>Total Warranty Claims</h4><p>42</p></div>
          <div className="card"><h4>Total Parts Requests</h4><p>31</p></div>
          <div className="card"><h4>Active Campaigns</h4><p>3</p></div>
          <div className="card highlight-card">
            <h4>Campaign Participation (Across All Active Campaigns)</h4>
            <p>61%</p>
          </div>
        </div>

        {/* CHART GRID */}
        <div className="chart-grid">

          {/* Warranty - Line */}
          <div className="chart-box">
            <h3 className="chart-title">Warranty Claims Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={warrantyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="claims" stroke="#4F46E5" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
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
            </div>
            <div className="campaign-info">
              <h3>Campaign Status Breakdown</h3>
              {campaignParticipation.map((c, i) => (
                <p key={i}><strong>{c.name}:</strong> {c.value}%</p>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
