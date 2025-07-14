import React, { use, useEffect } from "react";
import { motion } from "framer-motion";
import { XIcon } from "lucide-react";
import Select from "react-select";
import { set } from "idb-keyval";
import {useState} from "react";
import {toast} from "react-hot-toast";

const EditUser = ({ setShowForm, formType, teams,editData,fetchAllUsers }) => {

  const [formData, setFormData] = useState({
    user_id: editData.id || null,
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
    if (editData) {
      setFormData({
        user_id: editData.id || null,
        team_id:
          formType === "EXECUTIVE"
            ? editData.fld_team_id || ""
            : (editData.fld_team_id || "")
                .split(",")
                .map((id) => parseInt(id)), 
        username: editData.fld_username || "",
        name: editData.fld_name || "",
        email: editData.fld_email || "",
        phone: editData.fld_phone || "",
       
        consultant_type: editData.fld_consultant_type || "",
        subadmin_type: editData.fld_subadmin_type || "",
        permissions: editData.fld_permission
          ? JSON.parse(editData.fld_permission)
          : {
              reassign: false,
              approve_call: false,
            },
      });
      console.log("Team Id",editData.fld_team_id);
    }
  }, [editData, formType]);

 const handleSave = async () => {
  const {
    user_id,
    team_id,
    username,
    name,
    email,
    phone,
   
    consultant_type,
    subadmin_type,
    permissions,
  } = formData;

  if (!username || !name || !email || !phone) {
    alert("Please fill all required fields");
    return;
  }

  

  const payload = {
    user_id,
    team_id: formType === "EXECUTIVE" ? team_id : team_id.join(","),
    username,
    name,
    email,
    phone,
    
    consultant_type,
    subadmin_type,
    permissions,
  };

  try {
    const res = await fetch(`http://localhost:5000/api/users/update/${user_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.status) {
      toast.success("User updated successfully!");
      setShowForm(false);
       fetchAllUsers();
    } else {
      toast.error(data.message || "Update failed");
    }
  }  catch (error) {
    console.error(error);
    toast("Something went wrong");
  }
};


  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 w-full h-full bg-white shadow-xl z-50 overflow-y-auto"
    >
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h2 className="text-xl font-semibold">
          {formType === "EXECUTIVE" && "Add CRM"}
          {formType === "CONSULTANT" && "Add Consultant"}
          {formType === "SUBADMIN" && "Add Subadmin"}
          {formType === "OPSADMIN" && "Add OPS Admin"}
        </h2>
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-600 hover:text-black text-2xl"
        >
          <XIcon size={15} />
        </button>
      </div>

      <div className="p-6 space-y-4 row">
        {(formType === "EXECUTIVE" ||
          formType === "CONSULTANT" ||
          formType === "SUBADMIN") && (
          <div className="col-md-4">
            <label className="block mb-1 font-medium">Select Team</label>
            <Select
  className="react-select-container"
  classNamePrefix="react-select"
  options={teams.map((team) => ({
    value: team.id,
    label: team.fld_title,
  }))}
  value={
    formType === "EXECUTIVE"
      ? teams
          .map((team) => ({
            value: team.id,
            label: team.fld_title,
          }))
          .find((option) => String(option.value) === String(formData.team_id)) || null
      : teams
          .map((team) => ({
            value: team.id,
            label: team.fld_title,
          }))
          .filter((option) =>
            (formData.team_id || []).map(String).includes(String(option.value))
          )
  }
  isMulti={formType !== "EXECUTIVE"}
  onChange={(selected) => {
    if (formType === "EXECUTIVE") {
      setFormData({
        ...formData,
        team_id: selected ? selected.value : "",
      });
    } else {
      setFormData({
        ...formData,
        team_id: selected ? selected.map((s) => s.value) : [],
      });
    }
  }}
  placeholder="Select Team"
/>

          </div>
        )}

        <div className="col-md-4">
          <label className="block mb-1 font-medium">Username</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
        </div>

        <div className="col-md-4">
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="col-md-4">
          <label className="block mb-1 font-medium">Email ID</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>

        <div className="col-md-4">
          <label className="block mb-1 font-medium">Phone</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>

        {/* Consultant Type */}
        {formType === "CONSULTANT" && (
          <select
            className="w-full border px-3 py-2 rounded"
            value={formData.consultant_type}
            onChange={(e) =>
              setFormData({
                ...formData,
                consultant_type: e.target.value,
              })
            }
          >
            <option value="">Select Type</option>
            <option value="Service Provider">Service Provider</option>
          </select>
        )}

        {/* SubAdmin Type */}
        {formType === "SUBADMIN" && (
          <select
            className="w-full border px-3 py-2 rounded"
            value={formData.subadmin_type}
            onChange={(e) =>
              setFormData({
                ...formData,
                subadmin_type: e.target.value,
              })
            }
          >
            <option value="">Select Type</option>
            <option value="General">General</option>
          </select>
        )}

       

        {/* Permissions */}
        {(formType === "SUBADMIN" || formType === "CONSULTANT") && (
          <div className="space-y-2 col-md-4">
            <label className="block font-medium">Permissions</label>
            <div className="flex gap-4 flex-wrap">
              <label>
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={formData.permissions.reassign}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permissions: {
                        ...formData.permissions,
                        reassign: e.target.checked,
                      },
                    })
                  }
                />
                Reassign
              </label>
              {formType === "SUBADMIN" && (
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={formData.permissions.approve_call}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permissions: {
                        ...formData.permissions,
                        approve_call: e.target.checked,
                      },
                    })
                  }
                />
              )}
            </div>
          </div>
        )}

        <div className="pt-6 flex justify-end">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EditUser;
