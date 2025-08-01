import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Layout from "../layouts/Layout";
import ScrollToTop from "../components/ScrollToTop";
import { useAuth } from "../utils/idb";
import { useEffect } from "react";
import Dashboard from "../pages/dashboard/Dashboard";
import Login from "../pages/Login";
import Users from "../pages/manageuser/Users";
import Teams from "../pages/Teams";
import Bookings from "../pages/managebooking/Bookings";
import ScheduleCall from "../pages/managebooking/ScheduleCall";
import BookingDetail from "../pages/managebooking/bookingdetail/BookingDetail";
import CallRequestsFromRc from "../pages/additional/CallRequestsFromRc";
import ExternalCalls from "../pages/additional/ExternalCalls";



export default function AppRouter() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Restaurant Routes (NO layout) */}
        <Route path="/login" element={<Login/>} />

        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/bookings/:dashboard_status" element={<Bookings />} />
            <Route path="/schedulecall/:id" element={<ScheduleCall />} />
            <Route path="/admin/booking_detail/:bookingId" element={<BookingDetail />} />
             <Route path="/admin/booking_detail/:bookingId/convert" element={<BookingDetail />} />
            <Route path="/call_request_from_rc" element={<CallRequestsFromRc />} />
            <Route path="/external_calls" element={<ExternalCalls />} />
            <Route path="/admin/add_call_request/:bookingid/enq" element={<Bookings />} />


            
          </Route>
        </Route>
        
      </Routes>
    </Router>
  );
}
