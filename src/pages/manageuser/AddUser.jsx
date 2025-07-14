import React from "react";
import { motion } from "framer-motion";
import { XIcon } from "lucide-react";
import Select from "react-select";

const AddUser = ({
  setShowForm,
  formData,
  setFormData,
  formType,
  teams,
  handleSave,
}) => {
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
          <div className="col-md-3">
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
                      .find((option) => option.value === formData.team_id) ||
                    null
                  : teams
                      .map((team) => ({
                        value: team.id,
                        label: team.fld_title,
                      }))
                      .filter((option) =>
                        formData.team_id.includes(option.value)
                      )
              }
              isMulti={formType !== "EXECUTIVE"} // Single select only for EXECUTIVE
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

        <div>
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

        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
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

        <div>
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

        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Confirm Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({
                ...formData,
                confirmPassword: e.target.value,
              })
            }
          />
        </div>

        {/* Permissions */}
        {(formType === "SUBADMIN" || formType === "CONSULTANT") && (
          <div className="space-y-2">
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

export default AddUser;
