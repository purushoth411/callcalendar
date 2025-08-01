import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../utils/idb";
import { useNavigate } from "react-router-dom";
import DataTable from "datatables.net-react";
import ReactDOMServer from "react-dom/server";
import DT from "datatables.net-dt";
import $ from "jquery";
import SkeletonLoader from "../../components/SkeletonLoader";
import moment from "moment/moment";
import { RefreshCcw } from "lucide-react";
function CallRequestsFromRc() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [calls, setCalls] = useState([]);

  DataTable.use(DT);

  const tableRef = useRef(null);

  const fetchDatas = async () => {
    let crmId;
    if (user?.fld_admin_type == "EXECUTIVE") {
      crmId = user?.id;
    }
    try {
      setLoading(true);
      const response = await fetch(
        "https://callback-2suo.onrender.com/api/additional/callrequestrc",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ crmid: crmId }),
        }
      );
      const result = await response.json();
      if (result.status) {
        setCalls(result.data);
      } else {
        toast.error(result.message || "No Calls Found");
      }
    } catch (error) {
      console.error("Error fetching calls for status:", status, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatas();

    // Cleanup function to destroy DataTable on unmount
    return () => {
      if (tableRef.current) {
        $(tableRef.current).DataTable().destroy();
      }
    };
  }, []);

  const columns = [
    {
      title: "Project ID",
      data: "project_id",
      render: (data) => `<div class="text-gray-800">${data || "-"}</div>`,
    },
    {
      title: "Milestone Name",
      width: "100px",
      data: "milestone_title",
      render: (data) => `<div class="text-gray-800">${data || "-"}</div>`,
    },
    user?.fld_admin_type === "SUPERADMIN"
      ? {
          title: "CRM",
          data: "fld_name",
          render: (data) => `<div class="text-gray-800">${data || "-"}</div>`,
        }
      : false,
    {
      title: "Student Info.",
      data: null,
      width: "100px",
      render: (data, type, row) => {
        return `
      <div class="text-sm">
        <div class="font-medium text-gray-900">${row.st_name || "-"}</div>
        <div class="text-gray-600">${row.student_code || ""}</div>
        <div class="text-gray-500">${row.st_email || ""}</div>
      </div>
    `;
      },
    },
    {
      title: "Call Regarding",
      data: "call_regarding",
      render: (data) =>
        `<div class="text-gray-700 text-sm">${data || "-"}</div>`,
    },
    {
      title: "Message",
      data: "points_for_discussion",
      width: "200px",
      render: (data) =>
        `<div class="text-gray-700 text-sm">${data || "-"}</div>`,
    },
    {
      title: "Booking Info.",
      data: null,
      render: (data, type, row) => {
        const date = row.booking_date
          ? moment(row.booking_date).format("DD MMM YYYY")
          : "-";
        const time = row.slot_time || "";
        return `
      <div class="text-gray-700 text-sm">
        ${date} ${time ? `at ${time}` : ""}
      </div>
    `;
      },
    },
    {
      title: "Added On",
      data: "timestamp",
      render: (data) => {
        if (!data) return `<div class="text-gray-500">-</div>`;
        const formatted = moment.unix(data).format("DD MMM YYYY, hh:mm A");
        return `<div class="text-gray-700 text-sm">${formatted}</div>`;
      },
    },
    {
      title: "Status",
      data: "call_request_sts",
      render: (status, type, row) => {
        let cls = "secondary";
        switch (status) {
          case "Call Scheduled":
          case "Call Rescheduled":
            cls = "bg-gray-700 text-white";
            break;

          case "Consultant Assigned":
          case "Accept":
            cls = "bg-blue-500 text-white";
            break;

          case "Pending":
            cls = "bg-yellow-400 text-black";
            break;

          case "Reject":
          case "Client did not join":
            cls = "bg-red-500 text-white";
            break;

          case "Completed":
          case "Converted":
            cls = "bg-green-500 text-white";
            break;

          case "Rescheduled":
            cls = "bg-gray-400 text-white";
            break;

          case "Reassign Request":
            cls = "bg-gray-100 text-gray-800";
            break;
        }

        const deleted = row.delete_sts === "Yes" ? "strikeout" : "";
        const label =
          status === "Accept" || status === "Reject" ? `${status}ed` : status;

        return `<span class="status px-2 py-0.5 rounded f-11 ${cls} ${deleted}" style="text-align:center">
        ${label}
      </span>`;
      },
    },
    user?.fld_admin_type === "EXECUTIVE"
      ? {
          title: "ACTION",
          data: null,
          render: (data, type, row) => {
            if (!row.bookingid) {
              const encodedId = btoa(row.id); // base64 encode (replace with your `base64url_encode` equivalent if needed)
              return `
            <button 
          class="add-call-btn bg-yellow-500 px-2 py-1 text-sm rounded hover:underline cursor-pointer"
          data-id="${row.id}"
        >
          Add Call
        </button>
          `;
            } else {
              return `<div class="text-gray-400 text-sm">—</div>`;
            }
          },
        }
      : false,
  ].filter(Boolean);

  return (
    <div className="p-4 bg-gray-100 mx-auto">
      <div className="flex items-center max-w-7xl mx-auto rounded px-8 py-3 bg-white">
        <h2 className="block text-sm font-medium text-gray-700 mb-1">
          Call Requests From RC
        </h2>

        <button
          className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-sm ml-3 "
          onClick={fetchDatas}
        >
          <RefreshCcw size={15} />
        </button>
      </div>
      <div className="p-6">
        {loading ? (
          <SkeletonLoader
            rows={25}
            columns={[
              "Project Id",
              "Milestone",
              "Student Info",
              "Call Regrding",
              "Message",
              "Booking Info",
              "Added on",
              "Status",
            ]}
          />
        ) : (
          <div className="overflow-hidden bg-white rounded shadow-xl p-4">
            <DataTable
              ref={tableRef}
              data={calls}
              columns={columns}
              className="display table table-auto w-full text-[13px]"
              options={{
                pageLength: 50,
                ordering: false,
                createdRow: (row, data) => {
                  if (data.call_request_sts === "Completed") {
                    $(row).css("background-color", "#DFF7C5FF"); // light red (same as Tailwind bg-red-100)
                  }

                  $(row)
                    .find(".add-call-btn")
                    .on("click", function () {
                      const encodedId = btoa($(this).data("id")); // base64 encode
                      window.location.href = `/admin/add_call_request/${encodedId}/enq`;
                    });
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CallRequestsFromRc;
