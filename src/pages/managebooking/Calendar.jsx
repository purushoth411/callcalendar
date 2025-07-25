import React, { useRef, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const Calendar = () => {
  const calendarRef = useRef(null);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const yearOptions = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  useEffect(() => {
    const calendarApi = calendarRef.current.getApi();
    const newDate = new Date(selectedYear, selectedMonth, 1);
    calendarApi.gotoDate(newDate);
  }, [selectedMonth, selectedYear]);

  // Style each day cell
  const handleDayCell = (args) => {
    const cellDate = new Date(args.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayOfWeek = cellDate.getDay(); // 0 = Sunday

    if (dayOfWeek === 0) {
      args.el.style.color = "#dc2626"; // Tailwind red-600
    }

    if (cellDate < today) {
      args.el.style.backgroundColor = "#f3f4f6"; // Tailwind gray-100
    } else if (cellDate.toDateString() === today.toDateString()) {
      args.el.style.backgroundColor = "#dbeafe"; // Tailwind blue-100
      args.el.style.fontWeight = "600";
    } else {
      args.el.style.backgroundColor = "#ffffff"; // Future
    }

    args.el.style.borderRadius = "6px";
    args.el.style.padding = "4px";
  };

  return (
    <div className="p-4">
      {/* Custom Header */}
      <div className="flex items-center gap-4 mb-4">
        <select
          className="border px-2 py-1 rounded"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
        >
          {[
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ].map((month, index) => (
            <option key={index} value={index}>{month}</option>
          ))}
        </select>

        <select
          className="border px-2 py-1 rounded"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {yearOptions.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* FullCalendar */}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        ref={calendarRef}
        headerToolbar={false}
        height={600}
        dateClick={(info) => console.log("Date clicked:", info.dateStr)}
        dayCellDidMount={handleDayCell}
      />
    </div>
  );
};

export default Calendar;
