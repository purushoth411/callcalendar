import { useState } from "react";
import { NavLink } from "react-router-dom";
import { BarChart2 } from "lucide-react";

export default function PlansDropdown() {
  const [open, setOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const handleToggle = async () => {
    const newOpen = !open;
    setOpen(newOpen);

    if (newOpen) {
      
      try {
        const response = await fetch(
          "http://localhost:5000/api/approveaddcallrequests/getAllPendingaddcallrequests"
        );
        const result = await response.json();

        if (result.status ) {
          setPendingCount(result.count || 0);
        } else {
          setPendingCount(0);
        }
      } catch (error) {
        console.error("Error fetching pending count:", error);
        setPendingCount(0);
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="flex items-center text-white hover:text-gray-300 focus:outline-none"
      >
        <BarChart2 className="mr-1" size={14} />
        Plans & Requests
        <svg
          className="ml-1 w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute bg-[#fff] shadow-lg mt-1 rounded w-50 z-50 top-7 right-0 border border-gray-400">
          <NavLink
            to="/plans"
            className="block px-4 py-2 text-gray-900 border-b border-gray-400 hover:bg-[#2d6689] hover:text-white"
            onClick={() => setOpen(false)}
          >
            Plans
          </NavLink>

          <NavLink
            to="/approveaddcallrequests"
            className="flex items-center justify-between block px-4 py-2 text-gray-900 hover:bg-[#2d6689] hover:text-white"
            onClick={() => setOpen(false)}
          >
            <span>Approved Call Request</span>
            {pendingCount >= 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </NavLink>
        </div>
      )}
    </div>
  );
}
