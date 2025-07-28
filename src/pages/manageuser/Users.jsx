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
    permissions: [],
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
        "https://callback-2suo.onrender.com/api/users/getallusers",
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
        "https://callback-2suo.onrender.com/api/helpers/getAllActiveTeams",
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
      (formType === "EXECUTIVE" ||
        formType === "SUBADMIN" ||
        formType === "CONSULTANT") &&
      ((formType === "EXECUTIVE" && !formData.team_id) ||
        ((formType === "SUBADMIN" || formType === "CONSULTANT") &&
          (!formData.team_id || formData.team_id.length === 0))) // empty array
    ) {
      toast.error("Please select Team.");
      return;
    }

    if (
      !formData.username ||
      !formData.name ||
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

    if (formType === "CONSULTANT" && !formData.consultant_type) {
      toast.error("Consultant Type is required");
      return;
    }

    if (formType === "SUBADMIN" && !formData.subadmin_type) {
      toast.error("Subadmin Type is required");
      return;
    }

    const payload = {
      ...formData,
      usertype: formType,
    };

    try {
      const response = await fetch("https://callback-2suo.onrender.com/api/users/addUser", {
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
        "https://callback-2suo.onrender.com/api/users/getusercount",
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

  const updateUserStatus = async (userId, status) => {
    try {
      const res = await fetch(
        `https://callback-2suo.onrender.com/api/users/update-status/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

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
    setEditData(data);
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
        <div className="p-3 bg-gray-100 rounded shadow text-[13px]">
        {/* Header */}
        <div className="mb-8">
          <h4 className="text-xl font-bold text-gray-900">User Management</h4>
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
                      ? "prime-bg text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>{tab.label}</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedUserType === tab.key
                          ? "secondary-bg text-white"
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
              {/* <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Total:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {isLoading ? "..." : filteredUsers.length}
                </span>
              </div> */}
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
      </div>

      {/* Custom Styles */}
    </div>
  );
}
