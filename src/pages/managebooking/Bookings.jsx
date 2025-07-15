import React, { useEffect, useState, useRef } from "react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import $ from "jquery";
import { useAuth } from "../../utils/idb.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import AddUser from "./AddUser.jsx";
import EditUser from "./EditUser.jsx";
import { formatDate } from "../../helpers/CommonHelper.jsx";
import SkeletonLoader from "../../components/SkeletonLoader.jsx";

export default function Bookings() {
  const { user, logout } = useAuth();

  DataTable.use(DT);
  
  const [isLoading, setIsLoading] = useState(true);
 
  const tableRef = useRef(null);
 

  useEffect(() => {
    fetchAllBookings();
    
  }, []);



  const fetchAllBookings = async () => {
    try {
      setIsLoading(true);
      const filters = {
        usertype: [], // Fetch all user types
        keyword: "",
      };

      const response = await fetch(
        "http://localhost:5000/api/users/getallusers",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        }
      );

      const result = await response.json();
      if (result.status) {
        setAllUsers(result.data);
      } else {
        setAllUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setAllUsers([]);
    } finally {
      setIsLoading(false);
    }
  };



  const columns = [
    {
      title: "Name",
      data: "fld_name",
      orderable: true,
      render: (data) =>
        `<div class="font-medium text-gray-900">${data || ""}</div>`,
    },
    {
      title: "Username",
      data: "fld_username",
      orderable: true,
      render: (data) => `<div class="text-gray-600">${data || ""}</div>`,
    },
    {
      title: "Email",
      data: "fld_email",
      orderable: true,
      render: (data) => `<div class="text-blue-600">${data || ""}</div>`,
    },
    {
      title: "Type",
      data: "fld_admin_type",
      orderable: true,
      render: (data) =>
        `<div class="px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-md inline-block">${
          data || ""
        }</div>`,
    },
    {
      title: "Added On",
      data: "fld_addedon",
      orderable: true,
      render: (data) =>
        `<div class="text-gray-500 text-sm">${formatDate(data)}</div>`,
    },

    {
      title: "Status",
      data: "status",
      orderable: false,
      render: function (data, type, row) {
        const checked = data === "Active" ? "checked" : "";
        return `
      <label class="custom-switch">
        <input type="checkbox" class="custom-checkbox" data-id="${row.id}" ${checked}>
        <div class="custom-slider"></div>
      </label>
    `;
      },
    },

    {
      title: "Actions",
      data: null,
      orderable: false,
      render: (data) => `
        <button class="edit-btn bg-blue-600 px-2 py-1 rounded text-white leading-none text-[11px] mr-1"" data-id="${data.id}">
            Edit
        </button>
      `,
    },
  ];


  const tableOptions = {
    responsive: true,
    pageLength: 25,
    lengthMenu: [5, 10, 25, 50, 100],
    order: [[0, "asc"]],
    dom: '<"flex justify-between items-center mb-4"lf>rt<"flex justify-between items-center mt-4"ip>',
    language: {
      search: "",
      searchPlaceholder: "Search users...",
      lengthMenu: "Show _MENU_ entries",
      info: "Showing _START_ to _END_ of _TOTAL_ entries",
      infoEmpty: "No entries available",
      infoFiltered: "(filtered from _MAX_ total entries)",
    },
    createdRow: (row, data) => {
      $(row)
        .find(".edit-btn")
        .on("click", () => handleEditButtonClick(data));
      $(row)
        .find(".custom-checkbox")
        .on("change", function () {
          const userId = $(this).data("id");
          const newStatus = this.checked ? "ACTIVE" : "INACTIVE";
          updateUserStatus(userId, newStatus);
        });
    },
    drawCallback: function () {
      const container = $(this.api().table().container());
      container
        .find('input[type="search"]')
        .addClass(
          "form-input px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        );
      container
        .find("select")
        .addClass(
          "form-select px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        );
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1250px] mx-auto py-5">
        {/* Header */}
        <div className="mb-8">
          <h4 className="text-xl font-bold text-gray-900">Booking Management</h4>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {userTabs.find((tab) => tab.key === selectedUserType)?.label}{" "}
                Users
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Total:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {isLoading ? "..." : filteredUsers.length}
                </span>
              </div>
              <div className="flex justify-end mb-4 gap-2">
                {selectedUserType === "EXECUTIVE" && (
                  <button
                    onClick={() => {
                      setFormType("EXECUTIVE");
                      setShowForm(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    + Add CRM
                  </button>
                )}
                {selectedUserType === "SUBADMIN" && (
                  <button
                    onClick={() => {
                      setFormType("SUBADMIN");
                      setShowForm(true);
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    + Add Subadmin
                  </button>
                )}
                {selectedUserType === "CONSULTANT" && (
                  <button
                    onClick={() => {
                      setFormType("CONSULTANT");
                      setShowForm(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    + Add Consultant
                  </button>
                )}
                {selectedUserType === "OPERATIONSADMIN" && (
                  <button
                    onClick={() => {
                      setFormType("OPSADMIN");
                      setShowForm(true);
                    }}
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                  >
                    + Add OPS Admin
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table Content */}
          {/* Table Content */}
          <div className="p-6">
            {isLoading ? (
              <SkeletonLoader
                rows={6}
                columns={[
                  "Name",
                  "Username",
                  "Email",
                  "Type",
                  "Added On",
                  "Status",
                  "Actions",
                ]}
              />
            ) : (
              <div className="overflow-hidden">
                {selectedUserType === "EXECUTIVE" && (
                  <DataTable
                    data={executiveUsers}
                    columns={columns}
                    className="display table table-auto w-full text-[13px]"
                    options={tableOptions}
                  />
                )}
                {selectedUserType === "SUBADMIN" && (
                  <DataTable
                    data={subadminUsers}
                    columns={columns}
                    className="display table table-auto w-full text-[13px]"
                    options={tableOptions}
                  />
                )}
                {selectedUserType === "CONSULTANT" && (
                  <DataTable
                    data={consultantUsers}
                    columns={columns}
                    className="display table table-auto w-full text-[13px]"
                    options={tableOptions}
                  />
                )}
                {selectedUserType === "OPERATIONSADMIN" && (
                  <DataTable
                    data={opsAdminUsers}
                    columns={columns}
                    className="display table table-auto w-full text-[13px]"
                    options={tableOptions}
                  />
                )}
              </div>
            )}
          </div>
        </div>
       
      </div>

      {/* Custom Styles */}
    </div>
  );
}
