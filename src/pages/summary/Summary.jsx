import React, { useState } from 'react';

const Summary = () => {
  // Sample data - replace with your actual data
  const [callScheduledData] = useState([
    {
      id: 1,
      user_name: "John Doe",
      fld_client_id: "CL001",
      admin_name: "Dr. Smith",
      crm_name: "Sarah Wilson",
      fld_booking_date: "2025-01-15",
      fld_booking_slot: "10:00",
      fld_sale_type: "Presales",
      fld_call_request_sts: "Call Scheduled",
      fld_call_confirmation_status: "Call Confirmation Pending at Client End",
      fld_otp: "WEB123",
      delete_sts: "No",
      messageCount: 2
    },
    {
      id: 2,
      user_name: "Jane Smith",
      fld_client_id: "CL002",
      admin_name: "Dr. Johnson",
      crm_name: "Mike Davis",
      fld_booking_date: "2025-01-16",
      fld_booking_slot: "14:30",
      fld_sale_type: "Support",
      fld_call_request_sts: "Call Scheduled",
      fld_call_confirmation_status: "Call Confirmed by Client",
      fld_otp: "WEB456",
      delete_sts: "No",
      messageCount: 0
    }
  ]);

  const [acceptedPendingData] = useState([
    {
      id: 3,
      user_name: "Alice Brown",
      fld_client_id: "CL003",
      admin_name: "Dr. Williams",
      crm_name: "Tom Anderson",
      fld_booking_date: "2025-01-17",
      fld_booking_slot: "09:15",
      fld_sale_type: "Presales",
      fld_call_request_sts: "Accept",
      fld_call_confirmation_status: "Call Confirmation Pending at Client End",
      fld_otp: "WEB789",
      delete_sts: "No",
      messageCount: 1
    }
  ]);

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'Call Scheduled': 'bg-gray-800 text-white',
      'Consultant Assigned': 'bg-blue-500 text-white',
      'Pending': 'bg-yellow-500 text-white',
      'Accept': 'bg-blue-500 text-white',
      'Accepted': 'bg-blue-500 text-white',
      'Reject': 'bg-red-500 text-white',
      'Completed': 'bg-green-500 text-white',
      'Rescheduled': 'bg-gray-500 text-white',
      'Reassign Request': 'bg-gray-300 text-gray-800',
      'Converted': 'bg-green-500 text-white',
      'Client did not join': 'bg-red-500 text-white'
    };
    return statusClasses[status] || 'bg-gray-500 text-white';
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(`${date} ${time}`);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const TableSection = ({ title, data, viewAllLink }) => (
    <div className="col-span-1 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        <a href={viewAllLink} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          View All
        </a>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-y-auto" style={{ height: '275px' }}>
          <table className="w-full table-auto border-collapse">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Client</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Consultant</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Added By</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Booking Information</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Call Type</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((row, index) => (
                  <tr key={row.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                    <td className={`border border-gray-200 px-4 py-2 text-sm ${row.delete_sts === 'Yes' ? 'line-through' : ''}`}>
                      <a 
                        href={`#/booking_detail/${row.id}`} 
                        className=""
                        title="View Booking Detail"
                      >
                        {row.user_name} - {row.fld_client_id}
                       
                      </a>
                    </td>
                    <td className={`border border-gray-200 px-4 py-2 text-sm ${row.delete_sts === 'Yes' ? 'line-through' : ''}`}>
                      <span className="cursor-pointer text-blue-600 hover:text-blue-800">
                        {row.admin_name}
                      </span>
                    </td>
                    <td className={`border border-gray-200 px-4 py-2 text-sm ${row.delete_sts === 'Yes' ? 'line-through' : ''}`}>
                      <span className="cursor-pointer text-blue-600 hover:text-blue-800">
                        {row.crm_name}
                      </span>
                    </td>
                    <td className={`border border-gray-200 px-4 py-2 text-sm ${row.delete_sts === 'Yes' ? 'line-through' : ''}`}>
                      {formatDateTime(row.fld_booking_date, row.fld_booking_slot)}
                    </td>
                    <td className={`border border-gray-200 px-4 py-2 text-sm ${row.delete_sts === 'Yes' ? 'line-through' : ''}`}>
                      {row.fld_sale_type}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm">
                      <div className="flex flex-col space-y-1">
                        <button 
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(row.fld_call_request_sts)} ${row.delete_sts === 'Yes' ? 'line-through' : ''}`}
                        >
                          {row.fld_call_request_sts}
                        </button>
                        
                        {/* Edit button */}
                        <a 
                          href={`#/edit_booking/${row.id}`} 
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 inline-block w-fit"
                          title="Edit Booking Timing"
                        >
                          ✏️
                        </a>
                        
                        {/* Web Code */}
                        {/* {row.fld_otp && (
                          <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                            Web Code: {row.fld_otp}
                          </span>
                        )} */}
                        
                        {/* Call Confirmation Status */}
                        {/* {row.fld_call_confirmation_status === 'Call Confirmation Pending at Client End' && (
                          <button className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                            {row.fld_call_confirmation_status}
                          </button>
                        )} */}
                        
                        {/* {row.fld_call_confirmation_status === 'Call Confirmed by Client' && (
                          <button className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                            {row.fld_call_confirmation_status}
                          </button>
                        )} */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="border border-gray-200 px-4 py-2 text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      Info. Not Available
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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h4 className="text-2xl font-bold text-gray-800">
            Call Summary
          </h4>
          
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TableSection 
          title="Call Scheduled"
          data={callScheduledData}
          viewAllLink="#/summary?particularstatus=Call Scheduled"
        />
        
        <TableSection 
          title="Accepted And Client Did Not Confirmed"
          data={acceptedPendingData}
          viewAllLink="#/summary?particularstatus=Accept"
        />
      </div>
    </div>
  );
};

export default Summary;