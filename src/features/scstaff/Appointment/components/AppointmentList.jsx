import React from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
import { DataTable } from "../../../../components/organisms/DataTable/DataTable";
import "../../../scstaff/Campaign/components/CampaignList.css";

const renderStatus = (value) => {
  let statusClass = "status-";
  if (value === "Pending") statusClass += "draft";
  else if (value === "Scheduled") statusClass += "active";
  else statusClass += "closed";

  const displayText = value
    ? value.charAt(0).toUpperCase() + value.slice(1)
    : "Unknown";

  return <span className={`status-badge ${statusClass}`}>{displayText}</span>;
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
        <Button
          variant="primary"
          style={{ marginLeft: "auto" }} // <-- đẩy nút sang phải
          onClick={onAdd}
        >
          + Add Appointment
        </Button>
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
