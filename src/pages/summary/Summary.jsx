import React, { useEffect, useState } from "react";
import TableSection from "./TableSection";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { AnimatePresence, motion } from "framer-motion";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../../utils/idb";
import toast from "react-hot-toast";
import SkeletonLoader from "../../components/SkeletonLoader";
import moment from "moment";
import { RefreshCcw } from "lucide-react";
// import ViewAllTable from "./ViewAllTable";

const crms = [
  { id: 1, fld_name: "CRM1" },
  { id: 2, fld_name: "CRM2" },
];
const consultants = [
  { id: 1, fld_name: "Consultant 1", type: "ACTIVE" },
  { id: 2, fld_name: "Consultant 2", type: "INACTIVE" },
];
const today = moment().startOf("day");
const Summary = () => {
  const [filters, setFilters] = useState({
    sale_type: "",
    call_rcrd_status: "",
    booking_status: [],
    keyword_search: "",
    filter_type: "Booking",
    date_range: [today.toDate(), today.toDate()],
    crm_id: null,
    consultant_id: null,
    consultant_type: "ACTIVE",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  const [callScheduledData, setCallScheduledData] = useState([]);
  const [acceptedPendingData, setAcceptedPendingData] = useState([]);
  const [addedNotScheduledData, setAddedNotScheduledData] = useState([]);
  const [acceptedConfirmedData, setAcceptedConfirmedData] = useState([]);
  const [consultantRejectedData, setConsultantRejectedData] = useState([]);
  const [callCompletedData, setCallCompletedData] = useState([]);
  const [rescheduledCall, setRescheduledCall] = useState([]);
  const [reassignCallData, setReassignCallData] = useState([]);
  const [externalCallData, setExternalCallData] = useState([]);
  const [callCancelledData, setCallCancelledData] = useState([]);
  const [clientNotJoinedData, setClientNotJoinedData] = useState([]);

  const [selectedStatus, setSelectedStatus] = useState(null);
  const [confirmationStatus, setConfirmationStatus] = useState(null);
  const [allData,setAllData]=useState([]);

  const { user } = useAuth();

  const filteredConsultants = consultants.filter(
    (c) => c.type === filters.consultant_type
  );

  const formatDate = (date) =>
    date
      ? `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
      : null;

  const fetchData = async (
    setData,
    callRequestStatus,
    callConfirmationStatus,
    limit=true
  ) => {
    const payload = {
      userId: user.id,
      userType: user.fld_admin_type,
      assigned_team: user.fld_team_id,
      filters: {
        consultationStatus:
          filters.booking_status.length === 1
            ? filters.booking_status[0]
            : null,
        callRequestStatus,
        callConfirmationStatus,
        recordingStatus: filters.call_rcrd_status,
        fromDate: formatDate(filters.date_range[0]),
        toDate: formatDate(filters.date_range[1]),
        consultantId: filters.consultant_id || null,
        crmId: filters.crm_id || null,
        search: filters.keyword_search,
        sale_type: filters.sale_type || null,
        filter_type: filters.filter_type || "Booking",
      },
    type: limit ? "all" : "",

    };

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/fetchSummaryBookings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filterPayload: payload }),
        }
      );

      const result = await response.json();
      if (result.status) {
        setData(result.data || []);
      } else {
        console.log(result.message || "Failed to fetch data");
      }
    } catch {
      toast.error("Network error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchData(setCallScheduledData, "Call Scheduled", "");
    fetchData(
      setAcceptedPendingData,
      "Accept",
      "Call Confirmation Pending at Client End"
    );
    fetchData(setAddedNotScheduledData, "Consultant Assigned", "");
    fetchData(setAcceptedConfirmedData, "Accept", "Call Confirmed by Client");
    fetchData(setConsultantRejectedData, "Reject", "");
    fetchData(setCallCompletedData, "Completed", "");
    fetchData(setRescheduledCall, "Rescheduled", "");
    fetchData(setReassignCallData, "ComReassign Requestpleted", "");
    fetchData(setExternalCallData, "External", "");
    fetchData(setCallCancelledData, "Cancelled", "");
    fetchData(setClientNotJoinedData, "Client did not join", "");
    setShowFilters(false);
  };

  useEffect(() => {
    handleApplyFilters();
  }, []);
    const handleReload=()=>{
handleApplyFilters();
  }

 const handleClearFilters = () => {
    setFilters({
      sale_type: "",
      call_rcrd_status: "",
      booking_status: [],
      keyword_search: "",
      filter_type: "Booking",
      date_range: [today.toDate(), today.toDate()],
      crm_id: null,
      consultant_id: null,
      consultant_type: "ACTIVE",
    });
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6 flex justify-between items-center">
        <h4 className="text-2xl font-bold text-gray-800">Call Summary</h4>
       <div>
         <button
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
                onClick={handleReload}
              >
              <RefreshCcw size={15} />
              </button>
        
         <button
          className="ml-2 bg-blue-500 text-white px-3 py-1 rounded text-sm"
          onClick={() => setShowFilters((v) => !v)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
       </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="bg-white p-4 rounded-lg shadow mb-6 border"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1">Call Type</label>
                <select
                  className="w-full border px-3 py-2 rounded text-sm"
                  value={filters.sale_type}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, sale_type: e.target.value }))
                  }
                >
                  <option value="">Select Call Type</option>
                  <option value="Presales">Presales</option>
                  <option value="Postsales">Postsales</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Select CRM</label>
                <Select
                  options={crms.map((c) => ({
                    value: c.id,
                    label: c.fld_name,
                  }))}
                  value={
                    filters.crm_id
                      ? {
                          value: filters.crm_id,
                          label: crms.find((c) => c.id === filters.crm_id)
                            ?.fld_name,
                        }
                      : null
                  }
                  onChange={(opt) =>
                    setFilters((f) => ({
                      ...f,
                      crm_id: opt ? opt.value : null,
                    }))
                  }
                  isClearable
                  placeholder="Select CRM"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Consultant Type</label>
                <select
                  className="w-full border px-3 py-2 rounded text-sm"
                  value={filters.consultant_type}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      consultant_type: e.target.value,
                      consultant_id: null,
                    }))
                  }
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Select Consultant</label>
                <Select
                  options={filteredConsultants.map((c) => ({
                    value: c.id,
                    label: c.fld_name,
                  }))}
                  value={
                    filters.consultant_id
                      ? {
                          value: filters.consultant_id,
                          label: filteredConsultants.find(
                            (c) => c.id === filters.consultant_id
                          )?.fld_name,
                        }
                      : null
                  }
                  onChange={(opt) =>
                    setFilters((f) => ({
                      ...f,
                      consultant_id: opt ? opt.value : null,
                    }))
                  }
                  isClearable
                  placeholder="Select Consultant"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Keyword Search</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded text-sm"
                  placeholder="Search Name or Email"
                  value={filters.keyword_search}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      keyword_search: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Filter Type</label>
                <select
                  className="w-full border px-3 py-2 rounded text-sm"
                  value={filters.filter_type}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, filter_type: e.target.value }))
                  }
                >
                  <option value="Booking">Booking Date</option>
                  <option value="Created">Created Date</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Date Range</label>
                <DatePicker
                  className="w-full border px-3 py-2 rounded text-sm"
                  selectsRange
                  startDate={filters.date_range[0]}
                  endDate={filters.date_range[1]}
                  onChange={(update) =>
                    setFilters((f) => ({ ...f, date_range: update }))
                  }
                  isClearable
                  placeholderText="Select date range"
                />
              </div>
            </div>

             <div className="mt-4 flex gap-2 justify-end">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
                onClick={handleClearFilters}
              >
              <RefreshCcw />
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                onClick={handleApplyFilters}
                disabled={loading}
              >
                {loading ? "Applying..." : "Apply Filters"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedStatus ? (
        <div className="w-full h-screen">
          {/* <ViewAllTable
            title="Call Scheduled"
            data={allData}
           
            setSelectedStatus={setSelectedStatus}
            setConfirmationStatus={setConfirmationStatus}
            
            onClose={() => {
              setSelectedStatus(null);
            }}
          /> */}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <SkeletonLoader
              rows={6}
              columns={[
                "Client",
                "Consultant",
                "Added By",
                "Booking Info",
                "Call Type",
                "Status",
              ]}
            />
          ) : (
            <TableSection
              title="Call Scheduled"
              data={callScheduledData}
             selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            setConfirmationStatus={setConfirmationStatus}
               
            />
          )}
          {loading ? (
            <SkeletonLoader
              rows={6}
              columns={[
                "Client",
                "Consultant",
                "Added By",
                "Booking Info",
                "Call Type",
                "Status",
              ]}
            />
          ) : (
            <TableSection
              title="Accepted And Client Did Not Confirmed"
              data={acceptedPendingData}
             selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            setConfirmationStatus={setConfirmationStatus}
               onClose={() => {
                setSelectedStatus(null);
                setConfirmationStatus(null);
              }}
               
            />
          )}
          {loading ? (
            <SkeletonLoader
              rows={6}
              columns={[
                "Client",
                "Consultant",
                "Added By",
                "Booking Info",
                "Call Type",
                "Status",
              ]}
            />
          ) : (
            <TableSection
              title="Accepted And Client Confirmed"
              data={acceptedConfirmedData}
             selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            setConfirmationStatus={setConfirmationStatus}
               onClose={() => {
                setSelectedStatus(null);
                setConfirmationStatus(null);
              }}
            />
          )}
          {loading ? (
            <SkeletonLoader
              rows={6}
              columns={[
                "Client",
                "Consultant",
                "Added By",
                "Booking Info",
                "Call Type",
                "Status",
              ]}
            />
          ) : (
            <TableSection
              title="Call Added and Not Scheduled"
              data={addedNotScheduledData}
             selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            setConfirmationStatus={setConfirmationStatus}
               onClose={() => {
                setSelectedStatus(null);
                setConfirmationStatus(null);
              }}
            />
          )}
          {loading ? (
            <SkeletonLoader
              rows={6}
              columns={[
                "Client",
                "Consultant",
                "Added By",
                "Booking Info",
                "Call Type",
                "Status",
              ]}
            />
          ) : (
            <TableSection
              title="Consultant Rejected"
              data={consultantRejectedData}
             selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            setConfirmationStatus={setConfirmationStatus}
               onClose={() => {
                setSelectedStatus(null);
                setConfirmationStatus(null);
              }}
            />
          )}
          {loading ? (
            <SkeletonLoader
              rows={6}
              columns={[
                "Client",
                "Consultant",
                "Added By",
                "Booking Info",
                "Call Type",
                "Status",
              ]}
            />
          ) : (
            <TableSection
              title="Completed"
              data={callCompletedData}
             selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            setConfirmationStatus={setConfirmationStatus}
               onClose={() => {
                setSelectedStatus(null);
                setConfirmationStatus(null);
              }}
            />
          )}
          {loading ? (
            <SkeletonLoader
              rows={6}
              columns={[
                "Client",
                "Consultant",
                "Added By",
                "Booking Info",
                "Call Type",
                "Status",
              ]}
            />
          ) : (
            <TableSection
              title="Rescheduled Call"
              data={rescheduledCall}
             selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            setConfirmationStatus={setConfirmationStatus}
               onClose={() => {
                setSelectedStatus(null);
                setConfirmationStatus(null);
              }}
            />
          )}
          {loading ? (
            <SkeletonLoader
              rows={6}
              columns={[
                "Client",
                "Consultant",
                "Added By",
                "Booking Info",
                "Call Type",
                "Status",
              ]}
            />
          ) : (
            <TableSection
              title="Reassign Call"
              data={reassignCallData}
             selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            setConfirmationStatus={setConfirmationStatus}
               onClose={() => {
                setSelectedStatus(null);
                setConfirmationStatus(null);
              }}
            />
          )}
          {loading ? (
            <SkeletonLoader
              rows={6}
              columns={[
                "Client",
                "Consultant",
                "Added By",
                "Booking Info",
                "Call Type",
                "Status",
              ]}
            />
          ) : (
            <TableSection
              title="External Call"
              data={externalCallData}
             selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            setConfirmationStatus={setConfirmationStatus}
               onClose={() => {
                setSelectedStatus(null);
                setConfirmationStatus(null);
              }}
            />
          )}
          {loading ? (
            <SkeletonLoader
              rows={6}
              columns={[
                "Client",
                "Consultant",
                "Added By",
                "Booking Info",
                "Call Type",
                "Status",
              ]}
            />
          ) : (
            <TableSection
              title="Call Cancelled"
              data={callCancelledData}
             selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            setConfirmationStatus={setConfirmationStatus}
               onClose={() => {
                setSelectedStatus(null);
                setConfirmationStatus(null);
              }}
            />
          )}
          {loading ? (
            <SkeletonLoader
              rows={6}
              columns={[
                "Client",
                "Consultant",
                "Added By",
                "Booking Info",
                "Call Type",
                "Status",
              ]}
            />
          ) : (
            <TableSection
              title="Client did not join"
              data={clientNotJoinedData}
             selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            setConfirmationStatus={setConfirmationStatus}
               onClose={() => {
                setSelectedStatus(null);
                setConfirmationStatus(null);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Summary;
