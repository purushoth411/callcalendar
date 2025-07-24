export const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date)) return "";

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day < 10 ? "0" + day : day} ${month} ${year}`;
};

export const formatBookingDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return "";

  // Combine to create a valid Date object
  const [hours, minutesPart] = timeStr.split(':');
  const [minutes, period] = minutesPart.split(' ');
  const hour = parseInt(hours) + (period === 'PM' && hours !== '12' ? 12 : 0);
  const isoTime = `${hour.toString().padStart(2, '0')}:${minutes}:00`;

  const dateTimeStr = `${dateStr}T${isoTime}`;
  const date = new Date(dateTimeStr);

  const options = {
    weekday: "short", // Tue
    day: "2-digit",   // 15
    month: "short",   // Jul
    year: "numeric",  // 2025
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  return date.toLocaleString("en-US", options); // Output: Tue, 15 Jul, 2025, 10:00 AM
};

export const callRegardingOptions = {
  Presales: {
    1: "Understanding the client's requirements in detail",
    2: "Client needs to talk to the expert",
    3: "Brainstorming Call",
    4: "Client asked for a discount and needed re-discussion",
    5: "Understanding and giving confidence to the client",
  },
  Postsales: {
    1: "Understanding the client's requirements in detail",
    2: "Client needs to talk to the expert",
    3: "Brainstorming Call",
    4: "Client requested discussion on work provided",
    5: "Understanding and giving confidence to the client",
  },
};




