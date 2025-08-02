import React from "react";
import { motion } from "framer-motion";
import { XIcon } from "lucide-react";
import Select from "react-select";
import { useEffect } from "react";

const AddUser = ({
  setShowForm,
  formData,
  setFormData,
  formType,
  teams,
  handleSave,
}) => {
  useEffect(() => {
    setFormData({
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
  }, [formType, setShowForm]);
  return (
    <motion.div className="fixed inset-0 bg-[#000000c2] flex items-center justify-center z-50">
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 w-[25%] h-full bg-white shadow z-50 overflow-y-auto"
    >
      <div className="flex justify-between items-center px-4 py-3 border-b bg-[#224d68] text-white">
        <h2 className="text-[15px] font-semibold">
          {formType === "EXECUTIVE" && "Add CRM"}
          {formType === "CONSULTANT" && "Add Consultant"}
          {formType === "SUBADMIN" && "Add Subadmin"}
          {formType === "OPSADMIN" && "Add OPS Admin"}
        </h2>
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-100 hover:text-black text-2xl"
        >
          <XIcon size={17} />
        </button>
      </div>

      <div className="p-4 space-y-4 row">
        {(formType === "EXECUTIVE" ||
          formType === "CONSULTANT" ||
          formType === "SUBADMIN") && (
          <div className="col-md-4">
            <label className="block mb-1">Select Team</label>
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

        <div className="col-md-4">
          <label className="block mb-1">Username</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded border-[#cccccc] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-gray-400 active:border-blue-600"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
        </div>

        <div className="col-md-4">
          <label className="block mb-1">Name</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded border-[#cccccc] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-gray-400 active:border-blue-600"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="col-md-4">
          <label className="block mb-1">Email ID</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded border-[#cccccc] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-gray-400 active:border-blue-600"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>

        <div className="col-md-4">
          <label className="block mb-1">Phone</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded border-[#cccccc] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-gray-400 active:border-blue-600"
            autoComplete="off"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>

        {/* Consultant Type */}
        {formType === "CONSULTANT" && (
          <div className="col-md-3">
            <label className="block mb-1">Consultant Type</label>
            <select
              className="w-full border px-3 py-2 rounded border-[#cccccc] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-gray-400 active:border-blue-600"
              value={formData.consultant_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  consultant_type: e.target.value,
                })
              }
            >
              <option value="">Select Type</option>
              <option value="Presales">Presales</option>
              <option value="Postsales">Postsales</option>
              <option value="Both">Both</option>
            </select>
          </div>
        )}

        {/* SubAdmin Type */}
        {formType === "SUBADMIN" && (
          <div className="col-md-3">
            <label className="block mb-1">Subadmin Type</label>
            <select
              className="w-full border px-3 py-2 rounded border-[#cccccc] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-gray-400 active:border-blue-600"
              value={formData.subadmin_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  subadmin_type: e.target.value,
                })
              }
            >
              <option value="">Select Type</option>
              <option value="consultant_sub">Consultant</option>
              <option value="crm_sub">CRM </option>
            </select>
          </div>
        )}

        <div className="col-md-4">
          <label className="block mb-1">Password</label>
          <input
            type="password"
            autoComplete="off"
            className="w-full border px-3 py-2 rounded border-[#cccccc] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-gray-400 active:border-blue-600"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>

        <div className="col-md-4">
          <label className="block mb-1">Confirm Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded border-[#cccccc] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-gray-400 active:border-blue-600"
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
          <div className="space-y-2 col-md-4">
            <label className="block font-medium">Permissions</label>
            <div className="flex gap-4 flex-wrap">
              <label>
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={formData.permissions.includes("Reassign")}
                  onChange={(e) => {
                    const updatedPermissions = e.target.checked
                      ? [...formData.permissions, "Reassign"]
                      : formData.permissions.filter(
                          (perm) => perm !== "Reassign"
                        );

                    setFormData({
                      ...formData,
                      permissions: updatedPermissions,
                    });
                  }}
                />
                Reassign
              </label>
              {formType === "SUBADMIN" && (
                <label>
                  <input
                    type="checkbox"
                    className="mr-1"
                    checked={formData.permissions.includes(
                      "Approve Add Call Request"
                    )}
                    onChange={(e) => {
                      const updatedPermissions = e.target.checked
                        ? [...formData.permissions, "Approve Add Call Request"]
                        : formData.permissions.filter(
                            (perm) => perm !== "Approve Add Call Request"
                          );

                      setFormData({
                        ...formData,
                        permissions: updatedPermissions,
                      });
                    }}
                  />
                  Approve Add Call Request
                </label>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-[11px] flex items-center gap-1 cursor-pointer"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </motion.div>
    </motion.div>
  );
};

export default AddUser;
