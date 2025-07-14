import React, { useEffect, useState, useRef } from "react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import $ from "jquery";
import { useAuth } from "../../utils/idb.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import AddUser from "./AddUser.jsx";
import EditUser from "./EditUser.jsx";

export default function Users() {
  const { user, logout } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  DataTable.use(DT);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState("EXECUTIVE");
  const [userCount, setUserCount] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("");
  const [teams, setTeams] = useState([]);
  const tableRef = useRef(null);
  const [formData, setFormData] = useState({
    team_id: formType === "EXECUTIVE" ? "" : [],
    username: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    consultant_type: "",
    subadmin_type: "",
    permissions: {
      reassign: false,
      approve_call: false,
    },
  });

  useEffect(() => {
    fetchAllUsers();
    getAllTeams();
    getUserCount();
  }, []);

  useEffect(() => {
    // Filter users based on selected type
    const filtered = allUsers.filter(
      (user) => user.fld_admin_type === selectedUserType
    );
    setFilteredUsers(filtered);
  }, [selectedUserType, allUsers]);

  const fetchAllUsers = async () => {
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

  const getAllTeams = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/helpers/getAllActiveTeams",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = await response.json();
      if (result.status) {
        setTeams(result.data);
        console.log("Teams fetched successfully:", result.data);
      } else {
        setTeams([]);
        console.error("Failed to fetch teams:", result.message);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const handleSave = async () => {
    // Validation
    if (
      !formData.username ||
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill all mandatory fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const payload = {
      ...formData,
      usertype: formType,
    };

    try {
      const response = await fetch("http://localhost:5000/api/users/addUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.status) {
        alert("User added successfully");
        setShowForm(false);
        fetchAllUsers(); // reload users
      } else {
        alert(result.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Server error");
    }
  };

  const getUserCount = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/users/getusercount",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = await response.json();
      if (result.status) {
        setUserCount(result.data);
        console.log("User count fetched successfully:", result.data);
      } else {
        console.error("Failed to fetch user count:", result.message);
      }
    } catch (error) {
      console.error("Error fetching user count:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { day: "numeric", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options).toLowerCase();
  };

  const updateUserStatus = async (userId, status) => {
  try {
    const res = await fetch(`http://localhost:5000/api/users/update-status/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    if (data.status) {
      toast.success("Status updated");
    } else {
      toast.error(data.message || "Status update failed");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error updating status");
  }
};


  const [editData, setEditData] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const handleEditButtonClick = (data) => {
    setFormType(data.fld_admin_type);
    setEditData(data)
    setShowEditForm(true);
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
      <label class="inline-flex items-center cursor-pointer">
        <input type="checkbox" class="status-toggle" data-id="${row.id}" ${checked}>
        <span class="ml-2 text-sm">${data === "Active" ? "Active" : "Inactive"}</span>
      </label>
    `;
  },
},

    {
      title: "Actions",
      data: null,
      orderable: false,
      render: (data) => `
        <button class="edit-btn vd mx-1 p-1  text-dark" style="font-size:10px;border-radius:3px;     white-space: nowrap;" data-id="${data.id}">
            Edit
        </button>
      `,
    },
  ];

  const userTabs = [
    {
      key: "EXECUTIVE",
      label: "CRM",
      count: userCount.EXECUTIVE || 0,
      color: "blue",
    },
    {
      key: "SUBADMIN",
      label: "SUBADMIN",
      count: userCount.SUBADMIN || 0,
      color: "purple",
    },
    {
      key: "CONSULTANT",
      label: "CONSULTANT",
      count: userCount.CONSULTANT || 0,
      color: "green",
    },
    {
      key: "OPERATIONSADMIN",
      label: "OPS ADMIN",
      count: userCount.OPERATIONSADMIN || 0,
      color: "orange",
    },
  ];

  const handleTabClick = (userType) => {
    setSelectedUserType(userType);
  };

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-4">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="h-4 bg-gray-300 rounded flex-1"
                ></div>
              ))}
          </div>
        </div>

        {/* Table Rows */}
        {Array(8)
          .fill(0)
          .map((_, rowIndex) => (
            <div key={rowIndex} className="px-6 py-4 border-b border-gray-100">
              <div className="flex space-x-4">
                {Array(6)
                  .fill(0)
                  .map((_, colIndex) => (
                    <div
                      key={colIndex}
                      className="h-4 bg-gray-200 rounded flex-1"
                    ></div>
                  ))}
              </div>
            </div>
          ))}

        {/* Pagination Skeleton */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-300 rounded w-48"></div>
            <div className="flex space-x-2">
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="h-8 w-8 bg-gray-300 rounded"
                  ></div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const executiveUsers = allUsers.filter(
    (u) => u.fld_admin_type === "EXECUTIVE"
  );
  const subadminUsers = allUsers.filter((u) => u.fld_admin_type === "SUBADMIN");
  const consultantUsers = allUsers.filter(
    (u) => u.fld_admin_type === "CONSULTANT"
  );
  const opsAdminUsers = allUsers.filter(
    (u) => u.fld_admin_type === "OPERATIONSADMIN"
  );
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
    .find(".status-toggle")
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h4 className="text-3xl font-bold text-gray-900">User Management</h4>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <nav className="flex space-x-1">
              {userTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabClick(tab.key)}
                  className={`flex-1 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                    selectedUserType === tab.key
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>{tab.label}</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedUserType === tab.key
                          ? "bg-blue-400 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
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
              <SkeletonLoader />
            ) : (
              <div className="overflow-hidden">
                {selectedUserType === "EXECUTIVE" && (
                  <DataTable
                    data={executiveUsers}
                    columns={columns}
                    className="display table table-auto w-full"
                    options={tableOptions}
                  />
                )}
                {selectedUserType === "SUBADMIN" && (
                  <DataTable
                    data={subadminUsers}
                    columns={columns}
                    className="display table table-auto w-full"
                    options={tableOptions}
                  />
                )}
                {selectedUserType === "CONSULTANT" && (
                  <DataTable
                    data={consultantUsers}
                    columns={columns}
                    className="display table table-auto w-full"
                    options={tableOptions}
                  />
                )}
                {selectedUserType === "OPERATIONSADMIN" && (
                  <DataTable
                    data={opsAdminUsers}
                    columns={columns}
                    className="display table table-auto w-full"
                    options={tableOptions}
                  />
                )}
              </div>
            )}
          </div>
        </div>
        <AnimatePresence>
          {showForm && (
            <AddUser
              setShowForm={setShowForm}
              formData={formData}
              setFormData={setFormData}
              teams={teams}
              formType={formType}
              handleSave={handleSave}
            />
          )}

          {showEditForm && (
            <EditUser
              setShowForm={setShowEditForm}
              teams={teams}
              formType={formType}
              editData={editData}
               fetchAllUsers={fetchAllUsers}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Custom Styles */}
    </div>
  );
}
