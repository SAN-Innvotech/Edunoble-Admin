import Preloader from "@/components/common/Preloader";
import HomepageContent from "@/components/dashboard/HomepageContent";
import Sidebar from "@/components/dashboard/Sidebar";
import HeaderDashboard from "@/components/layout/headers/HeaderDashboard";
import React from "react";
import MetaComponent from "@/components/common/MetaComponent";

const metadata = {
  title: "Homepage Content | Edunoble - Manage Homepage Content",
  description:
    "Manage and edit all homepage content sections including hero, features, statistics, and more.",
};

export default function DshbHomepageContentPage() {
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
            <HomepageContent />
          </div>
        </div>
      </main>
    </div>
  );
}
