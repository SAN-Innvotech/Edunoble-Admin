import Preloader from "@/components/common/Preloader";
import PapersDashboard from "@/components/dashboard/PapersDashboard";
import Sidebar from "@/components/dashboard/Sidebar";
import HeaderDashboard from "@/components/layout/headers/HeaderDashboard";
import React from "react";

import MetaComponent from "@/components/common/MetaComponent";

const metadata = {
  title:
    "Sample Papers for Class 8, 9, 10, 11 & 12 | Edunoble - Free Practice Papers",
  description:
    "Browse and practice with free sample papers for Class 8, 9, 10, 11, and 12 students. CBSE, ICSE, and State Board sample papers available in secure online viewing environment.",
};

export default function DshbCoursesPage() {
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
            <PapersDashboard />
          </div>
        </div>
      </main>
    </div>
  );
}
