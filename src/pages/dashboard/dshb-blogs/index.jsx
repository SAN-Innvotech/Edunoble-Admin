import Preloader from "@/components/common/Preloader";
import Blogs from "@/components/dashboard/Blogs";
import Sidebar from "@/components/dashboard/Sidebar";
import HeaderDashboard from "@/components/layout/headers/HeaderDashboard";
import React from "react";
import MetaComponent from "@/components/common/MetaComponent";

const metadata = {
  title: "Blogs | Edunoble - Manage Blog Articles",
  description:
    "Manage and publish blog articles for Edunoble. Create, edit, and organize blog content.",
};

export default function DshbBlogsPage() {
  return (
    <div className="barba-container" data-barba="container">
      <MetaComponent meta={metadata} />
      <main className="main-content">
        {/* <Preloader /> */}
        <HeaderDashboard />
        <div className="content-wrapper js-content-wrapper overflow-hidden">
          <div
            id="dashboardOpenClose"
            className="dashboard -home-9 js-dashboard-home-9"
          >
            <div className="dashboard__sidebar scroll-bar-1">
              <Sidebar />
            </div>
            <Blogs />
          </div>
        </div>
      </main>
    </div>
  );
}
