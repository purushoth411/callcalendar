import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react"; // your bell icon
import { toast } from "react-hot-toast";
import { useAuth } from "../utils/idb";

const Notification = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth();

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/helpers/getNotifications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        }
      );
      const result = await response.json();
      if (result.status) {
        setNotifications(result.data || []);
      } else {
        toast.error(result.message || "Failed to fetch notifications");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching notifications");
    } finally {
      setLoading(false);
    }
  };

  // Toggle dropdown and fetch on open
  const toggleDropdown = () => {
    if (!showDropdown) {
      fetchNotifications();
    }
    setShowDropdown(!showDropdown);
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative px-2 py-2 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-haspopup="true"
        aria-expanded={showDropdown}
        aria-label="Show notifications"
      >
        <Bell size={20} />
        {/* Optional: Add badge if you want to show unread count */}
        {/* <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">3</span> */}
      </button>

      {showDropdown && (
        <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-2 max-h-60 overflow-y-auto">
            {loading ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Loading...
              </p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No notifications
              </p>
            ) : (
              notifications.map((notif, idx) => (
                <div
                  key={idx}
                  className="border-b last:border-b-0 border-gray-200 px-3 py-2 hover:bg-gray-100 cursor-pointer rounded"
                >
                  <p className="text-sm text-gray-700">{notif.fld_message}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(notif.fld_addedon).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
