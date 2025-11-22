import React from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
import { DataTable } from "../../../../components/organisms/DataTable/DataTable";
import "./AppointmentList.css";

const renderStatus = (value) => {
  if (!value) return <span className="status-badge status-unknown">Unknown</span>;

  // chuẩn hoá text về dạng class
  const normalized = value
    .toLowerCase()
    .replace(/[\s-]/g, "_")        // space hoặc - → _
    .replace(/__+/g, "_")          // bỏ double _
    .trim();

  // chuyển sang class
  const statusMap = {
    pending: "pending",
    not_confirmed: "not-confirmed",
    scheduled: "scheduled",
    confirmed: "confirmed",
    done: "done",
    canceled: "cancelled",
    cancelled: "cancelled",
    no_show: "no-show",
    checked_in: "checked-in",
  };

  const className = statusMap[normalized] || "unknown";

  const displayText =
    value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Unknown";

  return <span className={`status-badge status-${className}`}>{displayText}</span>;
};



const AppointmentList = ({
  data = [],
  loading = false,
  error = null,
  pagination = {},
  onView,
  onAdd,
  onPageChange,
  onRefresh,
  refreshing = false,
}) => {
  const columns = [
    { key: "customerName", label: "Customer name" },
    { key: "vin", label: "Vin" },
    { key: "appointmentType", label: "Type" },
    { key: "appointmentDate", label: "Date" },
    {
      key: "status",
      label: "Status",
      render: (value) => renderStatus(value),
    },
    {
      key: "action",
      label: "Actions",
      render: (_v, row) => (
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <Button size="small" variant="light" onClick={() => onView?.(row)}>
            <img src="/eye.png" style={{ width: "22px" }} alt="View" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="campaign-table">
      <div
        className="campaign-table__header"
        style={{ display: "flex", alignItems: "center" }}
      >
        <h2 className="size-h1">Appointment Management</h2>
<<<<<<< Updated upstream
        <Button variant="light" style={{ marginLeft: "auto" }} onClick={onAdd}>
          <img
            src="../../../../../public/add.png"
            alt="Create Appointment"
            style={{ width: "18px" }}
          />
        </Button>
=======

        <div className="appointment-table__right">
          <Button
            variant="light"
            style={{ marginLeft: "auto" }}
            onClick={onAdd}
          >
            <img
              src="../../../../../public/add.png"
              alt="Create Appointment"
              style={{ width: "40px" }}
            />
          </Button>
        </div>
>>>>>>> Stashed changes
      </div>

      <DataTable
        data={data}
        columns={columns}
        isLoading={loading}
        searchable={false}
        pagination
        serverSide={true}
        totalRecords={pagination.totalRecords ?? data.length}
        currentPage={pagination.pageNumber ?? 0}
        pageSize={pagination.pageSize ?? 10}
        onPageChange={onPageChange}
        noDataMessage={error ? String(error) : "No appointments found"}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
    </div>
  );
};

AppointmentList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  pagination: PropTypes.shape({
    totalRecords: PropTypes.number,
    pageNumber: PropTypes.number,
    pageSize: PropTypes.number,
  }),
  onView: PropTypes.func,
  onAdd: PropTypes.func.isRequired,
  onPageChange: PropTypes.func,
  onRefresh: PropTypes.func,
  refreshing: PropTypes.bool,
};

export default AppointmentList;
