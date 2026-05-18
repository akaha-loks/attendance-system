import { NavLink } from "react-router-dom";

import "../styles/sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          isActive ? "sidebar-link active" : "sidebar-link"
        }
      >
        Панель управления
      </NavLink>

      <NavLink
        to="/groups"
        className={({ isActive }) =>
          isActive ? "sidebar-link active" : "sidebar-link"
        }
      >
        Группы
      </NavLink>

      <NavLink
        to="/students"
        className={({ isActive }) =>
          isActive ? "sidebar-link active" : "sidebar-link"
        }
      >
        Студенты
      </NavLink>

      <NavLink
        to="/attendance"
        className={({ isActive }) =>
          isActive ? "sidebar-link active" : "sidebar-link"
        }
      >
        Посещаемость
      </NavLink>
    </aside>
  );
}

export default Sidebar;
