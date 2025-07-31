import React, { useEffect, useState } from "react";
import SkeletonLoader from "../../components/SkeletonLoader.jsx";
import Calendar from "./Calendar";
import CalendarLoader from "./CalendarLoader.jsx";
import toast from "react-hot-toast";

const ScheduleCall = () => {
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
  const [callLink, setCallLink] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);

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
    setLoadingSlots(true);
    setSelectedDate(dateStr);
    setSelectedSlot(""); // Reset selected slot

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

    const blockFieldMap = {
      sun: "fld_sun_time_block",
      mon: "fld_mon_time_block",
      tue: "fld_tue_time_block",
      wed: "fld_wed_time_block",
      thu: "fld_thu_time_block",
      fri: "fld_fri_time_block",
      sat: "fld_sat_time_block",
    };

    const normalizeTime = (time) =>
      time
        .replace(/^0+/, "") // Remove leading 0s
        .replace(/\u202F|\u00A0/g, " ") // Normalize non-breaking spaces
        .trim()
        .toUpperCase();

    const timeData = consultantSettings[dayFieldMap[dayKey]];
    const blockData = consultantSettings[blockFieldMap[dayKey]] || "";

    if (!timeData) return setAvailableSlots([]);

    const blockedSlots = blockData
      .split("-")
      .map((s) => normalizeTime(s))
      .filter((s) => s !== "");

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
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        const normalizedSlot = normalizeTime(slot);
        if (!blockedSlots.includes(normalizedSlot)) {
          generatedSlots.push(normalizedSlot);
        }

        current = new Date(current.getTime() + 30 * 60 * 1000); // 30 min
      }
    });

    try {
      const res1 = await fetch(
        "http://localhost:5000/api/helpers/getBookingData",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            consultantId: bookingDetails.fld_consultantid,
            selectedDate: dateStr,
            status: "Reject",
            hideSubOption: "HIDE_SUB_OPT",
            callExternalAssign: "No",
            showAcceptedCall: "Yes",
            checkType: "CHECK_BOTH",
          }),
        }
      );

      const data1 = await res1.json();

      // 🔶 API 2: getRcCallBookingRequest
      const res2 = await fetch(
        "http://localhost:5000/api/helpers/getRcCallBookingRequest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            consultantId: 143,
            selectedDate: dateStr,
          }),
        }
      );

      const data2 = await res2.json();

      // 🔴 Parse booked slots from both responses
      const bookedSlots = [];

      if (data1?.data?.length) {
        data1.data.forEach((item) => {
          if (!item.fld_booking_slot) return;

          const normalizedSlot = normalizeTime(item.fld_booking_slot);
          bookedSlots.push(normalizedSlot);

          if (
            item.fld_sale_type === "Postsales" &&
            item.fld_call_confirmation_status === "Call Confirmed by Client" &&
            item.fld_consultation_sts === "Accept"
          ) {
            const slotTime = new Date(`1970-01-01 ${normalizedSlot}`);
            const prev = new Date(slotTime.getTime() - 30 * 60 * 1000);
            const next = new Date(slotTime.getTime() + 30 * 60 * 1000);

            const prevSlot = prev.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });

            const nextSlot = next.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });

            bookedSlots.push(normalizeTime(prevSlot));
            bookedSlots.push(normalizeTime(nextSlot));
          }
        });
      }

      if (data2?.data?.length) {
        data2.data.forEach((item) => {
          if (item.slot_time) {
            bookedSlots.push(normalizeTime(item.slot_time));
          }
        });
      }

      // ✅ Final available slots = Generated - Booked
      const finalAvailableSlots = generatedSlots.filter(
        (slot) => !bookedSlots.includes(slot)
      );

      console.log("Generated:", generatedSlots);
      console.log("Blocked:", blockedSlots);
      console.log("Booked:", bookedSlots);
      console.log("Available:", finalAvailableSlots);

      setAvailableSlots(finalAvailableSlots);
    } catch (error) {
      console.error("Error fetching booking data:", error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot || !callLink) {
      alert("Please select a date, slot, and provide a call link.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/bookings/saveCallScheduling",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId: bookingDetails?.id,
            consultantId: bookingDetails?.fld_consultantid,
            secondaryConsultantId: bookingDetails?.fld_secondary_consultant_id,
            bookingDate: selectedDate,
            slot: selectedSlot,
            callLink,
            timezone: selectedTimezone,
          }),
        }
      );

      const result = await response.json();

      if (result.status) {
        toast.success("Booking successfully submitted!");
        setCallLink("");
        setSelectedSlot("");

        setTimeout(() => {
          window.location.href = "http://localhost:5173/bookings";
        }, 1500); // optional delay to let toast show
      } else {
        toast.errro("Failed to submit booking.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("An error occurred during submission.");
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
            <input
              type="hidden"
              name="que_counter"
              value={questionData.count}
            />
            <input
              type="hidden"
              name="que_fld_data"
              value={questionData.questions}
            />
            <input type="hidden" name="slcttimezone" value={selectedTimezone} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Calendar */}
              <div className="md:col-span-2">
                {loading ? (
                  <CalendarLoader />
                ) : (
                  <>
                    <h4 className="text-lg font-semibold mb-3">
                      Select a Date
                    </h4>
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
              <div className="flex flex-col  h-full">
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

                  {loadingSlots ? (
                    // Skeleton loader
                    <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                      {Array(16)
                        .fill("")
                        .map((_, i) => (
                          <div
                            key={i}
                            className="h-10 bg-gray-200 animate-pulse rounded-md"
                          ></div>
                        ))}
                    </div>
                  ) : availableSlots.length > 0 ? (
                    // Slots display
                    <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
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

                {selectedSlot && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Enter Call Link
                      </label>
                      <input
                        type="text"
                        value={callLink}
                        onChange={(e) => setCallLink(e.target.value)}
                        className="w-full border px-3 py-2 rounded shadow-sm"
                        placeholder="https://zoom.us/..."
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                      Submit
                    </button>

                    {submitMessage && (
                      <p className="text-sm text-green-600 mt-2">
                        {submitMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCall;
