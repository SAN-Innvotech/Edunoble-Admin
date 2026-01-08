import Preloader from "@/components/common/Preloader";
import Testimonials from "@/components/dashboard/Testimonials";
import Sidebar from "@/components/dashboard/Sidebar";
import HeaderDashboard from "@/components/layout/headers/HeaderDashboard";
import React from "react";
import MetaComponent from "@/components/common/MetaComponent";

const metadata = {
  title: "Testimonials | Edunoble - Manage Testimonials",
  description:
    "Manage and view all testimonials from students. Browse testimonials about Edunoble's educational resources.",
};

export default function DshbTestimonialsPage() {
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
            <Testimonials />
          </div>
        </div>
      </main>
    </div>
  );
}

