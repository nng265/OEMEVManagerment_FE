// src/components/templates/DashboardLayout.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
// Giả định cấu trúc thư mục: components/templates, components/organisms, context, configs
import { Navbar } from "../../organisms/Navbar/Navbar"; // Sửa đường dẫn nếu cần
import { Sidebar } from "../../organisms/Sidebar/Sidebar"; // Sửa đường dẫn nếu cần
import { useAuth } from "../../../context/AuthContext"; // Sửa đường dẫn nếu cần
import { roleScreens } from "../../../configs/roleScreen"; // Sửa đường dẫn nếu cần

export const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedScreen, setSelectedScreen] = useState(null);

  // --- HÀM ÁNH XẠ ID SANG PATH ---
  const getPathForScreen = useCallback((screenId) => {
    switch (screenId) {
      case "dashboard":
        return "/dashboard";
      case "staff_vehicle":
        return "/vehicles"; // Path đã định nghĩa trong routes.jsx
      case "staff_warranty":
        return "/warranty"; // Path đã định nghĩa trong routes.jsx
      case "staff_parts_request":
        return "/parts-request"; // Path đã định nghĩa trong routes.jsx
      case "service_center_inventory":
        return "/inventory"; // Path đã định nghĩa trong routes.jsx
      case "technician_vehicle_status":
        return "/technician"; // Sửa lại path này cho khớp routes.jsx
      case "evm_warranty_claims":
        return "/evmstaff"; // Sửa lại path này cho khớp routes.jsx
      case "evm_parts_list":
        return "/evmpartslist"; // Sửa lại path này cho khớp routes.jsx
      case "evm_campaigns":
        return "/evmstaff_campaign";
      case "manufacturer_inventory":
        return "/evmstaff_inventory"; // Sửa lại path này cho khớp routes.jsx
      case "staff_campaign":
        return "/campaign";
      case "status_campaign":
        return "/Statuscampaign";
      // !!! QUAN TRỌNG: Kiểm tra và bổ sung/sửa tất cả các case khác cho khớp routes.jsx !!!
      default:
        console.warn(
          `Không tìm thấy ánh xạ path cụ thể cho screen ID: ${screenId}`
        );
        return null; // Trả về null nếu không có ánh xạ rõ ràng
    }
  }, []); // Hàm không đổi nên dependency rỗng
  // --- KẾT THÚC HÀM ÁNH XẠ ---

  // Đồng bộ selectedScreen với route hiện tại khi tải trang hoặc URL thay đổi
  useEffect(() => {
    if (user?.role) {
      const currentPath = location.pathname; // Lấy full path ví dụ: '/vehicles'
      const availableScreens = roleScreens[user.role] || [];

      // Tìm screen có path tương ứng với currentPath bằng hàm ánh xạ
      const screenForPath = availableScreens.find(
        (screen) => getPathForScreen(screen.id) === currentPath
      );

      const isDashboard = currentPath === "/dashboard" || currentPath === "/";
      setSelectedScreen(
        screenForPath ||
          (isDashboard ? { id: "dashboard", label: "Dashboard" } : null)
      );
    } else {
      setSelectedScreen(null); // Reset khi không có user
    }
  }, [location.pathname, user?.role, getPathForScreen]); // Thêm getPathForScreen vào dependencies

  // Hàm xử lý khi chọn screen mới trong Sidebar
  const handleSetSelectedScreen = (screen) => {
    setSelectedScreen(screen); // Cập nhật state highlight sidebar
    const path = getPathForScreen(screen.id); // Lấy path từ hàm ánh xạ
    if (path && path !== location.pathname) {
      // Chỉ navigate nếu path hợp lệ và khác path hiện tại
      console.log(
        `Navigating from Sidebar click to: ${path} (for screen ID: ${screen.id})`
      );
      navigate(path);
    } else if (!path) {
      console.warn(
        `No path defined for screen ID: ${screen.id}, navigation skipped.`
      );
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-layout">
      <Navbar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        // user={user} // Navbar tự lấy user qua useAuth()
      />
      <Sidebar
        role={user?.role}
        logout={handleLogout}
        isOpen={isSidebarOpen}
        selectedScreen={selectedScreen} // Truyền state hiện tại
        setSelectedScreen={handleSetSelectedScreen} // Truyền hàm xử lý click
      />
      <main
        className={`main-content ${
          isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"
        }`}
      >
        {/* Render nội dung của route con */}
        {children || <Outlet />}
      </main>
    </div>
  );
};

// Cân nhắc thêm export default nếu cần thiết cho cách bạn import
export default DashboardLayout;
