import React, { useEffect, useState } from "react";
import SkeletonLoader from "../../components/SkeletonLoader.jsx";
import Calendar from "./Calendar";

const ScheduleCall = ({
  consultantId,
  saleType,
  bookingId,
  rcBookingDate,
  rcSlotTime,
  callRequestId,
}) => {
  const [loading, setLoading] = useState(true);
  const [timezoneList, setTimezoneList] = useState({});
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [questionData, setQuestionData] = useState({ count: 0, questions: "" });
  const [consultantName, setConsultantName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookingDetails, setBookingDetails] = useState(null);
  const [consultantSettings, setConsultantSettings] = useState(null);
  const [error, setError] = useState("");

  const fetchBookingDetailsWithRc = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/helpers/getBookingDetailsWithRc?id=26076`
      );
      const data = await response.json();

      if (data.status) {
        setBookingDetails(data.bookingDetails);
        setConsultantSettings(data.consultantSettings);
        setConsultantName(data.consultantSettings?.fld_consultant_name || "");
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

  const fetchTimezones = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/helpers/getTimezones?viewtype=show_custom_booking"
      );
      const result = await response.json();

      if (result.status && result.data) {
        setTimezoneList(result.data);
        const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const matchKey = Object.entries(result.data).find(([, val]) =>
          val.includes(localTz)
        );
        if (matchKey) setSelectedTimezone(matchKey[0]);
      }
    } catch (error) {
      console.error("Failed to fetch timezones", error);
    }
  };

  useEffect(() => {
    fetchBookingDetailsWithRc();
    fetchTimezones();
  }, []);

  const handleTimezoneChange = (e) => {
    setSelectedTimezone(e.target.value);
  };

  const handleDateSelect = async (dateStr, dayKey) => {
  setSelectedDate(dateStr);
  setSelectedSlot(""); // Reset on new date

  if (!consultantSettings) return;

  const dayFieldMap = {
    sun: "fld_sun_time_data",
    mon: "fld_mon_time_data",
    tue: "fld_tue_time_data",
    wed: "fld_wed_time_data",
    thu: "fld_thu_time_data",
    fri: "fld_fri_time_data",
    sat: "fld_sat_time_data",
  };

  const timeData = consultantSettings[dayFieldMap[dayKey]];
  if (!timeData) return setAvailableSlots([]);

  const slotRanges = timeData.split("~");
  let generatedSlots = [];

  slotRanges.forEach((range) => {
    const [start, end] = range.split("||");
    if (!start || !end) return;

    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    let current = new Date();
    current.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);

    while (current <= endTime) {
      const slot = current.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      generatedSlots.push(slot);
      current = new Date(current.getTime() + 30 * 60 * 1000); // 30-min step
    }
  });

  try {
    // 🔶 API Call 1 - getBookingData
    const res1 = await fetch("http://localhost:5000/api/helpers/getBookingData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        consultantId: 8,
        selectedDate: dateStr,
        status: "Reject",
        hideSubOption: "HIDE_SUB_OPT",
        callExternalAssign: "No",
        showAcceptedCall: "Yes",
        checkType: "CHECK_BOTH",
      }),
    });

    const data1 = await res1.json();
    if (!data1.status) {
      setAvailableSlots([]);
      return;
    }

    // 🔶 API Call 2 - getRcCallBookingRequest
    const res2 = await fetch("http://localhost:5000/api/helpers/getRcCallBookingRequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        consultantId: 8,
        selectedDate: dateStr,
      }),
    });

    const data2 = await res2.json();

    // 🔴 Extract booked slots from both APIs
    const bookedSlots = [];

    if (data1.data) {
      data1.data.forEach((item) => {
        if (item.slot_time) bookedSlots.push(item.slot_time);
      });
    }

    if (data2.data) {
      data2.data.forEach((item) => {
        if (item.slot_time) bookedSlots.push(item.slot_time);
      });
    }

    // 🔵 Filter generatedSlots to exclude booked ones
    const available = generatedSlots.filter(
      (slot) => !bookedSlots.includes(slot)
    );

    setAvailableSlots(available);
  } catch (error) {
    console.error("Error fetching booking data:", error);
    setAvailableSlots([]);
  }
};


  return (
    <div className="p-6">
      <div className="card shadow">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xl font-bold">Schedule Call</h4>
            {consultantName && (
              <span className="text-sm text-gray-600">
                Consultant: <strong>{consultantName}</strong>
              </span>
            )}
          </div>

          <form>
            <input type="hidden" name="booking_date" value={selectedDate} />
            <input type="hidden" name="que_counter" value={questionData.count} />
            <input type="hidden" name="que_fld_data" value={questionData.questions} />
            <input type="hidden" name="slcttimezone" value={selectedTimezone} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Calendar */}
              <div className="md:col-span-2">
                {loading ? (
                  <SkeletonLoader />
                ) : (
                  <>
                    <h4 className="text-lg font-semibold mb-3">Select a Date</h4>
                    <div className="border rounded shadow-sm p-2 bg-white">
                      <Calendar
                        height={700}
                        onDateClick={handleDateSelect}
                        consultantSettings={consultantSettings}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Timezone and slots */}
              <div className="flex flex-col justify-between h-full">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Select Time Zone
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={selectedTimezone}
                    onChange={handleTimezoneChange}
                  >
                    {Object.entries(timezoneList).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.trim()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Slots */}
                <div>
                  <h5 className="text-gray-800 font-semibold mb-2">
                    {selectedDate
                      ? `Available Slots for ${selectedDate}`
                      : "Select a date to view slots"}
                  </h5>

                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {availableSlots.map((slot, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedSlot(slot)}
                          className={`cursor-pointer border rounded-md text-center py-2 px-3 text-sm transition
                            ${
                              selectedSlot === slot
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-gray-50 hover:bg-blue-100"
                            }`}
                        >
                          {slot}
                        </div>
                      ))}
                    </div>
                  ) : selectedDate ? (
                    <p className="text-sm text-red-600">
                      No slots available for this day.
                    </p>
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
