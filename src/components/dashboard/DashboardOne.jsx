import React, { useState, useEffect, useCallback } from "react";
import { getApiUrl } from "@/config/api";
import { useContextElement } from "@/context/Context";
import { Link } from "react-router-dom";
import {
  Pie,
  Tooltip,
  Legend,
  PieChart,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#c084fc", "#d946ef", "#ec4899"];

// Custom Pie Chart Component for Distribution
const DistributionPieChart = ({ data, title }) => {
  const chartData = data.map((item) => ({
    name: item.class || item.subject,
    value: item.count,
  }));

  return (
    <div>
      <h3 className="text-16 fw-500 mb-20 text-center text-dark-1 -dark-text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <Pie
            dataKey="value"
            isAnimationActive={true}
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={90}
            fill="#6366f1"
            paddingAngle={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '8px'
            }}
          />
          <Legend 
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{
              paddingTop: '20px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, subtitle, icon, color = "purple-1" }) => {
  return (
    <div className="col-xl-3 col-md-6">
      <div className="d-flex justify-between items-center py-35 px-30 rounded-16 bg-white -dark-bg-dark-1 shadow-4 h-100" style={{ minHeight: "140px" }}>
        <div className="flex-grow-1">
          <div className={`lh-1 fw-500 ${icon ? "" : "text-dark-1 -dark-text-white"}`}>
            {title}
          </div>
          <div className="text-24 lh-1 fw-700 text-dark-1 -dark-text-white mt-20">
            {value}
          </div>
          {subtitle && (
            <div className="lh-1 mt-25 text-14 text-dark-1 -dark-text-white" style={{ minHeight: "20px" }}>
              {subtitle}
            </div>
          )}
        </div>
        {icon && (
          <i className={`text-40 ${icon} text-${color} shrink-0`}></i>
        )}
      </div>
    </div>
  );
};

export default function DashboardOne() {
  const { auth } = useContextElement();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!auth || !auth.token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url = getApiUrl("papers/admin/dashboard");
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.isSuccess) {
        throw new Error(result.message || "Failed to fetch dashboard data");
      }

      setDashboardData(result.data);
    } catch (err) {
      setError(err.message || "An error occurred while fetching dashboard data");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="dashboard__main">
        <div className="dashboard__content bg-light-4">
          <div className="d-flex justify-center items-center py-100">
            <div className="text-18 text-dark-1 -dark-text-white">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard__main">
        <div className="dashboard__content bg-light-4">
          <div className="d-flex justify-center items-center py-100">
            <div className="text-18 text-red-1">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="dashboard__main">
      <div className="dashboard__content bg-light-4">
        <div className="row pb-50 mb-10">
          <div className="col-auto">
            <h1 className="text-30 lh-12 fw-700 text-dark-1 -dark-text-white">Edunoble Dashboard</h1>
            <div className="mt-10 text-16 text-dark-1 -dark-text-white">
              Overview of papers, testimonials, queries, and platform analytics
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row y-gap-30">
          <StatsCard
            title="Total Papers"
            value={dashboardData.papers?.total || 0}
            subtitle={`${dashboardData.papers?.active || 0} Active, ${dashboardData.papers?.inactive || 0} Inactive`}
            icon="icon-document"
            color="purple-1"
          />
          <StatsCard
            title="Total Views"
            value={dashboardData.totalViews || 0}
            subtitle="All time paper views"
            icon="icon-discovery"
            color="purple-1"
          />
          <StatsCard
            title="Testimonials"
            value={dashboardData.testimonials?.total || 0}
            subtitle={`${dashboardData.testimonials?.active || 0} Active, ${dashboardData.testimonials?.inactive || 0} Inactive`}
            icon="icon-star"
            color="purple-1"
          />
          <StatsCard
            title="Queries"
            value={dashboardData.contacts?.total || 0}
            subtitle={`${dashboardData.contacts?.resolved || 0} Resolved, ${dashboardData.contacts?.unresolved || 0} Unresolved`}
            icon="icon-message"
            color="purple-1"
          />
        </div>

        {/* Additional Stats Row */}
        <div className="row y-gap-30 pt-30">
          <StatsCard
            title="Featured Papers"
            value={dashboardData.papers?.featured || 0}
            subtitle="Highlighted papers"
            icon="icon-star"
            color="purple-1"
          />
          <StatsCard
            title="Users"
            value={dashboardData.users?.total || 0}
            subtitle={`${dashboardData.users?.active || 0} Active, ${dashboardData.users?.inactive || 0} Inactive`}
            icon="icon-person-3"
            color="purple-1"
          />
          <StatsCard
            title="FAQs"
            value={dashboardData.faqs?.total || 0}
            subtitle={`${dashboardData.faqs?.active || 0} Active, ${dashboardData.faqs?.inactive || 0} Inactive`}
            icon="icon-list"
            color="purple-1"
          />
          <StatsCard
            title="Recent Papers"
            value={dashboardData.recentPapers?.length || 0}
            subtitle="Latest additions"
            icon="icon-clock-2"
            color="purple-1"
          />
        </div>

        {/* Charts Row */}
        <div className="row y-gap-30 pt-30">
          <div className="col-xl-6 col-md-6">
            <div className="rounded-16 bg-white -dark-bg-dark-1 shadow-4 h-100">
              <div className="d-flex justify-between items-center py-20 px-30 border-bottom-light">
                <h2 className="text-17 lh-1 fw-500 text-dark-1 -dark-text-white">Distribution by Class</h2>
              </div>
              <div className="py-40 px-30">
                {dashboardData.distribution?.byClass && dashboardData.distribution.byClass.length > 0 ? (
                  <DistributionPieChart
                    data={dashboardData.distribution.byClass}
                    title="Papers by Class"
                  />
                ) : (
                  <div className="text-center py-40 text-dark-1 -dark-text-white">No data available</div>
                )}
              </div>
            </div>
          </div>

          <div className="col-xl-6 col-md-6">
            <div className="rounded-16 bg-white -dark-bg-dark-1 shadow-4 h-100">
              <div className="d-flex justify-between items-center py-20 px-30 border-bottom-light">
                <h2 className="text-17 lh-1 fw-500 text-dark-1 -dark-text-white">Distribution by Subject</h2>
              </div>
              <div className="py-40 px-30">
                {dashboardData.distribution?.bySubject && dashboardData.distribution.bySubject.length > 0 ? (
                  <DistributionPieChart
                    data={dashboardData.distribution.bySubject}
                    title="Papers by Subject"
                  />
                ) : (
                  <div className="text-center py-40 text-dark-1 -dark-text-white">No data available</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top Papers and Recent Papers Row */}
        <div className="row y-gap-30 pt-30">
          <div className="col-xl-6 col-md-6">
            <div className="rounded-16 bg-white -dark-bg-dark-1 shadow-4 h-100">
              <div className="d-flex justify-between items-center py-20 px-30 border-bottom-light">
                <h2 className="text-17 lh-1 fw-500 text-dark-1 -dark-text-white">Top Papers</h2>
                <Link
                  to="/dshb-papers"
                  className="text-14 text-purple-1 underline"
                >
                  View All
                </Link>
              </div>
              <div className="py-30 px-30">
                {dashboardData.topPapers && dashboardData.topPapers.length > 0 ? (
                  <div className="y-gap-20">
                    {dashboardData.topPapers.map((paper, i) => (
                      <div
                        key={paper.id || i}
                        className={`d-flex items-start ${i !== 0 ? "border-top-light pt-20" : ""}`}
                      >
                        <div className="flex-grow-1">
                          <h4 className="text-15 lh-16 fw-500 text-dark-1 -dark-text-white">
                            {paper.title}
                          </h4>
                          <div className="d-flex items-center x-gap-15 y-gap-10 flex-wrap pt-10">
                            <div className="d-flex items-center">
                              <i className="icon-document text-14 mr-8 text-dark-1 -dark-text-white"></i>
                              <div className="text-13 lh-1 text-dark-1 -dark-text-white">
                                Class {paper.class}
                              </div>
                            </div>
                            <div className="d-flex items-center">
                              <i className="icon-book text-14 mr-8 text-dark-1 -dark-text-white"></i>
                              <div className="text-13 lh-1 text-dark-1 -dark-text-white">
                                {paper.subject}
                              </div>
                            </div>
                            <div className="d-flex items-center">
                              <i className="icon-eye text-14 mr-8 text-dark-1 -dark-text-white"></i>
                              <div className="text-13 lh-1 text-dark-1 -dark-text-white">
                                {paper.viewCount} views
                              </div>
                            </div>
                            {paper.featured && (
                              <div className="d-flex items-center">
                                <span
                                  className="d-flex items-center px-8 py-3 rounded-200"
                                  style={{
                                    backgroundColor: "#e9d5ff",
                                    color: "#6b21a8",
                                    fontSize: "9px",
                                    fontWeight: "500",
                                    gap: "4px",
                                    whiteSpace: "nowrap",
                                    display: "inline-flex",
                                  }}
                                >
                                  <span
                                    style={{
                                      width: "6px",
                                      height: "6px",
                                      borderRadius: "50%",
                                      backgroundColor: "#a855f7",
                                      display: "inline-block",
                                    }}
                                  ></span>
                                  Featured
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-40 text-dark-1 -dark-text-white">No top papers available</div>
                )}
              </div>
            </div>
          </div>

          <div className="col-xl-6 col-md-6">
            <div className="rounded-16 bg-white -dark-bg-dark-1 shadow-4 h-100">
              <div className="d-flex justify-between items-center py-20 px-30 border-bottom-light">
                <h2 className="text-17 lh-1 fw-500 text-dark-1 -dark-text-white">Recent Papers</h2>
                <Link
                  to="/dshb-papers"
                  className="text-14 text-purple-1 underline"
                >
                  View All
                </Link>
              </div>
              <div className="py-30 px-30">
                {dashboardData.recentPapers && dashboardData.recentPapers.length > 0 ? (
                  <div className="y-gap-20">
                    {dashboardData.recentPapers.map((paper, i) => (
                      <div
                        key={paper.id || i}
                        className={`d-flex items-start ${i !== 0 ? "border-top-light pt-20" : ""}`}
                      >
                        <div className="flex-grow-1">
                          <h4 className="text-15 lh-16 fw-500 text-dark-1 -dark-text-white">
                            {paper.title}
                          </h4>
                          <div className="d-flex items-center x-gap-15 y-gap-10 flex-wrap pt-10">
                            <div className="d-flex items-center">
                              <i className="icon-document text-14 mr-8 text-dark-1 -dark-text-white"></i>
                              <div className="text-13 lh-1 text-dark-1 -dark-text-white">
                                Class {paper.class}
                              </div>
                            </div>
                            <div className="d-flex items-center">
                              <i className="icon-book text-14 mr-8 text-dark-1 -dark-text-white"></i>
                              <div className="text-13 lh-1 text-dark-1 -dark-text-white">
                                {paper.subject}
                              </div>
                            </div>
                            <div className="d-flex items-center">
                              <i className="icon-clock-2 text-14 mr-8 text-dark-1 -dark-text-white"></i>
                              <div className="text-13 lh-1 text-dark-1 -dark-text-white">
                                {formatDate(paper.createdAt)}
                              </div>
                            </div>
                            <div className="d-flex items-center">
                              {paper.isActive !== false ? (
                                <span
                                  className="d-flex items-center px-8 py-3 rounded-200"
                                  style={{
                                    backgroundColor: "#d1fae5",
                                    color: "#065f46",
                                    fontSize: "9px",
                                    fontWeight: "500",
                                    gap: "4px",
                                    whiteSpace: "nowrap",
                                    display: "inline-flex",
                                  }}
                                >
                                  <span
                                    style={{
                                      width: "6px",
                                      height: "6px",
                                      borderRadius: "50%",
                                      backgroundColor: "#10b981",
                                      display: "inline-block",
                                    }}
                                  ></span>
                                  Active
                                </span>
                              ) : (
                                <span
                                  className="d-flex items-center px-8 py-3 rounded-200"
                                  style={{
                                    backgroundColor: "#fee2e2",
                                    color: "#991b1b",
                                    fontSize: "9px",
                                    fontWeight: "500",
                                    gap: "4px",
                                    whiteSpace: "nowrap",
                                    display: "inline-flex",
                                  }}
                                >
                                  <span
                                    style={{
                                      width: "6px",
                                      height: "6px",
                                      borderRadius: "50%",
                                      backgroundColor: "#ef4444",
                                      display: "inline-block",
                                    }}
                                  ></span>
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-40 text-dark-1 -dark-text-white">No recent papers available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
