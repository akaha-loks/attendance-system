import { useState } from "react";

import ConfirmModal from "./ConfirmModal";

import "../styles/navbar.css";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href = "/";
  };

  return (
    <header className="navbar">
      <div className="navbar-logo">
        <div className="navbar-title">Attendance System</div>

        <div className="navbar-subtitle">
          Платформа для автоматизации учета посещаемости
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-user">
          <div className="navbar-username">{user?.name}</div>

          <div className="navbar-role">Преподаватель</div>
        </div>

        <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
          Выйти
        </button>
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        title="Выход"
        message="Вы уверены, что хотите выйти из аккаунта?"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </header>
  );
}

export default Navbar;
