import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { request, ApiEnum } from "../../../../services/NetworkUntil";
import { Button } from "../../../../components/atoms/Button/Button";
import { ConfirmDialog } from "../../../../components/molecules/ConfirmDialog/ConfirmDialog";
import Modal from "../../../../components/molecules/Modal/Modal";
import { toast } from "react-toastify";
import "./CampaignDetailPage.css";

const formatStatus = (raw) => {
  if (!raw || raw === "-") return "-";
  const s = String(raw);
  const map = {
    NoResponse: "No Response",
    InProgress: "In Progress",
    EmailSent: "Email Sent",
    Completed: "Completed",
    Scheduled: "Scheduled",
    Closed: "Closed",
  };
  if (map[s]) return map[s];

  const replaced = s
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .trim();

  return replaced
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const CampaignDetailPage = ({ campaign: propCampaign = null, id: propId = null, onClose = null }) => {
  const params = useParams();
  const paramId = params?.id;
  const id = propId ?? paramId;
  const location = useLocation();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(
    propCampaign ?? location.state?.campaign ?? null
  );
  const [vehicleStatuses, setVehicleStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [closing, setClosing] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  const openVehicleModal = (v) => {
    setSelectedVehicle(v);
    setShowVehicleModal(true);
  };

  const closeVehicleModal = () => {
    setSelectedVehicle(null);
    setShowVehicleModal(false);
  };

  useEffect(() => {}, [id]);

  useEffect(() => {
    const loadStatuses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await request(ApiEnum.CAMPAIGN_VEHICLE_STATUSES, {
          params: { id },
        });
        const items = Array.isArray(res) ? res : res?.data ?? [];
        setVehicleStatuses(items);
      } catch (err) {
        console.error("Failed to load campaign vehicle statuses:", err);
        setError("Unable to load vehicle statuses.");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadStatuses();
  }, [id]);

  const goBack = () => {
    if (typeof onClose === "function") return onClose();
    return navigate(-1);
  };

  return (
    <div className="campaign-detail-page" style={{ padding: 24 }}>
      <h2 className="campaign-section-title">Details</h2>

      <div className="campaign-info-container">
        <div className="campaign-info-card">
          <div className="campaign-info-label">Campaign Type</div>
          <div className="campaign-info-value">
            {campaign?.type ?? campaign?._raw?.type ?? "-"}
          </div>
        </div>

        <div className="campaign-info-card">
          <div className="campaign-info-label">Target Part / Vehicle</div>
          <div className="campaign-info-value">
            {campaign?.target ?? campaign?._raw?.partModel ?? "-"}
          </div>
        </div>

        <div className="campaign-info-card">
          <div className="campaign-info-label">Campaign Period:</div>
          <div className="campaign-info-value">
            {campaign?.period ?? campaign?._raw?.period ?? "-"}
          </div>
        </div>

        <div className="campaign-info-card">
          <div className="campaign-info-label">Description:</div>
          <div className="campaign-info-value">
            {campaign?.description ?? campaign?._raw?.description}
          </div>
        </div>
      </div>

      <h2 className="campaign-section-title">Campaign Statistics</h2>

      <div className="campaign-info-row">
        <div className="campaign-info-block stat-block">
          <span className="info-block-label">Affected</span>
          <span className="info-block-value large-stat">
            {campaign?.totalAffectedVehicles || 0}
          </span>
        </div>

        <div className="campaign-info-block stat-block">
          <span className="info-block-label">Scheduled</span>
          <span className="info-block-value large-stat">
            {campaign?.pendingVehicles || 0}
          </span>
        </div>

        <div className="campaign-info-block stat-block">
          <span className="info-block-label">In Progress</span>
          <span className="info-block-value large-stat">
            {campaign?.inProgressVehicles || 0}
          </span>
        </div>

        <div className="campaign-info-block stat-block">
          <span className="info-block-label">Completed</span>
          <span className="info-block-value large-stat">
            {campaign?.completedVehicles || 0}
          </span>
        </div>
      </div>

      {/* <h2 className="campaign-section-title">Vehicles</h2>

      {loading && <div>Loading vehicle statuses...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      <div className="campaign-table-wrapper" style={{ overflowX: "auto" }}>
        <table
          className="campaign-table"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>VIN</th>
              <th style={{ textAlign: "left", padding: 8 }}>Model</th>
              <th style={{ textAlign: "left", padding: 8 }}>Year</th>
              <th style={{ textAlign: "left", padding: 8 }}>Customer</th>
              <th style={{ textAlign: "left", padding: 8 }}>
                Email Sent Count
              </th>
              <th style={{ textAlign: "left", padding: 8 }}>Status</th>
              <th style={{ textAlign: "left", padding: 8 }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {vehicleStatuses.length === 0 && !loading && (
              <tr>
                <td colSpan={7} style={{ padding: 12 }}>
                  No vehicles found.
                </td>
              </tr>
            )}

            {vehicleStatuses.map((v, idx) => (
              <tr
                key={v.vin ?? v.id ?? idx}
                style={{ borderTop: "1px solid #eee" }}
              >
                <td style={{ padding: 8 }}>{v.vin ?? "-"}</td>
                <td style={{ padding: 8 }}>{v.model ?? "-"}</td>
                <td style={{ padding: 8 }}>{v.year ?? "-"}</td>
                <td style={{ padding: 8 }}>{v.customerName ?? "-"}</td>
                <td style={{ padding: 8 }}>{v.emailSentCount ?? 0}</td>
                <td style={{ padding: 8 }}>
                  {formatStatus(v.overallStatus ?? v.status ?? "-")}
                </td>
                <td style={{ padding: 8 }}>
                  <Button variant="link" onClick={() => openVehicleModal(v)}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}

      <div className="campaign-footer">
        <div>
          <Button variant="secondary" onClick={goBack}>
            Back
          </Button>
        </div>

        <div>
          {campaign?.status?.toString().toLowerCase() !== "closed" && (
            <Button variant="danger" onClick={() => setShowConfirm(true)}>
              Close Campaign
            </Button>
          )}
        </div>
      </div>

      <Modal
        isOpen={showVehicleModal}
        onClose={closeVehicleModal}
        title={
          selectedVehicle ? `Vehicle ${selectedVehicle.vin ?? ""}` : "Vehicle"
        }
        size="md"
        showFooter={false}
        centered
      >
        {selectedVehicle ? (
          <div className="campaign-modal">
            <h3 className="campaign-section-title">Vehicle Information</h3>

            <div className="campaign-info-row">
              <div className="campaign-info-block">
                <span className="info-block-label">VIN</span>
                <span className="info-block-value">
                  {selectedVehicle.vin ?? "-"}
                </span>
              </div>

              <div className="campaign-info-block">
                <span className="info-block-label">Model</span>
                <span className="info-block-value">
                  {selectedVehicle.model ?? "-"}
                </span>
              </div>

              <div className="campaign-info-block">
                <span className="info-block-label">Year</span>
                <span className="info-block-value">
                  {selectedVehicle.year ?? "-"}
                </span>
              </div>
            </div>

            <h3 className="campaign-section-title">Customer</h3>

            <div className="campaign-info-row">
              <div className="campaign-info-block full-width">
                <span className="info-block-label">Customer Name</span>
                <span className="info-block-value">
                  {selectedVehicle.customerName ?? "-"}
                </span>
              </div>

              <div className="campaign-info-block">
                <span className="info-block-label">Email</span>
                <span className="info-block-value">
                  {selectedVehicle.customerEmail ?? "-"}
                </span>
              </div>

              <div className="campaign-info-block">
                <span className="info-block-label">Phone</span>
                <span className="info-block-value">
                  {selectedVehicle.customerPhone ?? "-"}
                </span>
              </div>
            </div>

            <h3 className="campaign-section-title">Status</h3>

            <div className="campaign-info-row">
              <div className="campaign-info-block">
                <span className="info-block-label">Email Sent Count</span>
                <span className="info-block-value">
                  {selectedVehicle.emailSentCount ?? 0}
                </span>
              </div>

              <div className="campaign-info-block">
                <span className="info-block-label">Overall Status</span>
                <span className="info-block-value">
                  {formatStatus(
                    selectedVehicle.overallStatus ??
                      selectedVehicle.status ??
                      "-"
                  )}
                </span>
              </div>
            </div>

            <div className="campaign-footer">
              <Button variant="secondary" onClick={closeVehicleModal}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div>No vehicle selected.</div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Close Campaign"
        message="Are you sure you want to close this campaign?"
        confirmLabel="Close"
        cancelLabel="Cancel"
        isLoading={closing}
        onCancel={() => setShowConfirm(false)}
        onConfirm={async () => {
          if (!id) return;
          setClosing(true);
          try {
            await request(ApiEnum.CLOSE_CAMPAIGN, { params: { id } });
            toast.success("Campaign closed successfully");
            setShowConfirm(false);
            if (typeof onClose === "function") onClose();
            else navigate(-1);
          } catch (err) {
            console.error("Failed to close campaign:", err);
            toast.error("Failed to close campaign");
          } finally {
            setClosing(false);
          }
        }}
      />
    </div>
  );
};

export default CampaignDetailPage;
