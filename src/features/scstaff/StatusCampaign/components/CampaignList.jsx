import React, { useState, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { Button } from "../../../../components/atoms/Button/Button";
import { DataTable } from "../../../../components/organisms/DataTable/DataTable";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import { toast } from "react-toastify";

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
  onRefresh,
  refreshing = false,
}) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const pendingActionRef = useRef(null);

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
              src="/eye.png" // <-- dùng public path chuẩn
              alt="View"
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

  // --- optional confirm dialog handler nếu sau này dùng ---
  const performPendingAction = async () => {
    const action = pendingActionRef.current;
    if (!action) return;

    setIsActionLoading(true);
    try {
      // TODO: Thực hiện hành động xác nhận ở đây
      toast.success("Action confirmed successfully!");
    } catch (err) {
      console.error("Action failed:", err);
      toast.error("Action failed. Please try again.");
    } finally {
      setIsActionLoading(false);
      setIsConfirmOpen(false);
      pendingActionRef.current = null;
    }
  };

  // --- modal chọn theo status ---
  const normalizedStatus = selectedRow?.status
    ? selectedRow.status.trim().toLowerCase()
    : "";

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
        noDataMessage="No records found"
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      {/* Dynamic modal */}
      {normalizedStatus === "waiting for unassigned repair" && (
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

      {normalizedStatus === "under repair" && (
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

      {normalizedStatus === "repaired" && (
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

      {normalizedStatus === "done" && (
        <Done open data={selectedRow} onClose={() => setSelectedRow(null)} />
      )}

      {/* ConfirmDialog (dự phòng cho hành động khác) */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={performPendingAction}
        onCancel={() => setIsConfirmOpen(false)}
        isLoading={isActionLoading}
      />
    </div>
  );
};

CampaignList.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.any,
  pagination: PropTypes.object,
  onPageChange: PropTypes.func,
  onRefresh: PropTypes.func,
  refreshing: PropTypes.bool,
};

export default CampaignList;
