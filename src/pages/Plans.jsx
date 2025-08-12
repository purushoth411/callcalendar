import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import { toast } from "react-hot-toast";
import $ from "jquery";
import { PlusIcon, X, XIcon } from "lucide-react";
import Select from "react-select";
import SkeletonLoader from "../components/SkeletonLoader";

DataTable.use(DT);

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    plan: "",
  });

  useEffect(() => {
    getAllPlans();
  }, []);

  const getAllPlans = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://callback-2suo.onrender.com/api/plans/getAllPlans"
      );
      const result = await response.json();
      
      if (result.status) {
        setPlans(result.data);
      } else {
        toast.error("Failed to fetch plans");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching plans");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlanStatus = async (planId, status) => {
    try {
      const res = await fetch(
        `https://callback-2suo.onrender.com/api/plans/update-plan-status/${planId}`,
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

  const handleSave = async () => {
    const { plan } = formData;
    if (!plan) {
      toast.error("Plan name is required");
      return;
    }

    try {
      const method = "POST";
      const url = "https://callback-2suo.onrender.com/api/plans/addPlan";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.status) {
        toast.success(`Plan added successfully`);
        setFormData({
          plan: "",
        });

        setShowAddForm(false);
        getAllPlans();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save");
    }
  };

  const handleUpdate = async () => {
    const { plan, allowedCalls } = formData;
    if (!plan) {
      toast.error("Plan name is required");
      return;
    }

    if (!allowedCalls) {
      toast.error("Allowed Calls is required");
      return;
    }

    try {
      const method = "PUT";
      const url = `https://callback-2suo.onrender.com/api/plans/updatePlan/${editId}`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.status) {
        toast.success(`Plan updated successfully`);
        setFormData({
          plan: "",
        });
        setEditId(null);
        setShowEditForm(false);
        getAllPlans();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save");
    }
  };

  const handleEdit = (item) => {
    setFormData({
      plan: item.plan,
      allowedCalls: item.allowedCalls,
    });
    setEditId(item.id);
    setShowEditForm(true);
  };

  const columns = [
    {
      title: "Plan Name",
      data: "plan",
    },
    {
      title: "Allowed Call",
      data: "allowedCalls",
    },
    {
      title: "Actions",
      data: null,
      orderable: false,
      render: (data, type, row) => `
      <button class="edit-btn bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-white leading-none text-[11px] cursor-pointer" data-id="${row.id}">Edit</button>
     
    `,
    },
  ];

  useEffect(() => {
    $(document).on("click", ".edit-btn", function () {
      const id = $(this).data("id");
      const selected = plans.find((d) => d.id === id);
      handleEdit(selected);
    });

    return () => {
      $(document).off("click", ".edit-btn");
    };
  }, [plans]);

  const tableOptions = {
    responsive: true,
    pageLength: 25,
    lengthMenu: [5, 10, 25, 50, 100],
    ordering: false, // Disable ordering globally
    dom: '<"flex justify-between items-center mb-4"lf>rt<"flex justify-between items-center mt-4"ip>',
    language: {
      search: "",
      searchPlaceholder: "Search ...",
      lengthMenu: "Show _MENU_ entries",
      info: "Showing _START_ to _END_ of _TOTAL_ entries",
      infoEmpty: "No entries available",
      infoFiltered: "(filtered from _MAX_ total entries)",
    },
    createdRow: (row, data) => {
      $(row)
        .find(".custom-checkbox")
        .on("change", function () {
          const planId = $(this).data("id");
          const newStatus = this.checked ? "ACTIVE" : "INACTIVE";
          updatePlanStatus(planId, newStatus);
        });
    },
    drawCallback: function () {
      const container = $(this.api().table().container());
      container
        .find('input[type="search"]')
        .addClass(
          "px-3 !py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-[13px]"
        );
      container
        .find("select")
        .addClass(
          "px-3 !py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-[13px]"
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
    <div className="">
      <div className="">
        <div className="">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[18px] font-semibold text-gray-900">Plan Management</h2>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          {isLoading ? (
            <SkeletonLoader
              rows={6}
              columns={["Plan Name", "Allowed Calls", "Action"]}
            />
          ) : (
            <DataTable
              data={plans}
              columns={columns}
              className="display table table-auto w-full text-[13px] border border-gray-300 n-table-set dataTable"
              options={tableOptions}
            />
          )}
          </div>
        </div>
      </div>
      <AnimatePresence>
        

        {/* EDIT Plan FORM */}
        {showEditForm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-[#000000c2] flex items-center justify-center z-50"
              onClick={closeForm}
            />

            {/* Slide-In Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 w-[25%] h-full bg-white shadow z-50 overflow-y-auto"
            >
              <div className="">
                <div className="flex justify-between items-center px-4 py-3 border-b bg-[#224d68] text-white">
                  <h3 className="text-[15px] font-semibold">
                    Edit Plan
                  </h3>
                  <button
                    onClick={closeForm}
                    className="text-gray-100 hover:text-black text-2xl"
                  >
                    <XIcon size={17} />
                  </button>
                </div>

                <div className="p-4 space-y-4 row">
                  {/* Plan Name */}
                  <div>
                    <label className="block mb-1">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter plan name"
                      value={formData.plan}
                      onChange={(e) =>
                        setFormData({ ...formData, plan: e.target.value })
                      }
                      readOnly
                      className="w-full border px-3 py-2 rounded border-[#cccccc] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-gray-400 active:border-blue-600"
                    />
                  </div>
                  {/* Plan Name */}
                  <div>
                    <label className="block mb-1">
                      Allowed Calls *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter allowed calls"
                      value={formData.allowedCalls}
                      onChange={(e) =>
                        setFormData({ ...formData, allowedCalls: e.target.value })
                      }
                      
                      className="w-full border px-3 py-2 rounded border-[#cccccc] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-gray-400 active:border-blue-600"
                    />
                  </div>
                

                {/* Update Button */}
                <div className="flex justify-end gap-3 ">
                  <button
                    onClick={handleUpdate}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    Update
                  </button>
                </div>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
