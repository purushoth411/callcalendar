import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Layout from "../layouts/Layout";
import ScrollToTop from "../components/ScrollToTop";
import { useAuth } from "../utils/idb";
import { useEffect } from "react";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Users from "../pages/manageuser/Users";
import DomainPref from "../pages/Domainpref";
import Teams from "../pages/Teams";
import Bookings from "../pages/managebooking/Bookings";



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
            <Route path="/domainpref" element={<DomainPref />} />
          </Route>
        </Route>
        
      </Routes>
    </Router>
  );
}
