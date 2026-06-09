import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useState, useEffect } from "react";

const MasterLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed inset-0 flex bg-color-light-gray overflow-hidden  w-full">
      {/* Overlay (mobile) */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobile={isMobile}
        open={open}
        setOpen={setOpen}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header
        collapsed={collapsed}
          toggleSidebar={() =>
            isMobile ? setOpen(true) : setCollapsed((prev) => !prev)
          }
        />
        <main className="flex-1 min-w-0 overflow-y-auto bg-secondary">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MasterLayout;
