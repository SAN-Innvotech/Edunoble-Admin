import Preloader from "@/components/common/Preloader";
import Courses from "@/components/dashboard/Courses";
import Sidebar from "@/components/dashboard/Sidebar";
import HeaderDashboard from "@/components/layout/headers/HeaderDashboard";
import React from "react";
import MetaComponent from "@/components/common/MetaComponent";

const metadata = {
  title: "Courses | Edunoble - Manage Courses",
  description:
    "Manage and organize courses offered by Edunoble. Create, edit, and update course details.",
};

export default function DshbCoursesCmsPage() {
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
            <Courses />
          </div>
        </div>
      </main>
    </div>
  );
}
