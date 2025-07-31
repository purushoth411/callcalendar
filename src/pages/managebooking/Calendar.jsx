import React, { useEffect, useState } from "react";
import "./Calendar.css"; // For CSS styles

const CustomCalendar = ({ consultantSettings, onDateClick }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  // Extract exclusions and selected weekdays
  const excludedDates = consultantSettings.fld_days_exclusion
    .split("|~|")
    .map((d) => d.trim());

  const allowedWeekDays = consultantSettings.fld_selected_week_days
    .split(",")
    .map((d) => parseInt(d));

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handlePrev = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    if (currentMonth === 0) setCurrentYear(currentYear - 1);
  };

  const handleNext = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    if (currentMonth === 11) setCurrentYear(currentYear + 1);
  };

  const renderCalendar = () => {
    const days = [];
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
    const totalDays = getDaysInMonth(currentMonth, currentYear);

    // Parse Saturday offs
    const saturdayOffs = consultantSettings.fld_saturday_off
      ? consultantSettings.fld_saturday_off.split(",").map((s) => parseInt(s))
      : [];

    let saturdayCount = 0;

    // Fill blank days before start
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={"blank" + i} className="day blank"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(d).padStart(2, "0")}`;
      const dateObj = new Date(currentYear, currentMonth, d);
      const dayOfWeek = dateObj.getDay(); // 0 = Sunday
      const isExcluded = excludedDates.includes(dateStr);
      const isAllowedDay = allowedWeekDays.includes(dayOfWeek + 1);

      // Handle Saturday off logic
      let isNthSaturdayOff = false;
      if (dayOfWeek === 6) {
        // Saturday
        saturdayCount++;
        if (saturdayOffs.includes(saturdayCount)) {
          isNthSaturdayOff = true;
        }
      }

      let classNames = "day";
      const isPastDate =
        dateObj <
        new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isDisabled =
        isExcluded || !isAllowedDay || isNthSaturdayOff || isPastDate;
      // const isDisabled = isExcluded || !isAllowedDay || isNthSaturdayOff;

      if (isExcluded) classNames += " excluded";
      else if (!isAllowedDay || isNthSaturdayOff || isPastDate) classNames += " disabled";
      else if (dayOfWeek === 0) classNames += " sunday";
      if (
        selectedDate &&
        selectedDate.toDateString() === dateObj.toDateString()
      )
        classNames += " selected";

      days.push(
        <div
          key={d}
          className={classNames}
          onClick={() => {
            if (!isDisabled) {
              setSelectedDate(dateObj);
              const formatted = `${currentYear}-${String(
                currentMonth + 1
              ).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

              const dayName = dateObj
                .toLocaleDateString("en-US", { weekday: "short" })
                .toLowerCase(); // "mon", "tue", etc.

              onDateClick && onDateClick(formatted, dayName);
            }
          }}
        >
          {d}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header">
        <button type="button" onClick={handlePrev}>
          Prev
        </button>
        <div className="month-label">
          {new Date(currentYear, currentMonth).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </div>
        <button type="button" onClick={handleNext}>
          Next
        </button>
      </div>
      <div className="day-names">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="day-name">
            {d}
          </div>
        ))}
      </div>
      <div className="calendar-grid">{renderCalendar()}</div>
    </div>
  );
};

export default CustomCalendar;
