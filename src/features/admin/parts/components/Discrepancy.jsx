import React from "react";
import PropTypes from "prop-types";
import "./PartList.css";

export default function Discrepancy({
  request,
  onClose,
  onReport,
  resolutionOptions,
  loadingOptions,
  optionError,
}) {
  if (!request) return null;

  /** --------------------------------------------------------
   * Build issues list from order items
   * -------------------------------------------------------- */
  const issues = (request.partOrderItems || []).flatMap((item) => {
    const arr = [];

    const model = item.model;

    // lấy receipts theo model
    const receivedSerials = (request.receipts || [])
      .filter((r) => r.model === model && r.status === "Received")
      .map((r) => r.serialNumber);

    // damaged receipts
    const damagedSerials = (request.receipts || [])
      .filter((r) => r.model === model && r.status === "Damaged")
      .map((r) => r.serialNumber);

    // all shipped
    const shippedSerials = (request.shipments || [])
      .filter((s) => s.model === model)
      .map((s) => s.serialNumber);

    // missing serials = shipped - received - damaged
    const missingSerials = shippedSerials.filter(
      (sn) => !receivedSerials.includes(sn) && !damagedSerials.includes(sn)
    );

    // ---- PUSH DAMAGED ITEMS ----
    damagedSerials.forEach((sn) => {
      arr.push({
        type: "Damaged",
        quantity: 1,
        model,
        serial: sn,
        note: item.remarks || "",
      });
    });

    // ---- PUSH SHORTAGE ITEMS ----
    missingSerials.forEach((sn) => {
      arr.push({
        type: "Shortage",
        quantity: 1,
        model,
        serial: sn,
        note: item.remarks || "",
      });
    });

    return arr;
  });

  /** --------------------------------------------------------
   * STATE: store decision per issue row
   * -------------------------------------------------------- */
  const [decisions, setDecisions] = React.useState(
    issues.map(() => ({
      responsibleParty: "",
      action: "",
      note: "",
    }))
  );

  const [overallNote, setOverallNote] = React.useState("");

  const updateDecision = (idx, field, value) => {
    const newArr = [...decisions];
    newArr[idx][field] = value;
    setDecisions(newArr);
  };

  /** --------------------------------------------------------
   * Handle Submit
   * -------------------------------------------------------- */
  const handleSubmit = () => {
    const partResolutions = issues.map((it, idx) => ({
      serialNumber: it.serial,
      model: it.model,
      discrepancyType: it.type, // "Damaged" | "Shortage" | "Excess"
      responsibleParty: decisions[idx].responsibleParty,
      action: decisions[idx].action,
      note: decisions[idx].note || it.note || "",
    }));

    console.log("Submitting resolutions:", partResolutions);

    onReport?.({
      orderId: request.orderId,
      partResolutions,
      overallNote,
    });
  };

  /** --------------------------------------------------------
   * Dropdown data mapping
   * -------------------------------------------------------- */
  const {
    discrepancyTypes = [],
    responsibleParties = [],
    damagedPartActions = [],
    excessPartActions = [],
    shortagePartActions = [],
  } = resolutionOptions || {};

  const getActionOptions = (type) => {
    if (type === "Damaged") return damagedPartActions;
    if (type === "Excess") return excessPartActions;
    return shortagePartActions; // Shortage
  };

  return (
    <div
      className="pl-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="pl-container discrepancy">
        <div className="pl-header">
          <h3>Discrepancy Resolution</h3>
          <button className="pl-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="pl-content">
          {/* ----------------------- */}
          {/*       BASIC INFO        */}
          {/* ----------------------- */}
          <div className="pl-info-row">
            <strong>Ticket #:</strong> {request.orderId}
          </div>
          <div className="pl-info-row">
            <strong>Service Center:</strong> {request.serviceCenterName}
          </div>

          {/* ----------------------- */}
          {/*       ISSUES TABLE      */}
          {/* ----------------------- */}
          <h3 className="pl-section-title">Issues Summary</h3>

          {loadingOptions && <div>Loading options…</div>}
          {optionError && <div style={{ color: "red" }}>{optionError}</div>}

          {issues.map((it, idx) => {
            const actions = getActionOptions(it.type);

            return (
              <div
                key={idx}
                style={{
                  border: "1px solid #ddd",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              >
                <strong>
                  {idx + 1}. [{it.type}] {it.quantity} × {it.model} (SN:{" "}
                  {it.serial})
                </strong>

                {/* responsible party */}
                <div className="pl-field">
                  <label className="pl-label">Responsible Party</label>
                  <select
                    className="pl-input"
                    value={decisions[idx].responsibleParty}
                    onChange={(e) =>
                      updateDecision(idx, "responsibleParty", e.target.value)
                    }
                  >
                    <option value="">Select…</option>
                    {responsibleParties.map((rp) => (
                      <option key={rp.value} value={rp.value}>
                        {rp.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* action to perform */}
                <div className="pl-field">
                  <label className="pl-label">Action</label>
                  <select
                    className="pl-input"
                    value={decisions[idx].action}
                    onChange={(e) =>
                      updateDecision(idx, "action", e.target.value)
                    }
                  >
                    <option value="">Select Action…</option>
                    {actions.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* note */}
                <div className="pl-field">
                  <label className="pl-label">Note</label>
                  <textarea
                    className="pl-textarea"
                    value={decisions[idx].note}
                    onChange={(e) =>
                      updateDecision(idx, "note", e.target.value)
                    }
                  />
                </div>
              </div>
            );
          })}

          {/* ------------------------ */}
          {/*      Overall Note        */}
          {/* ------------------------ */}
          <h3 className="pl-section-title">Overall Notes</h3>
          <textarea
            className="pl-textarea"
            rows={3}
            value={overallNote}
            onChange={(e) => setOverallNote(e.target.value)}
          />

          {/* ------------------------ */}
          {/*         Actions          */}
          {/* ------------------------ */}
          <div className="pl-actions" style={{ display: "flex", gap: 12 }}>
            <button className="pl-btn-secondary" onClick={onClose}>
              Close
            </button>
            <button className="pl-btn-primary" onClick={handleSubmit}>
              Submit Resolution
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Discrepancy.propTypes = {
  request: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onReport: PropTypes.func,
  resolutionOptions: PropTypes.object,
  loadingOptions: PropTypes.bool,
  optionError: PropTypes.string,
};
