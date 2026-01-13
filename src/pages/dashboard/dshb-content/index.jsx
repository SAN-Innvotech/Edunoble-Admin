import Preloader from "@/components/common/Preloader";
import Content from "@/components/dashboard/Content";
import Sidebar from "@/components/dashboard/Sidebar";
import HeaderDashboard from "@/components/layout/headers/HeaderDashboard";
import React from "react";
import MetaComponent from "@/components/common/MetaComponent";

const metadata = {
  title: "Content Management | Edunoble - Manage About Us & Vision",
  description:
    "Manage and view all content for About Us and Vision pages. Edit content, images, and manage display order.",
};

export default function DshbContentPage() {
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
            <Content />
          </div>
        </div>
      </main>
    </div>
  );
}
