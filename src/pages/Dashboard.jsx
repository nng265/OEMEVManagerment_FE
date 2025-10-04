import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { MENU_CONFIG } from "../configs/MenuConfig";
import { getVehicles } from "../services/vehicleService";
import Button from "../components/Button";
import InputText from "../components/InputText";
import CreateWarrantyRequest from "./CreateWarrantyRequest";
import "./Dashboard.css";
import AssignTechnician from "./AssignTechnician";
import EvmApproval from "./EvmApproval";
import UpdateStatus from "./UpdateStatus";
import SendToEvm from "./SendToStaff";

function WarrantyRecords({ onCreate }) {
  const [vehicles, setVehicles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [vin, setVin] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getVehicles();
        const safeData = Array.isArray(data) ? data : [];
        setVehicles(safeData);
        setFiltered(safeData);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
      }
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    if (!vin.trim()) {
      setFiltered(vehicles);
    } else {
      setFiltered(
        vehicles.filter((v) => v.vin.toLowerCase().includes(vin.toLowerCase()))
      );
    }
  };

  return (
    <div className="warranty-records">
      <h2>📑 Hồ sơ bảo hành</h2>

      <div className="search-bar">
        <InputText
          value={vin}
          onChange={(e) => setVin(e.target.value)}
          placeholder="Nhập số VIN..."
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
          {filtered.map((v) => (
            <tr key={v.vin}>
              <td>{v.vin}</td>
              <td>{v.model}</td>
              <td>{v.purchaseDate}</td>
              <td>{v.status}</td>
              <td>{Array.isArray(v.history) ? v.history.join(", ") : ""}</td>
              <td>
                <Button onClick={() => onCreate(v.vin)}>
                  + Yêu cầu bảo hành
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState("ho so"); // 👈 mặc định mở Hồ sơ
  const [searchText, setSearchText] = useState("");
  const [role, setRole] = useState(
    JSON.parse(localStorage.getItem("user"))?.role || "admin"
  );
  const [selectedVin, setSelectedVin] = useState("");

  const menuItems = MENU_CONFIG[role] || [];

  const renderContent = () => {
    switch (activeMenu) {
      case "ho so":
        return (
          <WarrantyRecords
            onCreate={(vin) => {
              setSelectedVin(vin);
              setActiveMenu("yeu cau");
            }}
          />
        );
      case "yeu cau":
        return <CreateWarrantyRequest vinProp={selectedVin} />;
      case "phan cong":
        return <AssignTechnician />;
      case "evm_approval":
        return <EvmApproval />;
      case "update_status":
        return <UpdateStatus />;
      case "send_update":
        return <SendToEvm />;
      default:
        return <div>Chọn một chức năng</div>;
    }
  };

  return (
    <div className="dashboard d-flex flex-column" style={{ height: "100vh" }}>
      <Navbar role={role} setRole={setRole} />

      <div className="d-flex flex-grow-1">
        <Sidebar
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          searchText={searchText}
          setSearchText={setSearchText}
          menuItems={menuItems}
        />
        <div className="flex-grow-1 p-4">{renderContent()}</div>
      </div>
    </div>
  );
}
