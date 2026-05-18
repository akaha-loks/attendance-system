import { useState } from "react";

import ConfirmModal from "./ConfirmModal";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  };

  return (
    <div className="navbar">
      <h2>Attendance System</h2>

      <div>
        <span>{user?.name}</span>

        <button onClick={() => setShowLogoutModal(true)}>Выйти</button>

        <ConfirmModal
          isOpen={showLogoutModal}
          title="Выход"
          message="Вы уверены, что хотите выйти?"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      </div>
    </div>
  );
}

export default Navbar;
