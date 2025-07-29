import React, { useEffect, useState, useRef } from "react";
import DataTable from "datatables.net-react";
import ReactDOMServer from "react-dom/server";
import DT from "datatables.net-dt";
import $ from "jquery";
import { useAuth } from "../../utils/idb.jsx";
import {
  formatBookingDateTime,
  formatDate,
} from "../../helpers/CommonHelper.jsx";
import SkeletonLoader from "../../components/SkeletonLoader.jsx";
import AddBooking from "./AddBooking.jsx";
import { AnimatePresence, motion } from "framer-motion";
import StatusUpdate from "./StatusUpdate.jsx"; //
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";


export default function Bookings() {
  const { user } = useAuth();

  DataTable.use(DT);

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [historyData, setHistoryData] = useState({}); // Store history for each booking
  const [loadingHistory, setLoadingHistory] = useState(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [consultants, setConsultants] = useState([]);
  const [filteredConsultants, setFilteredConsultants] = useState([]);
  const [crms, setCrms] = useState([]);
  const [selectedCRM, setSelectedCRM] = useState(null);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [consultantType, setConsultantType] = useState("ACTIVE");
  const { dashboard_status } = useParams();

  const {bookingid} = useParams();

  useEffect(()=>{
    if(bookingid){

      setShowForm(true);
    }
  },[bookingid]);

  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    sale_type: "",
    call_rcrd_status: "",
    booking_status: [],
    keyword_search: "",
    filter_type: "Booking",
    date_range: [null, null],
  });

  const fetchConsultantsAndCrms = async () => {
    try {
      // Fetch consultants first
      const consultantRes = await fetch(
        "http://localhost:5000/api/helpers/getUsersByRole",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "CONSULTANT", status: "Active" }),
        }
      );
      const consultantData = await consultantRes.json();

      // Then fetch CRMs
      const crmRes = await fetch(
        "http://localhost:5000/api/helpers/getUsersByRole",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "EXECUTIVE", status: "Active" }),
        }
      );
      const crmData = await crmRes.json();

      // Set state
      setConsultants(consultantData.users || []);
      setFilteredConsultants(consultantData.users || []);
      setCrms(crmData.users || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleConsultantTypeChange = async (type) => {
    setConsultantType(type);

    try {
      const res = await fetch(
        "http://localhost:5000/api/helpers/getUsersByRole",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "CONSULTANT", status: type }),
        }
      );

      const data = await res.json();
      setFilteredConsultants(data.users || []);
    } catch (err) {
      console.error("Error filtering consultants:", err);
    }
  };

  const handleApplyFilters = async () => {
    setIsLoading(true);
    try {
      const filterPayload = {
        userId: user.id,
        userType: user.fld_admin_type,
        assigned_team: user.fld_team_id,
        filters: {
          consultationStatus:
            filters.booking_status.length === 1
              ? filters.booking_status[0]
              : null,
          recordingStatus: filters.call_rcrd_status,
          fromDate: filters.date_range[0]
            ? filters.date_range[0].toISOString().split("T")[0]
            : null,
          toDate: filters.date_range[1]
            ? filters.date_range[1].toISOString().split("T")[0]
            : null,
          consultantId: selectedConsultant || null,
          crmId: selectedCRM || null,
          search: filters.keyword_search,
          sale_type: filters.sale_type || null,
          filter_type: filters.filter_type || "Booking",
        },
      };

      const response = await fetch(
        "http://localhost:5000/api/bookings/fetchBooking",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(filterPayload),
        }
      );

      const data = await response.json();

      if (data.status) {
        setBookings(data.data);
      } else {
        setBookings([]);
        console.warn("No bookings found");
      }
    } catch (error) {
      console.error("Filter fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCallStatusUpdationPending = (row) => {
    if (row.fld_consultation_sts === "Accept") {
      const bookingSlot = row.fld_booking_slot; // e.g., "03:30 PM"
      const bookingDate = row.fld_booking_date; // e.g., "2024-07-26"

      // Parse the booking slot and add 30 minutes
      const slotDateTime = new Date(`${bookingDate} ${bookingSlot}`);
      const callEndTime = new Date(slotDateTime.getTime() + 30 * 60000); // 30 mins later

      // Add 1 hour to call end time
      const oneHourAfterEndTime = new Date(callEndTime.getTime() + 60 * 60000);

      const now = new Date();
      const currentDate = now.toISOString().split("T")[0]; // e.g., "2024-07-26"

      if (bookingDate < currentDate) {
        return "Call status updation pending";
      } else if (bookingDate === currentDate && now >= oneHourAfterEndTime) {
        return "Call status updation pending";
      } else {
        return "";
      }
    }
    return "";
  };

  const handleAddNewClick = () => {
    setShowForm(true);
  };

  const tableRef = useRef(null);

  useEffect(() => {
    fetchAllBookings();

    // Cleanup function to destroy DataTable on unmount
    return () => {
      if (tableRef.current) {
        $(tableRef.current).DataTable().destroy();
      }
    };
  }, []);

  // Add effect to handle DataTable reinitialization when data changes
  useEffect(() => {
    if (!isLoading && bookings.length > 0 && tableRef.current) {
      // Destroy existing DataTable if it exists
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
    }
  }, [bookings, isLoading]);

  const fetchAllBookings = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/bookings/fetchBooking",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            userType: user?.fld_admin_type,
            assigned_team: user?.fld_team || "",
            filters: {},
            dashboard_status,
          }),
        }
      );

      const result = await response.json();
      if (result.status) {
        setBookings(result.data);
        if(dashboard_status){
          
          navigate("/bookings");
        }
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookingHistory = async (bookingId) => {
    if (historyData[bookingId]) return historyData[bookingId];

    setLoadingHistory((prev) => new Set([...prev, bookingId]));

    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/history/${bookingId}`
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

  const columns = [
    {
      title: "Client",
      data: "client_name",
      render: (data, type, row) => {
        const clientId = row.fld_client_id || "";
        return `
      <a href="/admin/booking_detail/${row.id}" class="font-medium text-blue-600 hover:underline">
        ${data} - ${clientId}
      </a>
    `;
      },
    },

    {
      title: "Consultant",
      data: "consultant_name",
      render: (data) => `<div class="text-gray-700">${data || ""}</div>`,
    },
    {
      title: "Added By",
      data: "crm_name",
      render: (data) => `<div class="text-gray-700">${data || ""}</div>`,
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
        <button class="show-history-btn text-xs px-2 py-1 border border-gray-300 rounded" 
                data-booking-id="${row.booking_id}">
          🔍 History
        </button>
      </div>`;
      },
    },

    {
      title: "Call Type",
      data: "fld_sale_type",
      render: (data) =>
        `<div class="text-indigo-700 font-medium text-sm">${data}</div>`,
    },
    {
  title: "Status",
  data: null,
  render: (data, type, row) => {
    const call_status_updation_pending = getCallStatusUpdationPending(row);
    return ReactDOMServer.renderToString(
      <StatusUpdate
        row={row}
        user={user}
        onCrmStatusChange={handleCrmStatusUpdate}
        call_status_updation_pending={call_status_updation_pending}
      />
    );
  },
},
  ];


  const tableOptions = {
    responsive: true,
    pageLength: 25,
    lengthMenu: [5, 10, 25, 50],
    order: [],
    columnDefs: [{ targets: "_all", orderable: false }],
    dom: '<"flex justify-between items-center mb-4"lf>rt<"flex justify-between items-center mt-4"ip>',
    language: {
      search: "",
      searchPlaceholder: "Search bookings...",
      lengthMenu: "Show _MENU_ entries",
      info: "Showing _START_ to _END_ of _TOTAL_ entries",
      infoEmpty: "No bookings available",
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
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1250px] mx-auto py-5">
        <div className="p-3 bg-gray-100 rounded shadow text-[13px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Booking Management
            </h2>

            <button
              onClick={handleAddNewClick}
              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors text-[11px]"
            >
              Add New
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                All Bookings
              </h2>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setShowFilters(!showFilters);
                    if (!showFilters) fetchConsultantsAndCrms();
                  }}
                  className="bg-gray-500 text-white px-2 py-1 rounded text-[11px] hover:bg-gray-600"
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
                <span className="text-sm text-gray-500">Total:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {isLoading ? "..." : bookings.length}
                </span>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  className="bg-white p-4 rounded-lg shadow mb-6 border"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Call Type
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        value={filters.sale_type}
                        onChange={(e) =>
                          setFilters({ ...filters, sale_type: e.target.value })
                        }
                      >
                        <option value="">Select Call Type</option>
                        <option value="Presales">Presales</option>
                        <option value="Postsales">Postsales</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select CRM
                      </label>
                      <Select
                        options={crms.map((c) => ({
                          value: c.id,
                          label: c.fld_name,
                        }))}
                        value={
                          crms.find((c) => c.id === selectedCRM)
                            ? {
                                value: selectedCRM,
                                label: crms.find((c) => c.id === selectedCRM)
                                  .fld_name,
                              }
                            : null
                        }
                        onChange={(opt) => setSelectedCRM(opt.value)}
                        placeholder="Select CRM"
                      />
                    </div>

                    {/* Consultant Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Consultant Type
                      </label>
                      <select
                        value={consultantType}
                        onChange={(e) =>
                          handleConsultantTypeChange(e.target.value)
                        }
                        className="w-full border px-2 py-2 rounded text-sm"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>

                    {/* Consultant Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Consultant
                      </label>
                      <Select
                        options={filteredConsultants.map((c) => ({
                          value: c.id,
                          label: c.fld_name,
                        }))}
                        value={
                          filteredConsultants.find(
                            (c) => c.id === selectedConsultant
                          )
                            ? {
                                value: selectedConsultant,
                                label: filteredConsultants.find(
                                  (c) => c.id === selectedConsultant
                                ).fld_name,
                              }
                            : null
                        }
                        onChange={(opt) => setSelectedConsultant(opt.value)}
                        placeholder="Select Consultant"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Call Recording Status
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        value={filters.call_rcrd_status}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            call_rcrd_status: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Call Recording Status</option>
                        <option value="Call Recording Updated">
                          Call Recording Updated
                        </option>
                        <option value="Call Recording Pending">
                          Call Recording Pending
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Booking Status
                      </label>
                      <Select
                        isMulti
                        options={[
                          "Pending",
                          "Call Scheduled",
                          "Call Rescheduled",
                          "Consultant Assigned",
                          "Accept",
                          "Reject",
                          "Completed",
                          "Rescheduled",
                          "Converted",
                          "Cancelled",
                          "Client did not join",
                          "Postponed",
                        ].map((status) => ({
                          value: status,
                          label: status,
                        }))}
                        value={filters.booking_status.map((status) => ({
                          value: status,
                          label: status,
                        }))}
                        onChange={(selected) =>
                          setFilters({
                            ...filters,
                            booking_status: selected.map(
                              (option) => option.value
                            ),
                          })
                        }
                        placeholder="Select booking statuses"
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Keyword Search
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        placeholder="Search Name or Email"
                        value={filters.keyword_search}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            keyword_search: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Filter Type
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        value={filters.filter_type}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            filter_type: e.target.value,
                          })
                        }
                      >
                        <option value="Booking">Booking Date</option>
                        <option value="Created">Created Date</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Range
                      </label>
                      <DatePicker
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        selectsRange
                        startDate={filters.date_range[0]}
                        endDate={filters.date_range[1]}
                        onChange={(update) =>
                          setFilters({ ...filters, date_range: update })
                        }
                        isClearable
                        placeholderText="Select date range"
                      />
                    </div>
                  </div>

                  <div className="mt-4 text-right">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                      onClick={handleApplyFilters}
                    >
                      Apply Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-6">
              {isLoading ? (
                <SkeletonLoader
                  rows={6}
                  columns={[
                    "Client",
                    "Consultant",
                    "Added By",
                    "Booking Information",
                    "Call Type",
                    "Status",
                  ]}
                />
              ) : (
                <div className="overflow-hidden">
                  <DataTable
                    ref={tableRef}
                    data={bookings}
                    columns={columns}
                    className="display table table-auto w-full text-[13px]"
                    options={tableOptions}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showForm && (
          <div className="mb-6">
            <AddBooking
              user={user}
              fetchAllBookings={fetchAllBookings}
              setShowForm={setShowForm}
              bookingId={bookingid}
            />
          </div>
        )}
      </AnimatePresence>
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
