import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div>
      <Navbar />

      <div className="layout">
        <Sidebar />

        <div className="content">{children}</div>
      </div>
    </div>
  );
}

export default Layout;
