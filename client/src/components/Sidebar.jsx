import { NavLink } from 'react-router-dom';

function Sidebar() {

  return (

    <div className="sidebar">

      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          isActive
            ? 'sidebar-link active'
            : 'sidebar-link'
        }
      >
        Панель управления
      </NavLink>

      <NavLink
        to="/groups"
        className={({ isActive }) =>
          isActive
            ? 'sidebar-link active'
            : 'sidebar-link'
        }
      >
        Группы
      </NavLink>

      <NavLink
        to="/students"
        className={({ isActive }) =>
          isActive
            ? 'sidebar-link active'
            : 'sidebar-link'
        }
      >
        Студенты
      </NavLink>

      <NavLink
        to="/attendance"
        className={({ isActive }) =>
          isActive
            ? 'sidebar-link active'
            : 'sidebar-link'
        }
      >
        Посещаемость
      </NavLink>

    </div>

  );

}

export default Sidebar;