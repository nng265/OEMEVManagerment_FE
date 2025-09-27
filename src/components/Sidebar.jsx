import "./Sidebar.css";
import InputText from "./InputText";
import Button from "./Button";

export default function Sidebar({
  activeMenu,
  setActiveMenu,
  searchText,
  setSearchText,
  menuItems = [], // thêm menuItems
}) {
  return (
    <div className="sidebar p-3">
      {/* Search bar */}
      <InputText
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search..."
        className="mb-3"
      />

      {/* Menu list */}
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.id}>
            <Button
              className={activeMenu === item.id ? "active" : ""}
              onClick={() => setActiveMenu(item.id)}
            >
              {item.label}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
