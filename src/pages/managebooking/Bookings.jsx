import React, { useEffect, useState, useRef } from "react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import $ from "jquery";
import { useAuth } from "../../utils/idb.jsx";
import {
  formatBookingDateTime,
  formatDate,
} from "../../helpers/CommonHelper.jsx";
import SkeletonLoader from "../../components/SkeletonLoader.jsx";

export default function Bookings() {
  const { user } = useAuth();

  DataTable.use(DT);

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [historyData, setHistoryData] = useState({}); // Store history for each booking
  const [loadingHistory, setLoadingHistory] = useState(new Set());

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
          }),
        }
      );

      const result = await response.json();
      if (result.status) {
        setBookings(result.data);
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

  setLoadingHistory(prev => new Set([...prev, bookingId]));

  try {
    const res = await fetch(`http://localhost:5000/api/bookings/history/${bookingId}`);
    const result = await res.json();

    const data = result.status ? result.data : [];

    setHistoryData(prev => ({
      ...prev,
      [bookingId]: data,
    }));

    return data;
  } catch (error) {
    console.error("Error fetching history:", error);
    setHistoryData(prev => ({
      ...prev,
      [bookingId]: [],
    }));
    return [];
  } finally {
    setLoadingHistory(prev => {
      const newSet = new Set(prev);
      newSet.delete(bookingId);
      return newSet;
    });
  }
};


  const toggleHistoryRow = (bookingId) => {
    const newExpandedRows = new Set(expandedRows);
    
    if (newExpandedRows.has(bookingId)) {
      newExpandedRows.delete(bookingId);
    } else {
      newExpandedRows.add(bookingId);
      fetchBookingHistory(bookingId);
    }
    
    setExpandedRows(newExpandedRows);
  };

  const renderHistoryRow = (bookingId) => {
    const history = historyData[bookingId] || [];
    const isLoadingThis = loadingHistory.has(bookingId);

    if (isLoadingThis) {
      return `
        <tr class="history-row bg-blue-50">
          <td colspan="6" class="p-4">
            <div class="flex items-center justify-center space-x-2">
              <div class="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span class="text-sm text-blue-600">Loading history...</span>
            </div>
          </td>
        </tr>
      `;
    }

    if (history.length === 0) {
      return `
        <tr class="history-row bg-gray-50">
          <td colspan="6" class="p-4 text-center text-gray-500 text-sm">
            No history found for this booking.
          </td>
        </tr>
      `;
    }

    const historyItems = history.map(item => `
      <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-2">
        <div class="text-sm text-gray-700 mb-2">
          ${item.fld_comment}
        </div>
        <div class="text-xs text-gray-500 flex items-center">
          <span class="mr-2">📅</span>
          ${formatDate(item.fld_addedon)}
        </div>
      </div>
    `).join('');

    return `
      <tr class="history-row bg-blue-50">
        <td colspan="6" class="p-4">
          <div class="space-y-2">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-semibold text-gray-800 text-sm">
                📋 Booking History (${history.length} entries)
              </h4>
              <button class="close-history-btn text-gray-500 hover:text-red-600 text-sm px-2 py-1" 
                      data-booking-id="${bookingId}">
                ✕ Close
              </button>
            </div>
            <div class="max-h-64 overflow-y-auto">
              ${historyItems}
            </div>
          </div>
        </td>
      </tr>
    `;
  };
  const generateHistoryHTML = (history) => {
  if (!history || history.length === 0) {
    return `<div class="p-3 text-sm text-gray-500">No history found.</div>`;
  }

  return `
    <div class="space-y-2 p-3">
      ${history.map(item => `
        <div class="bg-white p-3 border rounded shadow-sm">
          <div class="text-gray-700 text-sm">${item.fld_comment}</div>
          <div class="text-gray-400 text-xs mt-1">🕒 ${formatDate(item.fld_addedon)}</div>
        </div>
      `).join("")}
    </div>
  `;
};


  const formatDateTime = (dateString) => {
    return formatDate(dateString);
  };

  const columns = [
    {
      title: "Client",
      data: "client_name",
      render: (data, type, row) =>
        `<div class="font-medium text-gray-900">${data} - ${
          row.fld_client_id || ""
        }</div>`,
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
    const formatted = formatBookingDateTime(row.fld_booking_date, row.fld_booking_slot);
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
      data: "status",
      render: (data) => {
        let color =
          data === "Completed"
            ? "green"
            : data === "Pending"
            ? "orange"
            : "gray";
        return `<span class="text-${color}-600 font-semibold text-sm">${data}</span>`;
      },
    },
  ];

  const tableOptions = {
    responsive: true,
    pageLength: 25,
    lengthMenu: [5, 10, 25, 50],
    order: [[3, "desc"]],
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

  container.find('.show-history-btn').off('click').on('click', function () {
    const bookingId = $(this).data('booking-id');
    const tr = $(this).closest('tr');
    const row = api.row(tr);

    if (row.child.isShown()) {
      row.child.hide();
      tr.removeClass('shown');
    } else {
      if (historyData[bookingId]) {
        const html = generateHistoryHTML(historyData[bookingId]);
        row.child(html).show();
        tr.addClass('shown');
      } else {
        row.child('<div class="p-2 text-sm text-blue-500">Loading...</div>').show();
        fetchBookingHistory(bookingId).then((data) => {
  const html = generateHistoryHTML(data || []);
  row.child(html).show();
  tr.addClass('shown');
});
      }
    }
  });

  // Add search & select styling
  container.find('input[type="search"], select').addClass(
    "form-input px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 sm:text-sm"
  );
}

  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1250px] mx-auto py-5">
        <div className="mb-8">
          <h4 className="text-xl font-bold text-gray-900">
            Booking Management
          </h4>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              All Bookings
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Total:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {isLoading ? "..." : bookings.length}
              </span>
            </div>
          </div>

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

      <style jsx>{`
        .history-row {
          border-left: 4px solid #3b82f6;
        }
        .history-toggle-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}