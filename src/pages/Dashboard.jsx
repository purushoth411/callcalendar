import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../utils/idb";

function Dashboard() {
  const { user } = useAuth();
  const [callCounts, setCallCounts] = useState({
    Accept: 0,
    Reject: 0,
    Cancelled: 0,
    Rescheduled: 0,
    Completed: 0,
  });
  const [loading, setLoading] = useState(false);

  const statuses = ["Accept", "Reject", "Cancelled", "Rescheduled", "Completed"];

  const fetchParticularStatus = async (crmId, status) => {
    try {
      const response = await fetch("http://localhost:5000/api/dashboard/getparticularstatuscalls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crm_id: crmId, status }),
      });
      const result = await response.json();
      return result.status && Array.isArray(result.data) ? result.data.length : 0;
    } catch (error) {
      console.error("Error fetching calls for status:", status, error);
      return 0;
    }
  };

  const fetchAllStatuses = async () => {
    setLoading(true);
    try {
      const counts = {};
      const crmId = user?.fld_admin_type === "EXECUTIVE" ? user?.id : "";

      for (let status of statuses) {
        counts[status] = await fetchParticularStatus(crmId, status);
      }
      setCallCounts(counts);
    } catch (error) {
      toast.error("Failed to fetch call statuses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.fld_admin_type === "SUPERADMIN" || user?.fld_admin_type === "EXECUTIVE") {
      fetchAllStatuses();
    }
  }, [user]);

  const submitAndRedirect = (status) => {
    console.log("Redirect to", status);
    // e.g. navigate(`/calls/${status.toLowerCase()}`);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {(user?.fld_admin_type === "SUPERADMIN" || user?.fld_admin_type === "EXECUTIVE") && (
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold">Call Status Summary</h4>
            <button
              onClick={fetchAllStatuses}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          
            <div className="flex flex-wrap gap-2 justify-center">
              {statuses.map((status) => (
                <div
                  key={status}
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-200 cursor-pointer text-center p-3 rounded shadow w-[15%] "
                  onClick={() => submitAndRedirect(status)}
                >
                  <div className="font-semibold text-blue-700">{status}</div>
                  <div className="mt-1 text-xl font-bold  flex justify-center items-center">
                    {loading ? (<div className="w-5 h-5 animate-pulse bg-orange-500 rounded"></div>) :  <p className="bg-orange-500 text-white px-2 py-1 rounded text-sm">{callCounts[status]}</p>}
                  </div>
                </div>
              ))}
            </div>
          
        </div>
      )}
    </div>
  );
}

export default Dashboard;
