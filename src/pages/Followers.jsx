import React, { useEffect, useState, useRef } from "react";
import DataTable from "datatables.net-react";
import ReactDOMServer from "react-dom/server";
import DT from "datatables.net-dt";
import $ from "jquery";
import { toast } from "react-hot-toast";
import { useAuth } from "../utils/idb.jsx";
import { PlusIcon } from "lucide-react";
import SkeletonLoader from "../components/SkeletonLoader.jsx";
import { AnimatePresence, motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import { formatBookingDateTime, formatDate } from "../helpers/CommonHelper.jsx";
import { getSocket } from "../utils/Socket.jsx";

export default function Followers() {
  const { user } = useAuth();

  DataTable.use(DT);

  const [followers, setFollowers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [historyData, setHistoryData] = useState({}); // Store history for each follower
  const [loadingHistory, setLoadingHistory] = useState(new Set());
  const [showAddForm, setShowAddForm] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [consultants, setConsultants] = useState([]);
  const [filteredConsultants, setFilteredConsultants] = useState([]);
  const [crms, setCrms] = useState([]);
  const [selectedCRM, setSelectedCRM] = useState(null);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [consultantType, setConsultantType] = useState("ACTIVE");
  const { dashboard_status } = useParams();

  const { followerid } = useParams();

  const navigate = useNavigate();

  const tableRef = useRef(null);

  ///socket ////////

  useEffect(() => {
    const socket = getSocket();

   const handleCallClaimed = (followerId) => {
      console.log("Socket Called - Call Claimed ");
      setFollowers((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        return list.map((follower) =>
          follower.followerid == followerId
            ? { ...follower, followstatus: "Claimed" } // use correct column name
            : follower
        );
      });
    };


    socket.on("callClaimed", handleCallClaimed);

    return () => {
      socket.off("callClaimed", handleCallClaimed);
    };
  }, [user.id]);

  ///socket

  useEffect(() => {
    fetchAllFollowers();

    // Cleanup function to destroy DataTable on unmount
    return () => {
      if (tableRef.current) {
        $(tableRef.current).DataTable().destroy();
      }
    };
  }, []);

  // Add effect to handle DataTable reinitialization when data changes
  useEffect(() => {
    if (!isLoading && followers.length > 0 && tableRef.current) {
      // Destroy existing DataTable if it exists
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
    }
  }, [followers, isLoading]);

  const fetchAllFollowers = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        "https://callback-2suo.onrender.com/api/followers/getAllFollowers"
      );

      const result = await response.json();

      if (result.status) {
        setFollowers(result.data);
        if (dashboard_status) {
          navigate("/followers");
        }
      } else {
        setFollowers([]);
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
      setFollowers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookingHistory = async (bookingId) => {
    if (historyData[bookingId]) return historyData[bookingId];

    setLoadingHistory((prev) => new Set([...prev, bookingId]));

    try {
      const res = await fetch(
        `https://callback-2suo.onrender.com/api/bookings/history/${bookingId}`
      );
      const result = await res.json();

      const data = result.status ? result.data : [];

      setHistoryData((prev) => ({
        ...prev,
        [bookingId]: data,
      }));

      return data;
    } catch (error) {
      console.error("Error fetching history:", error);
      setHistoryData((prev) => ({
        ...prev,
        [bookingId]: [],
      }));
      return [];
    } finally {
      setLoadingHistory((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  const generateHistoryHTML = (history) => {
    if (!history || history.length === 0) {
      return `<div class="p-3 text-sm text-gray-500">No history found.</div>`;
    }

    return `
    <div class="history-timeline-container relative  py-3">
      ${history
        .map(
          (item) => `
        <div class="history-timeline-item mb-4 last:mb-0 relative">
          <div class="history-timeline-dot absolute -left-1.5 top-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white z-10"></div>
          <div class="bg-white p-3 border border-gray-200 rounded-lg shadow-sm ml-4">
            <div class="text-gray-700 text-sm font-medium">${
              item.fld_comment
            }</div>
            <div class="text-gray-400 text-xs mt-1">🕒 ${formatDate(
              item.fld_addedon
            )}</div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
  };

  const handleCrmStatusUpdate = (id, status) => {
    if (!status) return;
    // Replace BASE_URL or use axios/fetch as needed
    fetch(`/api/update-crm-status`, {
      method: "POST",
      body: JSON.stringify({ id, status }),
    });
  };

  const updateFollowersStatus = async (approveData, followerid, bookingid) => {
    try {
      const res = await fetch(
        `https://callback-2suo.onrender.com/api/followers/followerclaimbooking/${followerid}/${bookingid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id, userName: user.fld_name }),
        }
      );

      const data = await res.json();
      if (data.status) {
        toast.success("Booking Claimed");
        fetchAllFollowers();
      } else {
        toast.error(data.message || "Status update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating status");
    }
  };

  useEffect(() => {
    $(document).on("click", ".edit-btn", function () {
      const followerid = $(this).data("followerid");
      const bookingid = $(this).data("bookingid");
      const selected = followers.find((d) => d.id === followerid);
      //console.log(selected);

      updateFollowersStatus(selected, followerid, bookingid);
    });

    return () => {
      $(document).off("click", ".edit-btn");
    };
  }, [followers]);

  //console.log(user.fld_admin_type);

  const columns = [
    {
      title: "Client",
      data: "user_name",
      render: (data, type, row) => {
        const clientId = row.fld_client_id || "";
        const isDeleted = row.delete_sts === "Yes";
        const textStyle = isDeleted ? "line-through text-gray-400" : "";

        return `
          <button class="details-btn font-medium text-blue-600 hover:underline ${textStyle}" data-id="${row.id}">
            ${data} - ${clientId}
          </button>
        `;
      },
    },
    {
      title: "Booking Info",
      data: null,
      render: (data, type, row) => {
        const formatted = formatBookingDateTime(
          row.fld_booking_date,
          row.fld_booking_slot
        );
        return `
      <div class="flex items-center gap-2">
        <div class="text-gray-600">${formatted}</div>
        <button class="show-history-btn text-xs px-2 py-1 rounded" 
                data-booking-id="${row.id}">
          ⏳ 
        </button>
      </div>`;
      },
    },
    {
      title: "Added By",
      data: "admin_name",
      render: (data) => `<div class="text-gray-700">${data || ""}</div>`,
    },
    {
      title: "Consultant",
      data: "consultant_name",
      render: (data) => `<div class="text-gray-700">${data || ""}</div>`,
    },
    {
      title: "Added On ",
      data: "addedon",
      render: (data, type, row) => {
        const formatted = formatDate(row.addedon);
        return `
      <div class="flex items-center gap-2">
        <div class="text-gray-600">${formatted}</div>
      </div>`;
      },
    },
    {
      title: "Status",
      data: "followstatus",
      render: (data) => {
        if (data === "Pending") {
          return `<div class="text-red-600 font-semibold">Pending</div>`;
        } else {
          return `<div class="text-green-600 font-semibold">Claimed</div>`;
        }
      },
    },
    {
      title: "Action",
      data: "followstatus",
      orderable: false,
      render: function (data, type, row) {
        let bookingTime = new Date(
          `${row.fld_booking_date} ${row.fld_booking_slot}`
        ); // use ISO format
        let currentTime = new Date();
        if (
          data === "Pending" &&
          currentTime < bookingTime &&
          (user.fld_admin_type == "SUBADMIN" ||
            user.fld_admin_type == "CONSULTANT")
        ) {
          return `
            <button 
              class="edit-btn bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded mr-2" 
              data-followerid="${row.followerid}" data-bookingid="${row.id}">
              Claim
            </button>
          `;
        } else {
          return ` `;
        }
      },
    },
  ];

  const tableOptions = {
    responsive: true,
    pageLength: 25,
    lengthMenu: [5, 10, 25, 50],
    order: [],
    columnDefs: [{ targets: "_all", orderable: false }],
    dom: '<"flex justify-between items-center mb-4 text-[13px]"lf>rt<"flex justify-between items-center mt-4"ip>',
    language: {
      search: "",
      searchPlaceholder: "Search followers...",
      lengthMenu: "Show _MENU_ entries",
      info: "Showing _START_ to _END_ of _TOTAL_ entries",
      infoEmpty: "No followers available",
      infoFiltered: "(filtered from _MAX_ total entries)",
    },
    drawCallback: function () {
      const api = this.api();
      const container = $(api.table().container());

      container
        .find(".show-history-btn")
        .off("click")
        .on("click", function () {
          const bookingId = $(this).data("booking-id");
          const tr = $(this).closest("tr");
          const row = api.row(tr);

          if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass("shown");
          } else {
            if (historyData[bookingId]) {
              const html = generateHistoryHTML(historyData[bookingId]);
              row.child(html).show();
              tr.addClass("shown");
            } else {
              row
                .child(
                  '<div class="p-2 text-sm text-blue-500">Loading...</div>'
                )
                .show();
              fetchBookingHistory(bookingId).then((data) => {
                const html = generateHistoryHTML(data || []);
                row.child(html).show();
                tr.addClass("shown");
              });
            }
          }
        });

      // Add search & select styling
      container
        .find('input[type="search"], select')
        .addClass(
          "form-input px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 sm:text-sm"
        );

      container
        .find(".details-btn")
        .off("click")
        .on("click", function () {
          const bookingId = $(this).data("id");
          navigate(`/admin/booking_detail/${bookingId}`);
        });
    },
  };

  return (
    <div className="">
      <div className="">
        <div className="">
          <div className="mb-4 flex items-center gap-3 justify-between">
            <h2 className="text-[18px] font-semibold text-gray-900">
              Follower Management
            </h2>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              {isLoading ? (
                <SkeletonLoader
                  rows={6}
                  columns={[
                    "Client",
                    "Booking Information",
                    "Consultant",
                    "Added By",
                    "Added On",
                    "Status",
                  ]}
                />
              ) : (
                <div className="overflow-hidden">
                  <DataTable
                    ref={tableRef}
                    data={followers}
                    columns={columns}
                    className="display table table-auto w-full text-[13px] border border-gray-300 the-table-set dataTable"
                    options={tableOptions}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* DataTables child row styling */
        .history-row {
          border-left: 4px solid #3b82f6;
        }

        .history-toggle-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Timeline Specific Styles */
        .history-timeline-container {
          /* This creates the vertical line of the timeline */
          border-left: 2px solid #cbd5e1; /* gray-300 */
        }

        .history-timeline-item {
          /* Ensures proper positioning for each item relative to the line */
        }

        /* Dot for each timeline item - already defined in HTML for simplicity */
        /* .history-timeline-dot {
    position: absolute;
    left: -6px; /* Adjust based on border-left width / 2 */
        /* top: 6px; */
        /* width: 12px; */
        /* height: 12px; */
        /* background-color: #3b82f6; */
        /* border-radius: 50%; */
        /* border: 2px solid white; */
        /* z-index: 10; */
        /* } */

        /* General DataTables styling improvements */
        .dataTables_wrapper .dataTables_filter input {
          width: 250px; /* Adjust search input width */
        }

        /* Styling for selected DataTables rows (if you implement selection) */
        table.dataTable tbody tr.selected {
          background-color: #e0f2fe; /* Light blue background for selected rows */
        }

        /* Hover effect for DataTables rows */
        table.dataTable tbody tr:hover {
          background-color: #f3f4f6; /* Light gray on hover */
        }

        /* Zebra striping for readability */
        table.dataTable tbody tr:nth-child(odd) {
          background-color: #f9fafb; /* Very light gray for odd rows */
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
