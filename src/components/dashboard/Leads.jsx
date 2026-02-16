import React, { useState, useEffect, useCallback } from "react";
import { getApiUrl } from "@/config/api";
import { useContextElement } from "@/context/Context";

export default function Leads() {
  const { auth } = useContextElement();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        "Content-Type": "application/json",
      };

      // Add authorization token if available
      if (auth && auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      const response = await fetch(getApiUrl("leads/admin"), {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch leads: ${response.status}`);
      }

      const result = await response.json();

      if (result.isSuccess && result.data) {
        setLeads(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch leads");
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError(err.message);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="dashboard__main">
      <div className="dashboard__content bg-light-4">
        <div className="row pb-50 mb-10 justify-between items-center">
          <div className="col-auto">
            <h1 className="text-30 lh-12 fw-700">Leads</h1>
            <div className="mt-10">
              View all student leads and their information.
            </div>
          </div>
        </div>

        <div className="row y-gap-30">
          <div className="col-12">
            <div className="rounded-16 bg-white -dark-bg-dark-1 shadow-4 h-100">
              <div className="d-flex items-center py-20 px-30 border-bottom-light">
                <h2 className="text-17 lh-1 fw-500">All Leads</h2>
              </div>

              <div className="py-30 px-30">
                <style>
                  {`
                    .leads-table {
                      width: 100%;
                      border-collapse: collapse;
                    }
                    .leads-table th {
                      background-color: #f3f4f6;
                      padding: 15px;
                      text-align: left;
                      font-weight: 600;
                      font-size: 14px;
                      border-bottom: 1px solid #e5e7eb;
                      color: #374151;
                    }
                    .leads-table td {
                      padding: 15px;
                      border-bottom: 1px solid #e5e7eb;
                      font-size: 14px;
                      color: #6b7280;
                    }
                    .leads-table tbody tr:hover {
                      background-color: #f9fafb;
                    }
                    .leads-table tbody tr:last-child td {
                      border-bottom: none;
                    }
                    @media (max-width: 768px) {
                      .leads-table {
                        font-size: 12px;
                      }
                      .leads-table th,
                      .leads-table td {
                        padding: 10px;
                      }
                    }
                  `}
                </style>
                {loading && (
                  <div className="text-center py-50">
                    <div className="text-16 text-dark-1 -dark-text-white">Loading leads...</div>
                  </div>
                )}

                {error && (
                  <div className="text-center py-50">
                    <div className="text-16 text-red-1">Error: {error}</div>
                  </div>
                )}

                {!loading && !error && (
                  <>
                    {leads.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="leads-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Phone</th>
                              <th>Grade</th>
                              <th>Subject</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leads.map((lead, index) => (
                              <tr key={lead._id || index}>
                                <td className="fw-500 text-dark-1 -dark-text-white">
                                  {lead.name}
                                </td>
                                <td>{lead.number}</td>
                                <td>{lead.grade}</td>
                                <td>{lead.subject}</td>
                                <td>{formatDate(lead.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-50">
                        <div className="text-16 text-dark-1 -dark-text-white">
                          No leads found
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
