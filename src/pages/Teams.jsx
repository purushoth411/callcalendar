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

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    team: "",
  });

  useEffect(() => {
    getAllTeams();
  }, []);

  const getAllTeams = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://callback-2suo.onrender.com/api/helpers/getAllTeams"
      );
      const result = await response.json();
      if (result.status) {
        setTeams(result.data);
      } else {
        toast.error("Failed to fetch teams");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching teams");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTeamStatus = async (teamId, status) => {
      try {
        const res = await fetch(
          `https://callback-2suo.onrender.com/api/helpers/update-team-status/${teamId}`,
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
    const { team } = formData;
    if (!team) {
      toast.error("Team name is required");
      return;
    }

    try {
      const method = "POST";
      const url = "https://callback-2suo.onrender.com/api/helpers/addTeam";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.status) {
        toast.success(`Team added successfully`);
        setFormData({
          team: "",
        });

        setShowAddForm(false);
        getAllTeams();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save");
    }
  };

  const handleUpdate = async () => {
    const { team } = formData;
    if (!team) {
      toast.error("Team name is required");
      return;
    }

    try {
      const method = "PUT";
      const url = `https://callback-2suo.onrender.com/api/helpers/updateTeam/${editId}`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.status) {
        toast.success(`Team updated successfully`);
        setFormData({
          team: "",
        });
        setEditId(null);
        setShowEditForm(false);
        getAllTeams();
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
      team: item.fld_title,
    });
    setEditId(item.id);
    setShowEditForm(true);
  };

const columns = [
  {
    title: "Team Name",
    data: "fld_title",
  },
  {
    title: "Added On",
    data: "fld_addedon",
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
    render: (data, type, row) => `
      <button class="edit-btn bg-blue-600 px-2 py-1 rounded text-white leading-none text-[11px] mr-1" data-id="${row.id}">Edit</button>
     
    `,
  },
];


  useEffect(() => {
    $(document).on("click", ".edit-btn", function () {
      const id = $(this).data("id");
      const selected = teams.find((d) => d.id === id);
      handleEdit(selected);
    });



    return () => {
      $(document).off("click", ".edit-btn");
    
    };
  }, [teams]);

  const tableOptions = {
    responsive: true,
    pageLength: 25,
    lengthMenu: [5, 10, 25, 50, 100],
    order: [[0, "asc"]],
    dom: '<"flex justify-between items-center mb-4"lf>rt<"flex justify-between items-center mt-4"ip>',
    language: {
      search: "",
      searchPlaceholder: "Search teams...",
      lengthMenu: "Show _MENU_ entries",
      info: "Showing _START_ to _END_ of _TOTAL_ entries",
      infoEmpty: "No entries available",
      infoFiltered: "(filtered from _MAX_ total entries)",
    },
     createdRow: (row, data) => {
      
      $(row)
        .find(".custom-checkbox")
        .on("change", function () {
          const teamId = $(this).data("id");
          const newStatus = this.checked ? "ACTIVE" : "INACTIVE";
          updateTeamStatus(teamId, newStatus);
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
      Team Management
    </h2>
    <button
      onClick={openAddForm}
      className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors text-[11px]"
    >
      Add New
    </button>
  </div>

  {isLoading ? (
    <SkeletonLoader
  rows={6}
  columns={["Team Name", "Added On", "Status", "Actions"]}
/>

  ) :  (
    <DataTable
      data={teams}
      columns={columns}
      className="display w-full text-[13px]"
      options={tableOptions}
    />
  )}
</div>

      </div>
<AnimatePresence>
  {/* ADD TEAM FORM */}
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

      {/* Slide-In Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 h-full w-full bg-white shadow-2xl z-50 overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-4">
            <h3 className="text-xl font-semibold text-gray-800">Add New Team</h3>
            <button onClick={closeForm} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
              <X size={15} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Team Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team Name *</label>
              <input
                type="text"
                placeholder="Enter team name"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

           
          </div>

          {/* Save Button */}
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

  {/* EDIT TEAM FORM */}
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

      {/* Slide-In Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 h-full w-full bg-white shadow-2xl z-50 overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-4">
            <h3 className="text-xl font-semibold text-gray-800">Edit Team</h3>
            <button onClick={closeForm} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
              <X size={15} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Team Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team Name *</label>
              <input
                type="text"
                placeholder="Enter team name"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

           
          </div>

          {/* Update Button */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
