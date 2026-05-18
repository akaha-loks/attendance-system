import Navbar from "./Navbar";

import Sidebar from "./Sidebar";

import "../styles/layout.css";

function Layout({ children }) {
  return (
    <div className="layout-shell">
      <Navbar />

      <div className="layout-body">
        <Sidebar />

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
