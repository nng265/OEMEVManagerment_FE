import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { MENU_CONFIG } from "../configs/MenuConfig";
import StaffApproval from "./StaffApproval";
import UpdateStatus from "./UpdateStatus";
import SendToStaff from "./SendToStaff";
import "./Dashboard.css";

export default function Dashboard() {
  // menu mặc định là "update_status"
  const [activeMenu, setActiveMenu] = useState("update_status");
  const [role, setRole] = useState(
    JSON.parse(localStorage.getItem("user"))?.role || "admin"
  );

  const [searchText, setSearchText] = useState("");

  const menuItems = MENU_CONFIG[role] || [];

  const renderContent = () => {
    switch (activeMenu) {
      case "update_status":
        return <UpdateStatus />;
      case "send_update":
        return <SendToStaff />;
      case "staff_approval":
        return <StaffApproval />;
      default:
        return <div>Vui lòng chọn chức năng ở menu bên trái</div>;
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
