import React from "react";
import PropTypes from "prop-types";
import "./AccountList.css";
import { DataTable } from "../../../../components/organisms/DataTable/DataTable";
import { Button } from "../../../../components/atoms/Button/Button";

const AccountList = ({
  data = [],
  loading = false,
  error = null,
  pagination = {}, // <-- KHÔI PHỤC LẠI
  serverSide = false,
  onPageChange, // <-- KHÔI PHỤC LẠI
  onSearch,
  onFilterStatus,
  onRefresh,
  refreshing = false,
  onCreateAccount,
  onViewAccount,
  onEditAccount,
  onDeleteAccount,
}) => {
  const columns = [
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "organizationName", label: "Organization" },
    {
      key: "action",
      label: "Action",
      render: (_v, row) => (
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <Button
            size="small"
            variant="light"
            onClick={() => onViewAccount?.(row)}
          >
            <img
              src="../../../../../public/eye.png"
              alt="view"
              className="eye-svg"
              style={{ width: "22px" }}
            />
          </Button>

          {/* EDIT */}
          <Button
            size="small"
            variant="light"
            onClick={() => onEditAccount(row.raw)}
          >
            Edit
          </Button>

          <Button
            size="small"
            variant="light"
            onClick={() => onDeleteAccount(row.raw)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const rows = data.map((p) => ({
    userId: p.userId,
    email: p.email,
    role: p.role,
    organizationName: p.organizationName,
    raw: p.__raw ?? p,
  }));

  return (
    <div className="account-table">
      <div
        className="account-table__header"
        style={{ display: "flex", alignItems: "center" }}
      >
        <h2 className="size-h1">Account Management</h2>
        <Button
          size="small"
          variant="light"
          onClick={() => onCreateAccount?.()}
          style={{ marginLeft: "auto" }}
        >
          <img
            src="../../../../../public/add.png"
            alt="Create Account"
            style={{ width: "45px" }}
          />
        </Button>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        isLoading={loading}
        searchable={true}
        pagination={true} // Vẫn bật
        serverSide={serverSide} // Vẫn false
        // --- KHÔI PHỤC CÁC PROPS PHÂN TRANG ---
        // DataTable cần biết tổng số record (từ container)
        totalRecords={pagination.totalRecords ?? rows.length}
        // DataTable cần biết trang hiện tại (từ container)
        currentPage={pagination.pageNumber ?? 0}
        // DataTable cần biết kích thước trang (từ container)
        pageSize={pagination.pageSize ?? 10}
        // DataTable cần gọi hàm này khi người dùng bấm (từ container)
        onPageChange={onPageChange}
        // ------------------------------------

        noDataMessage={error ? String(error) : "No accounts found"}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onSearch={onSearch}
        onFilterStatus={onFilterStatus}
      />
    </div>
  );
};

// --- KHÔI PHỤC LẠI propTypes ---
AccountList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  pagination: PropTypes.shape({
    totalRecords: PropTypes.number,
    pageNumber: PropTypes.number,
    pageSize: PropTypes.number,
  }),
  serverSide: PropTypes.bool,
  onPageChange: PropTypes.func,
  onSearch: PropTypes.func,
  onFilterStatus: PropTypes.func,
  onRefresh: PropTypes.func,
  refreshing: PropTypes.bool,
  onCreateAccount: PropTypes.func,
  onViewAccount: PropTypes.func,
  onEditAccount: PropTypes.func,
  onDeleteAccount: PropTypes.func,
};

export default AccountList;
