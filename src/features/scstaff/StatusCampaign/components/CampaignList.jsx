import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
import { DataTable } from "../../../../components/organisms/DataTable/DataTable";

import WaitingForRepair from "./WaitingForRepair";
import UnderRepair from "./UnderRepair";
import Repaired from "./Repaired";
import Done from "./Done";
import "./CampaignList.css";

const CampaignList = ({
  data = [],
  loading = false,
  error = null,
  pagination = {},
  onPageChange,
  // onSearchVin,
  // onFilterStatus,
  onRefresh, // passed from container
}) => {
  // const [vinQuery, setVinQuery] = useState("");
  // const [statusFilter, setStatusFilter] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);

  const columns = useMemo(
    () => [
      { key: "vin", label: "VIN", sortable: true },
      { key: "customer", label: "Customer", sortable: true },
      { key: "type", label: "Title", sortable: true },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (value) => {
          const normalizedStatus = (value || "unknown").trim().toLowerCase();
          const statusClass = normalizedStatus.replace(/\s+/g, "-");
          const displayText =
            value && value.length > 0
              ? value.charAt(0).toUpperCase() + value.slice(1)
              : "Unknown";

          return (
            <span className={`status-badge status-${statusClass}`}>
              {displayText}
            </span>
          );
        },
      },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (_, row) => (
          <Button
            size="small"
            variant="light"
            onClick={() => setSelectedRow(row)}
          >
            <img
              src="../../../../../public/eye.png"
              className="eye-svg"
              style={{ width: "22px" }}
            />
          </Button>
        ),
      },
    ],
    []
  );

  const totalRecords = pagination.totalRecords ?? data.length;
  const pageNumber = pagination.pageNumber ?? 0;
  const pageSize = pagination.pageSize ?? 10;

  // const toolbarActions = (
  //   <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
  //     <input
  //       type="text"
  //       placeholder="Filter VIN..."
  //       value={vinQuery}
  //       onChange={(e) => {
  //         setVinQuery(e.target.value);
  //         onSearchVin?.(e.target.value);
  //       }}
  //       style={{ padding: 8, minWidth: 200 }}
  //     />

  //     <select
  //       value={statusFilter}
  //       onChange={(e) => {
  //         setStatusFilter(e.target.value);
  //         onFilterStatus?.(e.target.value);
  //       }}
  //       style={{ padding: 8 }}
  //     >
  //       <option value="">All Status</option>
  //       <option value="WAITING_FOR_REPAIR">waiting for unassigned repair</option>
  //       <option value="UNDER_REPAIR">under repair</option>
  //       <option value="REPAIRED">repaired</option>
  //       <option value="DONE">done</option>
  //     </select>

  //     <Button
  //       variant="secondary"
  //       onClick={() => {
  //         setVinQuery("");
  //         setStatusFilter("");
  //         onSearchVin?.("");
  //         onFilterStatus?.("");
  //       }}
  //     >
  //       Clear
  //     </Button>
  //   </div>
  // );

  return (
    <div className="campaign-table">
      <h1 className="size-h1">Campaign Vehicles</h1>

      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}

      <DataTable
        data={data}
        columns={columns}
        isLoading={loading}
        serverSide
        pagination
        totalRecords={totalRecords}
        currentPage={pageNumber}
        pageSize={pageSize}
        onPageChange={onPageChange}
        // toolbarActions={toolbarActions}
        noDataMessage="No records found"
      />

      {/* dynamic modal chooser */}
      {selectedRow &&
        selectedRow.status === "waiting for unassigned repair" && (
          <WaitingForRepair
            open
            data={selectedRow}
            onClose={() => setSelectedRow(null)}
            onSuccess={() => {
              setSelectedRow(null);
              onRefresh?.();
            }}
          />
        )}

      {selectedRow && selectedRow.status === "under repair" && (
        <UnderRepair
          open
          data={selectedRow}
          onClose={() => setSelectedRow(null)}
          onSuccess={() => {
            setSelectedRow(null);
            onRefresh?.();
          }}
        />
      )}

      {selectedRow && selectedRow.status === "repaired" && (
        <Repaired
          open
          data={selectedRow}
          onClose={() => setSelectedRow(null)}
          onSuccess={() => {
            setSelectedRow(null);
            onRefresh?.();
          }}
        />
      )}

      {selectedRow && selectedRow.status === "done" && (
        <Done open data={selectedRow} onClose={() => setSelectedRow(null)} />
      )}
    </div>
  );
};

CampaignList.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.any,
  pagination: PropTypes.object,
  onPageChange: PropTypes.func,
  onSearchVin: PropTypes.func,
  onFilterStatus: PropTypes.func,
  onRefresh: PropTypes.func,
};

export default CampaignList;
