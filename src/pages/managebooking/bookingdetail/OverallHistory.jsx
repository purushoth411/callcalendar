import React, { useEffect, useState } from 'react';
import { Clock, User, Calendar, Phone, FileText, Info, ChevronDown, ChevronUp } from 'lucide-react';


const OverallHistory = ({ bookingData }) => {
  const [overallHistory, setOverallHistory] = useState([]);
  const [statusHistories, setStatusHistories] = useState({});
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    if (bookingData?.id) {
      fetchOverallHistory(bookingData.id);
    }
  }, [bookingData]);

  const fetchOverallHistory = async (bookingId) => {
    try {
      const res = await fetch(`https://callback-2suo.onrender.com/api/bookings/history/${bookingId}`);
      const data = await res.json();
      setOverallHistory(data.data);

      data.data.forEach(async (item) => {
        const commentText = item.fld_comment?.split(" on ")[0] || "";
        const status = extractStatus(commentText);
        if (status) {
          const statusRes = await fetch(
            `https://callback-2suo.onrender.com/api/bookings/statusHistory?bookingId=${bookingId}&status=${status}`
          );
          const statusData = await statusRes.json();
          setStatusHistories((prev) => ({ ...prev, [status]: statusData.data }));
        }
      });
    } catch (err) {
      console.error("Fetch history error:", err);
    }
  };

  const extractStatus = (text) => {
    const possibleStatuses = [
      "Pending", "Consultant Assigned", "Call Scheduled", "Call Rescheduled",
      "Completed", "Rescheduled", "Accept", "Reject", "Converted",
      "External", "Cancelled", "Client did not join", "Reassign Request"
    ];
    return possibleStatuses.find((status) => text.includes(status));
  };

  const getStatusColor = (status) => {
    const colors = {
      "Completed": "bg-green-500",
      "Pending": "bg-yellow-500",
      "Cancelled": "bg-red-500",
      "Rescheduled": "bg-blue-500",
      "Call Scheduled": "bg-purple-500",
      "Consultant Assigned": "bg-indigo-500"
    };
    return colors[status] || "bg-gray-500";
  };

  const toggleExpand = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Overall History</h2>
      </div>

      <div className="space-y-4">
        {overallHistory.map((entry, idx) => {
          const arrComment = entry.fld_comment?.split(" on ");
          const commentMain = arrComment[0];
          const dateInfo = arrComment[1];
          const status = extractStatus(commentMain);
          const historyList = statusHistories[status] || [];
          const isExpanded = expandedItems[idx];

          return (
            <div key={idx} className="relative">
              {/* Timeline line */}
              {idx < overallHistory.length - 1 && (
                <div className="absolute left-4 top-10 w-0.5 h-full bg-gray-200 -z-10"></div>
              )}
              
              <div className="flex gap-4">
                {/* Timeline dot */}
                <div className={`w-8 h-8 rounded-full ${getStatusColor(status)} flex items-center justify-center flex-shrink-0 mt-1`}>
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium mb-2">{commentMain}</p>
                      
                      {entry.fld_rescheduled_date_time && (
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                            Rescheduled: {entry.fld_rescheduled_date_time}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{dateInfo}</span>
                      </div>
                    </div>

                    {historyList.length > 0 && (
                      <button
                        onClick={() => toggleExpand(idx)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors text-sm"
                      >
                        <Info className="w-4 h-4" />
                        Details
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {/* Expanded details */}
                  {historyList.length > 0 && isExpanded && (
                    <div className="mt-4 border-t pt-4">
                      <div className="space-y-4">
                        {historyList.map((row, i) => (
                          <div key={i} className="bg-white rounded-lg p-4 border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(row.status)} text-white`}>
                                {row.status}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(row.fld_call_completed_date).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-700">
                              {row.status === "Completed" ? (
                                <>
                                  {row.fld_specific_commnets_for_the_call && (
                                    <p><strong>Comments:</strong> {row.fld_specific_commnets_for_the_call}</p>
                                  )}
                                  {row.fld_comment && (
                                    <p><strong>Additional Notes:</strong> {row.fld_comment}</p>
                                  )}
                                </>
                              ) : (
                                <>
                                  {row.fld_status_options && (
                                    <p><strong>Status Options:</strong> {row.fld_status_options}</p>
                                  )}
                                  {row.fld_status_options_rescheduled_others && (
                                    <p><strong>Reschedule Details:</strong> {row.fld_status_options_rescheduled_others}</p>
                                  )}
                                  {row.fld_comment && (
                                    <p><strong>Comments:</strong> {row.fld_comment}</p>
                                  )}
                                </>
                              )}

                              {row.fld_booking_call_file && (
                                <div className="flex items-center gap-2 mt-2">
                                  <FileText className="w-4 h-4 text-blue-500" />
                                  <a
                                    href={`https://callback-2suo.onrender.com/assets/upload_doc/${row.fld_booking_call_file}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                  >
                                    Download File
                                  </a>
                                </div>
                              )}
                            </div>

                            {row.status === "Completed" && row.fld_question1 && (
                              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                <h6 className="font-semibold text-green-800 mb-2">Call Quality Assessment</h6>
                                <div className="space-y-1 text-sm">
                                  <p><strong>Was the CRM able to bridge the call?</strong> {row.fld_question1}</p>
                                  <p><strong>Was the voice clear?</strong> {row.fld_question2}</p>
                                  <p><strong>Was the client informed?</strong> {row.fld_question3}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {overallHistory.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No history available</p>
        </div>
      )}
    </div>
  );
};

export default OverallHistory;