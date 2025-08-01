import React, { useEffect, useState } from 'react';
import { Clock, User, Calendar, Phone, FileText, Info, ChevronDown, ChevronUp } from 'lucide-react';

const OtherCalls = ({ bookingId, clientId, fetchBookingById }) => {
  const [allbookingData, setAllbookingData] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(bookingId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAllClientBookingData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://callback-2suo.onrender.com/api/bookings/getAllClientBookingData?clientId=${clientId}`
        );

        const result = await response.json();

        if (result.status) {
          setAllbookingData(result.data);
        } else {
          console.error("Failed to fetch other bookings");
        }
      } catch (err) {
        console.error("Error fetching other bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      getAllClientBookingData();
    }
  }, [clientId]);

  useEffect(() => {
    setSelectedBookingId(bookingId);
  }, [bookingId]);

  const handleRowClick = (id) => {
    setSelectedBookingId(id);
    fetchBookingById(id);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      "Completed": "bg-green-100 text-green-800",
      "Pending": "bg-yellow-100 text-yellow-800",
      "Cancelled": "bg-red-100 text-red-800",
      "Scheduled": "bg-blue-100 text-blue-800",
      "Rescheduled": "bg-purple-100 text-purple-800"
    };
    
    const colorClass = statusColors[status] || "bg-gray-100 text-gray-800";
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Phone className="w-6 h-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-800">Previous Calls</h2>
        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
          {allbookingData.length} calls
        </span>
      </div>

      {allbookingData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Phone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No previous calls available</p>
          <p className="text-sm">This client has no call history</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Call Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consultant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allbookingData.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleRowClick(item.id)}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      item.id == selectedBookingId 
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <Phone className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.fld_sale_type || 'General Call'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-full mr-3">
                          <User className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="text-sm text-gray-900">
                          {item.admin_name || 'Unassigned'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">{item.fld_booking_date}</div>
                          <div className="text-sm text-gray-500">{item.fld_booking_slot}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.fld_call_request_sts)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtherCalls;