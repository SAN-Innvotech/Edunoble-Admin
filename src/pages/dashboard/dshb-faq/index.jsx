import Preloader from "@/components/common/Preloader";
import FAQ from "@/components/dashboard/FAQ";
import Sidebar from "@/components/dashboard/Sidebar";
import HeaderDashboard from "@/components/layout/headers/HeaderDashboard";
import React from "react";
import MetaComponent from "@/components/common/MetaComponent";

const metadata = {
  title: "FAQ Management | Edunoble - Manage Frequently Asked Questions",
  description:
    "Manage and view all FAQs. Add, edit, and organize frequently asked questions with order and active status.",
};

export default function DshbFAQPage() {
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
            <FAQ />
          </div>
        </div>
      </main>
    </div>
  );
}
