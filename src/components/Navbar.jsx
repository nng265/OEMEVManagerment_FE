import "./Navbar.css";
import DropdownList from "./DropdownList";

export default function Navbar({ role, setRole }) {
  return (
    <nav className="custom-navbar navbar navbar-expand-lg navbar-light px-3">
      <span className="logo navbar-brand fw-bold">LOGO</span>
      <div className="ms-auto d-flex align-items-center">
        <DropdownList
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={[
            { value: "admin", label: "Admin" },
            { value: "sc staff", label: "SC Staff" },
            { value: "sc technican", label: "SC Technican" },
          ]}
          className="me-3"
          style={{ width: "150px" }}
        />
        <div
          className="rounded-circle bg-secondary d-flex justify-content-center align-items-center text-white"
          style={{ width: "40px", height: "40px" }}
        >
          NA
        </div>
      </div>
    </nav>
  );
}
