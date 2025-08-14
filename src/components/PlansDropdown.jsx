import { useState } from "react";
import { NavLink } from "react-router-dom";
import { BarChart2 } from "lucide-react";

export default function PlansDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
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
        <div className="absolute bg-[#3c7ca5] shadow-lg mt-1 rounded w-48 z-50 top-7">
          <NavLink
            to="/plans"
            className="block px-4 py-2 text-white hover:bg-[#2d6689]"
            onClick={() => setOpen(false)}
          >
            Plans
          </NavLink>
          <NavLink
            to="/approveaddcallrequests"
            className="block px-4 py-2 text-white hover:bg-[#2d6689]"
            onClick={() => setOpen(false)}
          >
            Approved Call Request
          </NavLink>
        </div>
      )}
    </div>
  );
}
