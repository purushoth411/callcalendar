import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import { toast } from "react-hot-toast";
import $ from "jquery";
import { X } from "lucide-react";
import Select from "react-select";
import SkeletonLoader from "../components/SkeletonLoader";

DataTable.use(DT);

export default function DomainPref() {
  const [domains, setDomains] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allConsultants, setAllConsultants] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    domain: "",
    pref_1: "",
    pref_2: "",
    pref_3: "",
    pref_4: "",
    pref_5: "",
    pref_6: "",
  });

  useEffect(() => {
    getAllDomains();
    getConsultants();
  }, []);

  const getAllDomains = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://callback-2suo.onrender.com/api/helpers/getAllDomains"
      );
      const result = await response.json();
      if (result.status) {
        setDomains(result.data);
      } else {
        toast.error("Failed to fetch domains");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching domains");
    } finally {
      setIsLoading(false);
    }
  };

  const getConsultants = async () => {
    try {
      const response = await fetch(
        "https://callback-2suo.onrender.com/api/users/getallusers",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filters: {
              usertype: ["CONSULTANT"],
              keyword: "",
              status: "Active",
            },
          }),
        }
      );
      const result = await response.json();
      if (result.status) {
        setAllConsultants(result.data);
      } else {
        console.error("Failed to fetch Consultants");
      }
    } catch (error) {
      console.error("Error fetching consultants", error);
      toast.error("Error fetching Consultants");
    }
  };

  const handleSave = async () => {
    const { domain } = formData;
    if (!domain) {
      toast.error("Domain name is required");
      return;
    }

    try {
      const method = "POST";
      const url = "https://callback-2suo.onrender.com/api/domains";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.status) {
        toast.success(`Domain added successfully`);
        setFormData({
          domain: "",
          pref_1: "",
          pref_2: "",
          pref_3: "",
          pref_4: "",
          pref_5: "",
          pref_6: "",
        });

        setShowAddForm(false);
        getAllDomains();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save");
    }
  };

  const handleUpdate = async () => {
    const { domain } = formData;
    if (!domain) {
      toast.error("Domain name is required");
      return;
    }

    try {
      const method = "PUT";
      const url = `https://callback-2suo.onrender.com/api/domains/${editId}`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.status) {
        toast.success(`Domain updated successfully`);
        setFormData({
          domain: "",
          pref_1: "",
          pref_2: "",
          pref_3: "",
          pref_4: "",
          pref_5: "",
          pref_6: "",
        });
        setEditId(null);
        setShowEditForm(false);
        getAllDomains();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save");
    }
  };

  const handleEdit = (item) => {
    const prefs = (item.cosultantId || "").split(",").map((p) => p.trim());
    setFormData({
      domain: item.domain,
      pref_1: prefs[0] || "",
      pref_2: prefs[1] || "",
      pref_3: prefs[2] || "",
      pref_4: prefs[3] || "",
      pref_5: prefs[4] || "",
      pref_6: prefs[5] || "",
    });
    setEditId(item.id);
    setShowEditForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this domain?")) return;

    try {
      const res = await fetch(`https://callback-2suo.onrender.com/api/domains/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.status) {
        toast.success("Deleted successfully");
        getAllDomains();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete");
    }
  };

  const columns = [
    { title: "Domain", data: "domain" },
    {
      title: "Pref 1",
      data: "cosultantId",
      render: (data) => data?.split(",")[0]?.trim() || "",
    },
    {
      title: "Pref 2",
      data: "cosultantId",
      render: (data) => data?.split(",")[1]?.trim() || "",
    },
    {
      title: "Pref 3",
      data: "cosultantId",
      render: (data) => data?.split(",")[2]?.trim() || "",
    },
    {
      title: "Pref 4",
      data: "cosultantId",
      render: (data) => data?.split(",")[3]?.trim() || "",
    },
    {
      title: "Pref 5",
      data: "cosultantId",
      render: (data) => data?.split(",")[4]?.trim() || "",
    },
    {
      title: "Pref 6",
      data: "cosultantId",
      render: (data) => data?.split(",")[5]?.trim() || "",
    },
    {
      title: "Actions",
      data: null,
      orderable: false,
      render: (data, type, row) => `
        <button class="edit-btn bg-blue-600 px-2 py-1 rounded text-white leading-none text-[11px] mr-1" data-id="${row.id}">Edit</button>
        <button class="delete-btn bg-red-600 px-2 py-1 rounded text-white leading-none text-[11px]" data-id="${row.id}">Delete</button>
      `,
    },
  ];

  useEffect(() => {
    $(document).on("click", ".edit-btn", function () {
      const id = $(this).data("id");
      const selected = domains.find((d) => d.id === id);
      handleEdit(selected);
    });

    $(document).on("click", ".delete-btn", function () {
      const id = $(this).data("id");
      handleDelete(id);
    });

    return () => {
      $(document).off("click", ".edit-btn");
      $(document).off("click", ".delete-btn");
    };
  }, [domains]);

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

  const openAddForm = () => {
    setFormData({
      domain: "",
      pref_1: "",
      pref_2: "",
      pref_3: "",
      pref_4: "",
      pref_5: "",
      pref_6: "",
    });

    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setShowEditForm(false);
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1250px] mx-auto py-5">
        <div className="p-3 bg-gray-100 rounded shadow text-[13px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Domain Preferences
            </h2>
            <button
              onClick={openAddForm}
              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors text-[11px] "
            >
              Add New
            </button>
          </div>

          {isLoading ? (
                          <SkeletonLoader
  rows={6}
  columns={["Domain", "Pref 1","Pref 2","Pref 3","Pref 4","Pref 5","Pref 6", "Actions"]}
/>
          ) : domains.length > 0 ? (
            <DataTable
              data={domains}
              columns={columns}
              className="display w-full text-[13px]"
              options={tableOptions}
            />
          ) : (
            <div className="text-center text-gray-600">No domains available.</div>
          )}
        </div>
      </div>

      {/* Animated Side Form */}
      <AnimatePresence>
        {showAddForm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={closeForm}
            />

            {/* Side Form */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.4,
              }}
              className="fixed top-0 right-0 h-full w-full bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {editId ? "Edit Domain" : "Add New Domain"}
                  </h3>
                  <button
                    onClick={closeForm}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Form Content */}
                <div className="space-y-6">
                  {/* Domain Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Domain Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter domain name"
                      value={formData.domain}
                      onChange={(e) =>
                        setFormData({ ...formData, domain: e.target.value })
                      }
                      className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Consultant Preferences */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-800 pb-2">
                      Consultant Preferences
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preference {n}
                          </label>
                         <Select
  className="react-select-container"
  classNamePrefix="react-select"
  options={allConsultants.map((consultant) => ({
    value: consultant.fld_name,
    label: consultant.fld_name,
  }))}
  value={
    allConsultants
      .map((consultant) => ({
        value: consultant.fld_name,
        label: consultant.fld_name,
      }))
      .find((option) => option.value === formData[`pref_${n}`]) || null
  }
  onChange={(selected) =>
    setFormData({
      ...formData,
      [`pref_${n}`]: selected ? selected.value : "",
    })
  }
  placeholder="Select Consultant"
/>

                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
        {showEditForm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={closeForm}
            />

            {/* Side Form */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.4,
              }}
              className="fixed top-0 right-0 h-full w-full bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {editId ? "Edit Domain" : "Add New Domain"}
                  </h3>
                  <button
                    onClick={closeForm}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Form Content */}
                <div className="space-y-6">
                  {/* Domain Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Domain Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter domain name"
                      value={formData.domain}
                      onChange={(e) =>
                        setFormData({ ...formData, domain: e.target.value })
                      }
                      className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Consultant Preferences */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-800 pb-2">
                      Consultant Preferences
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preference {n}
                          </label>
                          <select
                            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData[`pref_${n}`] || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [`pref_${n}`]: e.target.value,
                              })
                            }
                          >
                            <option value="">Select Consultant</option>
                            {allConsultants.length > 0 &&
                              allConsultants.map((consultant) => (
                                <option
                                  key={consultant.id}
                                  value={consultant.fld_name}
                                >
                                  {consultant.fld_name}
                                </option>
                              ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
