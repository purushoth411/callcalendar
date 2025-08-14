import React, { useState } from "react";
import { formatBookingDateTime, formatDate } from "../../helpers/CommonHelper";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowUpRightFromCircle,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";

const badgeMeta = {
  "Call Scheduled": {
    bg: "bg-slate-100",
    text: "text-slate-800",
    icon: <Activity size={13} />,
  },
  "Call Rescheduled": {
    bg: "bg-slate-100",
    text: "text-slate-800",
    icon: <Activity size={13} />,
  },
  "Consultant Assigned": {
    bg: "bg-blue-100",
    text: "text-blue-800",
    icon: <UserCheck size={13} />,
  },
  Pending: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    icon: <Clock size={13} />,
  },
  Accept: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    icon: <CheckCircle size={13} />,
  },
  Accepted: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    icon: <CheckCircle size={13} />,
  },
  Reject: {
    bg: "bg-rose-100",
    text: "text-rose-800",
    icon: <UserX size={13} />,
  },
  Rejected: {
    bg: "bg-rose-100",
    text: "text-rose-800",
    icon: <UserX size={13} />,
  },
  Completed: {
    bg: "bg-green-100",
    text: "text-green-800",
    icon: <CheckCircle size={13} />,
  },
  Converted: {
    bg: "bg-green-100",
    text: "text-green-800",
    icon: <ArrowUpRightFromCircle size={13} />,
  },
  Rescheduled: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    icon: <Clock size={13} />,
  },
  "Reassign Request": {
    bg: "bg-gray-100",
    text: "text-gray-800",
    icon: <Clock size={13} />,
  },
  "Client did not join": {
    bg: "bg-red-100",
    text: "text-red-800",
    icon: <UserX size={13} />,
  },
  Cancelled: {
    bg: "bg-red-100",
    text: "text-red-800",
    icon: <UserX size={13} />,
  },
  _: { bg: "bg-gray-100", text: "text-gray-900", icon: <Activity size={13} /> },
};

const TableSection = ({
  title,
  data,
  selectedStatus,
  callStatus,
 CallconfirmationStatus,
  onClose,
 
}) => {
  const navigate = useNavigate();
  const [expandedRow, setExpandedRow] = useState(null);
  const [historyData, setHistoryData] = useState({});
  const [loadingRows, setLoadingRows] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBookingHistory = async (bookingId) => {
    if (historyData[bookingId]) return historyData[bookingId];

    setLoadingRows((prev) => new Set(prev).add(bookingId));

    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/history/${bookingId}`
      );
      const result = await res.json();
      const data = result.status ? result.data : [];
      setHistoryData((prev) => ({ ...prev, [bookingId]: data }));
      return data;
    } catch (err) {
      console.error("Fetch error:", err);
      setHistoryData((prev) => ({ ...prev, [bookingId]: [] }));
      return [];
    } finally {
      setLoadingRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  const renderHistoryRow = (bookingId) => {
    const data = historyData[bookingId];
    const isLoading = loadingRows.has(bookingId);

    return (
      <tr className="bg-gray-50">
        <td colSpan={6} className="px-4 py-3">
          <div className="flex flex-col items-start w-full">
            {isLoading ? (
              <div className="text-blue-500 text-sm">
                Loading booking history...
              </div>
            ) : data && data.length > 0 ? (
              <ol className="relative border-l-2 border-blue-200 space-y-3 w-full">
                {data.map((item, idx) => (
                  <li key={idx} className="relative ">
                    {/* Dot */}
                    <div className="absolute -left-1.5 top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white z-10" />

                    {/* Content */}
                    <div className="text-sm pl-5 ">
                      <span className="font-medium text-gray-800">
                        {item.fld_comment}
                      </span>
                      <span className="flex items-center text-gray-500 text-xs mt-1 gap-1">
                        <Clock size={12} className="text-blue-600" />
                        {formatDate(item.fld_addedon)}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="text-gray-500 text-sm">No history found.</div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="col-span-1 bg-white rounded shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4 bg-[#d7efff7d] rounded rounded-b-none p-3 py-2">
        <h1 className="text-[14px] font-semibold text-gray-800">
          {title}{" "}
          <span className="text-[12px] bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {data.length}
          </span>
        </h1>

        <div className="flex flex-col sm:flex-row items-center gap-2 ">
          <input
            type="text"
            placeholder="Search bookings..."
            className="border border-gray-300 px-2 py-1 bg-white rounded text-[12px] w-full sm:w-54 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
         
            <button
              onClick={() => {
                console.log("callStatus"+callStatus);
                console.log("confirmationStatus"+CallconfirmationStatus);
                const requestStatus = callStatus;
                const confirmationStatus = CallconfirmationStatus;

                navigate(
                  `/summary/viewall?request_status=${encodeURIComponent(
                    requestStatus
                  )}&confirmation_status=${encodeURIComponent(
                    confirmationStatus
                  )}`
                );
              }}
              className="bg-blue-500 text-white px-2 py-1 rounded text-[11px] whitespace-nowrap hover:bg-blue-600 transition cursor-pointer"
            >
              View All
            </button>
         
          
        </div>
      </div>

      <div className="overflow-hidden px-3">
        <div className="overflow-y-auto" style={{ height: "300px" }}>
          <table className="w-full text-[10px]">
            <thead className="sticky top-0 bg-gray-100 shadow text-gray-700">
              <tr>
                {[
                  "Client",
                  "Consultant",
                  "Added By",
                  "Booking Info",
                  "Call Type",
                  "Status",
                ].map((col) => (
                  <th key={col} className="px-4 py-2 border-b font-medium whitespace-nowrap text-left">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data
                  .filter((row) => {
                    const query = searchQuery.toLowerCase();
                    return (
                      row.user_name?.toLowerCase().includes(query) ||
                      row.admin_name?.toLowerCase().includes(query) ||
                      row.crm_name?.toLowerCase().includes(query) ||
                      row.fld_sale_type?.toLowerCase().includes(query) ||
                      row.fld_call_request_sts?.toLowerCase().includes(query) ||
                      row.fld_client_id?.toLowerCase().includes(query)
                    );
                  })
                  .map((row, index) => {
                    const deletedClass =
                      row.delete_sts === "Yes" ? "line-through" : "";
                    const badge =
                      badgeMeta[row.fld_call_request_sts] || badgeMeta["_"];
                    const isExpanded = expandedRow === row.id;

                    return (
                      <React.Fragment key={row.id}>
                        <tr
                          className={`group ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50 transition`}
                        >
                          <td className={`px-4 py-2 border-b ${deletedClass}`}>
                            <a
                              href={`#/booking_detail/${row.id}`}
                              className="hover:underline text-blue-600"
                            >
                              {row.user_name} - {row.fld_client_id}
                            </a>
                          </td>
                          <td className={`px-4 py-2 border-b  ${deletedClass}`}>
                            {row.admin_name}
                          </td>
                          <td className={`px-4 py-2 border-b  ${deletedClass}`}>
                            {row.crm_name}
                          </td>
                          <td className={`px-4 py-2 border-b ${deletedClass}`}>
                            {formatBookingDateTime(
                              row.fld_booking_date,
                              row.fld_booking_slot
                            )}
                            <button
                              className="ml-2 text-gray-500 hover:text-blue-600 show-history-btn"
                              onClick={async () => {
                                if (isExpanded) {
                                  setExpandedRow(null);
                                } else {
                                  setExpandedRow(row.id);
                                  await fetchBookingHistory(row.id);
                                }
                              }}
                              data-booking-id={row.id}
                            >
                              ⏳
                            </button>
                          </td>
                          <td className={`px-4 py-2 border-b ${deletedClass}`}>
                            {row.fld_sale_type}
                          </td>
                          <td className="px-4 py-2 border-b">
                            <div
                              className={`px-2 py-1 inline-flex items-center gap-1 rounded  font-medium ${badge.bg} ${badge.text} ${deletedClass}`}
                            >
                              {badge.icon}
                              {row.fld_call_request_sts}
                            </div>
                            {row.fld_call_request_sts === "Accept" && (
                              <>
                                {row.fld_call_confirmation_status ===
                                  "Call Confirmation Pending at Client End" && (
                                  <span className="inline-flex items-center gap-1 py-[1px] px-[6px] ml-1 rounded  bg-blue-100 text-blue-800">
                                    <Clock size={12} />{" "}
                                    {row.fld_call_confirmation_status}
                                  </span>
                                )}
                                {row.fld_call_confirmation_status ===
                                  "Call Confirmed by Client" && (
                                  <span className="inline-flex items-center gap-1 py-[1px] px-[6px] ml-1 rounded  bg-green-100 text-green-800">
                                    <CheckCircle size={12} />{" "}
                                    {row.fld_call_confirmation_status}
                                  </span>
                                )}
                              </>
                            )}
                          </td>
                        </tr>

                        {isExpanded && renderHistoryRow(row.id)}
                      </React.Fragment>
                    );
                  })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 px-4 py-2 rounded">
                      No bookings found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableSection;
