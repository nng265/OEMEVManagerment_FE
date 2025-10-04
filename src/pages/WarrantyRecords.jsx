import React, { useState, useEffect } from "react";
import { getVehicles } from "../services/vehicleService";
import InputText from "../components/InputText";
import Button from "../components/Button";
import "./WarrantyRecords.css";

/**
 * Props:
 *  - onCreate(vin) : callback khi bấm + Yêu cầu bảo hành
 */
export default function WarrantyRecords({ onCreate }) {
  const [vehicles, setVehicles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [vinSearch, setVinSearch] = useState("");

  useEffect(() => {
    (async () => {
      const data = await getVehicles();
      setVehicles(data || []);
      setFiltered(data || []);
    })();
  }, []);

  const handleSearch = () => {
    if (!vinSearch.trim()) {
      setFiltered(vehicles);
    } else {
      setFiltered(
        vehicles.filter((v) =>
          (v.vin || "").toLowerCase().includes(vinSearch.toLowerCase())
        )
      );
    }
  };

  return (
    <div className="warranty-records">
      <h2>📑 Hồ sơ bảo hành</h2>

      <div className="search-bar">
        <InputText
          value={vinSearch}
          onChange={(e) => setVinSearch(e.target.value)}
          placeholder="Nhập VIN để tìm..."
        />
        <Button onClick={handleSearch}>Tìm kiếm</Button>
      </div>

      <table className="records-table">
        <thead>
          <tr>
            <th>VIN</th>
            <th>Model</th>
            <th>Ngày mua</th>
            <th>Tình trạng</th>
            <th>Lịch sử</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            filtered.map((v) => (
              <tr key={v.vin}>
                <td>{v.vin}</td>
                <td>{v.model}</td>
                <td>{v.purchaseDate}</td>
                <td>{v.status}</td>
                <td>
                  {Array.isArray(v.history) ? v.history.join(", ") : v.history}
                </td>
                <td>
                  {/* Gọi onCreate để Dashboard chuyển sang menu "yeu cau" và giữ VIN */}
                  <Button onClick={() => onCreate(v.vin)}>
                    + Yêu cầu bảo hành
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
