import { useAuth } from "../utils/idb.jsx";
import { useNavigate, NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { LogOut, CircleUserRound, Bell,LayoutDashboard, BarChart2, Users2, Globe2,CalendarCheckIcon } from "lucide-react";
import { AnimatePresence,motion } from "framer-motion";
import logo from '../assets/images/callcalendar-logo.png';

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
      <header className="bg-white text-[#092e46] shadow-md">
        <div className="mx-auto flex items-center justify-between px-4 py-2">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <img src={logo} alt="Logo" className="h-10 w-auto mr-2" />
          </div>

          {/* User Info + Bell */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center px-2 py-1 rounded-md bg-gray-100 text-black transition hover:bg-gray-200"
              >
                <CircleUserRound className="mr-1" size={15} />
                <span className="capitalize font-[10px]">{user.fld_name}</span>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-10"
                  >
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-red-100 text-red-600 flex items-center"
                    >
                      <LogOut className="mr-2" size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button className="relative px-2 py-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <Bell size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Navbar below header */}
    <nav className="navbar-bg shadow-inner px-4 py-2">
  <div className="flex space-x-6 font-medium text-sm">
    <NavLink
      to="/"
      className={({ isActive }) =>
        isActive
          ? "flex items-center text-white underline font-semibold"
          : "flex items-center text-white hover:text-gray-300"
      }
    >
      <LayoutDashboard className="mr-1" size={16} />
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
      <BarChart2 className="mr-1" size={16} />
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
      <Users2 className="mr-1" size={16} />
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
      <Users2 className="mr-1" size={16} />
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
      <CalendarCheckIcon className="mr-1" size={16} />
      Bookings
    </NavLink>
     {/* <NavLink
      to="/domainpref"
      className={({ isActive }) =>
        isActive
          ? "flex items-center text-white underline font-semibold"
          : "flex items-center text-white hover:text-gray-300"
      }
    >
      <Globe2 className="mr-1" size={16} />
      Domain Pref
    </NavLink> */}
  </div>
</nav>

    </>
  );
}
