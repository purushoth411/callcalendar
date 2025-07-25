import React, { useEffect, useState } from "react";
import SkeletonLoader from "../../components/SkeletonLoader.jsx";
import Calendar from "./Calendar";

const ScheduleCall = ({ consultantId, saleType, bookingId, rcBookingDate, rcSlotTime, callRequestId }) => {
  const [loading, setLoading] = useState(true);
  const [timezoneList, setTimezoneList] = useState([]);
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [questionData, setQuestionData] = useState({ count: 0, questions: '' });
  const [consultantName, setConsultantName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
   const [bookingDetails, setBookingDetails] = useState(null);
  const [consultantSettings, setConsultantSettings] = useState(null);

 const fetchBookingDetailsWithRc = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/helpers/getBookingDetailsWithRc?id=26076`);
      const data = await response.json();

      if (data.status) {
        setBookingDetails(data.bookingDetails);
        setConsultantSettings(data.consultantSettings);
        setError("");
      } else {
        setError(data.message || "Failed to fetch booking details");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetailsWithRc();
  }, []);

  const handleTimezoneChange = (e) => {
    setSelectedTimezone(e.target.value);
  };

  const handleDateSelect = async (dateStr) => {
    setSelectedDate(dateStr);
    try {
      const res = await fetch(`/api/consultants/${consultantId}/slots?date=${dateStr}&timezone=${selectedTimezone}`);
      const json = await res.json();
      setAvailableSlots(json.slots || []);
    } catch (err) {
      console.error("Error fetching slots:", err);
      setAvailableSlots([]);
    }
  };

 return (
  <div className="p-6">
    <div className="card shadow">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h4 className="card-title">Schedule Call</h4>
          {consultantName && (
            <label className="text-sm text-gray-600 font-medium">
              Consultant: {consultantName}
            </label>
          )}
        </div>

        <form>
          {/* Hidden inputs */}
          <input type="hidden" name="booking_date" value={selectedDate} />
          <input type="hidden" name="que_counter" value={questionData.count} />
          <input type="hidden" name="que_fld_data" value={questionData.questions} />
          <input type="hidden" name="slcttimezone" value={selectedTimezone} />

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Calendar Section */}
            <div className="md:col-span-2">
              {loading ? (
                <SkeletonLoader />
              ) : (
                <>
                  <h4 className="text-lg font-semibold mb-3">Select a Date</h4>
                  <div className="border rounded shadow-sm p-2 bg-white">
                    <Calendar height={500} onDateClick={handleDateSelect} />
                  </div>
                </>
              )}
            </div>

            {/* Timezone & Slots */}
            <div className="flex flex-col justify-between h-full">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Select Time Zone
                </label>
                <select
                  className="form-control border rounded px-3 py-2"
                  value={selectedTimezone}
                  onChange={handleTimezoneChange}
                >
                  {Object.entries(timezoneList).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h5 className="text-gray-800 font-semibold mb-2">
                  {selectedDate
                    ? `Available Slots for ${selectedDate}`
                    : "Select a date to view slots"}
                </h5>

                {availableSlots.length > 0 ? (
                  <ul className="list-group max-h-64 overflow-auto border rounded">
                    {availableSlots.map((slot, i) => (
                      <li
                        key={i}
                        className="list-group-item cursor-pointer hover:bg-blue-100 transition"
                      >
                        {slot}
                      </li>
                    ))}
                  </ul>
                ) : selectedDate ? (
                  <p className="text-sm text-red-600">No slots available for this day.</p>
                ) : null}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
);

};

export default ScheduleCall;
