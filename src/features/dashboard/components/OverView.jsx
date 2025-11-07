import { Card, CardContent, Typography, MenuItem, Select } from "@mui/material";
import { BarChart, Bar, Tooltip, Legend, XAxis, YAxis } from "recharts";

export default function OverView({
  stats,
  loading,
  selectedUnit,
  onUnitChange,
}) {
  if (loading) return <p>Loading dashboard...</p>;

  const kpiStyle = {
    flex: "1 1 260px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "8px",
    background: "#fff",
    borderRadius: "14px",
    padding: "20px 24px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    position: "relative",
  };

  return (
    <div style={{ padding: 24, background: "#f5f7fb", minHeight: "100vh" }}>
      {/* ✅ KPI Cards */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          marginBottom: "32px",
          flexWrap: "wrap",
        }}
      >
        {[
          {
            label: "Total Tasks",
            value: stats.total,
            color: "#2563eb",
            icon: "📌",
          },
          {
            label: "In Progress",
            value: stats.inProgress,
            color: "#eab308",
            icon: "⚙️",
          },
          {
            label: "Completed",
            value: stats.completed,
            color: "#22c55e",
            icon: "✅",
          },
        ].map((item, i) => (
          <div key={i} style={{ ...kpiStyle }}>
            {/* ✅ Icon nền mờ giống ảnh */}
            <div
              style={{
                position: "absolute",
                right: 16,
                top: 12,
                fontSize: "32px",
                opacity: 0.15,
                color: item.color,
              }}
            >
              {item.icon}
            </div>

            <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.7 }}>
              {item.label}
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", color: item.color }}
            >
              {item.value}
            </Typography>
          </div>
        ))}
      </div>

      {/* ✅ Filter Unit */}
      <Typography variant="body1" sx={{ mb: 1 }}>
        Filter by Period
      </Typography>
      <Select
        size="small"
        sx={{ mb: 3, width: 160, background: "#fff" }}
        value={selectedUnit}
        onChange={(e) => onUnitChange(e.target.value)}
      >
        <MenuItem value="m">Current Month</MenuItem>
        <MenuItem value="y">Current Year</MenuItem>
      </Select>

      {/* ✅ Chart Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
          border: "1px solid #e6e6e6",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div>
          <Typography
            variant="subtitle1"
            sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}
          >
            Target & Task Type Breakdown
          </Typography>

          <BarChart
            width={520}
            height={340}
            data={[
              {
                target: "Warranty",
                inspection: stats.inspection,
                repair: Math.max(stats.warranty - stats.inspection, 0),
              },
              { target: "Campaign", inspection: 0, repair: stats.campaign },
            ]}
          >
            <XAxis dataKey="target" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="inspection" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="repair" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </div>
      </div>
    </div>
  );
}
