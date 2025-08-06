import { useAuth } from "../utils/idb.jsx";
import { useNavigate, NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  LogOut,
  CircleUserRound,
  Bell,
  LayoutDashboard,
  BarChart2,
  Users2,
  Globe2,
  CalendarCheckIcon,
  Phone,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import logo from "../assets/images/callcalendar-logo.png";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <>
      {/* Top Header */}
      <header className="">
        <div className="max-w-[85rem] mx-auto flex items-center justify-between px-2 py-2 ">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="Logo" className="h-10 " />
          </div>

          {/* User Info + Bell */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center px-2 cursor-pointer py-1 rounded-md bg-white text-black transition hover:bg-gray-100"
              >
                <CircleUserRound className="mr-1" size={13} />
                <span className="capitalize text-[12px]">{user.fld_name}</span>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2  bg-white border border-gray-100  rounded-md shadow-lg z-10 cursor-pointer hover:bg-red-100"
                  >
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-1 text-sm  text-red-600 flex items-center cursor-pointer"
                    >
                      <LogOut className="mr-2" size={13} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button className="relative px-2 py-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <Bell size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Navbar below header */}
      <nav className="bg-gradient-to-r from-[#224d68] to-[#3c7ca5] text-white">
        <div className="max-w-[85rem] mx-auto px-3 py-3">
        <div className="flex space-x-6 text-[12px]">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "flex items-center text-white underline font-semibold"
                : "flex items-center text-white hover:text-gray-300"
            }
          >
            <LayoutDashboard className="mr-1" size={14} />
            Dashboard
          </NavLink>

          <NavLink
            to="/summary"
            className={({ isActive }) =>
              isActive
                ? "flex items-center text-white underline font-semibold"
                : "flex items-center text-white hover:text-gray-300"
            }
          >
            <BarChart2 className="mr-1" size={14} />
            Summary
          </NavLink>

          <NavLink
            to="/users"
            className={({ isActive }) =>
              isActive
                ? "flex items-center text-white underline font-semibold"
                : "flex items-center text-white hover:text-gray-300"
            }
          >
            <Users2 className="mr-1" size={14} />
            Users
          </NavLink>
          <NavLink
            to="/teams"
            className={({ isActive }) =>
              isActive
                ? "flex items-center text-white underline font-semibold"
                : "flex items-center text-white hover:text-gray-300"
            }
          >
            <Users2 className="mr-1" size={14} />
            Teams
          </NavLink>
          <NavLink
            to="/bookings"
            className={({ isActive }) =>
              isActive
                ? "flex items-center text-white underline font-semibold"
                : "flex items-center text-white hover:text-gray-300"
            }
          >
            <CalendarCheckIcon className="mr-1" size={14} />
            Bookings
          </NavLink>
          {(user?.fld_admin_type == "SUPERADMIN" ||
            user?.fld_admin_type == "EXECUTIVE" || 
            user?.fld_admin_type == "SUBADMIN" || 
            user?.fld_admin_type == "CONSULTANT") && (
            <NavLink
              to="/external_calls"
              className={({ isActive }) =>
                isActive
                  ? "flex items-center text-white underline font-semibold"
                  : "flex items-center text-white hover:text-gray-300"
              }
            >
              <Phone className="mr-1" size={14} />
              External Calls
            </NavLink>
          )}
          {(user?.fld_admin_type == "SUPERADMIN" ||
            user?.fld_admin_type == "EXECUTIVE") && (
            <NavLink
              to="/call_request_from_rc"
              className={({ isActive }) =>
                isActive
                  ? "flex items-center text-white underline font-semibold"
                  : "flex items-center text-white hover:text-gray-300"
              }
            >
              <Phone className="mr-1" size={14} />
              Call Request From RC
            </NavLink>
          )}
          <NavLink
      to="/domain_pref"
      className={({ isActive }) =>
        isActive
          ? "flex items-center text-white underline font-semibold"
          : "flex items-center text-white hover:text-gray-300"
      }
    >
      <Globe2 className="mr-1" size={16} />
      Domain Pref
    </NavLink>
        </div>
        </div>
      </nav>
    </>
  );
}
