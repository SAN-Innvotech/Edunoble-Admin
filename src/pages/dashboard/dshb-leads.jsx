import Preloader from "@/components/common/Preloader";
import Leads from "@/components/dashboard/Leads";
import Sidebar from "@/components/dashboard/Sidebar";
import HeaderDashboard from "@/components/layout/headers/HeaderDashboard";
import React from "react";
import MetaComponent from "@/components/common/MetaComponent";

const metadata = {
  title: "Leads | Edunoble - Manage Student Leads",
  description:
    "Manage and view all student leads with their contact information and details.",
};

export default function DshbLeadsPage() {
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
            <Leads />
          </div>
        </div>
      </main>
    </div>
  );
}
