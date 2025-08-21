import React, { useEffect, useState } from "react";
import TableSection from "./TableSection";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { AnimatePresence, motion } from "framer-motion";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../../utils/idb";
import toast from "react-hot-toast";
import SkeletonLoader from "../../components/SkeletonLoader";

import moment from "moment-timezone";
import { RefreshCcw } from "lucide-react";
import SocketHandler from "../../hooks/SocketHandler";
// import ViewAllTable from "./ViewAllTable";




const today = moment().tz("Asia/Kolkata").startOf("day");
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
  const [allData, setAllData] = useState([]);

  const { user } = useAuth();

  const [consultants, setConsultants] = useState([]);
  const [filteredConsultants, setFilteredConsultants] = useState([]);
  const [crms, setCrms] = useState([]);
  const [consultantType, setConsultantType] = useState("ACTIVE");

  const fetchConsultantsAndCrms = async () => {
    try {
      // Fetch consultants first
      const consultantRes = await fetch(
        "https://callback-2suo.onrender.com/api/helpers/getUsersByRole",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "CONSULTANT", status: "Active" }),
        }
      );
      const consultantData = await consultantRes.json();

      // Then fetch CRMs
      const crmRes = await fetch(
        "https://callback-2suo.onrender.com/api/helpers/getUsersByRole",
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
        "https://callback-2suo.onrender.com/api/helpers/getUsersByRole",
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
    limit = true
  ) => {
    const payload = {
      userId: user.id,
      userType: user.fld_admin_type,
      subadminType : user.fld_subadmin_type,
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
        `https://callback-2suo.onrender.com/api/bookings/fetchSummaryBookings`,
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
    fetchData(setReassignCallData, "Reassign Request", "");
    fetchData(setExternalCallData, "External", "");
    fetchData(setCallCancelledData, "Cancelled", "");
    fetchData(setClientNotJoinedData, "Client did not join", "");
    setShowFilters(false);
  };

  useEffect(() => {
    handleApplyFilters();
  }, []);
  const handleReload = () => {
    handleApplyFilters();
  };

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
    <div className="">
      <SocketHandler otherSetters={[{ setFn: setConsultants, isBookingList: false,consultantType:consultantType },{ setFn: setFilteredConsultants, isBookingList: false,consultantType:consultantType },{ setFn: setCrms, isBookingList: false }]} />
      <div className="mb-4 flex items-center gap-3 justify-between">
        <div className="flex justify-start items-center ">
          <h4 className="text-[16px] font-semibold text-gray-900">Call Summary</h4>
          
        </div>

        <div className="flex gap-2 items-center">
          <button
            className="border border-gray-500 text-gray-500 hover:text-white px-2 py-1 rounded hover:bg-gray-500 text-sm ml-3 cursor-pointer "
            onClick={handleReload}
          >
            <RefreshCcw size={13} />
          </button>
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded text-[11px]"
            onClick={() => {
              setShowFilters(!showFilters);
              if (showFilters) fetchConsultantsAndCrms();
            }}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-300"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1">Call Type</label>
                <select
                  className="w-full border px-3 py-2 rounded border-[#cccccc] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-gray-400 active:border-blue-600"
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
                <label className="block mb-1">Select CRM</label>
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
                <label className="block mb-1">Consultant Type</label>
                <select
                  className="w-full border px-3 py-2 rounded border-[#cccccc] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-gray-400 active:border-blue-600"
                  value={filters.consultant_type}
                  onChange={(e) => {
                    handleConsultantTypeChange(e.target.value);
                    setFilters((f) => ({
                      ...f,
                      consultant_type: e.target.value,
                      consultant_id: null,
                    }));
                  }}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Select Consultant</label>
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
                <label className="block mb-1">Keyword Search</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded border-[#cccccc] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-gray-400 active:border-blue-600"
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
                <label className="block mb-1">Filter Type</label>
                <select
                  className="w-full border px-3 py-2 rounded border-[#cccccc] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-gray-400 active:border-blue-600"
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
                <label className="block mb-1">Date Range</label>
                <DatePicker
                  className="w-full border px-3 py-2 rounded border-[#cccccc] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-gray-400 active:border-blue-600"
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

            <div className="flex gap-2 justify-end">
              <button
                className="bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                onClick={handleClearFilters}
              >
                <RefreshCcw size={13} />
              </button>
              <button
                className="bg-green-600 text-white px-2 py-1 rounded text-[11px] hover:bg-green-700 transition-colors"
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
              callStatus="Call Scheduled"
              CallconfirmationStatus=""
              
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
              callStatus="Accept"
              CallconfirmationStatus="Call Confirmation Pending at Client End"
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
              callStatus="Accept"
              CallconfirmationStatus="Call Confirmed by Client"
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
              callStatus="Consultant Assigned"
              CallconfirmationStatus=""
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
              callStatus="Reject"
              CallconfirmationStatus=""
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
              callStatus="Completed"
              CallconfirmationStatus=""
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
              callStatus="Rescheduled"
              CallconfirmationStatus=""
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
              callStatus="Reassign Request"
              CallconfirmationStatus=""
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
              callStatus="External"
              CallconfirmationStatus=""
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
              callStatus="Cancelled"
              CallconfirmationStatus=""
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
              callStatus="Client did not join"
              CallconfirmationStatus=""
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
